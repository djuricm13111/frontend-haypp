import { DEFAULT_CURRENCY, convertCurrency } from "../utils/global_const";
import { calculatePrice } from "../utils/discount";
import { createSlice } from "@reduxjs/toolkit";
import CryptoJS from "crypto-js";
import TagManager from "react-gtm-module";

const CART_KEY = "cart";

const getCartFromStorage = () => {
  const cart = window.localStorage.getItem(CART_KEY);
  if (cart) {
    try {
      const bytes = CryptoJS.AES.decrypt(cart, "my-new-secret-key");
      const decryptedCart = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
      return decryptedCart;
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
    item_variant: product.nicotine + " MG", // Append "MG" to the nicotine value
    price: Number(product.price),
    quantity: quantity,
  };

  TagManager.dataLayer({
    dataLayer: {
      event: event,
      currency: currency, // Assume USD or dynamic retrieval
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
      const { product, quantity } = action.payload;
      if (quantity <= 0) return;

      const existingItem = state.itemsList.find(
        (item) => item.product.id === product.id
      );
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        const newItem = { ...product, discount_price: 0 }; // Temporarily set discount_price to 0
        state.itemsList.push({ product: newItem, quantity });
      }
      state.totalQuantity += quantity;

      // Update discount prices for all items
      state.itemsList = updateDiscountPrices(
        state.itemsList,
        state.totalQuantity
      );
      saveCartToStorage(state);
      gtmEvent("add_to_cart", product, quantity);
    },
    removeFromCart(state, action) {
      const id = action.payload;
      const itemToRemove = state.itemsList.find(
        (item) => item.product.id === id
      );
      if (!itemToRemove) return;

      state.itemsList = state.itemsList.filter(
        (item) => item.product.id !== id
      );
      state.totalQuantity -= itemToRemove.quantity;

      // Update discount prices for all items
      state.itemsList = updateDiscountPrices(
        state.itemsList,
        state.totalQuantity
      );
      saveCartToStorage(state);
      gtmEvent("remove_from_cart", itemToRemove.product, itemToRemove.quantity);
    },
    updateCart(state, action) {
      const { product, quantity } = action.payload;
      const existingItem = state.itemsList.find(
        (item) => item.product.id === product.id
      );
      if (!existingItem) return;

      existingItem.quantity = quantity;
      state.totalQuantity = state.itemsList.reduce(
        (total, item) => total + item.quantity,
        0
      );

      // Update discount prices for all items
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
      // Funkcija za ažuriranje cena sada koristi trenutne stavke korpe iz stanja
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

      saveCartToStorage(state); // Sačuvaj ažurirano stanje u lokalnom skladištu
    },
  },
});

export const cartActions = cartSlice.actions;
export default cartSlice.reducer;
