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

  function goToProduct(categoryName, productName) {
    return `/${slugPart(categoryName)}/${slugPart(productName)}`;
  }

  function goToCategory(name) {
    return `/category/${slugPart(name)}`;
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
  };
}
