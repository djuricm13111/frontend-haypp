/**
 * Ručno dodati proizvodi za ProductCard (početna, blog) — jedan izvor istine.
 * Polja kao u shop/API: id, slug, manufacturer, images, …
 */

// --- Zajedničke slike (S3) -------------------------------------------------

const S3 = "https://snus-s3.s3.eu-north-1.amazonaws.com/products";

const CLEW_SPEARMINT_10MG =
  `${S3}/clew/clew-spearmint-10mg_1_g9LFreoQBiRYd33WbaJYl2Kiaq4X5G22RL8XSySV.webp`;
const CLEW_SPEARMINT_10MG_2 =
  `${S3}/clew/clew-spearmint-10mg_2_g9LFreoQBiRYd33WbaJYl2Kiaq4X5G22RL8XSySV.webp`;

const STNG_COLA_CHERRY_MAX =
  `${S3}/stng/stng-cola-cherry-max-en_1_sOOuxdrXmDyRnjI0bPgN3gOPuk2MBJ4VhFs9zyxT.png`;
const STNG_COLA_CHERRY_MAX_2 =
  `${S3}/stng/stng-cola-cherry-max-en_2_sOOuxdrXmDyRnjI0bPgN3gOPuk2MBJ4VhFs9zyxT.png`;

const SKRUF_FROZEN_MINT =
  `${S3}/skruf/skruf-frozen-mint-superslim-s4_1_nKxH1Oxt6RWgCUJ1693373947.png`;

const LOOP_CAPPUCCINO =
  `${S3}/loop/loop-creamy-cappuccino-strong_1_xYcmSgLyl5dmsyKd8L6RrCcMv3KdliJp147nGNEG.webp`;

// Blog slike
const ZYN_APPLE_MINT_MINI_S2 =
  `${S3}/zyn/zyn-apple-mint-mini-s2_1_iDwPURzezFvifWIfDMKhqtxIkXRCAfLPvlzjvWDL.webp`;
const ZYN_SPEARMINT_MINI_S2 =
  `${S3}/zyn/zyn-spearmint-mini-s2_1_916Cr6L3WwcOf1aCCxfsrS2QgCzJcAhzk9dQBUB8.webp`;
const APRES_BLUEBERRY_MINI =
  `${S3}/apres/apres-blueberry-mini_1_lGxTK7aJS52zgzVCVsMzpLDy3H0T2LhKOYb0wCLb.webp`;

function imgPair(src, src2) {
  return [
    { is_primary: true, thumbnail: src, large: src },
    { is_primary: false, thumbnail: src2 || src, large: src2 || src },
  ];
}

// --- Početna: istaknuti proizvodi ------------------------------------------

export const homeFeaturedProductsMock = [
  {
    id: 129,
    slug: "clew-spearmint-10mg",
    name: "Spearmint 10mg",
    category_name: "CLEW",
    manufacturer: "CLEW",
    nicotine: 14,
    price: 4.78,
    is_in_stock: "in_stock",
    card_badge: { labelKey: "PRODUCT_CARD.OFFER" },
    images: imgPair(CLEW_SPEARMINT_10MG, CLEW_SPEARMINT_10MG_2),
  },
  {
    id: 135,
    slug: "stng-cola-cherry-max-en",
    name: "Cola Cherry MAX",
    category_name: "STNG",
    manufacturer: "STNG",
    nicotine: 50,
    price: 4.78,
    is_in_stock: "in_stock",
    card_badge: {
      label: "50mg",
      backgroundColor: "#b71c1c",
      color: "#ffffff",
    },
    images: imgPair(STNG_COLA_CHERRY_MAX, STNG_COLA_CHERRY_MAX_2),
  },
  {
    id: 635,
    slug: "skruf-frozen-mint-superslim-s4",
    name: "Frozen Mint Superslim S4",
    category_name: "Skruf",
    manufacturer: "Skruf",
    nicotine: 15,
    price: 4.69,
    is_in_stock: "in_stock",
    card_badge: {
      label: "New",
      backgroundColor: "#0d47a1",
      color: "#ffffff",
    },
    images: imgPair(SKRUF_FROZEN_MINT),
  },
  {
    id: 348,
    slug: "loop-creamy-cappuccino-strong",
    name: "Creamy Cappuccino Strong",
    category_name: "Loop",
    manufacturer: "Loop",
    nicotine: 15,
    price: 4.78,
    is_in_stock: "in_stock",
    card_badge: {
      label: "Top",
      backgroundColor: "#4e342e",
      color: "#ffffff",
    },
    images: imgPair(LOOP_CAPPUCCINO),
  },
];

// --- Blog: beginner guide (ProductCard u članku) --------------------------

export const blogBeginnerZynAppleMintMini = {
  id: 227,
  slug: "zyn-apple-mint-mini-s2",
  name: "Apple Mint Mini S2",
  category_name: "ZYN",
  manufacturer: "ZYN",
  nicotine: 7.5,
  price: 4.99,
  is_in_stock: "in_stock",
  show_offer: true,
  images: imgPair(ZYN_APPLE_MINT_MINI_S2),
};

export const blogBeginnerZynSpearmintMini = {
  id: 228,
  slug: "zyn-spearmint-mini-s2",
  name: "Spearmint Mini S2",
  category_name: "ZYN",
  manufacturer: "ZYN",
  nicotine: 7.5,
  price: 4.99,
  is_in_stock: "in_stock",
  show_offer: true,
  images: imgPair(ZYN_SPEARMINT_MINI_S2),
};

export const blogBeginnerAprèsBlueberryMini = {
  id: 177,
  slug: "apres-blueberry-mini",
  name: "Blueberry Mini",
  category_name: "apres",
  manufacturer: "Après",
  nicotine: 8,
  price: 4.78,
  is_in_stock: "in_stock",
  show_offer: true,
  images: imgPair(APRES_BLUEBERRY_MINI),
};

export const blogBeginnerGuideProductMocks = [
  blogBeginnerZynAppleMintMini,
  blogBeginnerZynSpearmintMini,
  blogBeginnerAprèsBlueberryMini,
];
