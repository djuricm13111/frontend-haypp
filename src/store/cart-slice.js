import { DEFAULT_CURRENCY, convertCurrency } from "../utils/global_const";
import { calculatePrice } from "../utils/discount";
import { createSlice } from "@reduxjs/toolkit";
import CryptoJS from "crypto-js";
import TagManager from "react-gtm-module";

const CART_KEY = "cart";

/** Dozvoljeni intervali pretplate (usklađeno sa backend ALLOWED_INTERVAL_DAYS). */
export const SUBSCRIPTION_INTERVAL_DAYS = [14, 31, 62];

export function normalizeSubscriptionIntervalDays(v) {
  if (v === undefined || v === null || v === "") return null;
  const n = Number(v);
  return SUBSCRIPTION_INTERVAL_DAYS.includes(n) ? n : null;
}

function newLineId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `line-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/** Isti režim pretplate (oba null = jednokratno). */
function sameSubscriptionMode(a, b) {
  return normalizeSubscriptionIntervalDays(a) === normalizeSubscriptionIntervalDays(b);
}

function migrateCartItems(itemsList) {
  if (!Array.isArray(itemsList)) return [];
  return itemsList.map((item) => ({
    ...item,
    lineId: item.lineId || newLineId(),
    subscriptionIntervalDays: normalizeSubscriptionIntervalDays(
      item.subscriptionIntervalDays
    ),
  }));
}

const getCartFromStorage = () => {
  const cart = window.localStorage.getItem(CART_KEY);
  if (cart) {
    try {
      const bytes = CryptoJS.AES.decrypt(cart, "my-new-secret-key");
      const decryptedCart = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
      const itemsList = migrateCartItems(decryptedCart.itemsList);
      const totalQuantity = itemsList.reduce((s, i) => s + (i.quantity || 0), 0);
      return {
        itemsList,
        totalQuantity,
      };
    } catch (e) {
      console.error("Error decrypting cart:", e);
      return {
        itemsList: [],
        totalQuantity: 0,
      };
    }
  } else {
    return {
      itemsList: [],
      totalQuantity: 0,
    };
  }
};

const saveCartToStorage = (cart) => {
  try {
    const encryptedCart = CryptoJS.AES.encrypt(
      JSON.stringify(cart),
      "my-new-secret-key"
    ).toString();
    window.localStorage.setItem(CART_KEY, encryptedCart);
  } catch (e) {
    console.error("Error encrypting cart:", e);
  }
};

const initialState = getCartFromStorage();

const updateDiscountPrices = (itemsList, totalQuantity) => {
  return itemsList.map((item) => ({
    ...item,
    product: {
      ...item.product,
      discount_price: calculatePrice(item.product.price, totalQuantity),
    },
  }));
};

function gtmEvent(event, product, quantity) {
  const currency = localStorage.getItem("currency") || DEFAULT_CURRENCY;
  const itemData = {
    item_id: product.id,
    item_name: product.category_name + " " + product.name,
    item_brand: product.manufacturer,
    item_category: product.category_name,
    item_variant: product.nicotine + " MG",
    price: Number(product.price),
    quantity: quantity,
  };

  TagManager.dataLayer({
    dataLayer: {
      event: event,
      currency: currency,
      value: (Number(product.price) * quantity).toFixed(2),
      items: [itemData],
    },
  });
}

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart(state, action) {
      const { product, quantity, subscriptionIntervalDays: rawSub } =
        action.payload;
      if (quantity <= 0) return;

      const incomingDefined = rawSub !== undefined;
      const incomingNorm = incomingDefined
        ? normalizeSubscriptionIntervalDays(rawSub)
        : null;

      let existingItem = null;
      if (incomingDefined) {
        existingItem = state.itemsList.find(
          (item) =>
            item.product.id === product.id &&
            sameSubscriptionMode(item.subscriptionIntervalDays, incomingNorm)
        );
      } else {
        existingItem = state.itemsList.find(
          (item) =>
            item.product.id === product.id &&
            (item.subscriptionIntervalDays == null ||
              item.subscriptionIntervalDays === "")
        );
      }

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        const newItem = { ...product, discount_price: 0 };
        state.itemsList.push({
          lineId: newLineId(),
          product: newItem,
          quantity,
          subscriptionIntervalDays: incomingDefined ? incomingNorm : null,
        });
      }
      state.totalQuantity += quantity;

      state.itemsList = updateDiscountPrices(
        state.itemsList,
        state.totalQuantity
      );
      saveCartToStorage(state);
      gtmEvent("add_to_cart", product, quantity);
    },
    removeFromCart(state, action) {
      const lineId = action.payload;
      const itemToRemove = state.itemsList.find(
        (item) => item.lineId === lineId
      );
      if (!itemToRemove) return;

      state.itemsList = state.itemsList.filter(
        (item) => item.lineId !== lineId
      );
      state.totalQuantity -= itemToRemove.quantity;

      state.itemsList = updateDiscountPrices(
        state.itemsList,
        state.totalQuantity
      );
      saveCartToStorage(state);
      gtmEvent("remove_from_cart", itemToRemove.product, itemToRemove.quantity);
    },
    updateCart(state, action) {
      const { lineId, product, quantity } = action.payload;
      const existingItem = state.itemsList.find(
        (item) => item.lineId === lineId && item.product.id === product.id
      );
      if (!existingItem) return;

      existingItem.quantity = quantity;
      state.totalQuantity = state.itemsList.reduce(
        (total, item) => total + item.quantity,
        0
      );

      state.itemsList = updateDiscountPrices(
        state.itemsList,
        state.totalQuantity
      );
      saveCartToStorage(state);
    },
    resetCart(state) {
      state.itemsList = [];
      state.totalQuantity = 0;
      saveCartToStorage(state);
    },
    updateCurrency(state, action) {
      const { fromCurrency, toCurrency } = action.payload;
      console.log("from", fromCurrency, "to", toCurrency);
      state.itemsList = state.itemsList.map((item) => ({
        ...item,
        product: {
          ...item.product,
          price: convertCurrency(item.product.price, fromCurrency, toCurrency),
          discount_price: convertCurrency(
            item.product.discount_price,
            fromCurrency,
            toCurrency
          ),
        },
      }));

      saveCartToStorage(state);
    },
  },
});

export const cartActions = cartSlice.actions;
export default cartSlice.reducer;
