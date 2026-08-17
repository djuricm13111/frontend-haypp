import { useEffect } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import Header from "../layouts/header/Header";
import {
  Crumbs,
  CrumbsList,
  CrumbsItem,
  CrumbSep,
  CrumbLink,
  CrumbCurrent,
} from "../components/ArticleBreadcrumbs";
import { normalizeShopLang } from "../utils/shopRoutes";
import {
  ACCESSIBILITY_BODY_DE,
  ACCESSIBILITY_BODY_EN,
  ACCESSIBILITY_LAST_UPDATED,
} from "../content/snusweAccessibilityHtml";
import { LegalDocumentProse } from "../components/LegalDocumentProse";

const Shell = styled.div`
  background-color: var(--background-color);
  color: var(--text-color);
  min-height: 60vh;
  overflow-x: hidden;
`;

const LayoutWrap = styled.div`
  width: 100%;
  max-width: min(var(--max-width-container), 100%);
  margin: 0 auto;
  padding: var(--spacing-lg) var(--spacing-md) var(--spacing-xxl);
  box-sizing: border-box;
`;

const Title = styled.h1`
  font-family: "Montserrat", sans-serif;
  font-weight: 800;
  font-size: clamp(1.5rem, 3.8vw, 2.05rem);
  line-height: 1.22;
  color: var(--text-100);
  margin: 0 0 var(--spacing-sm);
`;

const Subline = styled.p`
  margin: 0 0 var(--spacing-xl);
  font-size: var(--font-size-small);
  color: var(--text-200);
  font-family: "Montserrat", sans-serif;
`;

function AccessibilityCrumbsNav() {
  const { t } = useTranslation();
  return (
    <Crumbs aria-label={t("ACCESSIBILITY.BREADCRUMB_ARIA")}>
      <CrumbsList>
        <CrumbsItem>
          <CrumbLink to="/">{t("BLOG.CRUMB_HOME")}</CrumbLink>
        </CrumbsItem>
        <CrumbsItem aria-hidden>
          <CrumbSep>›</CrumbSep>
        </CrumbsItem>
        <CrumbsItem>
          <CrumbCurrent aria-current="page">
            {t("ACCESSIBILITY.HEADING")}
          </CrumbCurrent>
        </CrumbsItem>
      </CrumbsList>
    </Crumbs>
  );
}

function AccessibilityStatement() {
  const { t, i18n } = useTranslation();
  const { lang: langParam } = useParams();

  useEffect(() => {
    if (
      langParam &&
      (langParam === "de" || langParam === "en" || langParam === "hu") &&
      i18n.language?.split("-")[0] !== langParam
    ) {
      i18n.changeLanguage(langParam);
    }
  }, [langParam, i18n]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [langParam]);

  const lang = normalizeShopLang(langParam || i18n.language);
  const html = lang === "de" ? ACCESSIBILITY_BODY_DE : ACCESSIBILITY_BODY_EN;
  const canonical = `https://www.snuswe.com/${lang}/accessibility`;

  return (
    <>
      <Helmet>
        <html lang={lang} />
        <title>{t("ACCESSIBILITY.PAGE_TITLE")}</title>
        <meta name="description" content={t("ACCESSIBILITY.PAGE_DESCRIPTION")} />
        <link rel="canonical" href={canonical} />
      </Helmet>
      <Header />
      <Shell>
        <LayoutWrap>
          <AccessibilityCrumbsNav />
          <Title>{t("ACCESSIBILITY.HEADING")}</Title>
          <Subline>
            {t("ACCESSIBILITY.SUBLINE", { date: ACCESSIBILITY_LAST_UPDATED })}
          </Subline>
          <LegalDocumentProse dangerouslySetInnerHTML={{ __html: html }} />
        </LayoutWrap>
      </Shell>
    </>
  );
}

export default AccessibilityStatement;
