import React from "react";
import styled from "styled-components";
import HomeBrandLogoStrip from "../../components/home/HomeBrandLogoStrip";
import HomeFeaturedProducts from "../../components/home/HomeFeaturedProducts";
import HomePromoCardGrid from "../../components/home/HomePromoCardGrid";
import HomePromoIntro, {
  PROMO_LINK_NICOTINE_FREE,
  PROMO_LINK_TOBACCO_FREE,
} from "../../components/home/HomePromoIntro";
import ProductPromoSlider from "../../components/ProductPromoSlider";
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
import Header from "../../layouts/header/Header";
import HomeHero from "./HomeHero";

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

/** Brend logotipi — ikona iznad naziva, u redu sa wrap-om. */
const homeBrandLogoItems = [
  { key: "xqs", iconSrc: logoXqs, label: "XQS", href: "/category/xqs" },
  { key: "velo", iconSrc: logoVelo, label: "Velo", href: "/category/velo" },
  { key: "pablo", iconSrc: logoPablo, label: "Pablo", href: "/category/pablo" },
  {
    key: "nordic-spirit",
    iconSrc: logoNordicSpirit,
    label: "Nordic Spirit",
    href: "/category/nordic-spirit",
  },
  { key: "zyn", iconSrc: logoZyn, label: "ZYN", href: "/category/zyn" },
  { key: "killa", iconSrc: logoKilla, label: "Killa", href: "/category/killa" },
];

/** Kategorije — ikone iz `src/assets/images/list/`. */
const homeShopByCategoryItems = [
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
    href: "/category/new-arrivals",
  },
  {
    key: "bestsellers",
    iconSrc: listBestsellers,
    labelKey: "HOME.CATEGORY_NAV.BESTSELLERS",
    href: "/category/best-sellers",
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

const Content = styled.div`
  height: 2000px;
  background: #f5f5f5;
`;

const HomeMain = () => {
  return (
    <>
      <Header />
      <HomeHero />


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

      <Content />
    </>
  );
};

export default HomeMain;
