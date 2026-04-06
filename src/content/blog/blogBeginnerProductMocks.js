/**
 * Minimalni mock proizvoda za ProductCard u blog članku „Beginner’s guide“.
 * Slugovi odgovaraju `descriptions.json` / PDP putanjama.
 */
function imgPair(src) {
  return [
    { is_primary: true, thumbnail: src, large: src },
    { is_primary: false, thumbnail: src, large: src },
  ];
}

const ZYN_APPLE_MINT_MINI =
  "https://snus-s3.s3.eu-north-1.amazonaws.com/products/zyn/WEBP/zyn_apple_mint_mini_dry_left.webp";

/** Berry-style vizuel za kartu (Après / voćni mini). */
const BERRY_MINI_PLACEHOLDER =
  "https://snus-s3.s3.eu-north-1.amazonaws.com/products/velo/WEBP/velo_BAT2011_SE_VELO_RUBY_BERRY_front.webp";

export const blogBeginnerZynAppleMintMini = {
  id: "blog-bg-zyn-apple-mint-mini-s2",
  name: "Apple Mint Mini",
  slug: "zyn-apple-mint-mini-s2",
  category_name: "ZYN",
  manufacturer: "ZYN",
  nicotine: 3,
  price: 2.49,
  is_in_stock: "in_stock",
  show_offer: true,
  images: imgPair(ZYN_APPLE_MINT_MINI),
  
};

export const blogBeginnerZynSpearmintMini = {
  id: "blog-bg-zyn-spearmint-mini-s1",
  name: "Spearmint Mini",
  slug: "zyn-spearmint-mini-s1",
  category_name: "ZYN",
  manufacturer: "ZYN",
  nicotine: 1.5,
  price: 2.49,
  is_in_stock: "in_stock",
  show_offer: true,
  images: imgPair(ZYN_APPLE_MINT_MINI),
};

/** PDP: `apres-blueberry-mini` — tekst u članku može da pominje On! Berry dok je u katalogu drugačiji SKU. */
export const blogBeginnerAprèsBlueberryMini = {
  id: "blog-bg-apres-blueberry-mini",
  name: "Blueberry Mini",
  slug: "apres-blueberry-mini",
  category_name: "apres",
  manufacturer: "Après",
  nicotine: 3.2,
  price: 2.89,
  is_in_stock: "in_stock",
  show_offer: true,
  images: imgPair(BERRY_MINI_PLACEHOLDER),
};

export const blogBeginnerGuideProductMocks = [
  blogBeginnerZynAppleMintMini,
  blogBeginnerZynSpearmintMini,
  blogBeginnerAprèsBlueberryMini,
];
