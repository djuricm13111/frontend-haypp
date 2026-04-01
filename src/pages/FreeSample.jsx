import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Trans, useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import styled from "styled-components";
import Header from "../layouts/header/Header";
import ProductCardSlider from "../components/product/ProductCardSlider";
import APIService from "../services/APIService";
import {
  shopBasePath,
  shopBrandPath,
  shopAllBrandsPath,
  shopBestsellersPath,
  normalizeShopLang,
} from "../utils/shopRoutes";

/** Kategorije brendova za slider na stranici Free Sample (slug u URL-u prodavnice). */
const FREE_SAMPLE_CATEGORY_SLUGS = ["clew", "stng"];

function mergeProductsDeduped(lists) {
  const seen = new Set();
  const out = [];
  for (const list of lists) {
    if (!Array.isArray(list)) continue;
    for (const p of list) {
      if (!p) continue;
      const key = p.id ?? p.slug;
      if (key == null || seen.has(key)) continue;
      seen.add(key);
      out.push(p);
    }
  }
  return out;
}

const Shell = styled.div`
  width: 100%;
  max-width: min(1100px, 100%);
  margin: 0 auto;
  padding-top: clamp(16px, 4vw, 40px);
  padding-bottom: var(--spacing-xxl);
  /* Isti gutter levo i desno: baza + safe-area po strani. */
  padding-left: calc(12px + env(safe-area-inset-left, 0px));
  padding-right: calc(12px + env(safe-area-inset-right, 0px));
  box-sizing: border-box;

  @media (min-width: 480px) {
    padding-left: calc(14px + env(safe-area-inset-left, 0px));
    padding-right: calc(14px + env(safe-area-inset-right, 0px));
  }

  @media (min-width: 768px) {
    padding-left: calc(clamp(16px, 4vw, 32px) + env(safe-area-inset-left, 0px));
    padding-right: calc(clamp(16px, 4vw, 32px) + env(safe-area-inset-right, 0px));
  }
`;

const PromoBlock = styled.div`
  max-width: 720px;
  margin: 0 auto clamp(28px, 4vw, 36px);
  text-align: center;
`;

const Title = styled.h1`
  font-family: "Oswald-Medium", "Oswald", sans-serif;
  font-size: clamp(1.35rem, 3.2vw, 1.85rem);
  font-weight: 700;
  color: var(--text-100);
  margin: 0 0 14px;
  line-height: 1.2;
`;

const PromoProse = styled.p`
  margin: 0;
  line-height: 1.65;
  color: var(--text-200);
  font-size: var(--font-size-base);
  font-family: "Gudea-Regural", var(--font-family), sans-serif;
`;

const SliderSection = styled.section`
  margin-bottom: clamp(28px, 5vw, 40px);
`;

const SliderHeading = styled.h2`
  font-family: "Montserrat", sans-serif;
  font-size: clamp(1rem, 2vw, 1.1rem);
  font-weight: 600;
  color: var(--text-100);
  margin: 0 0 16px;
  text-align: center;
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid var(--text-300);
  margin: clamp(28px, 5vw, 40px) 0;
`;

const Section = styled.section`
  margin-bottom: clamp(28px, 5vw, 40px);

  &:last-of-type {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h2`
  font-family: "Montserrat", sans-serif;
  font-size: clamp(1.1rem, 2.2vw, 1.25rem);
  font-weight: 700;
  color: var(--text-100);
  margin: 0 0 14px;
  line-height: 1.3;
`;

const Subheading = styled.h3`
  font-family: "Montserrat", sans-serif;
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--text-100);
  margin: 0 0 10px;
`;

const Prose = styled.p`
  margin: 0 0 14px;
  line-height: 1.65;
  color: var(--text-200);
  font-size: var(--font-size-base);
  font-family: "Gudea-Regural", var(--font-family), sans-serif;

  &:last-child {
    margin-bottom: 0;
  }
`;

const OrderedList = styled.ol`
  margin: 0 0 16px;
  padding-left: 1.25em;
  line-height: 1.65;
  color: var(--text-200);
  font-family: "Gudea-Regural", var(--font-family), sans-serif;

  & > li {
    margin-bottom: 8px;

    &:last-child {
      margin-bottom: 0;
    }
  }
`;

const UnstyledList = styled.ul`
  margin: 0 0 16px;
  padding-left: 1.25em;
  list-style: disc;
  color: var(--text-200);
  line-height: 1.55;
  font-family: "Gudea-Regural", var(--font-family), sans-serif;

  & > li {
    margin-bottom: 6px;
  }
