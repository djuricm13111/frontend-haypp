import { useContext, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { ProductContext } from "../../context/ProductContext";
import { cartActions } from "../../store/cart-slice";
import { calculatePrice } from "../../utils/discount";
import ImageSlider from "../../components/product/ImageSlider";
import AddToCartAnim from "../../components/animations/AddToCartAnim";
import { useTranslation } from "react-i18next";
import Breadcrumbs from "../../components/section/BreadCrumbs";
import ProductDetails from "../../components/section/ProductDetails";
import ProductCardSlider from "../../components/product/ProductCardSlider";
import descriptions from "../../descriptions.json";

/** Haypp PDP referenca — plava i selekcije */
const PDP_BLUE = "#001a57";
const PDP_ROW_SELECTED = "#f2f2f2";
const PDP_LINE = "#e8e8e8";
const PDP_CARD_BORDER = "#e5e5e5";

const Container = styled.main`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-direction: column;
  background-color: var(--bg-100);
  /* Header je već u dokumentnom toku iznad <main> — bez duplog padding-top */
  padding-top: 0;
  min-height: 90vh;
  @media (max-width: 767px) {
    padding-bottom: calc(88px + env(safe-area-inset-bottom, 0px));
    overflow-x: hidden;
    width: 100%;
    box-sizing: border-box;
  }
`;

/** Odvojena traka ispod headera: fiksna visina kao jedan bar, breadcrumb vertikalno centriran */
const BreadcrumbStrip = styled.div`
  align-self: stretch;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  min-height: 52px;
  padding: 0 3%;
  margin-bottom: 70px;
  border-bottom: 1px solid var(--bg-300);
  background: var(--bg-100);

  @media (min-width: 768px) {
    min-height: 60px;
  }
`;

const BreadcrumbStripInner = styled.div`
  width: 100%;
  max-width: var(--max-width-container);
  display: flex;
  align-items: center;
  justify-content: center;
`;

/* ~96% preostalog viewporta; oduzima približno breadcrumb traku + margin */
const productRowMinHeightDesktop = `calc(
  (100vh - var(--navbar-height-desktop) - var(--navbar-mini) - 84px) * 0.96
)`;

/**
 * Mobilni redosled dece u DOM-u: naslov → slika → CTA → ukus → pack.
 * Desktop (grid): levo [naslov, ukus+pack, spacer, CTA], desno slika kroz sve redove.
 */
const ProductLayout = styled.div`
  padding-bottom: var(--spacing-xxl);
  width: 94%;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);

  @media (max-width: 767px) {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    padding-left: 3%;
    padding-right: 3%;
    box-sizing: border-box;
  }

  @media (min-width: 768px) {
    width: 100%;
    max-width: var(--max-width-container);
    display: grid;
    grid-template-columns: minmax(0, 1.05fr) minmax(0, 1.12fr);
    grid-template-rows: auto auto auto;
    column-gap: var(--spacing-xl);
    row-gap: var(--spacing-lg);
    align-items: start;
  }

  @media (min-width: 768px) and (max-width: 1024px) {
    min-height: auto;
  }

  @media (min-width: 1025px) {
    grid-template-rows: auto auto minmax(0, 1fr) auto;
    min-height: ${productRowMinHeightDesktop};
    align-items: stretch;
  }
`;

const PurchaseTopBlock = styled.div`
  width: 100%;
  min-width: 0;
  @media (min-width: 768px) {
    grid-column: 1;
    grid-row: 1;
  }
`;

const PurchaseMidBlock = styled.div`
  width: 100%;
  min-width: 0;
  @media (max-width: 767px) {
    scroll-margin-top: 12px;
    scroll-margin-bottom: 100px;
  }
  @media (min-width: 768px) {
    grid-column: 1;
    grid-row: 2;
  }
`;

/** Rasteže levi stub pre CTA — samo ≥1025px (grid red 3). */
const PurchaseColumnSpacer = styled.div`
  display: none;
  @media (min-width: 1025px) {
    display: block;
    grid-column: 1;
    grid-row: 3;
    min-height: 0;
    width: 100%;
    flex: 1 1 0;
  }
`;

const MediaColumn = styled.div`
  width: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  @media (max-width: 767px) {
    max-width: 100%;
  }
  @media (min-width: 768px) {
    grid-column: 2;
    grid-row: 1 / -1;
    align-self: stretch;
    min-height: 0;
    max-width: 560px;
  }
`;

const ProductImageCard = styled.div`
  position: relative;
  background-color: var(--bg-100);
  border: 1px solid var(--bg-300);
  border-radius: var(--border-radius-large);
  box-shadow: var(--shadow-medium);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  min-width: 0;
  height: 100%;

  @media (max-width: 767px) {
    max-width: 100%;
    overflow-x: hidden;
  }

  @media (min-width: 768px) and (max-width: 1024px) {
    flex: 0 1 auto;
    height: auto;
    width: 100%;
  }
`;

const SliderGrow = styled.div`
  flex: 1;
  min-height: 260px;
  display: flex;
  flex-direction: column;
  min-width: 0;

  @media (min-width: 768px) and (max-width: 1024px) {
    flex: 0 1 auto;
    min-height: 200px;
    max-height: min(48vh, 420px);
  }
`;

const OfferBadge = styled.span`
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 3;
  padding: 6px 14px;
  font-size: var(--font-size-small);
  font-weight: 600;
  color: var(--bg-100);
  background-color: var(--primary-100);
  border-radius: 999px;
`;

const pdpHeadingFont = `"Montserrat", var(--font-family)`;
const pdpBodyFont = `"Montserrat", var(--font-family)`;

const ProductTitle = styled.h1`
  margin: 0 0 var(--spacing-md);
  font-family: "Oswald-Medium";
  font-size: clamp(1.1rem, 2vw, 1.45rem);
  font-weight: 600;
  color: var(--text-100);
  line-height: 1.22;
  letter-spacing: -0.03em;
  @media (min-width: 768px) {
    font-size: clamp(1.2rem, 1.75vw, 1.65rem);
  }
`;

const StockRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: var(--spacing-lg);
`;

const StockLabel = styled.span`
  margin: 0;
  font-family: ${pdpBodyFont};
  font-size: 0.8125rem;
  font-weight: 500;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--text-200);
