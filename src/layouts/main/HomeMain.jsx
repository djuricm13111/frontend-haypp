import React, { useMemo } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import HomeBrandLogoStrip from "../../components/home/HomeBrandLogoStrip";
import HomeFeaturedProducts from "../../components/home/HomeFeaturedProducts";
import HomeBestsellersNewArrivalsGrid from "../../components/home/HomeBestsellersNewArrivalsGrid";
import HomePromoCardGrid from "../../components/home/HomePromoCardGrid";
import HomePromoIntro, {
  PROMO_LINK_NICOTINE_FREE,
  PROMO_LINK_TOBACCO_FREE,
} from "../../components/home/HomePromoIntro";
import ProductPromoSlider from "../../components/ProductPromoSlider";
import HomeNewArrivalsSlider from "../../components/home/HomeNewArrivalsSlider";
import bannerFumi from "../../assets/images/banner/fumi.jpg";
import bannerNordic from "../../assets/images/banner/nordic_spirit.jpg";
import bannerSkruf from "../../assets/images/banner/skruf.jpg";
import logoKilla from "../../assets/images/logo/killa.svg";
import logoNordicSpirit from "../../assets/images/logo/nordic_spirit.svg";
import logoPablo from "../../assets/images/logo/pablo.svg";
import logoVelo from "../../assets/images/logo/velo.svg";
import logoXqs from "../../assets/images/logo/xqs.svg";
import logoZyn from "../../assets/images/logo/zyn.svg";
import listBestsellers from "../../assets/images/list/bestsellers.svg";
import listBundles from "../../assets/images/list/bundles.svg";
import listFreeSample from "../../assets/images/list/free_sample.svg";
import listNewArrivals from "../../assets/images/list/new_arrivals.svg";
import listNicotineFree from "../../assets/images/list/nicotine_free_pouches.svg";
import listNicotinePouches from "../../assets/images/list/nicotine_pouches.svg";
import listOffers from "../../assets/images/list/offers.svg";
import listPickAndMix from "../../assets/images/list/pick_and_mix.svg";
import bannerXqs from "../../assets/images/banner/xqs.jpg";
import sliderVelo from "../../assets/images/slider/velo.jpg";
import sliderZone from "../../assets/images/slider/zone.jpg";
import sliderZyn from "../../assets/images/slider/zyn.png";
import flavorCitrus from "../../assets/images/flavors/citrus.svg";
import flavorCoffe from "../../assets/images/flavors/coffe.svg";
import flavorFruit from "../../assets/images/flavors/fruit.svg";
import flavorLiquorice from "../../assets/images/flavors/liqurice.svg";
import flavorMint from "../../assets/images/flavors/mint.svg";
import Header from "../../layouts/header/Header";
import HomeIntroText from "../../components/home/HomeIntroText";
import HomeAboutTrust from "../../components/home/HomeAboutTrust";
import {
  shopBrandPath,
  shopFlavourPath,
  shopBestsellersPath,
  shopNewInStorePath,
} from "../../utils/shopRoutes";

const SliderSection = styled.section`
  box-sizing: border-box;
  width: 100%;
  max-width: var(--max-width-container);
  margin: 0 auto;
  padding: var(--spacing-md) var(--spacing-md) var(--spacing-lg);
`;

/** Promotivne kartice — slike iz `src/assets/images/banner/`. */
const homePromoCards = [
  {
    key: "xqs",
    imageSrc: bannerXqs,
    imageAlt: "XQS",
    brand: "XQS",
    priceLabel: "From $2.49 / unit",
    href: "#",
  },
  {
    key: "nordic",
    imageSrc: bannerNordic,
    imageAlt: "Nordic Spirit",
    brand: "Nordic Spirit",
    priceLabel: "From £2.29 / unit",
    href: "#",
  },
  {
    key: "fumi",
    imageSrc: bannerFumi,
    imageAlt: "Fumi",
    brand: "Fumi",
    priceLabel: "From $2.69 / unit",
    href: "#",
  },
  {
    key: "skruf",
    imageSrc: bannerSkruf,
    imageAlt: "Skruf",
    brand: "Skruf Aloe Fresh",
    priceLabel: "From $3.22 / unit",
    href: "#",
  },
];

/** Slajder — slike iz `src/assets/images/slider/`. */
const demoPromoSlides = [
  {
    key: "velo",
    imageSrc: sliderVelo,
    imageAlt: "Velo",
    priceLabel: "From £2.49 / unit",
    title: "Velo Tasteful Trio",
    ctaLabel: "Buy here",
    ctaHref: "#",
  },
  {
    key: "zone",
    imageSrc: sliderZone,
    imageAlt: "Zone",
    priceLabel: "From £3.10 / pack",
    title: "Zone",
    ctaLabel: "Buy here",
    ctaHref: "#",
  },
  {
    key: "zyn",
    imageSrc: sliderZyn,
    imageAlt: "ZYN",
    priceLabel: "From £0.99 / unit",
    title: "ZYN Blueberry Mint",
    ctaLabel: "Buy here",
    ctaHref: "#",
  },
];