`;

const Disclaimer = styled.p`
  margin: 16px 0 0;
  font-size: calc(var(--font-size-base) - 1px);
  font-style: italic;
  color: var(--text-200);
  line-height: 1.5;
`;

const InlineLink = styled(Link)`
  color: var(--primary-200);
  text-decoration: underline;
  text-underline-offset: 2px;

  &:hover {
    color: var(--primary-100);
  }
`;

/** Linkovi u istaknutim blokovima — podebljano kao traženo. */
const EmphasisLink = styled(InlineLink)`
  font-weight: 600;
`;

const LinkCallout = styled.div`
  margin: 0 0 14px;
  padding: 12px 14px 12px 16px;
  border-left: 3px solid var(--primary-200);
  border-radius: 0 8px 8px 0;
  background: var(--bg-200);
  line-height: 1.65;
  color: var(--text-200);
  font-size: var(--font-size-base);
  font-family: "Gudea-Regural", var(--font-family), sans-serif;

  @media (max-width: 479px) {
    padding: 10px 12px;
  }
`;

const FaqAccordion = styled.div`
  border: 1px solid var(--bg-300);
  border-radius: 8px;
  overflow: hidden;
  background: var(--bg-100);
`;

const FaqSummary = styled.summary`
  cursor: pointer;
  padding: 14px 16px;
  list-style: none;

  @media (max-width: 479px) {
    padding: 12px 12px;
  }
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  font-family: "Montserrat", sans-serif;
  font-weight: 600;
  font-size: var(--font-size-base);
  color: var(--text-100);
  background: var(--bg-200);
  transition: background var(--transition-fast, 0.15s ease);

  &::-webkit-details-marker {
    display: none;
  }

  &::after {
    content: "+";
    flex-shrink: 0;
    font-size: 1.35rem;
    font-weight: 400;
    line-height: 1.2;
    color: var(--primary-200);
  }

  &:hover {
    background: var(--bg-300);
  }
`;

const FaqItem = styled.details`
  border-bottom: 1px solid var(--bg-300);

  &:last-child {
    border-bottom: none;
  }

  &[open] ${FaqSummary} {
    background: var(--bg-100);
  }

  &[open] ${FaqSummary}::after {
    content: "−";
  }
`;

const FaqAnswer = styled.div`
  padding: 0 16px 16px 16px;
  line-height: 1.6;

  @media (max-width: 479px) {
    padding: 0 12px 14px 12px;
  }
  color: var(--text-200);
  font-family: "Gudea-Regural", var(--font-family), sans-serif;
  background: var(--bg-100);
