import React from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import ProductCard from "../product/ProductCard";
import { homeFeaturedProductsMock } from "./homeFeaturedProductsMock";

const Section = styled.section`
  box-sizing: border-box;
  width: 100%;
  max-width: var(--max-width-container);
  margin: 0 auto;
  padding: var(--spacing-lg) var(--spacing-xs) var(--spacing-xl);

  @media (min-width: 768px) {
    padding-left: var(--spacing-md);
    padding-right: var(--spacing-md);
  }
`;

const Heading = styled.h2`
  margin: 0 0 var(--spacing-lg);
  font-family: var(--font-family);
  font-size: clamp(1.125rem, 2.2vw, 1.35rem);
  font-weight: 700;
  color: var(--text-100);
  line-height: 1.25;

  @media (max-width: 767px) {
    font-size: clamp(1rem, 4.2vw, 1.125rem);
    margin-bottom: var(--spacing-md);
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--spacing-xxs);
  align-items: stretch;

  @media (min-width: 768px) {
    gap: var(--spacing-md);
  }

  @media (min-width: 1025px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: var(--spacing-lg);
  }
`;

const Cell = styled.div`
  display: flex;
  justify-content: center;
  align-items: stretch;
  min-width: 0;
  overflow: visible;
`;

/**
 * Istaknuti proizvodi na početnoj — koristi postojeći ProductCard.
 * @param {{ products?: typeof homeFeaturedProductsMock }} props
 */
const HomeFeaturedProducts = ({ products = homeFeaturedProductsMock }) => {
  const { t } = useTranslation();
  const list = products?.length ? products : homeFeaturedProductsMock;

  return (
    <Section aria-labelledby="home-featured-products-heading">
      <Heading id="home-featured-products-heading">
        {t("HOME.FEATURED_PRODUCTS_TITLE")}
      </Heading>
      <Grid>
        {list.map((product) => (
          <Cell key={product.id}>
            <ProductCard product={product} />
          </Cell>
        ))}
      </Grid>
    </Section>
  );
};

export default HomeFeaturedProducts;
