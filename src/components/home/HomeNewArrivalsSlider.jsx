import React, { useContext, useEffect } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { ProductContext } from "../../context/ProductContext";
import ProductCardSlider from "../product/ProductCardSlider";

const Section = styled.section`
  box-sizing: border-box;
  width: 100%;
  max-width: var(--max-width-container);
  margin: 0 auto;
  padding: var(--spacing-md) var(--spacing-md) var(--spacing-lg);
`;

const Title = styled.h2`
  margin: 0 0 var(--spacing-sm);
  font-family: var(--font-family);
  font-size: clamp(1.125rem, 2.2vw, 1.35rem);
  font-weight: 700;
  color: var(--text-100);
  line-height: 1.25;

  @media (max-width: 767px) {
    font-size: clamp(1rem, 4.2vw, 1.125rem);
  }
`;

const Desc = styled.p`
  margin: 0 0 var(--spacing-lg);
  max-width: 52rem;
  font-family: var(--font-family);
  font-size: 0.9375rem;
  font-weight: 400;
  line-height: 1.5;
  color: var(--text-200);

  @media (max-width: 767px) {
    font-size: 0.875rem;
    margin-bottom: var(--spacing-md);
  }
`;

const TopBrands = styled.strong`
  font-weight: 700;
  color: #0a0a0a;
`;

/**
 * Učitava new arrivals preko {@link ProductContext} i prikazuje {@link ProductCardSlider}.
 */
const HomeNewArrivalsSlider = () => {
  const { t } = useTranslation();
  const { newArrivals, loadNewArrivalsBackend } = useContext(ProductContext);

  useEffect(() => {
    loadNewArrivalsBackend();
    // loadNewArrivalsBackend nije memoizovan u Provideru — jednokratno učitavanje na mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
    
  }, []);
console.log(newArrivals);
  return (
    <Section aria-labelledby="home-new-arrivals-slider-heading">
      <Title id="home-new-arrivals-slider-heading">
        {t("DESCRIPTION.NEW_ARRIVALS.TITLE")}
      </Title>
      <Desc>
        {t("HOME.NEW_ARRIVALS_SLIDER.DESC_BEFORE")}
        <TopBrands>{t("HOME.NEW_ARRIVALS_SLIDER.TOP_BRANDS")}</TopBrands>
        {t("HOME.NEW_ARRIVALS_SLIDER.DESC_AFTER")}
      </Desc>
      <ProductCardSlider products={newArrivals} />
    </Section>
  );
};

export default HomeNewArrivalsSlider;
