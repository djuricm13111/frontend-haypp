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
  normalizeShopLang,
} from "../utils/shopRoutes";

/**
 * Puna širina shop layout-a — proizvodi isključivo sa backend GET ruta
 * (`APIService.API_PRODUCT_LISTINGS`: best-sellers / new-arrivals).
 * Frontend rute: /:lang/bestsellers, /:lang/new-in-store
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
    loadProducts,
    setLockedFlavorGroupId,
    setLockedNicotineRangeLabels,
  } = useContext(ProductContext);

  const isBestsellers = listing === "bestsellers";
  const listingPageProp = isBestsellers ? "bestsellers" : "newInStore";

  useEffect(() => {
    const lang =
      langParam === "de" || i18n.language?.startsWith("de") ? "de" : "en";
    const baseKeywords =
      lang === "de"
        ? "Nikotinbeutel, Snus, Bestseller, SnusCo"
        : "nicotine pouches, snus, bestsellers, SnusCo";

    const title = isBestsellers
      ? t("SHOP_LISTING.BESTSELLERS.PAGE_TITLE")
      : t("SHOP_LISTING.NEW_IN_STORE.PAGE_TITLE");
    const description = isBestsellers
      ? t("SHOP_LISTING.BESTSELLERS.META_DESCRIPTION")
      : t("SHOP_LISTING.NEW_IN_STORE.META_DESCRIPTION");
    const canonicalPath = isBestsellers
      ? shopBestsellersPath(lang)
      : shopNewInStorePath(lang);

    setSeo({
      title: `${title} | SnusCo`,
      description,
      keywords: `${title}, ${baseKeywords}`,
      url: `https://www.snusco.at${canonicalPath}`,
      images: ["https://www.snusco.at/assets/snuspouch-category-image.jpg"],
    });
  }, [listing, langParam, i18n.language, t, isBestsellers]);

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
      loadProducts();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- loadProducts stabilan; refetch pri promeni jezika/URL
  }, [listing, isBestsellers, langParam, i18n.language]);

  const defaultSeo = {
    title: "SnusCo",
    description: "",
    keywords: "",
    url: "https://www.snusco.at/",
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
        <meta name="author" content="SnusCo" />
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
