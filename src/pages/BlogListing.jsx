import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import Header from "../layouts/header/Header";
import { listPostsSummaries } from "../content/blog";
import { blogArticlePath } from "../utils/blogRoutes";
import { normalizeShopLang } from "../utils/shopRoutes";

const Shell = styled.div`
  background-color: var(--background-color);
  color: var(--text-color);
  min-height: 60vh;
`;

const Inner = styled.div`
  width: 100%;
  max-width: min(1140px, 100%);
  margin: 0 auto;
  padding: var(--spacing-lg) var(--spacing-md) var(--spacing-xxl);
  box-sizing: border-box;
`;

const Title = styled.h1`
  font-family: "Montserrat", sans-serif;
  font-weight: 800;
  font-size: clamp(1.5rem, 4vw, 2rem);
  color: var(--text-100);
  margin: 0 0 var(--spacing-md);
`;

const Lead = styled.p`
  font-family: "Montserrat", sans-serif;
  font-size: var(--font-size-body);
  color: var(--text-200);
  line-height: 1.55;
  margin: 0 0 var(--spacing-xl);
  max-width: 42rem;
`;

const Grid = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 260px), 1fr));
  gap: var(--spacing-lg);
  align-items: stretch;
`;

const Card = styled(Link)`
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: var(--border-radius-base, 8px);
  overflow: hidden;
  background: var(--bg-100);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  text-decoration: none;
  color: inherit;
  transition:
    box-shadow 0.2s ease,
    transform 0.2s ease;

  &:hover {
    box-shadow: var(--shadow-medium);
    transform: translateY(-2px);
  }

  &:focus-visible {
    outline: 2px solid var(--primary-100);
    outline-offset: 2px;
  }
`;

const CardImage = styled.img`
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  display: block;
  flex-shrink: 0;
  background: rgba(0, 0, 0, 0.04);
`;

const CardBody = styled.div`
  padding: var(--spacing-md) var(--spacing-lg);
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const CardTitle = styled.h2`
  margin: 0 0 var(--spacing-xs);
  font-family: "Montserrat", sans-serif;
  font-size: 1.0625rem;
  font-weight: 700;
  line-height: 1.3;
  color: var(--primary-100);
`;

const Meta = styled.p`
  margin: 0 0 var(--spacing-sm);
  font-size: var(--font-size-small);
  color: var(--text-200);
  font-family: "Montserrat", sans-serif;
`;

const Excerpt = styled.p`
  margin: 0;
  font-size: var(--font-size-small);
  line-height: 1.5;
  color: var(--text-200);
  font-family: "Montserrat", sans-serif;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

function BlogListing() {
  const { t, i18n } = useTranslation();
  const { lang: langParam } = useParams();

  useEffect(() => {
    if (
      langParam &&
      (langParam === "de" || langParam === "en") &&
      i18n.language?.split("-")[0] !== langParam
    ) {
      i18n.changeLanguage(langParam);
    }
  }, [langParam, i18n]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [langParam]);

  const lang = normalizeShopLang(langParam || i18n.language);
  const posts = listPostsSummaries(lang);

  return (
    <Shell>
      <Helmet>
        <html lang={lang} />
        <title>{t("BLOG.PAGE_TITLE")}</title>
        <meta name="description" content={t("BLOG.PAGE_DESCRIPTION")} />
      </Helmet>
      <Header />
      <Inner>
        <Title>{t("BLOG.LIST_HEADING")}</Title>
        <Lead>{t("BLOG.LIST_LEAD")}</Lead>
        <Grid>
          {posts.map((post) => (
            <li key={post.slug}>
              <Card to={blogArticlePath(lang, post.slug)}>
                {post.heroImage ? (
                  <CardImage
                    src={post.heroImage}
                    alt=""
                    loading="lazy"
                    decoding="async"
                  />
                ) : null}
                <CardBody>
                  <CardTitle>{post.title}</CardTitle>
                  <Meta>
                    {post.published} · {post.author}
                  </Meta>
                  <Excerpt>{post.excerpt}</Excerpt>
                </CardBody>
              </Card>
            </li>
          ))}
        </Grid>
      </Inner>
    </Shell>
  );
}

export default BlogListing;
