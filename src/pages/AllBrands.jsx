import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import styled from "styled-components";
import Header from "../layouts/header/Header";
import APIService from "../services/APIService";
import {
  shopBrandPath,
  shopAllBrandsPath,
  normalizeShopLang,
} from "../utils/shopRoutes";
import { groupBrandsByLetter } from "../utils/groupBrandsByLetter";

const Shell = styled.div`
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: clamp(20px, 4vw, 40px) clamp(16px, 4vw, 32px) var(--spacing-xxl);
  box-sizing: border-box;
`;

/** Naslov + uvod centrirani; linija ispod opisa. */
const PageHeader = styled.div`
  text-align: center;
  padding-bottom: clamp(18px, 3vw, 26px);
  margin-bottom: clamp(22px, 4vw, 32px);
  border-bottom: 1px solid var(--text-300);
`;

const PageTitle = styled.h1`
  font-family: "Oswald-Medium", "Oswald", sans-serif;
  font-size: clamp(1.3rem, 3vw, 1.65rem);
  font-weight: 700;
  color: var(--text-100);
  margin: 0 auto 10px;
  line-height: 1.25;
  max-width: 28ch;
`;

const Intro = styled.p`
  margin: 0 auto;
  max-width: 52ch;
  line-height: 1.55;
  color: var(--text-200);
  font-size: var(--font-size-base);
  font-family: "Gudea-Regural", var(--font-family), sans-serif;
`;

/**
 * Jedan red = 2 slova (telefon) ili 4 slova (desktop); ispod svakog slova lista brendova.
 */
const LettersMatrix = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: clamp(12px, 3vw, 24px);
  row-gap: clamp(24px, 5vw, 36px);
  align-items: start;

  @media (min-width: 768px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
`;

const LetterColumn = styled.section`
  min-width: 0;
  scroll-margin-top: 96px;
`;

const LetterHeading = styled.h2`
  margin: 0 0 10px;
  font-size: 1.25rem;
  font-weight: 800;
  font-family: "Montserrat", sans-serif;
  color: #000;
  border-bottom: 1px solid var(--text-300);
  padding-bottom: 6px;
`;

/** Brendovi — tačkasta lista, blago uvučena. */
const BrandList = styled.ul`
  margin: 0;
  padding: 0 0 0 1.15em;
  list-style-type: disc;
  list-style-position: outside;
  color: #000;

  & > li {
    margin: 0 0 6px;
    padding-left: 0.2em;

    &:last-child {
      margin-bottom: 0;
    }
  }
`;

const BrandLink = styled(Link)`
  display: inline;
  color: #000;
  text-decoration: none;
  font-size: var(--font-size-base);
  font-family: "Montserrat", sans-serif;
  font-weight: 400;
  line-height: 1.5;

  &:hover {
    color: var(--primary-200);
    text-decoration: underline;
  }
`;

const ErrorText = styled.p`
  text-align: center;
  padding: 16px;
  color: var(--text-200);
`;

const EmptyText = styled.p`
  margin: 0;
  color: var(--text-200);
  font-size: var(--font-size-base);
`;

/**
 * Svi brendovi iz `GetCategories()`, grupisani po slovima — ruta `/:lang/all-brands`.
 */
const AllBrands = () => {
  const { t, i18n } = useTranslation();
  const { lang: langParam } = useParams();
  const [categories, setCategories] = useState([]);
  const [loadError, setLoadError] = useState(false);
  const [seo, setSeo] = useState(null);

  const apiLang = normalizeShopLang(langParam || i18n.language);
  const localeForSort = apiLang === "de" ? "de" : "en";

  const grouped = useMemo(
    () => groupBrandsByLetter(categories, localeForSort),
    [categories, localeForSort],
  );

  useEffect(() => {
    const lang = apiLang;
    const baseKeywords =
      lang === "de"
        ? "Nikotinbeutel, Marken, Snus, SnusCo"
        : "nicotine pouches, brands, snus, SnusCo";
    const title = t("ALL_BRANDS.PAGE_TITLE");
    const description = t("ALL_BRANDS.META_DESCRIPTION");
    const canonicalPath = shopAllBrandsPath(lang);

    setSeo({
      title: `${title} | SnusCo`,
      description,
      keywords: `${title}, ${baseKeywords}`,
      url: `https://www.snusco.at${canonicalPath}`,
      images: ["https://www.snusco.at/assets/snuspouch-category-image.jpg"],
    });
  }, [apiLang, t]);

  useEffect(() => {
    let cancelled = false;
    setLoadError(false);

    (async () => {
      try {
        const list = await APIService.GetCategories(apiLang);
        if (!cancelled) {
          setCategories(Array.isArray(list) ? list : []);
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          setLoadError(true);
          setCategories([]);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [apiLang]);

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
        <html lang={apiLang} />
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
      <Shell className="header-top-margin">
        <PageHeader>
          <PageTitle>{t("ALL_BRANDS.PAGE_TITLE")}</PageTitle>
          <Intro>{t("ALL_BRANDS.INTRO")}</Intro>
        </PageHeader>

        {loadError && (
          <ErrorText>{t("ALL_BRANDS.LOAD_ERROR")}</ErrorText>
        )}

        {!loadError && grouped.length === 0 && (
          <EmptyText>{t("ALL_BRANDS.EMPTY")}</EmptyText>
        )}

        {!loadError && grouped.length > 0 && (
          <LettersMatrix>
            {grouped.map(({ letter, brands }) => (
              <LetterColumn key={letter} id={`letter-${letter}`}>
                <LetterHeading>
                  {letter === "#"
                    ? t("ALL_BRANDS.LETTER_OTHER")
                    : letter}
                </LetterHeading>
                <BrandList>
                  {brands.map((b) => (
                    <li key={b.slug}>
                      <BrandLink to={shopBrandPath(apiLang, b.slug)}>
                        {b.name}
                      </BrandLink>
                    </li>
                  ))}
                </BrandList>
              </LetterColumn>
            ))}
          </LettersMatrix>
        )}
      </Shell>
    </div>
  );
};

export default AllBrands;
