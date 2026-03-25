import bannerFumi from "../../assets/images/banner/fumi.jpg";
import bannerNordic from "../../assets/images/banner/nordic_spirit.jpg";
import sliderVelo from "../../assets/images/slider/velo.jpg";
import sliderZyn from "../../assets/images/slider/zyn.png";

/**
 * Demo proizvodi za početnu — ista polja koja očekuje ProductCard i cart (id, manufacturer, nicotine, images…).
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
    id: "home-featured-velo-ice-cool",
    name: "Ice Cool Strong Slim",
    category_name: "Velo",
    manufacturer: "Velo",
    nicotine: 10,
    price: 5.49,
    is_in_stock: "in_stock",
    images: imgPair(sliderVelo),
  },
  {
    id: "home-featured-zyn-blueberry",
    name: "Blueberry Mint Slim",
    category_name: "ZYN",
    manufacturer: "ZYN",
    nicotine: 6,
    price: 4.99,
    is_in_stock: "in_stock",
    images: imgPair(sliderZyn),
  },
  {
    id: "home-featured-nordic-spirit",
    name: "Bergamot Wildberry Slim",
    category_name: "Nordic Spirit",
    manufacturer: "Nordic Spirit",
    nicotine: 8,
    price: 5.29,
    is_in_stock: "in_stock",
    images: imgPair(bannerNordic),
  },
  {
    id: "home-featured-fumi",
    name: "Melon Rush Slim",
    category_name: "Fumi",
    manufacturer: "Fumi",
    nicotine: 4,
    price: 4.69,
    is_in_stock: "in_stock",
    images: imgPair(bannerFumi),
  },
];
