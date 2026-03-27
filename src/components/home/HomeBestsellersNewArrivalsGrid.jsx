import React, { useContext, useEffect, useMemo, useState } from "react";
import styled, { css } from "styled-components";
import { useTranslation } from "react-i18next";
import { ProductContext } from "../../context/ProductContext";
import ProductCard from "../product/ProductCard";

/** Koliko kartica prikazati po breakpointu. */
const LIMIT_PHONE = 6;
const LIMIT_TABLET = 6;
const LIMIT_DESKTOP = 10;

function resolvePickLimit() {
  if (typeof window === "undefined") return LIMIT_DESKTOP;
  const w = window.innerWidth;
  if (w < 768) return LIMIT_PHONE;
  if (w < 1024) return LIMIT_TABLET;
  return LIMIT_DESKTOP;
}

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

const TabBarWrap = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: var(--spacing-md);
`;

const SectionTitle = styled.h2`
  margin: 0 0 var(--spacing-md);
  padding: 0 var(--spacing-xs);
  font-family: "Montserrat", var(--font-family);
  font-size: clamp(1.125rem, 2.2vw, 1.35rem);
  font-weight: 700;
  color: var(--text-100);
  line-height: 1.25;
  text-align: center;

  @media (max-width: 767px) {
    font-size: clamp(1rem, 4.2vw, 1.125rem);
    margin-bottom: var(--spacing-sm);
  }
`;

const TabBar = styled.div`
  display: flex;
  width: 100%;
  max-width: 320px;
  flex-shrink: 0;
  border-radius: 0;
  overflow: hidden;
  box-shadow: var(--shadow-small);
  border: 1px solid rgba(0, 32, 105, 0.1);
`;

const Tab = styled.button`
  flex: 1 1 0;
  min-width: 0;
  min-height: 42px;
  padding: 10px 14px;
  box-sizing: border-box;
  font-family: "Montserrat", var(--font-family);
  font-size: 0.875rem;
  line-height: 1.2;
  cursor: pointer;
  border: none;
  border-radius: 0;
  transition: background 0.2s ease, color 0.2s ease, font-weight 0.15s ease;
  border-right: 1px solid rgba(0, 32, 105, 0.1);

  &:last-child {
    border-right: none;
  }

  &:focus-visible {
    outline: 2px solid var(--primary-100);
    outline-offset: 2px;
    z-index: 1;
  }

  ${(p) =>
    p.$active
      ? css`
          background: var(--primary-100);
          color: var(--bg-100);
          font-weight: 700;
        `
      : css`
          background: var(--bg-200);
          color: var(--text-100);
          font-weight: 400;
        `}
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--spacing-xxs);
  align-items: stretch;

  @media (min-width: 768px) {
    gap: var(--spacing-md);
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: var(--spacing-md);
  }
`;

const Cell = styled.div`
  display: flex;
  justify-content: center;
  align-items: stretch;
  min-width: 0;
  overflow: visible;
`;

const StatusMessage = styled.p`
  margin: 0;
  padding: var(--spacing-lg) 0;
  text-align: center;
  font-family: var(--font-family);
  font-size: 0.9375rem;
  color: var(--text-200);
`;

/**
 * Tab prebacivanje Best sellers / New arrivals — broj kartica zavisi od širine ekrana.
 */
const HomeBestsellersNewArrivalsGrid = () => {
  const { t } = useTranslation();
  const {
    bestSellers,
    newArrivals,
    loadBestSellersBackend,
    loadNewArrivalsBackend,
  } = useContext(ProductContext);

  const [tab, setTab] = useState("bestsellers");
  const [loading, setLoading] = useState(true);
  const [pickLimit, setPickLimit] = useState(resolvePickLimit);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        await Promise.all([
          loadBestSellersBackend(),
          loadNewArrivalsBackend(),
        ]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // Kontekst funkcije nisu memoizovane u Provideru
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const sync = () => setPickLimit(resolvePickLimit());
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  const bestList = useMemo(
    () => bestSellers.slice(0, pickLimit),
    [bestSellers, pickLimit]
  );
  const newList = useMemo(
    () => newArrivals.slice(0, pickLimit),
    [newArrivals, pickLimit]
  );

  const activeList = tab === "bestsellers" ? bestList : newList;

  const activeTitle =
    tab === "bestsellers"
      ? t("HOME.CATEGORY_NAV.BESTSELLERS")
      : t("HOME.CATEGORY_NAV.NEW_ARRIVALS");

  return (
    <Section aria-labelledby="home-pick-active-title">
      <TabBarWrap>
        <TabBar role="tablist" aria-label={t("HOME.HOME_PICK_GRID.TABLIST_LABEL")}>
          <Tab
            type="button"
            role="tab"
            id="home-pick-tab-bestsellers"
            aria-selected={tab === "bestsellers"}
            aria-controls="home-pick-grid-panel"
            $active={tab === "bestsellers"}
            onClick={() => setTab("bestsellers")}
          >
            {t("HOME.CATEGORY_NAV.BESTSELLERS")}
          </Tab>
          <Tab
            type="button"
            role="tab"
            id="home-pick-tab-new"
            aria-selected={tab === "new_arrivals"}
            aria-controls="home-pick-grid-panel"
            $active={tab === "new_arrivals"}
            onClick={() => setTab("new_arrivals")}
          >
            {t("HOME.CATEGORY_NAV.NEW_ARRIVALS")}
          </Tab>
        </TabBar>
      </TabBarWrap>

      <SectionTitle id="home-pick-active-title">{activeTitle}</SectionTitle>

      <div
        role="tabpanel"
        id="home-pick-grid-panel"
        aria-labelledby="home-pick-active-title"
      >
        {loading ? (
          <StatusMessage>{t("HOME.HOME_PICK_GRID.LOADING")}</StatusMessage>
        ) : activeList.length === 0 ? (
          <StatusMessage>{t("HOME.HOME_PICK_GRID.EMPTY")}</StatusMessage>
        ) : (
          <Grid>
            {activeList.map((product) => (
              <Cell key={product.id ?? product.slug}>
                <ProductCard product={product} />
              </Cell>
            ))}
          </Grid>
        )}
      </div>
    </Section>
  );
};

export default HomeBestsellersNewArrivalsGrid;
