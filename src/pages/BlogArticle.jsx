import { useEffect } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import Header from "../layouts/header/Header";
import ProductCard from "../components/product/ProductCard";
import { getPostBySlug } from "../content/blog";
import { blogArticlePath, blogListingPath } from "../utils/blogRoutes";
import {
  normalizeShopLang,
  shopBasePath,
  shopBrandPath,
  shopStrengthHubPath,
} from "../utils/shopRoutes";

function blogInjectLang(html, lang) {
  return String(html).replace(/\{\{LANG\}\}/g, lang);
}

function resolveSectionCtaTo(lang, cta) {
  if (!cta) return shopBasePath(lang);
  if (cta.linkKind === "strengthHub") return shopStrengthHubPath(lang);
  if (cta.shopBrand) return shopBrandPath(lang, cta.shopBrand);
  return shopBasePath(lang);
}

function resolveRelatedTo(lang, to) {
  if (!to || !to.type) return shopBasePath(lang);
  if (to.type === "shop") return shopBasePath(lang);
  if (to.type === "brand" && to.slug) return shopBrandPath(lang, to.slug);
  if (to.type === "blog" && to.slug) return blogArticlePath(lang, to.slug);
  return shopBasePath(lang);
}

const Shell = styled.div`
  background-color: var(--background-color);
  color: var(--text-color);
  min-height: 60vh;
  overflow-x: hidden;
`;

const LayoutWrap = styled.div`
  width: 100%;
  max-width: min(1140px, 100%);
  margin: 0 auto;
  padding: var(--spacing-lg) var(--spacing-md) var(--spacing-xxl);
  box-sizing: border-box;
`;

/**
 * Reset globalnog `index.css`: `article { display:flex; align-items:center }`
 * koji sužava decu i može da seče tekst u užoj koloni.
 */
const BlogArticleRoot = styled.article`
  display: block;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
`;

/**
 * Reset globalnog `section { width: var(--max-width-container) }` — u grid koloni
 * to forsira 1140px širinu i overflow skriva tekst (MainColumn overflow-x: hidden).
 */
const BlogContentSection = styled.section`
  width: 100% !important;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
`;

/** Hero, naslov, meta — uvek puna širina (bez related kolone) */
const IntroFullWidth = styled.div`
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
  margin-bottom: var(--spacing-xl);
`;

const PageGrid = styled.div`
  display: grid;
  gap: var(--spacing-xl);
  grid-template-columns: 1fr;
  grid-template-areas: "main";
  width: 100%;
  min-width: 0;
  max-width: 100%;
  box-sizing: border-box;

  ${(p) =>
    p.$hasSidebar
      ? `
    @media (max-width: 991px) {
      grid-template-columns: 1fr;
      grid-template-areas:
        "main"
        "related";
    }
    @media (min-width: 992px) {
      grid-template-columns: minmax(0, 70%) minmax(0, 30%);
      grid-template-areas: "main related";
      align-items: start;
    }
  `
      : ""}
`;

const RelatedAside = styled.aside`
  grid-area: related;
  min-width: 0;
  max-width: 100%;
  box-sizing: border-box;
  @media (min-width: 992px) {
    position: sticky;
    top: 96px;
    align-self: start;
  }
`;

const RelatedHeading = styled.h2`
  margin: 0 0 var(--spacing-md);
  font-family: "Montserrat", sans-serif;
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--text-100);
  line-height: 1.3;
`;