`;

const IntroBlock = styled.div`
  margin-bottom: 40px;

  @media (min-width: 768px) and (max-width: 1024px) {
    margin-bottom: var(--spacing-lg);
  }
`;

const ReadMoreLink = styled.a`
  display: inline-block;
  margin-top: 12px;
  font-family: ${pdpBodyFont};
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--text-100);
  &:hover {
    text-decoration: underline;
  }
`;
const FlavourBlock = styled.div`
  margin-bottom: 48px;

  @media (min-width: 768px) and (max-width: 1024px) {
    margin-bottom: var(--spacing-lg);
  }
`;

/** Ceo okvir je jedan klik (kasnije: side menu za izbor ukusa) */
const FlavourCardButton = styled.button`
  background: var(--bg-100);
  border: 1px solid ${PDP_CARD_BORDER};
  border-radius: var(--border-radius-small);
  box-shadow: var(--shadow-medium);
  padding: 10px 8px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0;
  text-align: left;
  cursor: pointer;
  font: inherit;
  color: inherit;
  transition: background-color 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    background-color: var(--bg-200);
    box-shadow: var(--shadow-large);
  }

  &:focus-visible {
    outline: 2px solid ${PDP_BLUE};
    outline-offset: 2px;
  }
`;

const FlavourLabelSmall = styled.span`
  display: block;
  font-size: 0.625rem;
  font-weight: 500;
  color: var(--text-200);
  margin: 0;
  line-height: 1.15;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const FlavourCardRow = styled.span`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  width: 100%;
  min-width: 0;
`;

const FlavourValue = styled.span`
  font-size: var(--font-size-small);
  font-weight: 700;
  color: var(--text-100);
  line-height: 1.2;
`;

const FlavourChevronCircle = styled.span`
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background-color: ${PDP_BLUE};
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--bg-100);

  svg {
    width: 12px;
    height: 12px;
  }
`;

const PackList = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 40px;
  border: 1px solid ${PDP_CARD_BORDER};
  border-radius: var(--border-radius-base);
  overflow: hidden;
  background: var(--bg-100);
`;

const PackRow = styled.button`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr auto;
  align-items: center;
  column-gap: 10px;
  row-gap: 4px;
  width: 100%;
  padding: 9px 12px;
  margin: 0;
  border: none;
  border-radius: 0;
  background-color: ${({ $active }) =>
    $active ? PDP_ROW_SELECTED : "var(--bg-100)"};
  cursor: pointer;
  text-align: left;
  transition: background-color 0.15s ease;

  &:hover {
    background-color: ${({ $active }) =>
      $active ? PDP_ROW_SELECTED : "var(--bg-200)"};
  }
`;

/** Kolona 1/4: pakovanje */
const PackColPack = styled.div`
  min-width: 0;
  justify-self: start;
  text-align: left;
`;

/** Kolona 2/4: ukupna cena */
const PackColTotal = styled.div`
  min-width: 0;
  justify-self: end;
  text-align: right;
