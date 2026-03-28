/**
 * URL segment posle `/:lang/snus-verkauf/strength/:slug` — usklađeno sa FilterSection NICOTINE_RANGES labelama.
 */

/** @type {Record<string, string[]>} */
export const STRENGTH_SLUG_TO_RANGE_LABELS = {
  low: ["0-5 mg"],
  normal: ["5-9 mg"],
  strong: ["9-12 mg", "12-15 mg"],
  "extra-strong": ["15-17 mg"],
  "ultra-strong": ["17-65 mg"],
};

/** Ključ za `SHOP.STRENGTH_PAGE.<key>` (underscore u JSON-u). */
const SLUG_TO_I18N_KEY = {
  low: "low",
  normal: "normal",
  strong: "strong",
  "extra-strong": "extra_strong",
  "ultra-strong": "ultra_strong",
};

/**
 * @param {string | undefined} urlSlug
 * @returns {string[] | null}
 */
export function strengthUrlSlugToRangeLabels(urlSlug) {
  if (urlSlug == null || urlSlug === "") return null;
  const s = String(urlSlug).toLowerCase().trim();
  return STRENGTH_SLUG_TO_RANGE_LABELS[s] ?? null;
}

/**
 * @param {string | undefined} urlSlug
 * @returns {string | null}
 */
export function strengthUrlSlugToI18nKey(urlSlug) {
  if (urlSlug == null || urlSlug === "") return null;
  const s = String(urlSlug).toLowerCase().trim();
  return SLUG_TO_I18N_KEY[s] ?? null;
}
