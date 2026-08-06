import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";
import Header from "../layouts/header/Header";
import ShopMain from "../layouts/main/ShopMain";
import { ProductContext } from "../context/ProductContext";
import APIService from "../services/APIService";
import {
  shopBestsellersPath,
  shopNewInStorePath,
  shopMixpacksBundlesPath,
  shopOffersPath,
  normalizeShopLang,
} from "../utils/shopRoutes";

/**
 * Puna širina shop layout-a — proizvodi isključivo sa backend GET ruta
 * (`APIService.API_PRODUCT_LISTINGS`: best-sellers / new-arrivals / mix-packs).
 * Frontend rute: /:lang/bestsellers, /:lang/new-in-store, /:lang/mixpacks-bundles
 */
const ShopListing = ({ listing }) => {
  const { i18n, t } = useTranslation();
  const { lang: langParam } = useParams();
  const [seo, setSeo] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const {
    setProducts,
    setFilteredProducts,
    setCategory,
    setLockedFlavorGroupId,
    setLockedNicotineRangeLabels,
  } = useContext(ProductContext);

  const isBestsellers = listing === "bestsellers";
  const isMixpacks = listing === "mixpacks";
  const isOffers = listing === "offers";
  const listingPageProp = isBestsellers
    ? "bestsellers"
    : isMixpacks
      ? "mixpacks"
      : isOffers
        ? "offers"
        : "newInStore";

  useEffect(() => {
    const lang =
      normalizeShopLang(langParam || i18n.language);
    const baseKeywords =
      lang === "de"
        ? "Nikotinbeutel, Snus, Bestseller, SnusWe"
        : "nicotine pouches, snus, bestsellers, SnusWe";

    const title = isBestsellers
      ? t("SHOP_LISTING.BESTSELLERS.PAGE_TITLE")
      : isMixpacks
        ? t("SHOP_LISTING.MIXPACKS.PAGE_TITLE")
        : isOffers
          ? t("SHOP_LISTING.OFFERS.PAGE_TITLE")
          : t("SHOP_LISTING.NEW_IN_STORE.PAGE_TITLE");
    const description = isBestsellers
      ? t("SHOP_LISTING.BESTSELLERS.META_DESCRIPTION")
      : isMixpacks
        ? t("SHOP_LISTING.MIXPACKS.META_DESCRIPTION")
        : isOffers
          ? t("SHOP_LISTING.OFFERS.META_DESCRIPTION")
          : t("SHOP_LISTING.NEW_IN_STORE.META_DESCRIPTION");
    const canonicalPath = isBestsellers
      ? shopBestsellersPath(lang)
      : isMixpacks
        ? shopMixpacksBundlesPath(lang)
        : isOffers
          ? shopOffersPath(lang)
          : shopNewInStorePath(lang);

    setSeo({
      title: `${title} | SnusWe`,
      description,
      keywords: `${title}, ${baseKeywords}`,
      url: `https://snuswe.com${canonicalPath}`,
      images: ["https://snuswe.com/assets/snuspouch-category-image.jpg"],
    });
  }, [listing, langParam, i18n.language, t, isBestsellers, isMixpacks, isOffers]);

  useEffect(() => {
    setLockedFlavorGroupId(null);
    setLockedNicotineRangeLabels(null);
    setCategory(null);
    setLoadError(null);

    let cancelled = false;
    /** Jezik iz URL-a (`/de/...`) da `Accept-Language` na backendu odgovara stranici. */
    const apiLang = normalizeShopLang(langParam || i18n.language);

    (async () => {
      try {
        const list = isBestsellers
          ? await APIService.GetBestSellers(apiLang)
          : isMixpacks
            ? await APIService.GetMixPacks(apiLang)
            : isOffers
              ? await APIService.GetOffers(apiLang)
              : await APIService.GetNewArrivals(apiLang);
        if (cancelled) return;
        setProducts(list);
        setFilteredProducts(list);
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          setLoadError(true);
          setProducts([]);
          setFilteredProducts([]);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [listing, isBestsellers, isMixpacks, isOffers, langParam, i18n.language]);

  const defaultSeo = {
    title: "SnusWe",
    description: "",
    keywords: "",
    url: "https://snuswe.com/",
    images: [],
  };

  const activeSeo = seo || defaultSeo;

  return (
    <div>
      <Helmet>
        <html lang={i18n.language} />
        <title>{activeSeo.title}</title>
        <meta name="description" content={activeSeo.description} />
        <meta name="keywords" content={activeSeo.keywords} />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content={activeSeo.title} />
        <meta property="og:description" content={activeSeo.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={activeSeo.url} />
        {activeSeo.images?.map((image, index) => (
          <meta key={index} property="og:image" content={image} />
        ))}
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="author" content="SnusWe" />
        <link rel="canonical" href={activeSeo.url} />
      </Helmet>
      <Header />
      {loadError && (
        <p
          style={{
            textAlign: "center",
            padding: "16px",
            color: "var(--text-200, #666)",
          }}
        >
          {t("SHOP_LISTING.LOAD_ERROR")}
        </p>
      )}
      <ShopMain listingPage={listingPageProp} />
    </div>
  );
};

export default ShopListing;
