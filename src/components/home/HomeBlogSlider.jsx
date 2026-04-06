import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { listPostsSummaries } from "../../content/blog";
import { blogArticlePath, blogListingPath } from "../../utils/blogRoutes";

const MOBILE = "(max-width: 768px)";
const TABLET = "(min-width: 769px) and (max-width: 1024px)";

const Section = styled.section`
  box-sizing: border-box;
  width: 100%;
  max-width: var(--max-width-container);
  margin: 0 auto;
  padding: var(--spacing-lg) var(--spacing-md) var(--spacing-xxl);
`;

const HeadRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--spacing-sm) var(--spacing-md);
  margin-bottom: var(--spacing-md);
`;

const Title = styled.h2`
  margin: 0;
  font-family: var(--font-family);
  font-size: clamp(1.125rem, 2.2vw, 1.35rem);
  font-weight: 700;
  color: var(--text-100);
  line-height: 1.25;
`;

const ViewAllLink = styled(Link)`
  font-family: "Montserrat", sans-serif;
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--primary-100);
  text-decoration: none;
  white-space: nowrap;

  &:hover {
    text-decoration: underline;
  }

  &:focus-visible {
    outline: 2px solid var(--primary-100);
    outline-offset: 2px;
  }
`;

const Wrapper = styled.div`
  width: 100%;
  font-family: var(--font-family);

  &:focus-visible {
    outline: 2px solid var(--primary-100);
    outline-offset: 4px;
    border-radius: 4px;
  }
`;

const Viewport = styled.div`
  position: relative;
  overflow: hidden;
  width: 100%;
`;

const Track = styled.div`
  display: flex;
  width: ${({ $count, $perView }) =>
    $count <= $perView ? 100 : ($count / $perView) * 100}%;
  transform: translateX(
    ${({ $slideIndex, $count }) => (-($slideIndex / $count) * 100)}%
  );
  transition: transform var(--transition-normal);
`;

const SlideCell = styled.div`
  --slider-between: var(--spacing-xxs);
  @media (min-width: 769px) {
    --slider-between: var(--spacing-sm);
  }

  display: flex;
  flex: 0 0 ${({ $count }) => 100 / $count}%;
  width: ${({ $count }) => 100 / $count}%;
  min-width: 0;
  box-sizing: border-box;
  padding-left: calc(var(--slider-between) / 2);
  padding-right: calc(var(--slider-between) / 2);

  &:first-child {
    padding-left: 0;
  }
  &:last-child {
    padding-right: 0;
  }
`;

const ArrowZone = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  pointer-events: none;
  padding: 0;
  z-index: var(--zindex-default);
`;

const ArrowButton = styled.button`
  pointer-events: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  flex: 0 0 34px;
  height: 26%;
  min-height: 64px;
  max-height: 132px;
  align-self: center;
  margin: 0;
  padding: 0;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 0;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.14);
  color: var(--primary-100);
  cursor: pointer;
  transition: background var(--transition-fast), border-color var(--transition-fast),
    box-shadow var(--transition-fast), opacity var(--transition-fast);

  @media ${MOBILE} {
    width: 28px;
    flex-basis: 28px;
    min-height: 52px;
    max-height: 100px;
    background: rgba(255, 255, 255, 0.85);
  }

  &:first-of-type {
    border-top-right-radius: var(--border-radius-base);
    border-bottom-right-radius: var(--border-radius-base);
  }

  &:last-of-type {
    border-top-left-radius: var(--border-radius-base);
    border-bottom-left-radius: var(--border-radius-base);
  }

  &:hover {
    background: rgba(255, 255, 255, 0.88);
    border-color: rgba(0, 0, 0, 0.14);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
  }

  &:focus-visible {
    outline: 2px solid var(--primary-100);
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  svg {
    width: 32px;
    height: 32px;
    flex-shrink: 0;

    @media ${MOBILE} {
      width: 22px;
      height: 22px;
    }
  }
`;

