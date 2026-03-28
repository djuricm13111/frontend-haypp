/**
 * Jedan izvor istine za putanje prodavnice: /{lang}/snus-verkauf/...
 * Koristi: header dropdown, mobilni drawer, početna stranica, navigate(goToShop).
 */

export const SHOP_PATH_SEGMENT = "snus-verkauf";

export function normalizeShopLang(lng) {
  const l = String(lng || "en").split("-")[0].toLowerCase();
  return l === "de" ? "de" : "en";
}

/** Puna prodavnica: /de/snus-verkauf */
export function shopBasePath(lang) {
  return `/${normalizeShopLang(lang)}/${SHOP_PATH_SEGMENT}`;
}

/** Brend ili kategorija po slug-u: /en/snus-verkauf/zyn */
export function shopBrandPath(lang, categorySlug) {
  const s = String(categorySlug ?? "")
    .trim()
    .replace(/^\/+|\/+$/g, "");
  return s ? `${shopBasePath(lang)}/${s}` : shopBasePath(lang);
}

/** Ukus: /en/snus-verkauf/flavours/mint — slug kao u flavorGroups (mint, fruit, …). */
export function shopFlavourPath(lang, flavourUrlSlug) {
  const s = String(flavourUrlSlug ?? "").trim();
  return `${shopBasePath(lang)}/flavours/${s}`;
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

/**
 * Dropdown „Nicotine Pouches“ (desktop header + mobilni side menu) — isti sadržaj.
 * @param {string} lang — npr. i18n.language
 */
export function buildShopNavDropdown(lang) {
  const base = shopBasePath(lang);
  return {
    first: [
      {
        title: "Popular Brands",
        href: base,
        items: [
          { label: "ZYN", href: shopBrandPath(lang, "zyn") },
          { label: "Nordic Spirit", href: shopBrandPath(lang, "nordic-spirit") },
          { label: "VELO", href: shopBrandPath(lang, "velo") },
          { label: "FUMi", href: shopBrandPath(lang, "fumi") },
          { label: "XQS", href: shopBrandPath(lang, "xqs") },
          { label: "KILLA", href: shopBrandPath(lang, "killa") },
          { label: "PABLO", href: shopBrandPath(lang, "pablo") },
        ],
      },
      {
        title: "Shop by Flavour",
        href: shopFlavourPath(lang, "mint"),
        items: [
          { label: "Mint Pouches", href: shopFlavourPath(lang, "mint") },
          { label: "Fruit Pouches", href: shopFlavourPath(lang, "fruit") },
          { label: "Coffee Pouches", href: shopFlavourPath(lang, "coffee") },
        ],
      },
      {
        title: "Shop by Strength",
        href: shopStrengthPath(lang, "low"),
        items: [
          { label: "Low", href: shopStrengthPath(lang, "low") },
          { label: "Normal", href: shopStrengthPath(lang, "normal") },
          { label: "Strong", href: shopStrengthPath(lang, "strong") },
          { label: "Extra Strong", href: shopStrengthPath(lang, "extra-strong") },
          { label: "Ultra Strong", href: shopStrengthPath(lang, "ultra-strong") },
        ],
      },
      {
        title: "Snus Pouches",
        href: "/snus",
      },
      {
        title: "Subscriptions",
        href: "/subscriptions",
      },
      {
        title: "Free Sample",
        href: "/free-sample",
      },
      {
        title: "Can of the Month",
        href: "/can-of-the-month",
      },
    ],
    second: [
      { title: "Free Sample", href: "/free-sample" },
      { title: "Mixpacks & Bundles", href: "/mixpacks-bundles" },
    ],
  };
}
