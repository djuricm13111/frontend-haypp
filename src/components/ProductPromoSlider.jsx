import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";

/** Ispod: mobilni raspored; strelice sakrivene (ostaju crtice + swipe). */
const MOBILE = "(max-width: 768px)";
const DESKTOP = "(min-width: 769px)";
/** Tipografija donjeg dela — manja na pravom desktopu */
const DESKTOP_LG = "(min-width: 1025px)";

const Wrapper = styled.div`
  width: 100%;
  max-width: var(--max-width-container);
  margin: 0 auto;
  font-family: var(--font-family);

  &:focus-visible {
    outline: 2px solid var(--primary-100);
    outline-offset: 4px;
    border-radius: 4px;
  }
`;

const Card = styled.div`
  border: 1px solid #d8d8d8;
  border-radius: 15px;
  overflow: hidden;
  background: var(--bg-100);
  box-shadow: var(--shadow-small);
`;

const ImageViewport = styled.div`
  position: relative;
  overflow: hidden;
  background: var(--bg-300);
`;

const Track = styled.div`
  display: flex;
  width: ${({ $count }) => $count * 100}%;
  transform: translateX(
    ${({ $index, $count }) => (-$index * 100) / $count}%
  );
  transition: transform var(--transition-normal);
`;

const ImageSlide = styled.div`
  flex: 0 0 ${({ $count }) => 100 / $count}%;
  width: ${({ $count }) => 100 / $count}%;
  min-width: 0;
`;

/** Puna širina kartice; cover popunjava prostor bez praznina levo/desno. */
const ImageHolder = styled.div`
  position: relative;
  width: 100%;
  height: clamp(168px, 30vw, 300px);
  overflow: hidden;
  background: var(--bg-300);

  @media ${DESKTOP_LG} {
    /* Viša zona na desktopu = manje vertikalnog crop-a uz cover */
    height: clamp(200px, 24vw, 380px);
  }

  @media ${MOBILE} {
    height: clamp(140px, 36vw, 220px);
  }
`;

/** Klik na sliku — isti link kao CTA (SPA). */
const SlideImageLink = styled(Link)`
  position: absolute;
  inset: 0;
  display: block;
  z-index: 0;
`;

const PromoImage = styled.img`
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;

  @media ${DESKTOP_LG} {
    /* Gornji deo banera ostaje u kadru (prioritet nad centrom) */
    object-position: center top;
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

  @media ${MOBILE} {
    display: none;
  }
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

  /* Spolja: 0; unutra (prema slici): zaobljenje */
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
  }
`;

const FooterViewport = styled.div`
  overflow: hidden;
  background: var(--bg-100);
`;

const FooterTrack = styled(Track)`
  /* inherits transform */
`;

const FooterSlide = styled.div`
  flex: 0 0 ${({ $count }) => 100 / $count}%;
  width: ${({ $count }) => 100 / $count}%;
  min-width: 0;
  box-sizing: border-box;
`;

const FooterInner = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-lg);
  min-height: 4.25rem;

  @media ${DESKTOP} {
    padding: var(--spacing-xs) var(--spacing-lg);
    min-height: 3rem;
    gap: var(--spacing-sm);
  }

  @media ${MOBILE} {
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
    gap: var(--spacing-sm);
    min-height: unset;
    padding: var(--spacing-sm) var(--spacing-md);
  }
`;

const TextBlock = styled.div`
  min-width: 0;
  flex: 1;

  @media ${MOBILE} {
    flex: none;
    width: 100%;
    text-align: center;
  }
`;

const PriceLine = styled.p`
  margin: 0 0 var(--spacing-xxs);
  font-size: 0.8125rem;
  font-weight: 400;
  color: var(--text-200);
  line-height: 1.3;
  font-family: var(--font-family);

  @media ${DESKTOP_LG} {
    font-size: 0.75rem;
    margin-bottom: var(--spacing-xxs);
  }

  @media ${MOBILE} {
    font-size: 0.6875rem;
  }
`;

const TitleLine = styled.h3`
  margin: 0;
  font-size: clamp(1rem, 2.5vw, 1.25rem);
  font-weight: 700;
  color: var(--text-100);
  line-height: 1.25;
  font-family: var(--font-family);

  @media ${DESKTOP_LG} {
    font-size: clamp(0.875rem, 1.25vw, 1.0625rem);
  }

  @media ${MOBILE} {
    font-size: 0.9rem;
  }
