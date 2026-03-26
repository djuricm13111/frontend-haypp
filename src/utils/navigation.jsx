import { useNavigate } from "react-router-dom";

function slugPart(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-");
}

/**
 * Putanje za navigate(...). Koristi: navigate(goToHome()) itd.
 */
export function useNavigation() {
  const navigate = useNavigate();

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

  function goToForgotPassword() {
    return "/forgot-password";
  }

  function goToCheckout() {
    return "/checkout";
  }

  function goToSearch(searchValue) {
    return `/search/${encodeURIComponent(searchValue || "")}`;
  }

  /** PDP: /{slug-kategorije}/{slug-kategorije}-{slug-proizvoda} npr. /velo/velo-ruby-berry */
  function goToProduct(categoryName, productName) {
    const cat = slugPart(categoryName) || "proizvod";
    const prod = slugPart(productName);
    return `/${cat}/${cat}-${prod}`;
  }

  function goToCategory(name) {
    return `/category/${slugPart(name)}`;
  }

  /** Lista „Nicotine pouches” (isti obrazac kao u HomePromoIntro / HomeMain). */
  function goToShop() {
    return "/category/nicotine-pouches";
  }

  return {
    goToHome,
    goToLogin,
    goToVerification,
    goToRegister,
    goToForgotPassword,
    goToCheckout,
    goToSearch,
    goToProduct,
    goToCategory,
    goToShop,
  };
}