const DashBar = styled.div`
  display: flex;
  align-items: stretch;
  width: 100%;
  margin-top: var(--spacing-sm);
  height: 6px;
  border-radius: 4px;
  overflow: hidden;
  background: #d0d0d0;

  @media ${MOBILE} {
    margin-top: var(--spacing-xs);
    height: 5px;
  }
`;

const DashSegment = styled.button`
  flex: 1 1 0;
  min-width: 0;
  margin: 0;
  padding: 0;
  border: none;
  border-radius: 0;
  cursor: pointer;
  transition: background var(--transition-fast);
  background: ${({ $active }) => ($active ? "var(--primary-100)" : "#d0d0d0")};

  &:hover {
    background: ${({ $active }) =>
      $active ? "var(--primary-200)" : "#b8b8b8"};
  }

  &:focus-visible {
    outline: 2px solid var(--primary-100);
    outline-offset: 2px;
    z-index: 1;
  }
`;

const BlogCard = styled(Link)`
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
  transition: box-shadow 0.2s ease, transform 0.2s ease;

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
  background: rgba(0, 0, 0, 0.04);
`;

const CardBody = styled.div`
  padding: var(--spacing-md);
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const CardTitle = styled.h3`
  margin: 0 0 var(--spacing-xs);
  font-family: "Montserrat", sans-serif;
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.3;
  color: var(--primary-100);
`;

const CardMeta = styled.p`
  margin: 0 0 var(--spacing-xs);
  font-size: var(--font-size-small);
  color: var(--text-200);
`;

const CardExcerpt = styled.p`
  margin: 0;
  font-size: var(--font-size-small);
  line-height: 1.45;
  color: var(--text-200);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

function ChevronLeft() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M14.2893 5.70708C13.8988 5.31655 13.2657 5.31655 12.8751 5.70708L7.98768 10.5993C7.20729 11.3805 7.2076 12.6463 7.98837 13.427L12.8787 18.3174C13.2693 18.7079 13.9024 18.7079 14.293 18.3174C14.6835 17.9269 14.6835 17.2937 14.293 16.9032L10.1073 12.7175C9.71678 12.327 9.71678 11.6939 10.1073 11.3033L14.2893 7.12129C14.6799 6.73077 14.6799 6.0976 14.2893 5.70708Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M9.71069 18.2929C10.1012 18.6834 10.7344 18.6834 11.1249 18.2929L16.0123 13.4006C16.7927 12.6195 16.7924 11.3537 16.0117 10.5729L11.1213 5.68254C10.7308 5.29202 10.0976 5.29202 9.70708 5.68254C9.31655 6.07307 9.31655 6.70623 9.70708 7.09676L13.8927 11.2824C14.2833 11.6729 14.2833 12.3061 13.8927 12.6966L9.71069 16.8787C9.32016 17.2692 9.32016 17.9023 9.71069 18.2929Z"
        fill="currentColor"
      />
    </svg>
  );
}

function useItemsPerView() {
  const [itemsPerView, setItemsPerView] = useState(() => {
    if (typeof window === "undefined") return 3;
    if (window.matchMedia(MOBILE).matches) return 1;
    if (window.matchMedia(TABLET).matches) return 2;
    return 3;
  });

  useEffect(() => {
    const mqMobile = window.matchMedia(MOBILE);
    const mqTablet = window.matchMedia(TABLET);
    const update = () => {
      if (mqMobile.matches) setItemsPerView(1);
      else if (mqTablet.matches) setItemsPerView(2);
      else setItemsPerView(3);
    };
    update();
    mqMobile.addEventListener("change", update);
    mqTablet.addEventListener("change", update);
    return () => {
      mqMobile.removeEventListener("change", update);
      mqTablet.removeEventListener("change", update);
    };
  }, []);

  return itemsPerView;
}

/**
 * Slider članaka bloga na početnoj stranici — isti podaci kao lista bloga.
 */
