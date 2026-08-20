/**
 * Jedan izvor istine za putanje prodavnice: /{lang}/snus-verkauf/...
 * Koristi: header dropdown, mobilni drawer, početna stranica, navigate(goToShop).
 */

export const SHOP_PATH_SEGMENT = "snus-verkauf";

export function normalizeShopLang(lng) {
  const l = String(lng || "en").split("-")[0].toLowerCase();
  if (l === "de") return "de";
  if (l === "hu") return "hu";
  return "en";
}

/** Puna prodavnica: /de/snus-verkauf */
export function shopBasePath(lang) {
  return `/${normalizeShopLang(lang)}/${SHOP_PATH_SEGMENT}`;
}

/** Brend ili kategorija po slug-u: /en/zyn */
export function shopBrandPath(lang, categorySlug) {
  const s = String(categorySlug ?? "")
    .trim()
    .replace(/^\/+|\/+$/g, "");
  return s ? `/${normalizeShopLang(lang)}/${s}` : shopBasePath(lang);
}

/** Samo filter po ukusu — bez fiksnog slug-a. */
export function shopFlavoursHubPath(lang) {
  return `${shopBasePath(lang)}/flavours`;
}

/** Ukus: /en/snus-verkauf/flavours/mint — slug kao u flavorGroups (mint, fruit, …). */
export function shopFlavourPath(lang, flavourUrlSlug) {
  const s = String(flavourUrlSlug ?? "").trim();
  return `${shopBasePath(lang)}/flavours/${s}`;
}

/** Samo filter po jačini — bez fiksnog slug-a. */
export function shopStrengthHubPath(lang) {
  return `${shopBasePath(lang)}/strength`;
}

/** Jačina: /en/snus-verkauf/strength/low */
export function shopStrengthPath(lang, strengthSlug) {
  const s = String(strengthSlug ?? "").trim();
  return `${shopBasePath(lang)}/strength/${s}`;
}

/** Frontend stranica bestsellera — podaci: `APIService.API_PRODUCT_LISTINGS.BEST_SELLERS`. */
export function shopBestsellersPath(lang) {
  return `/${normalizeShopLang(lang)}/bestsellers`;
}

/** Frontend „new in store“ — podaci: `APIService.API_PRODUCT_LISTINGS.NEW_ARRIVALS`. */
export function shopNewInStorePath(lang) {
  return `/${normalizeShopLang(lang)}/new-in-store`;
}

/** Mix packovi i bundle listing — `APIService.API_PRODUCT_LISTINGS.MIX_PACKS`. */
export function shopMixpacksBundlesPath(lang) {
  return `/${normalizeShopLang(lang)}/mixpacks-bundles`;
}

/** Ponude / popusti — `APIService.API_PRODUCT_LISTINGS.OFFERS`. */
export function shopOffersPath(lang) {
  return `/${normalizeShopLang(lang)}/offers`;
}

/** Pregled svih brendova — podaci: `APIService.GetCategories()`. */
export function shopAllBrandsPath(lang) {
  return `/${normalizeShopLang(lang)}/all-brands`;
}

/**
 * Rezultati pretrage — uobičajeni oblik `/:lang/search?q=...` (deljivi link, bez path segmenta za ceo upit).
 */
export function shopSearchPath(lang, query) {
  const base = `/${normalizeShopLang(lang)}/search`;
  const q = String(query ?? "").trim();
  if (!q) return base;
  return `${base}?${new URLSearchParams({ q }).toString()}`;
}

/**
 * Dropdown „Nicotine Pouches“ (desktop header + mobilni side menu) — isti sadržaj.
 * @param {string} lang — npr. i18n.language
 * @param {(key: string) => string} t — react-i18next `t`
 */
export function buildShopNavDropdown(lang, t) {
  const T = (key) => t(`HEADER.SHOP_NAV.${key}`);
  return {
    first: [
      {
        title: T("POPULAR_BRANDS"),
        href: shopAllBrandsPath(lang),
        items: [
          { label: "ZYN", href: shopBrandPath(lang, "zyn") },
          { label: "VELO", href: shopBrandPath(lang, "velo") },
          { label: "XQS", href: shopBrandPath(lang, "xqs") },
          { label: "Skruf", href: shopBrandPath(lang, "skruf") },
          { label: "FUMi", href: shopBrandPath(lang, "fumi") },
        ],
      },
      {
        title: T("SHOP_BY_FLAVOUR"),
        href: shopFlavoursHubPath(lang),
        items: [
          { label: T("FRUIT_POUCHES"), href: shopFlavourPath(lang, "fruit") },
          { label: T("COFFEE_POUCHES"), href: shopFlavourPath(lang, "coffee") },
          { label: T("MINT_POUCHES"), href: shopFlavourPath(lang, "mint") },
        ],
      },
      {
        title: T("SHOP_BY_STRENGTH"),
        href: shopStrengthHubPath(lang),
        items: [
          { label: T("STRENGTH_LOW"), href: shopStrengthPath(lang, "low") },
          { label: T("STRENGTH_NORMAL"), href: shopStrengthPath(lang, "normal") },
          { label: T("STRENGTH_STRONG"), href: shopStrengthPath(lang, "strong") },
          { label: T("STRENGTH_EXTRA_STRONG"), href: shopStrengthPath(lang, "extra-strong") },
          { label: T("STRENGTH_ULTRA_STRONG"), href: shopStrengthPath(lang, "ultra-strong") },
        ],
      },
      {
        title: T("SNUS_POUCHES"),
        href: "/snus",
      },
      {
        title: T("SUBSCRIPTIONS"),
        href: "/subscriptions",
      },
      {
        title: T("FREE_SAMPLE"),
        href: "/free-sample",
      },
      {
        title: T("CAN_OF_THE_MONTH"),
        href: "/can-of-the-month",
      },
    ],
    second: [
      { title: T("OFFERS"), href: shopOffersPath(lang) },
      { title: T("FREE_SAMPLE"), href: "/free-sample" },
      { title: T("MIXPACKS_BUNDLES"), href: shopMixpacksBundlesPath(lang) },
    ],
  };
}
