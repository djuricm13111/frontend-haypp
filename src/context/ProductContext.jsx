import { useState, createContext, useEffect } from "react";
import APIService from "../services/APIService";
import {
  DEFAULT_CURRENCY,
  currencyTags,
  transportMethods,
} from "../utils/global_const";

export const ProductContext = createContext();

/** Stable tie-break for equal sort keys (price, name, …). */
export function productSortKey(p) {
  return p?.id ?? p?.slug ?? "";
}

/** Pure sort for product lists (shop grid, context). */
export function sortProductList(items, criterion, isAscending = true) {
  if (!items?.length) return [];
  const sortedItems = [...items];

  switch (criterion) {
    case "date":
      sortedItems.sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at)
      );
      sortedItems.reverse();
      break;
    case "strength":
      sortedItems.sort((a, b) => {
        const na = Number(a.nicotine);
        const nb = Number(b.nicotine);
        const d =
          (Number.isFinite(na) ? na : 0) - (Number.isFinite(nb) ? nb : 0);
        if (d !== 0) return d;
        return String(productSortKey(a)).localeCompare(
          String(productSortKey(b))
        );
      });
      break;
    case "price":
      sortedItems.sort((a, b) => {
        const pa = Number(a.price);
        const pb = Number(b.price);
        const d =
          (Number.isFinite(pa) ? pa : 0) - (Number.isFinite(pb) ? pb : 0);
        if (d !== 0) return d;
        return String(productSortKey(a)).localeCompare(
          String(productSortKey(b))
        );
      });
      break;
    case "name": {
      sortedItems.sort((a, b) => {
        const c = (a.name || "").localeCompare(b.name || "");
        if (c !== 0) return c;
        return String(productSortKey(a)).localeCompare(
          String(productSortKey(b))
        );
      });
      break;
    }
    case "best_sellers":
      sortedItems.sort((a, b) => b.sales_count - a.sales_count);
      break;
    default:
      break;
  }
  if (!isAscending) {
    sortedItems.reverse();
  }
  return sortedItems;
}

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [product, setProduct] = useState(null);
  const [category, setCategory] = useState(null);
  /** Shop stranica `/snus-verkauf/flavours/...` — ukus je fiksno iz URL-a; filter „Flavour“ se ne prikazuje. */
  const [lockedFlavorGroupId, setLockedFlavorGroupId] = useState(null);
  /** Shop `/snus-verkauf/strength/...` — fiksni mg opsezi; filter „Strength“ se ne prikazuje. */
  const [lockedNicotineRangeLabels, setLockedNicotineRangeLabels] =
    useState(null);
  /**
   * `/snus-verkauf/flavours` ili `/strength` bez slug-a — u prodavnici samo Flavour ili samo Strength filter.
   */
  const [shopFilterOnlyMode, setShopFilterOnlyMode] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [recommendedProducts, setRecommendedProducts] = useState([]);

  const [searchedProducts, setSearchedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [createdOrder, setCreatedOrder] = useState(null);

  const [currencyTag, setCurrencyTag] = useState(
    currencyTags[localStorage.getItem("currency") || DEFAULT_CURRENCY]
  );
  //izgled na mobilnom telefonu
  const [shippingMethod, setShippingMethod] = useState(transportMethods[0]);

  //Ako je sadržaj nikotina po gramu 16 mg, a težina jedne vrećice je 0.75 g, teoretski sadržaj nikotina po vrećici bi trebao biti 0.75 g * 16 mg/g = 12 mg, što se slaže sa navedenim podatkom.
  //S obzirom na to da jedna limenka sadrži 20 vrećica i da je ukupna težina snusa po limenci 15 g, provera za težinu po porciji je 15 g / 20 = 0.75 g po porciji, što se takođe slaže sa navedenim podatkom
  const maxAttributes = { nicotine: 50.0 };
  const [activateConffete, setActivateConffete] = useState(false);

  // const [products, setProducts] = useState([]);
  // const [currentPage, setCurrentPage] = useState(1);
  // const [hasMore, setHasMore] = useState(true); // Da znamo da li imamo još stranica

  // const loadProducts = async (page = 1) => {
  //   try {
  //     const response = await APIService.GetProducts(page);

  //     // Provera da li ima više proizvoda
  //     if (response.length < 30) {
  //       setHasMore(false); // Nema više stranica za učitavanje
  //     }

  //     setProducts((prevProducts) => [...prevProducts, ...response]); // Dodaje proizvode za trenutnu stranicu
  //     setCurrentPage(page); // Ažurira trenutnu stranicu
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  // // Funkcija za učitavanje sledeće stranice
  // const loadMoreProducts = () => {
  //   if (hasMore) {
  //     loadProducts(currentPage + 1);
  //   }
  // };

  const loadProducts = async () => {
    try {
      const response = await APIService.GetProducts();
      setProducts(response);
      setFilteredProducts(response);
    } catch (error) {
      console.error(error);
    }
  };
  const loadCategories = async () => {
    try {
      const response = await APIService.GetCategories();
      setCategories(response);
    } catch (error) {
      console.error(error);
    }
  };
  const loadBestSellers = async () => {
    // Proveravamo da li već imamo proizvode i da li `forShop` parametar je true

    if (products.length) {
      const sortedItems = [...products];
      sortedItems.sort((a, b) => b.sales_count - a.sales_count);
      // Ispravka za dobijanje prvih 12 elemenata niza
      setBestSellers(sortedItems.slice(0, 23));
      return;
    }
  };
  const loadBestSellersBackend = async () => {
    try {
      const response = await APIService.GetBestSellers();
      const list = Array.isArray(response) ? response : [];
      setBestSellers(list.slice(0, 23));
    } catch (error) {
      console.error(error);
    }
  };
  const loadNewArrivalsBackend = async () => {
    try {
      const response = await APIService.GetNewArrivals();
      const list = Array.isArray(response) ? response : [];
      setNewArrivals(list.slice(0, 12));
    } catch (error) {
      console.error(error);
    }
  };
  const loadNewArrivals = async () => {
    if (products.length) {
      const sortedItems = [...products];
      sortedItems.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );

      // Ispravka za dobijanje prvih 12 elemenata niza
      setNewArrivals(sortedItems);
      return;
    }

    /*if (newArrivals.length && forShop) {
      setProducts(newArrivals);
      return;
    }
    try {
      const response = await APIService.GetNewArrivals();
      setNewArrivals(response);
      if (forShop) {
        setProducts(response);
      }
    } catch (error) {
      console.error(error);
    }*/
  };
  const loadProductsByCategorySlug = async (slug) => {
    try {
      const response = await APIService.GetProductsByCategory(slug);
      setProducts(response.products);
      setFilteredProducts(response.products);
      setCategory(response.category);
    } catch (error) {
      console.error(error);
      throw error; // Throwing error to handle it at a higher level if necessary
    }
  };

  const loadProductBySlug = async (slug) => {
    try {
      const product = await APIService.GetProductBySlug(slug);
      return product; // Vraćanje proizvoda može biti korisno ako želite da dalje koristite ovaj podatak
    } catch (error) {
      console.error(error);
      throw error; // Bacanje greške omogućava da se ista obradi na višem nivou ako je potrebno
    }
  };
  const loadRecommededProductsBySlug = async (slug) => {
    try {
      const response = await APIService.GetRecommendedProductsBySlug(slug);

      setRecommendedProducts(response);
    } catch (error) {
      console.error(error);
      throw error; // Bacanje greške omogućava da se ista obradi na višem nivou ako je potrebno
    }
  };

  const fetchFeaturedProducts = async (slug) => {
    try {
      const response = await APIService.getFeaturedGroup(slug);
      return response.products;
    } catch (error) {
      console.error(error);
    }
  };

  function sortProducts(items, criterion, isAscending = true) {
    const sortedItems = sortProductList(items, criterion, isAscending);
    setProducts(sortedItems);
  }

  function updateCurrencyTag() {
    const storedCurrency = localStorage.getItem("currency");

    // Postavljanje simbola valute iz mape ili korišćenje samog koda valute ako simbol nije definisan
    const tag = currencyTags[storedCurrency] || currencyTags[DEFAULT_CURRENCY]; // Ako `storedCurrency` nije u mapi, koristi se podrazumevani simbol ($)
    setCurrencyTag(tag);
  }

  useEffect(() => {
    updateCurrencyTag();
  }, []);

  const createOrder = async (orderData, accessToken) => {
    try {
      const createdOrder = await APIService.createOrder(orderData, accessToken);

      // const updatedUserProfile = { ...userProfile };
      // updatedUserProfile.addresses.push(createdAddress);
      // setUserProfile(updatedUserProfile);
      // localStorage.setItem(
      //   "userProfileData",
      //   JSON.stringify(updatedUserProfile)
      // );

      return createdOrder;
    } catch (error) {
      console.error("Error creating new address:", error);
      throw error; // Ili obradite grešku na način koji vam odgovara
    }
  };

  let contextData = {
    products,
    categories,
    //search
    setProducts,
    setSearchedProducts,
    searchedProducts,
    //
    filteredProducts,
    setFilteredProducts,

    setIsCartOpen,
    maxAttributes,
    activateConffete,
    setActivateConffete,
    loadProducts,
    loadCategories,
    loadProductsByCategorySlug,
    loadProductBySlug,
    loadRecommededProductsBySlug,
    loadBestSellers,
    loadBestSellersBackend,
    bestSellers,
    loadNewArrivalsBackend,
    loadNewArrivals,
    newArrivals,
    fetchFeaturedProducts,
    category,
    setCategory,
    lockedFlavorGroupId,
    setLockedFlavorGroupId,
    lockedNicotineRangeLabels,
    setLockedNicotineRangeLabels,
    shopFilterOnlyMode,
    setShopFilterOnlyMode,
    product,
    setProduct,
    recommendedProducts,
    sortProducts,

    updateCurrencyTag,
    currencyTag,

    createOrder,
    createdOrder,
    setCreatedOrder,
    shippingMethod,
    setShippingMethod,
  };
  return (
    <ProductContext.Provider value={contextData}>
      {children}
    </ProductContext.Provider>
  );
};