`;

/** Kolona 3/4: per unit */
const PackColUnit = styled.div`
  min-width: 0;
  justify-self: end;
  text-align: right;
`;

const PackLabelText = styled.span`
  font-weight: ${({ $active }) => ($active ? 700 : 500)};
    color: var(--text-100);
  font-size: var(--font-size-small);
`;

const PackTotal = styled.span`
  font-weight: 700;
  font-size: var(--font-size-base);
  color: var(--text-100);
`;

const PackUnit = styled.span`
  font-size: 0.7rem;
  color: var(--text-200);
  white-space: nowrap;
`;

const PackIndicator = styled.span`
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid ${({ $active }) => ($active ? PDP_BLUE : PDP_LINE)};
  background-color: ${({ $active }) => ($active ? PDP_BLUE : "transparent")};
  color: var(--bg-100);

  svg {
    width: 10px;
    height: 10px;
  }
`;

const CtaRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: stretch;
  gap: 15px;
  margin-bottom: var(--spacing-xl);
  flex-shrink: 0;
  @media (max-width: 767px) {
    margin-bottom: var(--spacing-md);
  gap: 10px;
  }
  @media (min-width: 768px) {
    grid-column: 1;
    grid-row: 3;
    margin-top: 0;
    margin-bottom: 0;
  }
  @media (min-width: 1025px) {
    grid-row: 4;
  }
`;

const BtnSubscribe = styled.button`
  flex: 1;
  min-width: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 15px 12px;
  font-size: var(--font-size-base);
  font-weight: 600;
  color: ${PDP_BLUE};
  background: var(--bg-100);
  border: 2px solid ${PDP_BLUE};
  border-radius: var(--border-radius-base);
  cursor: pointer;
  transition: background-color 0.2s ease, opacity 0.2s ease;
  &:hover {
    background: rgba(0, 26, 87, 0.06);
  }
  @media (max-width: 767px) {
    gap: 6px;
    padding: 10px 10px;
    font-size: 0.8125rem;
    border-width: 1.5px;
    svg {
      width: 18px;
      height: 18px;
    }
  }
`;

const BtnAddCart = styled.button`
  position: relative;
  width: 100%;
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 15px 12px;
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--bg-100);
  background: ${PDP_BLUE};
  border: 2px solid ${PDP_BLUE};
  border-radius: var(--border-radius-base);
  cursor: pointer;
  transition: opacity 0.2s ease, filter 0.2s ease;
  &:hover:not(:disabled) {
    filter: brightness(1.08);
  }
  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

/** Add to cart samo u fiksnoj donjoj traci na telefonu */
const BtnAddCartSticky = styled(BtnAddCart)`
  flex: 1 1 auto;
  width: 100%;
  min-width: 0;
  padding: 11px 8px;
  font-size: 0.8125rem;
  gap: 6px;
  border-width: 1.5px;
  border-radius: 0;
  box-shadow: 0 4px 14px rgba(0, 26, 87, 0.28), 0 2px 6px rgba(0, 0, 0, 0.08);
  svg {
    width: 18px;
    height: 18px;
  }
`;

const SpecsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0;
  align-items: stretch;
  padding: var(--spacing-md) var(--spacing-md);
  border-top: 1px solid var(--bg-300);
  background: var(--bg-100);
  flex-shrink: 0;

  @media (max-width: 767px) {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    overflow: hidden;
    padding: var(--spacing-sm) 4px var(--spacing-md);
    column-gap: 0;
    align-items: stretch;
  }
`;

const MobileStickyBar = styled.div`
  display: none;
  @media (max-width: 767px) {
    display: flex;
    flex-direction: row;
    align-items: stretch;
    gap: 0;
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    /* Ispod Header (9) i ProductCard izbora količine (7–8 u index.css) — korpa/login/drawer iznad */
    z-index: 6;
    padding: 0 14px calc(14px + env(safe-area-inset-bottom, 0px));
    background: transparent;
    border-top: none;
    box-sizing: border-box;
    pointer-events: none;
    & > * {
      pointer-events: auto;
    }
  }
`;

const StickyPriceButton = styled.button`
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 10px 10px;
  margin: 0;
  border: none;
  border-radius: 0;
  background: var(--bg-100);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.14), 0 2px 6px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  text-align: center;
  width: 100%;
  -webkit-tap-highlight-color: transparent;
  &:active {
    opacity: 0.9;
  }
`;

const StickyPriceLine = styled.span`
  font-size: 1.0625rem;
  font-weight: 800;
  color: var(--text-100);
  font-family: ${pdpBodyFont};
  line-height: 1.15;
`;