`;

const CtaButton = styled.a`
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-sm) var(--spacing-lg);
  background: var(--primary-100);
  color: var(--bg-100) !important;
  font-size: 0.9375rem;
  font-weight: 600;
  font-family: var(--font-family);
  text-decoration: none;
  border-radius: 0;
  border: 1px solid var(--primary-100);
  box-sizing: border-box;
  transition: background var(--transition-fast), border-color var(--transition-fast);

  @media ${DESKTOP} {
    border-radius: var(--border-radius-small);
  }

  @media ${DESKTOP_LG} {
    font-size: 0.8125rem;
    padding: var(--spacing-xs) var(--spacing-xxl);
  }

  @media ${MOBILE} {
    width: 100%;
    flex: none;
    font-size: 0.8125rem;
    padding: var(--spacing-xs) var(--spacing-md);
  }

  &:hover {
    background: var(--primary-200);
    border-color: var(--primary-200);
    color: var(--bg-100) !important;
  }

  &:focus-visible {
    outline: 2px solid var(--primary-100);
    outline-offset: 2px;
  }
`;

const Dashes = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: var(--spacing-sm);
  padding: 0 var(--spacing-md);

  @media ${DESKTOP} {
    margin-top: var(--spacing-xs);
  }

  @media ${MOBILE} {
    gap: 8px;
    margin-top: var(--spacing-xs);
  }
`;

const Dash = styled.button`
  width: 28px;
  height: 3px;
  padding: 0;
  border: none;
  border-radius: 2px;

  @media ${MOBILE} {
    width: 22px;
    height: 2px;
  }
  cursor: pointer;
  transition: background var(--transition-fast), transform var(--transition-fast);
  background: ${({ $active }) =>
    $active ? "var(--primary-100)" : "#d0d0d0"};

  &:hover {
    background: ${({ $active }) =>
      $active ? "var(--primary-200)" : "#b8b8b8"};
  }

  &:focus-visible {
    outline: 2px solid var(--primary-100);
    outline-offset: 2px;
  }
`;

function ChevronLeft() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M14.2893 5.70708C13.8988 5.31655 13.2657 5.31655 12.8751 5.70708L7.98768 10.5993C7.20729 11.3805 7.2076 12.6463 7.98837 13.427L12.8787 18.3174C13.2693 18.7079 13.9024 18.7079 14.293 18.3174C14.6835 17.9269 14.6835 17.2937 14.293 16.9032L10.1073 12.7175C9.71678 12.327 9.71678 11.6939 10.1073 11.3033L14.2893 7.12129C14.6799 6.73077 14.6799 6.0976 14.2893 5.70708Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M9.71069 18.2929C10.1012 18.6834 10.7344 18.6834 11.1249 18.2929L16.0123 13.4006C16.7927 12.6195 16.7924 11.3537 16.0117 10.5729L11.1213 5.68254C10.7308 5.29202 10.0976 5.29202 9.70708 5.68254C9.31655 6.07307 9.31655 6.70623 9.70708 7.09676L13.8927 11.2824C14.2833 11.6729 14.2833 12.3061 13.8927 12.6966L9.71069 16.8787C9.32016 17.2692 9.32016 17.9023 9.71069 18.2929Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * @typedef {Object} PromoSlide
 * @property {string} imageSrc
 * @property {string} [imageAlt]
 * @property {string} [priceLabel] — mala siva linija (npr. "From £2.49 / unit")
 * @property {string} title — naslov proizvoda / ponude
 * @property {string} [ctaLabel] — tekst dugmeta (npr. "Buy here")
 * @property {string} [ctaHref] — link za CTA
 */

/**
 * Slider kao na promotivnoj kartici: velika slika, ispod beli bar sa tekstom i CTA, crtice ispod.
 * @param {{ slides: PromoSlide[], className?: string }} props
 */
const AUTOPLAY_MS = 5000;

