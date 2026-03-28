/**
 * Grupisanje `product.flavor` u nekoliko kategorija (mint, voće/jagode, citrus, …)
 * da filter ne bude dugačka lista svih različitih stringova.
 */

export const FLAVOR_GROUP_ORDER = [
  "mint",
  "fruit_berry",
  "citrus",
  "coffee_sweet",
  "liquorice",
  "other",
];

const LABEL_KEY = {
  mint: "FILTER.FLAVOR_GROUP_MINT",
  fruit_berry: "FILTER.FLAVOR_GROUP_FRUIT_BERRY",
  citrus: "FILTER.FLAVOR_GROUP_CITRUS",
  coffee_sweet: "FILTER.FLAVOR_GROUP_COFFEE_SWEET",
  liquorice: "FILTER.FLAVOR_GROUP_LIQUORICE",
  other: "FILTER.FLAVOR_GROUP_OTHER",
};

export function getFlavorGroupLabelKey(groupId) {
  return LABEL_KEY[groupId] || LABEL_KEY.other;
}

/**
 * Jedna grupa po proizvodu — redosled provera određuje kategoriju.
 */
export function getFlavorGroupId(flavor) {
  const raw = String(flavor ?? "").trim();
  if (!raw) return "other";

  const f = raw.toLowerCase();

  // Mint / sveže (uključuje reč „mint“, mentol, eukaliptus)
  if (/mint|menthol|spearmint|peppermint|eucalyptus|fresh freeze|frost/i.test(f)) {
    return "mint";
  }

  if (/liquorice|licorice|salmiak|lakritz|anis|anise/i.test(f)) {
    return "liquorice";
  }

  if (
    /citrus|lemon|lime|orange|grapefruit|tangerine|yuzu|bergamot|citron/i.test(f)
  ) {
    return "citrus";
  }

  if (
    /berry|berries|strawberry|raspberry|blueberry|blackberry|currant|cherry|fruit|apple|grape|melon|peach|mango|tropical|forest|skog|frukt|watermelon|pineapple|dragon|pomegranate|pear|plum|banana|passion/i.test(
      f
    )
  ) {
    return "fruit_berry";
  }

  if (
    /coffee|mocha|espresso|cocoa|chocolate|caramel|vanilla|toffee|cream|honey|biscuit|cookie|dessert/i.test(
      f
    )
  ) {
    return "coffee_sweet";
  }

  return "other";
}

export function getPresentFlavorGroupIds(products) {
  const ids = new Set();
  for (const p of products || []) {
    ids.add(getFlavorGroupId(p.flavor));
  }
  return FLAVOR_GROUP_ORDER.filter((id) => ids.has(id));
}

export function productMatchesFlavorGroups(product, selectedGroupIds) {
  if (!selectedGroupIds?.size) return true;
  const gid = getFlavorGroupId(product.flavor);
  return selectedGroupIds.has(gid);
}

/** URL segment posle `/flavours/` (npr. `fruit`) → interni group id (`fruit_berry`). */
const URL_SLUG_TO_GROUP = {
  mint: "mint",
  fruit: "fruit_berry",
  "fruit-berry": "fruit_berry",
  berry: "fruit_berry",
  citrus: "citrus",
  coffee: "coffee_sweet",
  "coffee-sweet": "coffee_sweet",
  liquorice: "liquorice",
  other: "other",
};

/** Interni id → jedan kanonski URL slug za `/{lang}/snus-verkauf/flavours/:slug`. */
export const FLAVOR_GROUP_TO_URL_SLUG = {
  mint: "mint",
  fruit_berry: "fruit",
  citrus: "citrus",
  coffee_sweet: "coffee",
  liquorice: "liquorice",
  other: "other",
};

export function flavorUrlSlugToGroupId(urlSlug) {
  if (urlSlug == null || urlSlug === "") return null;
  const s = String(urlSlug).toLowerCase().trim();
  return URL_SLUG_TO_GROUP[s] ?? null;
}

export function flavorGroupIdToUrlSlug(groupId) {
  return FLAVOR_GROUP_TO_URL_SLUG[groupId] ?? null;
}