const HomeMain = () => {
  const { i18n } = useTranslation();
  const lang =
    i18n.language?.split("-")[0]?.toLowerCase() === "de" ? "de" : "en";

  /** Kategorije na početnoj — bestsellers / new-in-store vode na `shopRoutes.js` listing stranice. */
  const homeShopByCategoryItems = useMemo(
    () => [
      {
        key: "nicotine-pouches",
        iconSrc: listNicotinePouches,
        labelKey: "HOME.CATEGORY_NAV.NICOTINE_POUCHES",
        href: PROMO_LINK_TOBACCO_FREE,
      },
      {
        key: "nicotine-free-pouches",
        iconSrc: listNicotineFree,
        labelKey: "HOME.CATEGORY_NAV.NICOTINE_FREE_POUCHES",
        href: PROMO_LINK_NICOTINE_FREE,
      },
      {
        key: "new-arrivals",
        iconSrc: listNewArrivals,
        labelKey: "HOME.CATEGORY_NAV.NEW_ARRIVALS",
        href: shopNewInStorePath(lang),
      },
      {
        key: "bestsellers",
        iconSrc: listBestsellers,
        labelKey: "HOME.CATEGORY_NAV.BESTSELLERS",
        href: shopBestsellersPath(lang),
      },
      {
        key: "offers",
        iconSrc: listOffers,
        labelKey: "HOME.CATEGORY_NAV.OFFERS",
        href: "/category/offers",
      },
      {
        key: "bundles",
        iconSrc: listBundles,
        labelKey: "HOME.CATEGORY_NAV.BUNDLES",
        href: "/category/bundles",
      },
      {
        key: "pick-and-mix",
        iconSrc: listPickAndMix,
        labelKey: "HOME.CATEGORY_NAV.PICK_AND_MIX",
        href: "/category/pick-and-mix",
      },
      {
        key: "free-sample",
        iconSrc: listFreeSample,
        labelKey: "HOME.CATEGORY_NAV.FREE_SAMPLE",
        href: "/category/free-sample",
      },
    ],
    [lang]
  );

  /** Brendovi — `shopRoutes.js` (isti slug kao u header dropdown-u). */
  const homeBrandLogoItems = useMemo(
    () => [
      { key: "xqs", iconSrc: logoXqs, label: "XQS", href: shopBrandPath(lang, "xqs") },
      { key: "velo", iconSrc: logoVelo, label: "Velo", href: shopBrandPath(lang, "velo") },
      { key: "pablo", iconSrc: logoPablo, label: "Pablo", href: shopBrandPath(lang, "pablo") },
      {
        key: "nordic-spirit",
        iconSrc: logoNordicSpirit,
        label: "Nordic Spirit",
        href: shopBrandPath(lang, "nordic-spirit"),
      },
      { key: "zyn", iconSrc: logoZyn, label: "ZYN", href: shopBrandPath(lang, "zyn") },
      { key: "killa", iconSrc: logoKilla, label: "Killa", href: shopBrandPath(lang, "killa") },
    ],
    [lang]
  );

  /** Ukusi — slugovi kao u `flavorGroups.js` / headeru. */
  const homeShopByFlavorItems = useMemo(
    () => [
      {
        key: "mint",
        iconSrc: flavorMint,
        labelKey: "HOME.FLAVOR_NAV.MINT",
        href: shopFlavourPath(lang, "mint"),
      },
      {
        key: "citrus",
        iconSrc: flavorCitrus,
        labelKey: "HOME.FLAVOR_NAV.CITRUS",
        href: shopFlavourPath(lang, "citrus"),
      },
      {
        key: "fruit",
        iconSrc: flavorFruit,
        labelKey: "HOME.FLAVOR_NAV.FRUIT",
        href: shopFlavourPath(lang, "fruit"),
      },
      {
        key: "coffee",
        iconSrc: flavorCoffe,
        labelKey: "HOME.FLAVOR_NAV.COFFEE",
        href: shopFlavourPath(lang, "coffee"),
      },
      {
        key: "liquorice",
        iconSrc: flavorLiquorice,
        labelKey: "HOME.FLAVOR_NAV.LIQUORICE",
        href: shopFlavourPath(lang, "liquorice"),
      },
    ],
    [lang]
  );

  return (
    <>
      <Header />
      <HomeIntroText />


      <SliderSection aria-label="Featured offers">
        <ProductPromoSlider slides={demoPromoSlides} />
      </SliderSection>
      <HomePromoCardGrid items={homePromoCards}>
        <HomePromoIntro />
      </HomePromoCardGrid>
      <HomeBrandLogoStrip items={homeBrandLogoItems} />
      <HomeFeaturedProducts />
      <HomeBrandLogoStrip
        items={homeShopByCategoryItems}
        titleI18nKey="HOME.SHOP_BY_CATEGORY"
        headingId="home-shop-by-category-heading"
        wideItems
      />
      <HomeBestsellersNewArrivalsGrid />
      <HomeBrandLogoStrip
        items={homeShopByFlavorItems}
        titleI18nKey="HOME.SHOP_BY_FLAVOR"
        headingId="home-shop-by-flavor-heading"
        wideItems
      />

      <HomeNewArrivalsSlider />
      <HomeAboutTrust />
    </>
  );
};

export default HomeMain;
