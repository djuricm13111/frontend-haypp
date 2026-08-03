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

const VELO_CRISPY_PEPPERMINT =
  `${S3}/velo/velo-crispy-peppermint_1_ZnosO40gTR3Cz2QjdPfPntYRZyzKi1h1k2Pq5veB.webp`;
const VELO_CRISPY_PEPPERMINT_2 =
  `${S3}/velo/velo-crispy-peppermint_2_ZnosO40gTR3Cz2QjdPfPntYRZyzKi1h1k2Pq5veB.webp`;


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
    id: 1,
    slug: "velo-crispy-peppermint",
    name: "Crispy Peppermint",
    category_name: "Velo",
    manufacturer: "Velo",
    nicotine: 14,
    price: 4.79,
    is_in_stock: "in_stock",
    card_badge: {
      label: "Top",
      backgroundColor: "#002069",
      color: "#ffffff",
    },
    images: imgPair(VELO_CRISPY_PEPPERMINT, VELO_CRISPY_PEPPERMINT_2),
  },
];