const StickyQtyLine = styled.span`
  font-size: 0.625rem;
  font-weight: 500;
  color: var(--text-200);
  text-transform: uppercase;
  letter-spacing: 0.03em;
  font-family: ${pdpBodyFont};
  line-height: 1.2;
  text-align: center;
  width: 100%;
`;

/** Ikonica levo; desno dva reda: 1/2 naslov, 2/2 vrednost */
const SpecItem = styled.div`
  display: flex;
  flex-direction: row;
  align-items: stretch;
  gap: 10px;
  min-width: 0;
  padding: 0 6px;
  &:not(:last-child) {
    border-right: 1px solid var(--bg-300);
  }
`;

/** Trust red: sadržaj kolone centriran; uža razmaci ikona–tekst i label–value */
const TrustSpecItem = styled(SpecItem)`
  justify-content: center;
  gap: 6px;
  align-items: flex-start;
`;

const SpecIconWrap = styled.div`
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  align-self: center;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-100);
  svg {
    width: 26px;
    height: 26px;
  }
`;

const SpecTextCol = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex: 1;
  min-width: 0;
  min-height: 48px;
  text-align: left;
  @media (max-width: 767px) {
    min-height: 0;
    justify-content: center;
    gap: 1px;
  }
`;

const SpecLabel = styled.span`
  font-size: 0.65rem;
  color: var(--text-200);
  text-transform: uppercase;
  letter-spacing: 0.02em;
  line-height: 1.25;
  flex: 1 1 0;
  display: flex;
  align-items: flex-end;
`;

const SpecValue = styled.span`
  font-size: var(--font-size-small);
  font-weight: 600;
  color: var(--text-100);
  line-height: 1.25;
  flex: 1 1 0;
  display: flex;
  align-items: flex-start;
`;

/** Ispod slike na telefonu: ikona iznad teksta (centrirano) */
const PdpSpecItem = styled(SpecItem)`
  @media (max-width: 767px) {
  flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding: 6px 4px;
  gap: 8px;
    ${SpecIconWrap} {
      align-self: center;
      width: 36px;
      height: 36px;
      svg {
        width: 24px;
        height: 24px;
      }
    }
    ${SpecTextCol} {
      width: 100%;
      align-items: center;
      text-align: center;
      min-height: 0;
      justify-content: flex-start;
      gap: 4px;
    }
    ${SpecLabel} {
      flex: 0 0 auto;
      align-items: center;
      justify-content: center;
      font-size: 0.625rem;
      letter-spacing: 0.04em;
      text-align: center;
    }
    ${SpecValue} {
      flex: 0 0 auto;
      align-items: center;
      justify-content: center;
      font-size: 0.8125rem;
      text-align: center;
      word-break: break-word;
    }
  }
`;

const TrustSpecTextCol = styled(SpecTextCol)`
  justify-content: flex-start;
  gap: 4px;
  min-height: 0;
  text-align: center;
  align-items: center;
  & > * {
    flex: 0 0 auto;
    justify-content: center;
    align-items: center;
  }
`;

/** Trust red ispod opisa: bez kartice; centriran */
const TrustRowWrap = styled.div`
  width: 100%;
  margin-top: var(--spacing-xl);
  display: flex;
  justify-content: center;
`;

const TrustIconWrap = styled(SpecIconWrap)`
  width: 30px;
  height: 30px;
  align-self: flex-start;
  svg {
    width: 22px;
    height: 22px;
  }
`;

const TrustSpecsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0;
  align-items: start;
  width: 100%;
  max-width: 720px;
  padding: var(--spacing-md) var(--spacing-sm);
  background: transparent;
  box-sizing: border-box;
`;

const AgeWarningWrap = styled.div`
  width: 100%;
  margin-top: var(--spacing-xl);
  display: flex;
  justify-content: center;
  padding: 0 var(--spacing-sm);
`;

const AgeWarningInner = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: clamp(14px, 2.5vw, 22px);
  max-width: min(100%, 420px);
  width: 100%;
`;

const AgeWarningIconColumn = styled.div`
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--text-100);
`;

/** Štit + „18+“ preko HTML-a (čitljiviji font od SVG text-a) */
const AgeShieldFrame = styled.div`
  position: relative;
  width: 42px;
  height: 42px;
  flex-shrink: 0;
`;

const AgeShieldOutline = styled.svg`
  width: 100%;
  height: 100%;
  display: block;
  color: var(--text-100);
