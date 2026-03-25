import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Section = styled.section`
  box-sizing: border-box;
  width: 100%;
  max-width: var(--max-width-container);
  margin: 0 auto;
  padding: var(--spacing-lg) var(--spacing-md) var(--spacing-xl);
`;

const Title = styled.h2`
  font-family: var(--font-family);
  font-size: clamp(1.125rem, 2.5vw, 1.375rem);
  font-weight: 600;
  color: var(--text-100);
  line-height: 1.3;
  margin: 0 0 var(--spacing-md);
  text-align: left;

  @media (max-width: 767px) {
    font-size: clamp(1rem, 4.2vw, 1.125rem);
  }
`;

const DESKTOP = "(min-width: 768px)";

const Track = styled.ul`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  column-gap: clamp(0.25rem, 1.5vw, 0.5rem);
  row-gap: var(--spacing-md);
  align-items: start;
  list-style: none;
  margin: 0;
  padding: 0;

  @media ${DESKTOP} {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: flex-start;
    gap: var(--spacing-lg) var(--spacing-xl);
  }
`;

const ItemRoot = styled.li`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 0;
  width: 100%;
  box-sizing: border-box;
  container-type: inline-size;

  @media ${DESKTOP} {
    flex: 0 1 auto;
    width: auto;
    min-width: ${({ $wide }) => ($wide ? "5rem" : "4.5rem")};
    max-width: ${({ $wide }) => ($wide ? "9.5rem" : "6.5rem")};
  }
`;

const IconBox = styled.div`
  width: 90%;
  aspect-ratio: 1;
  height: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  @media ${DESKTOP} {
    width: 3.75rem;
    height: 3.75rem;
    aspect-ratio: unset;
  }

  @media (min-width: 1025px) {
    width: 4.25rem;
    height: 4.25rem;
  }

  img {
    display: block;
    max-width: 100%;
    max-height: 100%;
    width: auto;
    height: auto;
    object-fit: contain;
  }
`;

const Label = styled.span`
  font-family: "Montserrat", var(--font-family);
  font-size: 0.6875rem;
  font-size: clamp(0.6875rem, 14.5cqi, 0.875rem);
  font-weight: 600;
  color: var(--text-100);
  line-height: 1.2;
  text-align: center;
  width: 100%;
  box-sizing: border-box;
  hyphens: auto;
  overflow-wrap: break-word;

  @media ${DESKTOP} {
    font-size: 0.8125rem;
    line-height: 1.25;
  }
`;

const ItemStack = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.35rem;
  gap: clamp(0.25rem, 4cqi, 0.5rem);
  width: 100%;

  @media ${DESKTOP} {
    gap: var(--spacing-sm);
  }
`;

const StyledLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.35rem;
  gap: clamp(0.25rem, 4cqi, 0.5rem);
  width: 100%;
  transition: opacity var(--transition-fast);

  @media ${DESKTOP} {
    gap: var(--spacing-sm);
  }

  &:hover {
    opacity: 0.82;
  }

  &:focus-visible {
    outline: 2px solid var(--primary-100);
    outline-offset: 4px;
    border-radius: 4px;
  }
`;

/**
 * @typedef {{ key: string, iconSrc: string, label?: string, labelKey?: string, href?: string }} BrandLogoItem
 */

function itemLabel(item, t) {
  if (item.labelKey) return t(item.labelKey);
  return item.label ?? "";
}

/**
 * @param {{
 *   items: BrandLogoItem[],
 *   className?: string,
 *   titleI18nKey?: string,
 *   headingId?: string,
 *   wideItems?: boolean,
 * }} props
 */
const HomeBrandLogoStrip = ({
  items,
  className,
  titleI18nKey = "HOME.SHOP_BY_BRAND",
  headingId = "home-shop-by-brand-heading",
  wideItems = false,
}) => {
  const { t } = useTranslation();

  if (!items?.length) return null;

  return (
    <Section className={className} aria-labelledby={headingId}>
      <Title id={headingId}>{t(titleI18nKey)}</Title>
      <Track>
        {items.map((item) => {
          const label = itemLabel(item, t);
          return (
            <ItemRoot key={item.key} $wide={wideItems}>
              {item.href ? (
                <StyledLink to={item.href}>
                  <IconBox>
                    <img src={item.iconSrc} alt="" />
                  </IconBox>
                  <Label>{label}</Label>
                </StyledLink>
              ) : (
                <ItemStack>
                  <IconBox>
                    <img src={item.iconSrc} alt="" />
                  </IconBox>
                  <Label>{label}</Label>
                </ItemStack>
              )}
            </ItemRoot>
          );
        })}
      </Track>
    </Section>
  );
};

export default HomeBrandLogoStrip;
