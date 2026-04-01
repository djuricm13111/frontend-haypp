import { useTranslation } from "react-i18next";
import {
  shopBasePath,
  shopBestsellersPath,
  shopNewInStorePath,
  shopAllBrandsPath,
  shopSearchPath,
  shopFlavourPath,
} from "./shopRoutes";

function slugPart(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-");
}

function normalizeLang(lng) {
  const l = String(lng || "en").split("-")[0].toLowerCase();
  return l === "de" ? "de" : "en";
}

/**
 * Putanje za navigate(...). Koristi: navigate(goToHome()) itd.
 */
export function useNavigation() {
  const { i18n } = useTranslation();

  function goToHome() {
    return "/";
  }

  /** Login je drawer u headeru — vraća home. */
  function goToLogin() {
    return "/";
  }

  function goToVerification() {
    return "/verify";
  }

  function goToRegister() {
    return "/register";
  }

  /** Nalog (ulogovan korisnik) — profil, porudžbine. */
  function goToAccount() {
    return "/account";
  }

  function goToForgotPassword() {
    return "/forgot-password";
  }

  function goToCheckout() {
    return "/checkout";
  }

  function goToSearch(searchValue) {
    const lang = normalizeLang(i18n.language);
    return shopSearchPath(lang, searchValue);
  }

  /** PDP: /{lang}/{category_slug}/{product_slug} npr. /de/velo/velo-crispy-peppermint */
  function goToProduct(categoryName, productName, productSlug) {
    const lang = normalizeLang(i18n.language);
    const cat = slugPart(categoryName) || "product";
    const slug =
      productSlug && String(productSlug).trim()
        ? slugPart(productSlug)
        : slugPart(productName);
    return `/${lang}/${cat}/${slug}`;
  }

  function goToCategory(name) {
    return `/category/${slugPart(name)}`;
  }

  /** Shop lista — vidi `shopRoutes.js`. */
  function goToShop() {
    return shopBasePath(i18n.language);
  }

  function goToBestsellers() {
    return shopBestsellersPath(i18n.language);
  }

  function goToNewInStore() {
    return shopNewInStorePath(i18n.language);
  }

  function goToAllBrands() {
    return shopAllBrandsPath(i18n.language);
  }

  /** Ukus u prodavnici: /{lang}/snus-verkauf/flavours/{slug} npr. mint, fruit, coffee */
  function goToFlavour(flavourUrlSlug) {
    return shopFlavourPath(i18n.language, flavourUrlSlug);
  }

  return {
    goToHome,
    goToLogin,
    goToVerification,
    goToRegister,
    goToAccount,
    goToForgotPassword,
    goToCheckout,
    goToSearch,
    goToProduct,
    goToCategory,
    goToShop,
    goToBestsellers,
    goToNewInStore,
    goToAllBrands,
    goToFlavour,
  };
}