`;

const AgeIconNumber = styled.span`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -52%);
  font-size: 0.6875rem;
  font-weight: 700;
  font-family: "Oswald-Medium", ${pdpBodyFont};
  letter-spacing: 0.02em;
  color: var(--text-100);
  line-height: 1;
  pointer-events: none;
`;

const AgeVerifyMark = styled.span`
  font-size: 0.5625rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  margin-top: 4px;
  color: var(--text-100);
  font-family: ${pdpBodyFont};
`;

const AgeWarningCopy = styled.div`
  flex: 0 1 auto;
  min-width: 0;
  max-width: 33ch;
`;

const AgeWarningTitle = styled.h2`
  margin: 0 0 5px;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-100);
  font-family: ${pdpBodyFont};
  line-height: 1.3;
  letter-spacing: -0.01em;
`;

const AgeWarningBody = styled.p`
  margin: 0;
  font-size: 0.75rem;
  font-weight: 400;
  color: var(--text-200);
  line-height: 1.5;
  font-family: ${pdpBodyFont};
`;

const RecommendedPdpSection = styled.section`
  width: 100%;
  margin-top: var(--spacing-xl);
  padding-top: var(--spacing-md);
`;

const RecommendedPdpTitle = styled.h2`
  margin: 0 0 var(--spacing-md);
  font-family: "Oswald-Medium", var(--font-family);
  font-size: clamp(1.05rem, 2vw, 1.25rem);
  font-weight: 600;
  color: var(--text-100);
  line-height: 1.25;
  letter-spacing: -0.02em;

  @media (max-width: 767px) {
    font-size: clamp(1rem, 4vw, 1.1rem);
  }
`;

const DetailsSection = styled.section`
  width: 94%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
  @media (min-width: 1025px) {
    width: var(--max-width-container);
  }
  margin-top: var(--spacing-xl);
`;

const ButtonWrapper = styled.div`
  position: relative;
  flex: 1;
  min-width: 0;
  display: flex;
  @media (max-width: 767px) {
    display: none;
  }
`;

const StickyCartButtonWrap = styled.div`
  position: relative;
  flex: 1 1 0;
  min-width: 0;
  display: flex;
`;

const DescText = styled.p`
  font-family: ${pdpBodyFont};
  font-weight: 400;
  color: var(--text-200);
  margin: 0;
  font-size: var(--font-size-base);
  line-height: 1.65;
  @media (min-width: 768px) {
    font-size: 1.0625rem;
    line-height: 1.7;
  }

  strong {
    font-weight: 600;
    color: var(--text-100);
  }
`;

const StatusDot = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 50px;
  background-color: ${({ status }) =>
    status === "in_stock"
      ? "var(--success-color)"
      : status === "on_request"
      ? "var(--warning-color)"
      : "var(--error-color)"};
`;

const PACK_QUANTITIES = [1, 5, 10, 20];