const RelatedCard = styled(Link)`
  display: block;
  text-decoration: none;
  color: inherit;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 0;
  overflow: hidden;
  margin-bottom: var(--spacing-md);
  background: var(--bg-100);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  transition: border-color 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    border-color: rgba(0, 48, 87, 0.25);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const RelatedCardMedia = styled.div`
  width: 100%;
  aspect-ratio: 16 / 9;
  background: linear-gradient(180deg, #f3f3f3 0%, #ececec 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 14px;
  box-sizing: border-box;
`;

const RelatedCardImg = styled.img`
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
`;

const RelatedCardBody = styled.div`
  padding: var(--spacing-md);
`;

const RelatedCardTitle = styled.h3`
  margin: 0 0 var(--spacing-sm);
  font-family: "Montserrat", sans-serif;
  font-size: 1rem;
  font-weight: 800;
  line-height: 1.35;
  color: var(--text-100);
`;

const RelatedExcerpt = styled.p`
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.52;
  color: var(--text-200);
  font-family: "Montserrat", sans-serif;
`;

const MainColumn = styled.div`
  grid-area: main;
  min-width: 0;
  max-width: 100%;
  box-sizing: border-box;
`;

/** Kompaktnija tipografija i širina — od naslova „Differences…“ nadole */
const ArticleLower = styled.div`
  min-width: 0;
  max-width: 100%;
  box-sizing: border-box;
`;

/** Tri kolone — legacy grid kada nema productRows */
const BlogProductGrid = styled.div`
  display: grid;
  gap: var(--spacing-md);
  grid-template-columns: 1fr;
  margin: var(--spacing-md) 0 var(--spacing-lg);
  min-width: 0;

  @media (min-width: 768px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`;

/** Jedan proizvod: levo naslov + lista, desno ProductCard */
const BlogProductRow = styled.div`
  display: grid;
  gap: var(--spacing-lg);
  align-items: start;
  margin: var(--spacing-lg) 0;
  min-width: 0;
  grid-template-columns: 1fr;

  @media (min-width: 900px) {
    grid-template-columns: minmax(0, 1fr) minmax(200px, 260px);
    gap: var(--spacing-lg);
  }
`;

const BlogProductRowText = styled.div`
  min-width: 0;
`;

const BlogProductRowHeading = styled.h4`
  margin: 0 0 var(--spacing-sm);
  font-family: "Montserrat", sans-serif;
  font-weight: 800;
  font-size: 1.0625rem;
  color: var(--text-100);
  line-height: 1.35;
`;

const BlogProductRowCard = styled.div`
  min-width: 0;
  justify-self: center;
  width: 100%;
  max-width: 50%;

  @media (min-width: 900px) {
    justify-self: stretch;
    max-width: none;
  }
`;

const ArticleInfographic = styled.figure`
  margin: 0 0 var(--spacing-lg);
  padding: 0;
  max-width: 100%;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: #f5f5f5;
  box-sizing: border-box;
`;

const ArticleInfographicImg = styled.img`
  width: 100%;
  height: auto;
  display: block;
  vertical-align: middle;
`;

const BodyH2 = styled.h2`
  font-family: "Montserrat", sans-serif;
  font-weight: 800;
  font-size: 1.2rem;
  margin: var(--spacing-md) 0 var(--spacing-xs);
  color: var(--text-100);
  scroll-margin-top: 80px;
  line-height: 1.32;
`;

const BodyH3 = styled.h3`
  font-family: "Montserrat", sans-serif;
  font-weight: 700;
  font-size: 1.0625rem;
  margin: var(--spacing-md) 0 0.35rem;
  color: var(--text-100);
  scroll-margin-top: 80px;
  line-height: 1.38;
`;

const BodyP = styled.p`
  font-size: 0.9375rem;
  line-height: 1.6;
  margin: 0 0 var(--spacing-sm);
  color: var(--text-200);
  font-family: "Montserrat", sans-serif;
  word-wrap: break-word;
  overflow-wrap: anywhere;

  a {
    color: var(--primary-100);
    font-weight: 600;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }

  strong {
    font-weight: 800;
    color: var(--text-100);
  }
`;

function BodyParagraph({ children, lang }) {
  const raw = typeof children === "string" ? children : "";
  const html = blogInjectLang(raw, lang);
  if (html.includes("<") && html.includes(">")) {
    return (
      <BodyP dangerouslySetInnerHTML={{ __html: html }} />
    );
  }
  return <BodyP>{children}</BodyP>;
}

const BodyBulletList = styled.ul`
  margin: 0 0 var(--spacing-sm);
  padding-left: 1.25rem;
  font-family: "Montserrat", sans-serif;
  font-size: 0.9375rem;
  line-height: 1.55;
  color: var(--text-200);
`;

const BodySubhead = styled.p`
  font-weight: 700;
  margin: var(--spacing-sm) 0 var(--spacing-xs);
  font-family: "Montserrat", sans-serif;
  font-size: 0.9375rem;
  color: var(--text-100);
`;

const Crumbs = styled.nav`
  font-size: var(--font-size-small);
  font-family: "Montserrat", sans-serif;
  color: var(--text-200);
  margin-bottom: var(--spacing-md);

  a {
    color: var(--primary-100);
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
`;

const CategoryRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 16px;
  margin-bottom: var(--spacing-sm);
`;

const CategoryTag = styled.span`
  display: inline-block;
  padding: 4px 10px;
  background: rgba(0, 102, 178, 0.12);
  color: var(--primary-100);
  font-size: 0.75rem;
  font-weight: 700;
  font-family: "Montserrat", sans-serif;
  border-radius: 4px;
  letter-spacing: 0.02em;
`;

const PublishedLine = styled.span`
  font-size: var(--font-size-small);
  color: var(--text-200);
  font-family: "Montserrat", sans-serif;
`;

const HeroRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-sm);

  @media (min-width: 768px) {
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--spacing-xl);
  }
`;

const HeroText = styled.div`
  flex: 1 1 0;
  min-width: 0;
`;

const HeroFigure = styled.div`
  flex: 0 0 auto;
  width: 100%;
  max-width: min(320px, 100%);
  margin: 0 auto;

  @media (min-width: 768px) {
    max-width: 340px;
    margin: 0;
  }
`;

const HeroImg = styled.img`
  width: 100%;
  height: auto;
  display: block;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: #f0f0f0;
`;

const H1 = styled.h1`
  font-family: "Montserrat", sans-serif;
  font-weight: 800;
  font-size: clamp(1.5rem, 3.8vw, 2.05rem);
  line-height: 1.22;
  color: var(--text-100);
  margin: 0 0 var(--spacing-sm);
`;

const Dek = styled.p`
  font-size: 1.125rem;
  line-height: 1.62;
  color: var(--text-200);
  margin: 0;
`;

const MetaLine = styled.p`
  font-size: var(--font-size-small);
  color: var(--text-200);
  margin: 0 0 var(--spacing-xl);
  font-family: "Montserrat", sans-serif;
`;

const H2 = styled.h2`
  font-family: "Montserrat", sans-serif;
  font-weight: 800;
  font-size: 1.3rem;
  margin: var(--spacing-xl) 0 var(--spacing-sm);
  color: var(--text-100);
  scroll-margin-top: 80px;
  line-height: 1.3;
`;

const H3 = styled.h3`
  font-family: "Montserrat", sans-serif;
  font-weight: 700;
  font-size: 1.125rem;
  margin: var(--spacing-lg) 0 var(--spacing-sm);
  color: var(--text-100);
  scroll-margin-top: 80px;
  line-height: 1.35;
`;

const P = styled.p`
  font-size: 1.0625rem;
  line-height: 1.65;
  margin: 0 0 var(--spacing-md);
  color: var(--text-200);
  font-family: "Montserrat", sans-serif;
`;

const TakeawayBox = styled.div`
  background: rgba(0, 48, 87, 0.06);
  border-left: 4px solid var(--primary-100);
  padding: var(--spacing-md) var(--spacing-lg);
  margin: var(--spacing-lg) 0;
  border-radius: 0 8px 8px 0;
`;

const TakeawayTitle = styled.p`
  margin: 0;
  font-family: "Montserrat", sans-serif;
  font-weight: 800;
  font-size: 1.125rem;
  color: var(--text-100);
`;

const TakeawayList = styled.ul`
  margin: var(--spacing-sm) 0 0;
  padding-left: 1.25rem;
  font-family: "Montserrat", sans-serif;
  font-size: 1.0625rem;
  line-height: 1.58;
  color: var(--text-200);
`;

const TOC_BORDER = "#e0e0e0";

const TocBlock = styled.nav`
  border-top: 1px solid ${TOC_BORDER};
  border-bottom: 1px solid ${TOC_BORDER};
  padding: var(--spacing-lg) 0;
  margin: var(--spacing-xl) 0;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
`;

const TocHeading = styled.h2`
  margin: 0 0 var(--spacing-md);
  padding: 0;
  font-family: "Montserrat", sans-serif;
  font-weight: 800;
  font-size: 1.2rem;
  color: var(--text-100);
  scroll-margin-top: 80px;
  line-height: 1.3;
`;

const TocGrid = styled.ul`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px var(--spacing-xl);
  margin: 0;
  padding: 0;
  list-style: none;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const TocItem = styled.li`
  margin: 0;
  padding: 0;
  min-width: 0;
`;

const TocLink = styled.a`
  display: inline-flex;
  align-items: flex-start;
  gap: 8px;
  font-family: "Montserrat", sans-serif;
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--primary-100);
  text-decoration: none;
  line-height: 1.45;
  word-wrap: break-word;
  overflow-wrap: anywhere;

  &:hover {
    text-decoration: underline;
  }

  &:focus-visible {
    outline: 2px solid var(--primary-100);
    outline-offset: 2px;
  }
`;

const TocLinkIcon = styled.span`
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 1px;
  color: var(--primary-100);
`;

const TableWrap = styled.div`
  overflow-x: auto;
  margin: var(--spacing-md) 0 var(--spacing-lg);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
  -webkit-overflow-scrolling: touch;
`;

const Table = styled.table`
  width: 100%;
  max-width: 100%;
  border-collapse: collapse;
  font-size: 0.9375rem;
  font-family: "Montserrat", sans-serif;
  table-layout: fixed;
`;

const Th = styled.th`
  text-align: left;
  padding: 10px 12px;
  background: rgba(0, 26, 87, 0.06);
  font-weight: 800;
  color: var(--text-100);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  word-wrap: break-word;
  overflow-wrap: anywhere;
`;

const Td = styled.td`
  padding: 10px 12px;
  vertical-align: top;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  color: var(--text-200);
  line-height: 1.45;
  word-wrap: break-word;
  overflow-wrap: anywhere;
`;

const CtaLink = styled(Link)`
  display: inline-block;
  margin-top: var(--spacing-sm);
  font-family: "Montserrat", sans-serif;
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--primary-100);
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;

const FaqStack = styled.div`
  margin-top: var(--spacing-sm);
  border: 1px solid rgba(0, 26, 87, 0.12);
  border-radius: 10px;
  overflow: hidden;
  background: var(--bg-100);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
`;

const FaqChevron = styled.span`
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  margin-top: -2px;
  border-radius: 6px;
  color: var(--primary-100);
  background: rgba(0, 48, 87, 0.08);
  transition: transform 0.2s ease;
`;

const FaqDetails = styled.details`
  margin: 0;
  font-family: "Montserrat", sans-serif;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  min-width: 0;
  max-width: 100%;
  box-sizing: border-box;

  &:last-child {
    border-bottom: none;
  }

  &[open] {
    background: rgba(0, 48, 87, 0.04);
  }

  &[open] ${FaqChevron} {
    transform: rotate(180deg);
  }
`;

const FaqSummary = styled.summary`
  cursor: pointer;
  font-weight: 700;
  font-size: 0.9375rem;
  line-height: 1.48;
  color: var(--text-100);
  list-style: none;
  padding: 14px 16px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  user-select: none;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  &::-webkit-details-marker {
    display: none;
  }

  &:hover {
    background: rgba(0, 0, 0, 0.03);
  }
`;

const FaqSummaryText = styled.span`
  flex: 1;
  min-width: 0;
`;

const FaqBody = styled.div`
  padding: 12px 16px 16px;
  font-size: 0.9375rem;
  line-height: 1.62;
  color: var(--text-200);
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
  word-wrap: break-word;
  overflow-wrap: anywhere;
`;

function BlogArticle() {
  const { t, i18n } = useTranslation();
  const { lang: langParam, slug } = useParams();

  useEffect(() => {
    if (
      langParam &&
      (langParam === "de" || langParam === "en") &&
      i18n.language?.split("-")[0] !== langParam
    ) {
      i18n.changeLanguage(langParam);
    }
  }, [langParam, i18n]);

  const lang = normalizeShopLang(langParam || i18n.language);
  const l = lang === "de" ? "de" : "en";
  const post = getPostBySlug(slug);

  if (!post) {
    return <Navigate to={blogListingPath(lang)} replace />;
  }

  const title = post.meta.title[l];
  const desc = post.meta.description[l];
  const related = Array.isArray(post.relatedArticles)
    ? post.relatedArticles
    : [];
  const hasSidebar = related.length > 0;
  const heroSrc = post.heroImage ?? null;
  const categoryLabel = post.category?.[l];

  return (
    <>
      <Helmet>
        <html lang={lang} />
        <title>{title} | SnusCo</title>
        <meta name="description" content={desc} />
      </Helmet>
      {/**
       * Header mora biti izvan Shell-a: Shell ima overflow-x:hidden (širina sadržaja),
       * a sticky u Header.jsx ne radi ispod roditelja sa overflow != visible.
       */}
      <Header />
      <Shell>
        <LayoutWrap>
        <BlogArticleRoot>
          <IntroFullWidth>
            <CrumbsNav lang={lang} />
            <CategoryRow>
              {categoryLabel && (
                <CategoryTag>{categoryLabel}</CategoryTag>
              )}
              <PublishedLine>
                {t("BLOG.PUBLISHED", { date: post.published })}
              </PublishedLine>
            </CategoryRow>

            <HeroRow>
              <HeroText>
                <H1>{title}</H1>
                <Dek>{post.intro[l]}</Dek>
              </HeroText>
              {heroSrc ? (
                <HeroFigure>
                  <HeroImg
                    src={heroSrc}
                    alt={title}
                    width={680}
                    height={420}
                    loading="eager"
                  />
                </HeroFigure>
              ) : null}
            </HeroRow>

            <MetaLine>
              {t("BLOG.BY_AUTHOR", { name: post.author[l] })}
            </MetaLine>
          </IntroFullWidth>

          <PageGrid $hasSidebar={hasSidebar}>
            <MainColumn>
              <TakeawayBox id="takeaways">
                <TakeawayTitle>{post.keyTakeaways.title[l]}</TakeawayTitle>
                <TakeawayList>
                  {post.keyTakeaways.items[l].map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </TakeawayList>
              </TakeawayBox>

              <TocBlock aria-label={post.toc.title[l]}>
                <TocHeading id="toc">{post.toc.title[l]}</TocHeading>
                <TocGrid>
                  {post.toc.items.map((item) => (
                    <TocItem key={item.id}>
                      <TocLink href={`#${item.id}`}>
                        <TocLinkIcon aria-hidden>
                          <svg
                            viewBox="0 0 24 24"
                            width="14"
                            height="14"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                          </svg>
                        </TocLinkIcon>
                        <span>{item.label[l]}</span>
                      </TocLink>
                    </TocItem>
                  ))}
                </TocGrid>
              </TocBlock>

              <H2 id="glance">{post.toc.items[0].label[l]}</H2>
              {post.blogLayout === "guide" && post.openingParagraphs ? (
                post.openingParagraphs[l].map((para, pIdx) => (
                  <BodyParagraph key={`open-${pIdx}`} lang={lang}>
                    {para}
                  </BodyParagraph>
                ))
              ) : post.glanceIntro ? (
                <P>{post.glanceIntro[l]}</P>
              ) : null}

              {post.comparisonTable ? (
                <>
                  <TableWrap>
                    <Table>
                      <thead>
                        <tr>
                          <Th>{post.comparisonTable.headers.feature[l]}</Th>
                          <Th>{post.comparisonTable.headers.mini[l]}</Th>
                          <Th>{post.comparisonTable.headers.slim[l]}</Th>
                        </tr>
                      </thead>
                      <tbody>
                        {post.comparisonTable.rows.map((row) => (
                          <tr key={row.feature[l]}>
                            <Td>{row.feature[l]}</Td>
                            <Td>{row.mini[l]}</Td>
                            <Td>{row.slim[l]}</Td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </TableWrap>
                  {post.pouchCountNote?.[l] ? (
                    <P>{post.pouchCountNote[l]}</P>
                  ) : null}
                </>
              ) : null}

              <ArticleLower>
                {post.blogLayout !== "guide" ? (
                  <>
                    <BodyH2 id="differences">
                      {post.toc.items[1].label[l]}
                    </BodyH2>
                    {post.differencesInfographic ? (
                      <ArticleInfographic>
                        <ArticleInfographicImg
                          src={post.differencesInfographic}
                          alt={post.toc.items[1].label[l]}
                          loading="lazy"
                          decoding="async"
                        />
                      </ArticleInfographic>
                    ) : null}
                  </>
                ) : null}

                {post.sections.map((section) => (
                  <BlogContentSection key={section.id} id={section.id}>
                    <BodyH3>{section.title[l]}</BodyH3>
                    {section.paragraphs &&
                      section.paragraphs[l].map((para, pIdx) => (
                        <BodyParagraph key={`${section.id}-${pIdx}`} lang={lang}>
                          {para}
                        </BodyParagraph>
                      ))}
                    {section.productRows?.length ? (
                      section.productRows.map((row, rowIdx) => (
                        <BlogProductRow
                          key={`${section.id}-prow-${rowIdx}`}
                        >
                          <BlogProductRowText>
                            <BlogProductRowHeading>
                              {row.heading[l]}
                            </BlogProductRowHeading>
                            <BodyBulletList>
                              {row.bullets[l].map((item) => (
                                <li key={item}>{item}</li>
                              ))}
                            </BodyBulletList>
                          </BlogProductRowText>
                          <BlogProductRowCard>
                            <ProductCard product={row.product} />
                          </BlogProductRowCard>
                        </BlogProductRow>
                      ))
                    ) : section.products?.length ? (
                      <BlogProductGrid>
                        {section.products.map((product) => (
                          <ProductCard key={product.id} product={product} />
                        ))}
                      </BlogProductGrid>
                    ) : null}
                    {section.paragraphsAfter &&
                      section.paragraphsAfter[l].map((para, pIdx) => (
                        <BodyParagraph
                          key={`${section.id}-after-${pIdx}`}
                          lang={lang}
                        >
                          {para}
                        </BodyParagraph>
                      ))}
                    {section.infographic ? (
                      <ArticleInfographic>
                        <ArticleInfographicImg
                          src={section.infographic}
                          alt={
                            section.infographicAlt
                              ? section.infographicAlt[l]
                              : section.title[l]
                          }
                          loading="lazy"
                          decoding="async"
                        />
                      </ArticleInfographic>
                    ) : null}
                    {section.cta && (
                      <CtaLink to={resolveSectionCtaTo(lang, section.cta)}>
                        {section.cta.label[l]}
                      </CtaLink>
                    )}
                    {section.bullets && (
                      <>
                        <BodySubhead>{section.bullets.titleMini[l]}</BodySubhead>
                        <BodyBulletList>
                          {section.bullets.mini[l].map((x) => (
                            <li key={x}>{x}</li>
                          ))}
                        </BodyBulletList>
                        <BodySubhead>{section.bullets.titleSlim[l]}</BodySubhead>
                        <BodyBulletList>
                          {section.bullets.slim[l].map((x) => (
                            <li key={x}>{x}</li>
                          ))}
                        </BodyBulletList>
                      </>
                    )}
                  </BlogContentSection>
                ))}

                <BodyH2 id="faqs">{post.faqs.title[l]}</BodyH2>
                <FaqStack>
                  {post.faqs.items.map((faq) => (
                    <FaqDetails key={faq.q[l]}>
                      <FaqSummary>
                        <FaqSummaryText>{faq.q[l]}</FaqSummaryText>
                        <FaqChevron aria-hidden>
                          <svg
                            viewBox="0 0 24 24"
                            width="16"
                            height="16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path
                              d="M6 9l6 6 6-6"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </FaqChevron>
                      </FaqSummary>
                      <FaqBody>{faq.a[l]}</FaqBody>
                    </FaqDetails>
                  ))}
                </FaqStack>
              </ArticleLower>
            </MainColumn>

            {hasSidebar && (
              <RelatedAside aria-label={t("BLOG.RELATED_HEADING")}>
                <RelatedHeading>{t("BLOG.RELATED_HEADING")}</RelatedHeading>
                {related.map((item, idx) => (
                  <RelatedCard
                    key={`${item.title[l]}-${idx}`}
                    to={resolveRelatedTo(lang, item.to)}
                  >
                    {item.image ? (
                      <RelatedCardMedia>
                        <RelatedCardImg
                          src={item.image}
                          alt=""
                          loading="lazy"
                          decoding="async"
                        />
                      </RelatedCardMedia>
                    ) : null}
                    <RelatedCardBody>
                      <RelatedCardTitle>{item.title[l]}</RelatedCardTitle>
                      <RelatedExcerpt>{item.excerpt[l]}</RelatedExcerpt>
                    </RelatedCardBody>
                  </RelatedCard>
                ))}
              </RelatedAside>
            )}
          </PageGrid>
        </BlogArticleRoot>
        </LayoutWrap>
      </Shell>
    </>
  );
}

function CrumbsNav({ lang }) {
  const { t } = useTranslation();
  return (
    <Crumbs aria-label="Breadcrumb">
      <Link to="/">{t("BLOG.CRUMB_HOME")}</Link>
      {" · "}
      <Link to={blogListingPath(lang)}>{t("BLOG.CRUMB_BLOG")}</Link>
    </Crumbs>
  );
}

export default BlogArticle;
