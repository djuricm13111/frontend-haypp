import React from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const RADIUS = "8px";
/** Vertikalni razmak oko slike */
const IMAGE_PAD_V = "5px";
/** Horizontalni — malo veći da vizuelno odgovara prostoru kao gore kod širokih banera */
const IMAGE_PAD_H = "6px";
/** Zaobljenje same grafike */
const IMG_RADIUS = "6px";

const Section = styled.section`
  box-sizing: border-box;
  width: 100%;
  max-width: var(--max-width-container);
  margin: 0 auto;
  padding: var(--spacing-md) var(--spacing-md) var(--spacing-lg);
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--spacing-md);
  align-items: start;

  @media (min-width: 768px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: var(--spacing-xl);
  }
`;

const Card = styled.article`
  display: flex;
  flex-direction: column;
  height: auto;
  background: var(--bg-100);
  border-radius: ${RADIUS};
  overflow: hidden;
  border: 1px solid #e8e8e8;
  box-shadow: var(--shadow-small);
  min-width: 0;
  padding-bottom: var(--spacing-xs);
`;

const ImageWrap = styled.div`
  position: relative;
  width: 100%;
  flex: 0 0 auto;
  /* Malo više prostora za grafiku nego 4/5 */
  aspect-ratio: 3 / 4;
  background: var(--bg-300);
  overflow: hidden;
  line-height: 0;
  padding: ${IMAGE_PAD_V} ${IMAGE_PAD_H};
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 767px) {
    /* Manje „gutanja“ slike — veći prikaz */
    padding: 1px 2px;
    /* Viši blok slike nego ranije → grafika deluje veća */
    aspect-ratio: 3 / 4.45;
  }
`;

const CardImage = styled.img`
  display: block;
  max-width: 92%;
  max-height: 100%;
  width: auto;
  height: auto;
  margin: 0 auto;
  object-fit: contain;
  object-position: center;
  border-radius: ${IMG_RADIUS};

  @media (max-width: 767px) {
    max-width: 100%;
    width: 100%;
    max-height: none;
    min-height: 0;
  }
`;

const TextBlock = styled.div`
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: var(--spacing-xs) var(--spacing-md) var(--spacing-xxs);
  gap: var(--spacing-xxs);
  min-height: 0;
`;

const Brand = styled.h3`
  margin: 0;
  font-family: var(--font-family);
  font-size: clamp(0.9375rem, 2.2vw, 1.0625rem);
  font-weight: 700;
  color: var(--text-100);
  line-height: 1.2;
`;

const PriceLine = styled.p`
  margin: 0;
  font-family: var(--font-family);
  font-size: 0.8125rem;
  font-weight: 400;
  color: var(--text-200);
  line-height: 1.35;
`;

const buyLinkStyles = `
  display: flex;
  align-items: center;
  justify-content: center;
  align-self: center;
  width: 88%;
  max-width: 100%;
  margin: 0;
  margin-top: var(--spacing-xxs);
  padding: 6px var(--spacing-md);
  box-sizing: border-box;
  background: var(--primary-100);
  color: var(--bg-100) !important;
  font-family: var(--font-family);
  font-size: 0.75rem;
  font-weight: 600;
  text-decoration: none;
  border: 0;
  border-radius: 4px;
  transition: background var(--transition-fast);

  &:hover {
    background: var(--primary-200);
    color: var(--bg-100) !important;
  }

  &:focus-visible {
    outline: 2px solid var(--primary-100);
    outline-offset: -2px;
  }
`;

const BuyLink = styled.a`
  ${buyLinkStyles}
`;

const BuyRouterLink = styled(Link)`
  ${buyLinkStyles}
`;

const CardImageLink = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-height: 0;
  text-decoration: none;
  color: inherit;

  &:focus-visible {
    outline: 2px solid var(--primary-100);
    outline-offset: -2px;
    border-radius: ${IMG_RADIUS};
  }
`;

/**
 * @typedef {{ key?: string, imageSrc: string, imageAlt: string, brand: string, priceLabel: string, href: string }} PromoCardItem
 */

/**
 * Mreža promotivnih kartica (ne proizvodnih listinga).
 * @param {{ items: PromoCardItem[], className?: string, children?: React.ReactNode }} props
 */
function isInternalShopPath(href) {
  return typeof href === "string" && href.startsWith("/") && href !== "#";
}

const HomePromoCardGrid = ({ items, className, children }) => {
  const { t } = useTranslation();
  const buyLabel = t("HOME.BUY_HERE");

  if (!items?.length) return null;

  return (
    <Section
      className={className}
      aria-label={t("HOME.PROMO_CARDS_LABEL")}
    >
      {children}
      <Grid>
        {items.map((item, i) => {
          const internal = isInternalShopPath(item.href);
          return (
            <Card key={item.key ?? i}>
              <ImageWrap>
                {internal ? (
                  <CardImageLink
                    to={item.href}
                    aria-label={`${item.brand} — ${buyLabel}`}
                  >
                    <CardImage
                      src={item.imageSrc}
                      alt=""
                      loading={i < 2 ? "eager" : "lazy"}
                    />
                  </CardImageLink>
                ) : (
                  <CardImage
                    src={item.imageSrc}
                    alt={item.imageAlt}
                    loading={i < 2 ? "eager" : "lazy"}
                  />
                )}
              </ImageWrap>
              <TextBlock>
                <Brand>{item.brand}</Brand>
                <PriceLine>{item.priceLabel}</PriceLine>
              </TextBlock>
              {internal ? (
                <BuyRouterLink to={item.href}>{buyLabel}</BuyRouterLink>
              ) : (
                <BuyLink href={item.href}>{buyLabel}</BuyLink>
              )}
            </Card>
          );
        })}
      </Grid>
    </Section>
  );
};

export default HomePromoCardGrid;
