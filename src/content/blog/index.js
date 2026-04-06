/**
 * Registar članaka. Novi post: novi fajl u ovom folderu + import ovde.
 * Hero i related slike se podešavaju u samom fajlu članka (`heroImage`, `relatedArticles[].image`).
 */
import { veloMiniVsSlim } from "./veloMiniVsSlim";
import { pabloNicotinePouchesReview } from "./pabloNicotinePouchesReview";
import { nicotinePouchesVsVapes } from "./nicotinePouchesVsVapes";
import { beginnersGuideNicotinePouches } from "./beginnersGuideNicotinePouches";

/** Noviji članci prvi u listi bloga */
export const blogPosts = [
  beginnersGuideNicotinePouches,
  nicotinePouchesVsVapes,
  pabloNicotinePouchesReview,
  veloMiniVsSlim,
];

export function getPostBySlug(slug) {
  return blogPosts.find((p) => p.slug === slug) ?? null;
}

function langKey(lang) {
  return lang === "de" ? "de" : "en";
}

export function listPostsSummaries(lang) {
  const l = langKey(lang);
  return blogPosts.map((p) => ({
    slug: p.slug,
    title: p.meta.title[l],
    excerpt: p.meta.description[l],
    published: p.published,
    author: p.author[l],
    heroImage: p.heroImage ?? null,
  }));
}
