/**
 * Tekst za naslov / uvod ispod naslova na shop stranici.
 * Backend može slati kratki opis po jeziku; brand JSON može imati short_desc_*.
 */

function normalizeLang(lng) {
  const l = String(lng || "en").split("-")[0].toLowerCase();
  return l === "de" ? "de" : "en";
}

/**
 * Kratki opis iz API kategorije (nakon GetProductsByCategory / category slug).
 */
export function getCategoryShortDescription(category, lang) {
  if (!category || typeof category !== "object") return null;
  const l = normalizeLang(lang);

  if (l === "de" && category.short_description_de) {
    return String(category.short_description_de).trim() || null;
  }
  if (l === "en" && category.short_description_en) {
    return String(category.short_description_en).trim() || null;
  }

  if (category.short_description) {
    return String(category.short_description).trim() || null;
  }

  const sd = category.seo_data;
  if (sd && typeof sd === "object") {
    if (l === "de" && sd.short_description_de) {
      return String(sd.short_description_de).trim() || null;
    }
    if (l === "en" && sd.short_description_en) {
      return String(sd.short_description_en).trim() || null;
    }
    if (sd.short_description) {
      return String(sd.short_description).trim() || null;
    }
    if (sd.description) {
      return String(sd.description).trim() || null;
    }
  }

  return null;
}

/**
 * Kratki opis iz brand_descriptions.json zapisa (opcioni short_desc_en / short_desc_de).
 */
export function getBrandEntryShortDescription(entry, lang) {
  if (!entry || typeof entry !== "object") return null;
  const l = normalizeLang(lang);
  const shortKey = l === "de" ? "short_desc_de" : "short_desc_en";
  if (entry[shortKey]) {
    return String(entry[shortKey]).trim() || null;
  }
  const retailKey = l === "de" ? "retail_desc_de" : "retail_desc_en";
  const retail = entry[retailKey];
  if (!retail || typeof retail !== "string") return null;
  const first = retail.split(/\n\n/)[0].trim().replace(/\*\*/g, "");
  if (!first) return null;
  return first.length > 360 ? `${first.slice(0, 357)}…` : first;
}
