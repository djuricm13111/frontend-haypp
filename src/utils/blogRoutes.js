import { normalizeShopLang } from "./shopRoutes";

export function blogListingPath(lang) {
  return `/${normalizeShopLang(lang)}/blog`;
}

export function blogArticlePath(lang, slug) {
  const s = String(slug ?? "").trim();
  return s ? `${blogListingPath(lang)}/${s}` : blogListingPath(lang);
}
