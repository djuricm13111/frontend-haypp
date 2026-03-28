/**
 * Kategorije iz `GetCategories()` → { name, slug } za linkove u prodavnicu.
 */
export function mapCategoryToBrand(category) {
  const raw = category ?? {};
  const name = String(raw.name ?? raw.title ?? "").trim();
  const slug = String(raw.slug ?? raw.category_slug ?? "").trim();
  if (!name || !slug) return null;
  return { name, slug };
}

function firstLetterBucket(char, locale) {
  if (!char) return "#";
  try {
    if (/\p{L}/u.test(char)) {
      return char.toLocaleUpperCase(locale);
    }
  } catch {
    if (/[A-Za-z]/.test(char)) return char.toUpperCase();
  }
  return "#";
}

/**
 * Sortira po imenu, grupiše po prvom slovu (ne-slova → `"#"`).
 * @param {unknown[]} categories
 * @param {string} locale — npr. `"de"` | `"en"`
 * @returns {{ letter: string, brands: { name: string, slug: string }[] }[]}
 */
export function groupBrandsByLetter(categories, locale) {
  const loc = String(locale || "en").split("-")[0];
  const items = (Array.isArray(categories) ? categories : [])
    .map(mapCategoryToBrand)
    .filter(Boolean);
  items.sort((a, b) =>
    a.name.localeCompare(b.name, loc, { sensitivity: "base" }),
  );

  const bucket = new Map();
  for (const item of items) {
    const first = item.name.trim().charAt(0);
    const letter = firstLetterBucket(first, loc);
    if (!bucket.has(letter)) bucket.set(letter, []);
    bucket.get(letter).push(item);
  }

  const keys = [...bucket.keys()].sort((a, b) => {
    if (a === "#") return 1;
    if (b === "#") return -1;
    return a.localeCompare(b, loc, { sensitivity: "base" });
  });

  return keys.map((letter) => ({
    letter,
    brands: bucket.get(letter) ?? [],
  }));
}
