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

/**
 * Recursively walks every plain object in a blog post.
 * For any object that has an `en` key but no `hu` key, adds `hu = en`.
 * This acts as a safety net for any future language additions — real `hu:`
 * keys in blog files take precedence because this only adds `hu` when missing.
 */
function addHuFallback(value) {
  if (Array.isArray(value)) return value.map(addHuFallback);
  if (value && typeof value === "object" && value.constructor === Object) {
    const result = {};
    for (const [k, v] of Object.entries(value)) {
      result[k] = addHuFallback(v);
    }
    if ("en" in result && !("hu" in result)) {
      result.hu = result.en;
    }
    return result;
  }
  return value;
}

function langKey(lang) {
  if (lang === "de") return "de";
  if (lang === "hu") return "hu";
  return "en";
}

export function getPostBySlug(slug) {
  const post = blogPosts.find((p) => p.slug === slug) ?? null;
  return post ? addHuFallback(post) : null;
}

export function listPostsSummaries(lang) {
  const l = langKey(lang);
  return blogPosts.map((p) => {
    const post = addHuFallback(p);
    return {
      slug: post.slug,
      title: post.meta.title[l],
      excerpt: post.meta.description[l],
      published: post.published,
      author: post.author[l],
      heroImage: post.heroImage ?? null,
    };
  });
}