function HomeBlogSlider() {
  const { t, i18n } = useTranslation();
  const id = useId();
  const [slideIndex, setSlideIndex] = useState(0);
  const touchStartX = useRef(null);
  const itemsPerView = useItemsPerView();

  const lang =
    i18n.language?.split("-")[0]?.toLowerCase() === "de" ? "de" : "en";

  const posts = useMemo(() => listPostsSummaries(lang), [lang]);
  const list = posts ?? [];
  const count = list.length;
  const maxIndex = Math.max(0, count - itemsPerView);

  useEffect(() => {
    setSlideIndex((i) => Math.min(i, maxIndex));
  }, [maxIndex]);

  const go = useCallback(
    (delta) => {
      if (maxIndex <= 0) return;
      setSlideIndex((i) => Math.max(0, Math.min(maxIndex, i + delta)));
    },
    [maxIndex]
  );

  const onCarouselKeyDown = (e) => {
    if (maxIndex <= 0) return;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(-1);
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(1);
    }
  };

  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e) => {
    if (touchStartX.current == null || maxIndex <= 0) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (dx > 48) go(-1);
    else if (dx < -48) go(1);
  };

  if (!count) return null;

  const labelId = `${id}-blog-slider-label`;
  const showNav = maxIndex > 0;
  const dotCount = maxIndex + 1;
  const listPath = blogListingPath(lang);

  return (
    <Section aria-labelledby="home-blog-slider-heading">
      <HeadRow>
        <Title id="home-blog-slider-heading">{t("HOME.BLOG_SLIDER.TITLE")}</Title>
        <ViewAllLink to={listPath}>{t("HOME.BLOG_SLIDER.VIEW_ALL")}</ViewAllLink>
      </HeadRow>

      <Wrapper
        role="region"
        aria-roledescription="carousel"
        aria-labelledby={labelId}
        tabIndex={0}
        onKeyDown={onCarouselKeyDown}
      >
        <span id={labelId} className="visually-hidden">
          {t("HOME.BLOG_SLIDER.ARIA_REGION")}
        </span>
        <Viewport
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          aria-hidden={!showNav}
        >
          <Track $slideIndex={slideIndex} $count={count} $perView={itemsPerView}>
            {list.map((post) => (
              <SlideCell key={post.slug} $count={count}>
                <BlogCard to={blogArticlePath(lang, post.slug)}>
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
                    <CardMeta>
                      {post.published} · {post.author}
                    </CardMeta>
                    <CardExcerpt>{post.excerpt}</CardExcerpt>
                  </CardBody>
                </BlogCard>
              </SlideCell>
            ))}
          </Track>
          {showNav && (
            <ArrowZone>
              <ArrowButton
                type="button"
                aria-label={t("HOME.BLOG_SLIDER.ARIA_PREV")}
                disabled={slideIndex <= 0}
                onClick={() => go(-1)}
              >
                <ChevronLeft />
              </ArrowButton>
              <ArrowButton
                type="button"
                aria-label={t("HOME.BLOG_SLIDER.ARIA_NEXT")}
                disabled={slideIndex >= maxIndex}
                onClick={() => go(1)}
              >
                <ChevronRight />
              </ArrowButton>
            </ArrowZone>
          )}
        </Viewport>

        {showNav && (
          <DashBar role="tablist" aria-label={t("HOME.BLOG_SLIDER.ARIA_REGION")}>
            {Array.from({ length: dotCount }, (_, i) => (
              <DashSegment
                key={i}
                type="button"
                role="tab"
                aria-selected={i === slideIndex}
                aria-label={t("HOME.BLOG_SLIDER.ARIA_SLIDE", {
                  current: i + 1,
                  total: dotCount,
                })}
                $active={i === slideIndex}
                onClick={() => setSlideIndex(i)}
              />
            ))}
          </DashBar>
        )}
      </Wrapper>
    </Section>
  );
}

export default HomeBlogSlider;