function formatStockLabel(status) {
  if (status == null || status === "") return "";
  const s = String(status);
  return s
    .split("_")
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

function strengthLabel(nicotine, t) {
  const n = Number(nicotine);
  if (Number.isNaN(n)) return "—";
  if (n < 6) return t("PRODUCT.STRENGTH.MILD");
  if (n > 14) return t("PRODUCT.STRENGTH.STRONG");
  return t("PRODUCT.STRENGTH.REGULAR");
}

const ProductMain = () => {
  const { t, i18n } = useTranslation();
  const { slug } = useParams();

  const [selectedQuantity, setSelectedQuantity] = useState(10);
  const dispatch = useDispatch();
  const {
    setIsCartOpen,

    loadProductBySlug,
    product,
    setProduct,
    currencyTag,
    loadRecommededProductsBySlug,
    recommendedProducts,
  } = useContext(ProductContext);
  const [discountedPrice, setDiscountedPrice] = useState(0);
  const [savingsPercentage, setSavingsPercentage] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [breadcrumbItems, setBreadcrumbItems] = useState([]);
  /** Slika u kartici puni visinu samo na širokom desktopu — na tabletu prirodna visina */
  const [fillImageSliderHeight, setFillImageSliderHeight] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1025px)");
    const sync = () => setFillImageSliderHeight(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!slug) {
      return;
    }
    setProduct(null);
    const fetchProduct = async () => {
      try {
        const productData = await loadProductBySlug(slug); // Pretpostavljamo da loadProductBySlug vraća podatke o proizvodu
        setProduct(productData);
        window.scrollTo(0, 0);
      } catch (error) {
        console.error("Failed to load product:", error);
        // Ovde možete postaviti neki state za grešku ako želite da obavestite korisnika
      }
    };

    fetchProduct();
    loadRecommededProductsBySlug(slug);
  }, [slug, i18n.language]);
  useEffect(() => {
    if (product) {
      const newDiscountedPrice = calculatePrice(
        product.price,
        selectedQuantity
      );
      setDiscountedPrice(newDiscountedPrice);

      const newSavingsPercentage = Math.round(
        ((product.price - newDiscountedPrice) / product.price) * 100
      );
      setSavingsPercentage(newSavingsPercentage);
      setBreadcrumbItems([
        { name: "SnusCo", url: "/" },
        { name: "Nicotine Pouches", url: `/${i18n.language}/snus-verkauf` },
        {
          name: `${product.name}`,
          url: "/",
        },
      ]);
    }
  }, [product, selectedQuantity]);

  const addToCart = (selectedQuantity) => {
    dispatch(
      cartActions.addToCart({
        product: product,
        quantity: selectedQuantity,
      })
    );
    setIsCartOpen(true);
    setIsAnimating(true);
  };

  const handleAnimationComplete = () => {
    setIsAnimating(false);
  };
  const getDiscountData = (quantity) => {
    const discountedPrice = calculatePrice(product.price, quantity);
    const savings = Math.round(
      ((product.price - discountedPrice) / product.price) * 100
    );
    return { discountedPrice, savings };
  };

  const [shortDesc, setShortDesc] = useState("");

  useEffect(() => {
    // Pronađi objekat za trenutni slug
    const item = descriptions.find((d) => d.slug === slug) ?? null;
    if (!item) {
      setShortDesc(t("loading"));
      return;
    }

    // Odredi jezik i ključ
    const lang = i18n.language.startsWith("sr")
      ? "sr"
      : i18n.language.startsWith("de")
      ? "de"
      : "en";
    const shortKey = `short_${lang}`;

    // Učitaj kratki opis
    setShortDesc(item[shortKey] || "");
  }, [slug, descriptions, i18n.language, t]);

  const recommendedSliderProducts = useMemo(() => {
    const raw = Array.isArray(recommendedProducts)
      ? recommendedProducts
      : recommendedProducts?.data ??
        recommendedProducts?.products ??
        recommendedProducts?.results ??
        [];
    if (!Array.isArray(raw) || raw.length === 0) return [];
    return raw
      .filter((p) => p && p.is_in_stock !== "out_of_stock")
      .slice(0, 12);
  }, [recommendedProducts]);

  const scrollToPackSelection = () => {
    const el = document.getElementById("product-pack-selection");
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const top = rect.top + window.scrollY;
    const targetY = top - window.innerHeight * 0.28;
    window.scrollTo({
      top: Math.max(0, targetY),
      behavior: "smooth",
    });
  };

  const stickyLineTotal = product
    ? (calculatePrice(product.price, selectedQuantity) * selectedQuantity).toFixed(2)
    : "0";
  const stickyPackLabel = product
    ? selectedQuantity === 1
      ? t("PRODUCT.DOSE", { defaultValue: "1-pack" })
      : t("PRODUCT.PACK", {
          quantity: selectedQuantity,
          defaultValue: `${selectedQuantity}-pack`,
        })
    : "";

  return (
    <Container>
      {product && (
        <>
          <BreadcrumbStrip>
            <BreadcrumbStripInner>
            <Breadcrumbs breadcrumbs={breadcrumbItems} />
            </BreadcrumbStripInner>
          </BreadcrumbStrip>

          <ProductLayout>
            <PurchaseTopBlock>
              <ProductTitle>{product.name}</ProductTitle>
              <StockRow>
                <StatusDot status={product.is_in_stock} />
                <StockLabel>{formatStockLabel(product.is_in_stock)}</StockLabel>
              </StockRow>

              <IntroBlock>
                <DescText>{shortDesc}</DescText>
                <ReadMoreLink href="#product-long-description">
                  {t("PRODUCT.READ_MORE", {
                    name: product.name,
                    defaultValue: `Read more about ${product.name}`,
                  })}
                </ReadMoreLink>
              </IntroBlock>
            </PurchaseTopBlock>

            <MediaColumn>
              <ProductImageCard>
                {savingsPercentage > 0 && (
                  <OfferBadge>{t("PRODUCT_CARD.OFFER")}</OfferBadge>
                )}
                <SliderGrow>
                  <ImageSlider
                    images={product.images}
                    layout="card"
                    fillHeight={fillImageSliderHeight}
                  />
                </SliderGrow>
                <SpecsRow>
                  <PdpSpecItem>
                    <SpecIconWrap aria-hidden>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                        <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" />
                      </svg>
                    </SpecIconWrap>
                    <SpecTextCol>
                      <SpecLabel>{t("PRODUCT.FORMAT")}</SpecLabel>
                      <SpecValue>{product.format}</SpecValue>
                    </SpecTextCol>
                  </PdpSpecItem>
                  <PdpSpecItem>
                    <SpecIconWrap aria-hidden>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M4 18V6M8 18v-6M12 18v-9M16 18v-4M20 18v-8" />
                      </svg>
                    </SpecIconWrap>
                    <SpecTextCol>
                      <SpecLabel>{t("PRODUCT.STRENGTH_LABEL")}</SpecLabel>
                      <SpecValue>{strengthLabel(product.nicotine, t)}</SpecValue>
                    </SpecTextCol>
                  </PdpSpecItem>
                  <PdpSpecItem>
                    <SpecIconWrap aria-hidden>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 22a7 7 0 007-7c0-5-7-13-7-13S5 10 5 15a7 7 0 007 7z" />
                      </svg>
                    </SpecIconWrap>
                    <SpecTextCol>
                      <SpecLabel>{t("PRODUCT.FLAVOR")}</SpecLabel>
                      <SpecValue>{product.flavor}</SpecValue>
                    </SpecTextCol>
                  </PdpSpecItem>
                </SpecsRow>
              </ProductImageCard>
            </MediaColumn>

            <CtaRow>
              <BtnSubscribe type="button">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
                {t("BUTTONS.SUBSCRIBE", { defaultValue: "Subscribe" })}
              </BtnSubscribe>
                <ButtonWrapper>
                <BtnAddCart
                  type="button"
                    onClick={() => addToCart(selectedQuantity)}
                    disabled={product.is_in_stock === "out_of_stock"}
                  >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
                  </svg>
                    {product.is_in_stock === "out_of_stock"
                      ? t("BUTTONS.AVAILABLE_SOON")
                      : t("BUTTONS.ADD_TO_CART")}
                </BtnAddCart>
                  {isAnimating && (
                    <AddToCartAnim
                      isAnimating={isAnimating}
                      onComplete={handleAnimationComplete}
                    />
                  )}
                </ButtonWrapper>
            </CtaRow>

            <PurchaseMidBlock id="product-pack-selection">
              <FlavourBlock>
                <FlavourCardButton
                  type="button"
                  aria-haspopup="dialog"
                  aria-label={t("PRODUCT.FLAVOR")}
                  onClick={() => {
                    /* TODO: otvoriti side drawer za izbor ukusa */
                  }}
                >
                  <FlavourLabelSmall>{t("PRODUCT.FLAVOR")}</FlavourLabelSmall>
                  <FlavourCardRow>
                    <FlavourValue>{product.flavor}</FlavourValue>
                    <FlavourChevronCircle aria-hidden>
                      <svg
                    viewBox="0 0 24 24"
                    fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </FlavourChevronCircle>
                  </FlavourCardRow>
                </FlavourCardButton>
              </FlavourBlock>

              <PackList>
                {PACK_QUANTITIES.map((quantity) => {
                  const { discountedPrice } = getDiscountData(quantity);
                  const lineTotal = (
                    calculatePrice(product.price, quantity) * quantity
                  ).toFixed(2);
                  const isActive = selectedQuantity === quantity;
                  return (
                    <PackRow
                      key={quantity}
                      type="button"
                      $active={isActive}
                      onClick={() => setSelectedQuantity(quantity)}
                    >
                      <PackColPack>
                        <PackLabelText $active={isActive}>
                          {quantity === 1
                            ? t("PRODUCT.DOSE", { defaultValue: "1-pack" })
                            : t("PRODUCT.PACK", {
                                quantity,
                                defaultValue: `${quantity}-pack`,
                              })}
                        </PackLabelText>
                      </PackColPack>
                      <PackColTotal>
                        <PackTotal>
                          {currencyTag}
                          {lineTotal}
                        </PackTotal>
                      </PackColTotal>
                      <PackColUnit>
                        {quantity !== 1 && (
                          <PackUnit>
                            {currencyTag}
                            {discountedPrice.toFixed(2)}
                            {t("PRODUCT_CARD.PER_UNIT")}
                          </PackUnit>
                        )}
                      </PackColUnit>
                      <PackIndicator $active={isActive}>
                        {isActive && (
                          <svg viewBox="0 0 24 24" aria-hidden>
                    <path
                              fill="currentColor"
                              d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
                            />
                          </svg>
                        )}
                      </PackIndicator>
                    </PackRow>
                  );
                })}
              </PackList>
            </PurchaseMidBlock>

            <PurchaseColumnSpacer aria-hidden />
          </ProductLayout>

          <MobileStickyBar>
            <StickyPriceButton
              type="button"
              onClick={scrollToPackSelection}
              aria-label={t("PRODUCT.STICKY_PRICE_TAP", {
                defaultValue: "View pack size and price",
              })}
            >
              <StickyPriceLine>
                {currencyTag}
                {stickyLineTotal}
              </StickyPriceLine>
              <StickyQtyLine>{stickyPackLabel}</StickyQtyLine>
            </StickyPriceButton>
            <StickyCartButtonWrap>
              <BtnAddCartSticky
                type="button"
                onClick={() => addToCart(selectedQuantity)}
                disabled={product.is_in_stock === "out_of_stock"}
              >
                <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden
                >
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
                </svg>
                {product.is_in_stock === "out_of_stock"
                  ? t("BUTTONS.AVAILABLE_SOON")
                  : t("BUTTONS.ADD_TO_CART")}
              </BtnAddCartSticky>
              {isAnimating && (
                <AddToCartAnim
                  isAnimating={isAnimating}
                  onComplete={handleAnimationComplete}
                />
              )}
            </StickyCartButtonWrap>
          </MobileStickyBar>

          <DetailsSection id="product-specifications">
            <ProductDetails product={product} />
            <TrustRowWrap>
              <TrustSpecsRow>
                <TrustSpecItem>
                  <TrustIconWrap aria-hidden>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      <path d="M9 12l2 2 4-4" />
                    </svg>
                  </TrustIconWrap>
                  <TrustSpecTextCol>
                    <SpecLabel>
                      {t("PRODUCT.TRUST_LOW_PRICE_LABEL")}
                    </SpecLabel>
                    <SpecValue>
                      {t("PRODUCT.TRUST_LOW_PRICE_VALUE")}
                    </SpecValue>
                  </TrustSpecTextCol>
                </TrustSpecItem>
                <TrustSpecItem>
                  <TrustIconWrap aria-hidden>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
                      <path d="M15 18H9" />
                      <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35a1 1 0 0 0-.78-.376H14" />
                      <circle cx="17" cy="18" r="2" />
                      <circle cx="7" cy="18" r="2" />
                    </svg>
                  </TrustIconWrap>
                  <TrustSpecTextCol>
                    <SpecLabel>
                      {t("PRODUCT.TRUST_SHIPPING_LABEL")}
                    </SpecLabel>
                    <SpecValue>
                      {t("PRODUCT.TRUST_SHIPPING_VALUE")}
                    </SpecValue>
                  </TrustSpecTextCol>
                </TrustSpecItem>
                <TrustSpecItem>
                  <TrustIconWrap aria-hidden>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
                      <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
                    </svg>
                  </TrustIconWrap>
                  <TrustSpecTextCol>
                    <SpecLabel>{t("PRODUCT.TRUST_KLARNA_LABEL")}</SpecLabel>
                    <SpecValue>{t("PRODUCT.TRUST_KLARNA_VALUE")}</SpecValue>
                  </TrustSpecTextCol>
                </TrustSpecItem>
              </TrustSpecsRow>
            </TrustRowWrap>

            <AgeWarningWrap>
              <AgeWarningInner
                role="region"
                aria-labelledby="age-warning-heading"
              >
                <AgeWarningIconColumn aria-hidden>
                  <AgeShieldFrame>
                    <AgeShieldOutline
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden
                    >
                      <path
                        d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </AgeShieldOutline>
                    <AgeIconNumber>18+</AgeIconNumber>
                  </AgeShieldFrame>
                  <AgeVerifyMark>
                    {t("PRODUCT.AGE_WARNING_VERIFY")}
                  </AgeVerifyMark>
                </AgeWarningIconColumn>
                <AgeWarningCopy>
                  <AgeWarningTitle id="age-warning-heading">
                    {t("PRODUCT.AGE_WARNING_TITLE")}
                  </AgeWarningTitle>
                  <AgeWarningBody>
                    {t("PRODUCT.AGE_WARNING_BODY")}
                  </AgeWarningBody>
                </AgeWarningCopy>
              </AgeWarningInner>
            </AgeWarningWrap>

            {recommendedSliderProducts.length > 0 && (
              <RecommendedPdpSection aria-labelledby="pdp-recommended-slider-heading">
                <RecommendedPdpTitle id="pdp-recommended-slider-heading">
                  {t("PRODUCT.RECOMMENDED_SLIDER_TITLE")}
                </RecommendedPdpTitle>
                <ProductCardSlider products={recommendedSliderProducts} />
              </RecommendedPdpSection>
            )}
          </DetailsSection>
        </>
      )}
    </Container>
  );
};

export default ProductMain;
