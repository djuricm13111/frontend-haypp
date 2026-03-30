import { useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { useParams, useSearchParams } from "react-router-dom";
import Header from "../layouts/header/Header";
import ShopMain from "../layouts/main/ShopMain";
import { ProductContext } from "../context/ProductContext";
import APIService from "../services/APIService";
import { normalizeShopLang, shopSearchPath } from "../utils/shopRoutes";

/**
 * Puna stranica rezultata pretrage — isti grid / filter / sort kao prodavnica.
 * Ruta: /:lang/search?q=upit (npr. ?q=velo+freezing)
 */
const SearchResults = () => {
  const { i18n, t } = useTranslation();
  const { lang: langParam } = useParams();
  const [searchParams] = useSearchParams();
  const [loadError, setLoadError] = useState(false);
  const [seo, setSeo] = useState(null);

  const decodedQuery = useMemo(
    () => (searchParams.get("q") ?? "").replace(/\+/g, " "),
    [searchParams]
  );

  const qTrim = decodedQuery.trim();

  const {
    setProducts,
    setFilteredProducts,
    setCategory,
    setLockedFlavorGroupId,
    setLockedNicotineRangeLabels,
    setShopFilterOnlyMode,
    setSearchedProducts,
  } = useContext(ProductContext);

  useEffect(() => {
    if (
      langParam &&
      (langParam === "de" || langParam === "en") &&
      i18n.language?.split("-")[0] !== langParam
    ) {
      i18n.changeLanguage(langParam);
    }
  }, [langParam, i18n]);

  const apiLang = normalizeShopLang(langParam || i18n.language);

  useEffect(() => {
    const lang = apiLang;
    const baseKeywords =
      lang === "de"
        ? "Nikotinbeutel, Suche, SnusCo"
        : "nicotine pouches, search, SnusCo";
    const display = qTrim || t("SEARCH.NO_QUERY_TITLE");
    setSeo({
      title: `${t("SEARCH.PAGE_TITLE", { query: display })} | SnusCo`,
      description: qTrim
        ? t("SEARCH.META_DESCRIPTION", { query: qTrim })
        : t("SEARCH.META_EMPTY"),
      keywords: `${display}, ${baseKeywords}`,
      url: `https://www.snusco.at${shopSearchPath(lang, qTrim)}`,
      images: ["https://www.snusco.at/assets/snuspouch-category-image.jpg"],
    });
  }, [apiLang, qTrim, t]);

  useEffect(() => {
    setLockedFlavorGroupId(null);
    setLockedNicotineRangeLabels(null);
    setShopFilterOnlyMode(null);
    setCategory(null);
    setLoadError(false);

    if (!qTrim) {
      setProducts([]);
      setFilteredProducts([]);
      setSearchedProducts([]);
      return undefined;
    }

    let cancelled = false;

    (async () => {
      try {
        const data = await APIService.SearchProducts(qTrim, {
          language: apiLang,
        });
        if (cancelled) return;
        const list = Array.isArray(data?.products) ? data.products : [];
        setProducts(list);
        setFilteredProducts(list);
        setSearchedProducts(list);
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          setLoadError(true);
          setProducts([]);
          setFilteredProducts([]);
          setSearchedProducts([]);
        }
      }
    })();

    /* Ne pozivati loadProducts() ovde — cleanup se pri svakom re-run-u efekta i
       prepisuje ceo katalog preko rezultata pretrage (naročito ako je loadProducts
       nestabilna referenca iz konteksta). */
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- seteri iz konteksta stabilni; izbegavamo re-run od suvišnih referenci
  }, [qTrim, apiLang]);

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
          {t("SEARCH.LOAD_ERROR")}
        </p>
      )}
      <ShopMain searchQuery={decodedQuery} />
    </div>
  );
};

export default SearchResults;