const ProductPromoSlider = ({ slides, className }) => {
  const id = useId();
  const [index, setIndex] = useState(0);
  const touchStartX = useRef(null);
  const count = slides?.length ?? 0;
  const countRef = useRef(count);
  const autoplayTimeoutRef = useRef(null);
  const resetAutoplayRef = useRef(() => {});

  const go = useCallback(
    (delta) => {
      if (count < 2) return;
      setIndex((i) => (i + delta + count) % count);
    },
    [count]
  );

  /** Auto slajd tek nakon AUTOPLAY_MS bez korisničke aktivnosti (klik, dodir, strelice). */
  useEffect(() => {
    countRef.current = count;
    const clearTimer = () => {
      if (autoplayTimeoutRef.current !== null) {
        window.clearTimeout(autoplayTimeoutRef.current);
        autoplayTimeoutRef.current = null;
      }
    };

    if (count < 2) {
      clearTimer();
      resetAutoplayRef.current = () => {};
      return undefined;
    }

    const scheduleNext = () => {
      autoplayTimeoutRef.current = window.setTimeout(() => {
        autoplayTimeoutRef.current = null;
        setIndex((prev) => (prev + 1) % countRef.current);
        scheduleNext();
      }, AUTOPLAY_MS);
    };

    const resetAutoplayFromUser = () => {
      clearTimer();
      scheduleNext();
    };

    resetAutoplayRef.current = resetAutoplayFromUser;
    scheduleNext();

    return () => clearTimer();
  }, [count]);

  const onUserActivity = useCallback(() => {
    resetAutoplayRef.current();
  }, []);

  const onCarouselKeyDown = (e) => {
    if (count < 2) return;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      onUserActivity();
      go(-1);
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      onUserActivity();
      go(1);
    }
  };

  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    onUserActivity();
  };

  const onTouchEnd = (e) => {
    if (touchStartX.current == null || count < 2) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (dx > 48) {
      onUserActivity();
      go(-1);
    } else if (dx < -48) {
      onUserActivity();
      go(1);
    }
  };

  if (!count) return null;

  const labelId = `${id}-label`;
  const showNav = count > 1;

  return (
    <Wrapper
      className={className}
      role="region"
      aria-roledescription="carousel"
      aria-labelledby={labelId}
      tabIndex={0}
      onKeyDown={onCarouselKeyDown}
      onPointerDownCapture={onUserActivity}
    >
      <span id={labelId} className="visually-hidden">
        Promotivni slider
      </span>
      <Card>
        <ImageViewport
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          aria-hidden={!showNav}
        >
          <Track $index={index} $count={count}>
            {slides.map((slide, i) => (
              <ImageSlide key={slide.key ?? i} $count={count}>
                <ImageHolder>
                  {slide.ctaHref ? (
                    <SlideImageLink
                      to={slide.ctaHref}
                      aria-label={
                        slide.imageAlt ||
                        slide.title ||
                        `${slide.ctaLabel ?? "Shop"} — slide ${i + 1}`
                      }
                    >
                      <PromoImage
                        src={slide.imageSrc}
                        alt=""
                        loading={i === 0 ? "eager" : "lazy"}
                      />
                    </SlideImageLink>
                  ) : (
                    <PromoImage
                      src={slide.imageSrc}
                      alt={slide.imageAlt ?? ""}
                      loading={i === 0 ? "eager" : "lazy"}
                    />
                  )}
                </ImageHolder>
              </ImageSlide>
            ))}
          </Track>
          {showNav && (
            <ArrowZone>
              <ArrowButton
                type="button"
                aria-label="Prethodni slajd"
                onClick={() => {
                  onUserActivity();
                  go(-1);
                }}
              >
                <ChevronLeft />
              </ArrowButton>
              <ArrowButton
                type="button"
                aria-label="Sledeći slajd"
                onClick={() => {
                  onUserActivity();
                  go(1);
                }}
              >
                <ChevronRight />
              </ArrowButton>
            </ArrowZone>
          )}
        </ImageViewport>

        <FooterViewport>
          <FooterTrack $index={index} $count={count}>
            {slides.map((slide, i) => (
              <FooterSlide key={slide.key ?? `f-${i}`} $count={count}>
                <FooterInner>
                  <TextBlock>
                    {slide.priceLabel ? (
                      <PriceLine>{slide.priceLabel}</PriceLine>
                    ) : null}
                    <TitleLine>{slide.title}</TitleLine>
                  </TextBlock>
                  {slide.ctaLabel && slide.ctaHref ? (
                    <CtaButton as={Link} to={slide.ctaHref}>
                      {slide.ctaLabel}
                    </CtaButton>
                  ) : null}
                </FooterInner>
              </FooterSlide>
            ))}
          </FooterTrack>
        </FooterViewport>
      </Card>

      {showNav && (
        <Dashes role="tablist" aria-label="Izbor slajda">
          {slides.map((slide, i) => (
            <Dash
              key={slide.key ?? `d-${i}`}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Slajd ${i + 1} od ${count}`}
              $active={i === index}
              onClick={() => {
                onUserActivity();
                setIndex(i);
              }}
            />
          ))}
        </Dashes>
      )}
    </Wrapper>
  );
};

export default ProductPromoSlider;