`;

/**
 * Informativna stranica o besplatnoj uzorku — sadržaj u i18n (en/de).
 */
const FreeSample = () => {
  const { t, i18n } = useTranslation();
  const lang = normalizeShopLang(i18n.language);
  const shopPath = shopBasePath(lang);
  const [freeSampleSliderProducts, setFreeSampleSliderProducts] = useState([]);

  const faqItems = useMemo(
    () =>
      [1, 2, 3, 4, 5, 6, 7].map((n) => ({
        q: t(`FREE_SAMPLE.FAQ_Q${n}`),
        a: t(`FREE_SAMPLE.FAQ_A${n}`),
      })),
    [t]
  );

  const brandsLinkComponents = useMemo(
    () => ({
      ZynLink: <EmphasisLink to={shopBrandPath(lang, "zyn")} />,
      VeloLink: <EmphasisLink to={shopBrandPath(lang, "velo")} />,
      NordicLink: <EmphasisLink to={shopBrandPath(lang, "nordic-spirit")} />,
      XqsLink: <EmphasisLink to={shopBrandPath(lang, "xqs")} />,
    }),
    [lang]
  );

  const dealsLinkComponents = useMemo(
    () => ({
      PickMixLink: <EmphasisLink to={shopAllBrandsPath(lang)} />,
      OffersLink: <EmphasisLink to={shopBestsellersPath(lang)} />,
    }),
    [lang]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const responses = await Promise.all(
          FREE_SAMPLE_CATEGORY_SLUGS.map((slug) => APIService.GetProductsByCategory(slug))
        );
        const merged = mergeProductsDeduped(
          responses.map((data) => data?.products ?? [])
        );
        const inStock = merged.filter(
          (p) => p && p.is_in_stock && p.is_in_stock !== "out_of_stock"
        );
        const useList = inStock.length > 0 ? inStock : merged;
        if (!cancelled) setFreeSampleSliderProducts(useList.slice(0, 24));
      } catch {
        if (!cancelled) setFreeSampleSliderProducts([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [i18n.language]);

  const canonical = `https://www.snusco.at/free-sample`;

  return (
    <div>
      <Helmet>
        <html lang={i18n.language} />
        <title>{t("FREE_SAMPLE.PAGE_TITLE")}</title>
        <meta name="description" content={t("FREE_SAMPLE.META_DESCRIPTION")} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={canonical} />
      </Helmet>
      <Header />
      <Shell>
        <PromoBlock>
          <Title>{t("FREE_SAMPLE.PROMO_TITLE")}</Title>
          <PromoProse>{t("FREE_SAMPLE.PROMO_BODY")}</PromoProse>
        </PromoBlock>

        <SliderSection aria-labelledby="fs-free-sample-slider-heading">
          <SliderHeading id="fs-free-sample-slider-heading">
            {t("FREE_SAMPLE.SLIDER_HEADING")}
          </SliderHeading>
          {freeSampleSliderProducts.length > 0 ? (
            <ProductCardSlider products={freeSampleSliderProducts} />
          ) : (
            <Prose style={{ textAlign: "center" }}>{t("FREE_SAMPLE.SLIDER_EMPTY")}</Prose>
          )}
        </SliderSection>

        <Divider />

        <Section aria-labelledby="fs-claim">
          <SectionTitle as="h2" id="fs-claim">
            {t("FREE_SAMPLE.HERO_TITLE")}
          </SectionTitle>
          <Prose>{t("FREE_SAMPLE.CLAIM_INTRO")}</Prose>
          <OrderedList>
            <li>{t("FREE_SAMPLE.STEP_1")}</li>
            <li>{t("FREE_SAMPLE.STEP_2")}</li>
            <li>{t("FREE_SAMPLE.STEP_3")}</li>
          </OrderedList>
          <LinkCallout>
            <Trans i18nKey="FREE_SAMPLE.BRANDS_TEXT" components={brandsLinkComponents} />
          </LinkCallout>
          <Prose>{t("FREE_SAMPLE.RANDOM_TEXT")}</Prose>
          <Prose>
            {t("FREE_SAMPLE.RANGE_BEFORE")}{" "}
            <InlineLink to={shopPath}>{t("FREE_SAMPLE.RANGE_LINK")}</InlineLink>{" "}
            {t("FREE_SAMPLE.RANGE_AFTER")}
          </Prose>
          <Disclaimer>{t("FREE_SAMPLE.DISCLAIMER")}</Disclaimer>
        </Section>

        <Section aria-labelledby="fs-why">
          <SectionTitle id="fs-why">{t("FREE_SAMPLE.WHY_TITLE")}</SectionTitle>
          <Prose>{t("FREE_SAMPLE.WHY_P1")}</Prose>
          <Prose>{t("FREE_SAMPLE.WHY_P2")}</Prose>
          <LinkCallout>
            <Trans i18nKey="FREE_SAMPLE.WHY_P3" components={dealsLinkComponents} />
          </LinkCallout>
        </Section>

        <Section aria-labelledby="fs-delivery">
          <SectionTitle id="fs-delivery">{t("FREE_SAMPLE.DELIVERY_TITLE")}</SectionTitle>
          <Prose>{t("FREE_SAMPLE.DELIVERY_INTRO")}</Prose>
          <Subheading>{t("FREE_SAMPLE.DELIVERY_OPTIONS_TITLE")}</Subheading>
          <UnstyledList>
            <li>{t("FREE_SAMPLE.DELIVERY_OPT_1")}</li>
            <li>{t("FREE_SAMPLE.DELIVERY_OPT_2")}</li>
            <li>{t("FREE_SAMPLE.DELIVERY_OPT_3")}</li>
            <li>{t("FREE_SAMPLE.DELIVERY_OPT_4")}</li>
            <li>{t("FREE_SAMPLE.DELIVERY_OPT_5")}</li>
          </UnstyledList>
          <Prose>{t("FREE_SAMPLE.DELIVERY_NOTE")}</Prose>
        </Section>

        <Section aria-labelledby="fs-faq">
          <SectionTitle id="fs-faq">{t("FREE_SAMPLE.FAQ_TITLE")}</SectionTitle>
          <FaqAccordion>
            {faqItems.map((item, i) => (
              <FaqItem key={i}>
                <FaqSummary>{item.q}</FaqSummary>
                <FaqAnswer>{item.a}</FaqAnswer>
              </FaqItem>
            ))}
          </FaqAccordion>
        </Section>
      </Shell>
    </div>
  );
};

export default FreeSample;
