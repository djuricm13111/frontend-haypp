import { useState, createContext, useEffect } from "react";
import APIService from "../services/APIService";
import {
  DEFAULT_CURRENCY,
  currencyTags,
  transportMethods,
} from "../utils/global_const";

export const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [product, setProduct] = useState(null);
  const [category, setCategory] = useState(null);
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
      setBestSellers(response.slice(0, 23));
    } catch (error) {
      console.error(error);
    }
  };
  const loadNewArrivalsBackend = async () => {
    try {
      const response = await APIService.GetNewArrivals();
      setNewArrivals(response.slice(0, 23));
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
    const sortedItems = [...items]; // Create a copy to avoid mutating the original array

    switch (criterion) {
      //case 'date':
      //  sortedItems.sort((a, b) => new Date(a.expirationDate) - new Date(b.expirationDate));
      //  break;
      case "date":
        sortedItems.sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at)
        );
        sortedItems.reverse();
        break;
      case "strength":
        sortedItems.sort((a, b) => a.nicotine - b.nicotine);
        break;
      case "price":
        sortedItems.sort((a, b) => a.price - b.price);
        break;
      case "name":
        sortedItems.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "best_sellers":
        sortedItems.sort((a, b) => b.sales_count - a.sales_count); // Assuming 'sales_count' indicates how many times the product was sold
        break;
      default:
        console.warn("Invalid sorting criterion provided:", criterion);
        break;
    }
    if (!isAscending) {
      sortedItems.reverse();
    }

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
