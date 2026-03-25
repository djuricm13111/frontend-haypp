const VELO_RUBY_BERRY_FRONT =
  "https://snus-s3.s3.eu-north-1.amazonaws.com/products/velo/WEBP/velo_BAT2011_SE_VELO_RUBY_BERRY_front.webp";
const VELO_RUBY_BERRY_LEFT =
  "https://snus-s3.s3.eu-north-1.amazonaws.com/products/velo/WEBP/velo_BAT2011_SE_VELO_RUBY_BERRY_LEFT.webp";
const VELO_RUBY_BERRY_RIGHT =
  "https://snus-s3.s3.eu-north-1.amazonaws.com/products/velo/WEBP/velo_BAT2011_SE_VELO_RUBY_BERRY_RIGHT.webp";

const VELO_FREEZE_ULTRA =
  "https://snus-s3.s3.eu-north-1.amazonaws.com/products/velo/WEBP/velo_freeze-ULTRA-strong-snus.webp";

const ZYN_APPLE_MINT_MINI_DRY_LEFT =
  "https://snus-s3.s3.eu-north-1.amazonaws.com/products/zyn/WEBP/zyn_apple_mint_mini_dry_left.webp";

const XQS_EPIC_FREEZE_FRONT =
  "https://snus-s3.s3.eu-north-1.amazonaws.com/products/xqs/WEBP/xqs_epic_freeze_front.webp";

/**
 * Demo proizvodi za početnu — ista polja koja očekuje ProductCard i cart (id, manufacturer, nicotine, images…).
 *
 * Opcioni bedž na slici:
 * - `card_badge: { label, backgroundColor?, color? }` ili `labelKey` (i18n) umesto `label`
 * - aliasi: `background`, `textColor` umesto `backgroundColor` / `color`
 * - legacy: `show_offer: true` → isti tekst kao PRODUCT_CARD.OFFER, podrazumevane boje
 *
 * Zameni API podacima kada bude spremno.
 */
function imgPair(src) {
  return [
    { is_primary: true, thumbnail: src, large: src },
    { is_primary: false, thumbnail: src, large: src },
  ];
}

export const homeFeaturedProductsMock = [
  {
    id: "home-featured-velo-ruby-berry",
    name: "Ruby Berry",
    category_name: "Velo",
    manufacturer: "Velo",
    nicotine: 10,
    price: 5.49,
    is_in_stock: "in_stock",
    card_badge: { labelKey: "PRODUCT_CARD.OFFER" },
    images: [
      {
        is_primary: true,
        thumbnail: VELO_RUBY_BERRY_FRONT,
        large: VELO_RUBY_BERRY_FRONT,
      },
      {
        is_primary: false,
        thumbnail: VELO_RUBY_BERRY_LEFT,
        large: VELO_RUBY_BERRY_LEFT,
      },
      {
        is_primary: false,
        thumbnail: VELO_RUBY_BERRY_RIGHT,
        large: VELO_RUBY_BERRY_RIGHT,
      },
    ],
  },
  {
    id: "home-featured-velo-freeze-ultra",
    name: "Freeze Ultra Strong",
    category_name: "Velo",
    manufacturer: "Velo",
    nicotine: 11,
    price: 5.49,
    is_in_stock: "out_of_stock",
    card_badge: {
      label: "New",
      backgroundColor: "#0d47a1",
      color: "#ffffff",
    },
    images: imgPair(VELO_FREEZE_ULTRA),
  },
  {
    id: "home-featured-zyn-apple-mint-mini-dry",
    name: "Apple Mint Mini Dry",
    category_name: "ZYN",
    manufacturer: "ZYN",
    nicotine: 3,
    price: 4.99,
    is_in_stock: "in_stock",
    card_badge: {
      label: "Sale",
      backgroundColor: "#c62828",
      color: "#ffffff",
    },
    images: imgPair(ZYN_APPLE_MINT_MINI_DRY_LEFT),
  },
  {
    id: "home-featured-xqs-epic-freeze",
    name: "Epic Freeze",
    category_name: "XQS",
    manufacturer: "XQS",
    nicotine: 8,
    price: 4.69,
    is_in_stock: "in_stock",
    card_badge: {
      label: "-15%",
      backgroundColor: "#2e7d32",
      color: "#ffffff",
    },
    images: imgPair(XQS_EPIC_FREEZE_FRONT),
  },
];
