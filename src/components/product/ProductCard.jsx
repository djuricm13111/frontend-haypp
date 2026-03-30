import styled, { css, keyframes } from "styled-components";
import { createPortal } from "react-dom";
import {
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { useDispatch } from "react-redux";
import { cartActions } from "../../store/cart-slice";
import { ProductContext } from "../../context/ProductContext";
import AddToCartAnim from "../animations/AddToCartAnim";
import { useNavigation } from "../../utils/navigation";
import { useNavigate } from "react-router-dom";
import { calculatePrice } from "../../utils/discount";
import { useTranslation } from "react-i18next";

const PACK_TIERS_DEFAULT = [1, 5, 10, 20];

/** Panel ide naviše od Add to cart — reveal od donje ivice (suprotno od Search dropdowna). */
const fadeInBottom = keyframes`
  from {
    clip-path: polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%);
  }
  to {
    clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
  }
`;

/** Inverz fadeInBottom — sužava se ka donjoj ivici (ka Add to cart). */
const fadeOutToBottom = keyframes`
  from {
    clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
  }
  to {
    clip-path: polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%);
  }
`;

const slideSheetUp = keyframes`
  from {
    transform: translate3d(0, 100%, 0);
  }
  to {
    transform: translate3d(0, 0, 0);
  }
`;

const slideSheetDown = keyframes`
  from {
    transform: translate3d(0, 0, 0);
  }
  to {
    transform: translate3d(0, 100%, 0);
  }
`;

const PICKER_CLOSE_MS = 220;
/** Iza slideSheetDown (0.26s) da se sheet skloni iz DOM-a posle zatvaranja */
const MOBILE_QTY_SHEET_UNMOUNT_MS = 300;
const MOBILE_QTY_MAX_PX = 767;

const Card = styled.figure`
  position: relative;
  margin: 0;
  width: 100%;
  max-width: 100%;
  height: 100%;
  min-height: 0;
  background: var(--bg-100);
  border-radius: var(--border-radius-base);
  box-shadow: var(--shadow-medium);
  border: 1px solid #e8e8e8;
  overflow: visible;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  font-family: var(--font-family);

  ${(p) =>
    p.$pickerLift &&
    css`
      z-index: var(--zindex-product-card-qty-desktop);
    `}
`;

/** Slika + brend/naslov */
const TopBlock = styled.div`
  position: relative;
  z-index: 0;
  flex-shrink: 0;
`;

/** Transparentan sloj iznad slike — zatvara picker klikom (blur je na <img>). */
const ImageHitLayer = styled.button`
  position: absolute;
  inset: 0;
  z-index: 3;
  display: block;
  border: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
  background: transparent;
  border-radius: var(--border-radius-base) var(--border-radius-base) 0 0;

  &:focus-visible {
    outline: 2px solid var(--primary-100);
    outline-offset: -2px;
  }
`;

const ImageSection = styled.div`
  position: relative;
  z-index: 0;
  flex: 0 0 auto;
  min-height: 148px;
  border-radius: var(--border-radius-base) var(--border-radius-base) 0 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-100);
  padding: var(--spacing-md) var(--spacing-sm) 0;

  @media (min-width: 768px) {
    min-height: 176px;
  }
`;

/** Kartica na slici: `card_badge` ili legacy `show_offer`. Boje: proizvoljne CSS vrednosti. */
const ProductCardBadge = styled.span`
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 2;
  background: ${(p) => p.$background ?? "var(--primary-100)"};
  color: ${(p) => p.$foreground ?? "var(--bg-100)"};
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.02em;
  padding: 5px 10px;
  border-radius: 4px;
  line-height: 1;
`;

const Picture = styled.picture`
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  width: 100%;
  position: relative;
  z-index: 0;

  &:hover .primary-image {
    display: ${(props) => (props.$secondary_image ? "none" : "block")};
  }

  &:hover .secondary-image {
    display: ${(props) => (props.$secondary_image ? "block" : "none")};
  }
`;

const ProductImg = styled.img`
  width: 100%;
  max-width: 200px;
  max-height: 140px;
  object-fit: contain;
  display: block;
  margin: 0 auto;
  filter: ${(p) => (p.$blur ? "blur(10px)" : "none")};
  transition: filter 0.25s ease;

  &.secondary-image {
    display: none;
  }

  @media (min-width: 768px) {
    max-height: 168px;
    max-width: 220px;
  }
`;

const Body = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  padding: 0;
  min-height: 0;
  overflow: visible;
  gap: 0;
  position: relative;
  z-index: 2;
`;

const BodyInner = styled.div`
  position: relative;
  z-index: 0;
  padding: var(--spacing-xs) var(--spacing-sm) var(--spacing-xs);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xxs);
  min-height: 0;
  flex-shrink: 0;
`;

/** Fiksna visina za 2 reda brenda — kartice u gridu/slideru ostaju iste visine. */
const BrandRow = styled.div`
  flex-shrink: 0;
  min-height: calc(2 * 1.2em);
  font-size: 0.75rem;
  line-height: 1.2;
  display: flex;
  align-items: flex-start;
`;

const Brand = styled.p`
  margin: 0;
  font-size: inherit;
  color: var(--text-200);
  font-weight: 400;
  line-height: 1.2;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
`;

const ProductTitleCategory = styled.span`
  color: var(--text-200);
  font-weight: 400;
`;

const ProductTitleSep = styled.span`
  color: var(--text-200);
  font-weight: 400;
`;

const ProductName = styled.h3`
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--text-100);
  line-height: 1.3;
  min-height: 2.4em;
  cursor: pointer;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;

  @media (max-width: 767px) {
    font-size: 0.875rem;
    min-height: 2.35em;
  }

  &:hover {
    color: var(--primary-200);
  }

  &:hover ${ProductTitleCategory},
  &:hover ${ProductTitleSep} {
    color: var(--primary-200);
  }
`;

const ProductNameText = styled.span`
  font-weight: 500;
`;

const QuantityWrap = styled.div`
  position: relative;
  z-index: 1;
  flex-shrink: 0;
  margin-top: auto;
`;

/** Panel je pozicioniran od vrha dugmeta (bottom: 100%), širi se preko qty reda, naslova i slike. */
const AddToCartAnchor = styled.div`
  position: relative;
  z-index: 8;
  width: 100%;
  flex-shrink: 0;
`;

/** Pun širine kartice; levo: pakovanje + strelica, desno: ukupno / po jedinici. */
const QtyTrigger = styled.button`
  box-sizing: border-box;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 6px var(--spacing-md);
  min-height: 0;
  border: none;
  border-top: 1px solid #e8e8e8;
  border-bottom: 1px solid #e8e8e8;
  background: ${(p) => (p.$open ? "var(--bg-200)" : "var(--bg-100)")};
  cursor: pointer;
  font-family: inherit;
  color: var(--text-100);
  text-align: left;
  flex-shrink: 0;
  position: relative;
  z-index: 2;
  transition: background var(--transition-fast);

  &:hover {
    background: ${(p) => (p.$open ? "var(--bg-300)" : "var(--bg-200)")};
  }

  &:focus-visible {
    outline: 2px solid rgba(0, 0, 0, 0.2);
    outline-offset: -2px;
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

const QtyTriggerLeft = styled.span`
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  gap: 6px;
  min-width: 0;
  flex: 1 1 auto;
`;

const QtyPackLabel = styled.span`
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--text-100);
  line-height: 1.25;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const QtyTriggerPrices = styled.span`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  gap: 0;
  flex-shrink: 0;
`;

const QtyUnitHint = styled.span`
  font-size: 0.5625rem;
  font-weight: 500;
  color: var(--text-200);
  line-height: 1.2;
  text-align: right;
`;

const QtyTotalPrice = styled.span`
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-100);
  line-height: 1.15;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
  text-align: right;
`;

/** Donja ivica panela = vrh Add to cart; ide naviše preko količine, naslova i slike. */
const PickerPanel = styled.div`
  box-sizing: border-box;
  position: absolute;
  left: 0;
  right: 0;
  bottom: 100%;
  top: auto;
  z-index: 10;
  display: flex;
  flex-direction: column;
  max-height: min(320px, 55vh);
  overflow-x: hidden;
  overflow-y: auto;
  border: 1px solid #e0e0e0;
  border-bottom: 1px solid #e8e8e8;
  border-radius: var(--border-radius-base) var(--border-radius-base) 0 0;
  background: var(--bg-100);
  box-shadow: 0 -8px 28px rgba(0, 0, 0, 0.12);

  ${({ $isOpen }) =>
    $isOpen
      ? css`
          animation: ${fadeInBottom} 0.3s ease-in-out both;
        `
      : css`
          animation: ${fadeOutToBottom} 0.2s ease-in-out both;
        `}
`;

const MinimizeBar = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 4px var(--spacing-md);
  flex-shrink: 0;
  border: none;
  border-bottom: 1px solid #e0e0e0;
  background: var(--bg-300);
  color: var(--text-200);
  font-size: 0.6875rem;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;

  &:hover {
    background: var(--bg-200);
  }

  &:focus-visible {
    outline: 2px solid rgba(0, 0, 0, 0.2);
    outline-offset: -2px;
  }
`;

const PickerRow = styled.button`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  padding: 5px var(--spacing-md);
  border: none;
  border-top: 1px solid #ebebeb;
  background: ${(p) => (p.$selected ? "var(--bg-200)" : "var(--bg-100)")};
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  transition: background var(--transition-fast);
  flex-shrink: 0;
  gap: 6px;

  ${MinimizeBar} + & {
    border-top: none;
  }

  &:hover {
    background: var(--bg-300);
  }

  &:focus-visible {
    outline: 2px solid rgba(0, 0, 0, 0.2);
    outline-offset: -2px;
    z-index: 1;
  }
`;

const PickerLabel = styled.span`
  flex: 0 1 auto;
  min-width: 0;
  font-size: 0.6875rem;
  font-weight: ${(p) => (p.$selected ? 700 : 500)};
  color: var(--text-100);
  line-height: 1.2;
  text-align: left;
`;

const PickerRowPrices = styled.span`
  flex: 1 1 auto;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  min-width: 0;
`;

const PickerPrice = styled.span`
  flex: 0 0 auto;
  font-size: 0.6875rem;
  font-weight: ${(p) => (p.$selected ? 700 : 500)};
  color: var(--text-100);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
`;

const PickerUnitPrice = styled.span`
  flex: 0 1 auto;
  font-size: 0.5625rem;
  font-weight: 400;
  color: var(--text-200);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  text-align: right;
`;

const RadioOuter = styled.span`
  width: 18px;
  height: 18px;
  flex: 0 0 18px;
  border-radius: 50%;
  border: 1.5px solid ${(p) => (p.$selected ? "var(--primary-100)" : "#c4c4c4")};
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(p) => (p.$selected ? "var(--primary-100)" : "transparent")};
`;

const ChevronIcon = styled.svg`
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  color: var(--text-200);
  transition: transform 0.2s ease;
  transform: rotate(${(p) => (p.$open ? "180deg" : "0deg")});
`;

function ChevronDown({ $open }) {
  return (
    <ChevronIcon viewBox="0 0 24 24" aria-hidden $open={$open}>
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 9l6 6 6-6"
      />
    </ChevronIcon>
  );
}

function CheckMark() {
  return (
    <svg width="9" height="8" viewBox="0 0 12 10" aria-hidden>
      <path
        d="M1 5l3.5 3.5L11 1"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const ButtonWrap = styled.div`
  position: relative;
  z-index: 1;
  width: 100%;
  margin: 0;
  padding: 0;
  flex-shrink: 0;
`;

const AddButton = styled.button`
  width: 100%;
  margin: 0;
  padding: 14px 16px;
  border: none;
  border-radius: 0 0 calc(var(--border-radius-base) - 1px)
    calc(var(--border-radius-base) - 1px);
  background: var(--primary-100);
  color: var(--bg-100) !important;
  font-size: 0.875rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: background var(--transition-fast);

  &:hover:not(:disabled) {
    background: var(--primary-200);
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid var(--primary-200);
    outline-offset: 2px;
  }
`;

/**
 * Isti princip kao MaskContainer u CartMenu.jsx (#0000003a, full viewport).
 * Samo mobilni sheet; desktop nema full-screen masku (zatvaranje: Escape, Minimize, ponovni klik).
 */
const MobileQtyMaskContainer = styled.button`
  position: fixed;
  right: 0;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: var(--zindex-product-card-qty-mobile-backdrop);
  min-width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  border: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
  background-color: #0000003a;

  @media (min-width: 768px) {
    display: none !important;
  }
`;

const MobileQtySheet = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: var(--zindex-product-card-qty-mobile);
  display: flex;
  flex-direction: column;
  max-height: min(88vh, 560px);
  background: var(--bg-100);
  border-radius: 16px 16px 0 0;
  box-shadow: 0 -12px 40px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  touch-action: manipulation;

  ${({ $isOpen }) =>
    $isOpen
      ? css`
          animation: ${slideSheetUp} 0.34s cubic-bezier(0.22, 1, 0.36, 1) both;
        `
      : css`
          animation: ${slideSheetDown} 0.26s ease-in both;
        `}
`;

const MobileQtyHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-md) var(--spacing-sm);
  flex-shrink: 0;
  border-bottom: 1px solid #ebebeb;
`;

const MobileQtyHeaderMain = styled.div`
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
  min-width: 0;
  flex: 1;
`;

const MobileQtyHeaderText = styled.div`
  min-width: 0;
  flex: 1;
`;

const MobileQtyThumb = styled.img`
  width: 56px;
  height: 56px;
  object-fit: contain;
  flex-shrink: 0;
  border-radius: 8px;
  background: var(--bg-200);
`;

const MobileQtyBrand = styled.p`
  margin: 0 0 2px;
  font-size: 0.75rem;
  font-weight: 400;
  color: var(--text-200);
  line-height: 1.2;
`;

const MobileQtyName = styled.h2`
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--text-100);
  line-height: 1.25;
`;

const MobileQtyClose = styled.button`
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  padding: 0;
  margin: -6px -4px 0 0;
  background: transparent;
  color: var(--text-100);
  cursor: pointer;
  border-radius: 8px;
  font-size: 1.35rem;
  line-height: 1;
  font-family: inherit;
  transition: background var(--transition-fast);

  &:hover {
    background: var(--bg-300);
  }

  &:focus-visible {
    outline: 2px solid rgba(0, 0, 0, 0.2);
    outline-offset: 2px;
  }
`;

const MobileQtyList = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
`;

const MobileQtyRow = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 11px var(--spacing-md);
  border: none;
  border-top: 1px solid #f0f0f0;
  background: ${(p) => (p.$selected ? "var(--bg-200)" : "var(--bg-300)")};
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  transition: background 0.15s ease;

  &:first-child {
    border-top: none;
  }

  &:hover {
    background: ${(p) => (p.$selected ? "var(--bg-300)" : "var(--bg-200)")};
  }

  &:focus-visible {
    outline: 2px solid rgba(0, 0, 0, 0.2);
    outline-offset: -2px;
    z-index: 1;
  }
`;

const MobileQtyRowLabel = styled.span`
  flex: 0 0 auto;
  min-width: 3.35rem;
  font-size: 0.8125rem;
  font-weight: ${(p) => (p.$selected ? 700 : 500)};
  color: var(--text-100);
`;

const MobileQtyRowPrices = styled.span`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-sm);
  min-width: 0;
`;

const MobileQtyRowTotal = styled.span`
  font-size: 0.8125rem;
  font-weight: ${(p) => (p.$selected ? 700 : 600)};
  color: var(--text-100);
  font-variant-numeric: tabular-nums;
`;

const MobileQtyRowUnit = styled.span`
  font-size: 0.75rem;
  font-weight: 400;
  color: var(--text-200);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
`;

const MobileQtyFooter = styled.div`
  padding: var(--spacing-sm) var(--spacing-md)
    calc(var(--spacing-md) + env(safe-area-inset-bottom, 0px));
  flex-shrink: 0;
  border-top: 1px solid #ebebeb;
  background: var(--bg-100);
`;

const MobileQtyAddButton = styled.button`
  width: 100%;
  padding: 14px 20px;
  border: none;
  border-radius: 999px;
  background: var(--primary-100);
  color: var(--bg-100) !important;
  font-size: 0.9375rem;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  transition: background var(--transition-fast), box-shadow var(--transition-fast);

  &:hover:not(:disabled) {
    background: var(--primary-200);
  }

  @media (max-width: 767px) {
    &:hover:not(:disabled) {
      background: var(--primary-100);
      box-shadow: inset 0 0 0 9999px rgba(0, 0, 0, 0.08);
    }
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid var(--primary-200);
    outline-offset: 2px;
  }
`;

function useMatchMobileQty(maxPx = MOBILE_QTY_MAX_PX) {
  const [isMobile, setIsMobile] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia(`(max-width: ${maxPx}px)`).matches
  );
  useLayoutEffect(() => {
    const mq = window.matchMedia(`(max-width: ${maxPx}px)`);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [maxPx]);
  return isMobile;
}

function buildPackOptions(product) {
  if (Array.isArray(product.pack_options) && product.pack_options.length > 0) {
    return product.pack_options.map((po) => {
      const qty = Number(po.quantity);
      const label = po.label || `${qty}-pack`;
      const perUnit =
        po.unit_price != null
          ? Number(po.unit_price)
          : calculatePrice(Number(product.price), qty);
      const total =
        po.total_price != null
          ? Number(po.total_price)
          : perUnit * qty;
      return { quantity: qty, label, perUnit, total };
    });
  }

  return PACK_TIERS_DEFAULT.map((qty) => {
    const perUnit = calculatePrice(Number(product.price), qty);
    const total = perUnit * qty;
    return {
      quantity: qty,
      label: `${qty}-pack`,
      perUnit,
      total,
    };
  });
}

const ProductCard = ({ product }) => {
  const { t } = useTranslation();
  const isMobileQty = useMatchMobileQty();
  const packOptions = useMemo(() => buildPackOptions(product), [product]);
  const [selectedQty, setSelectedQty] = useState(
    () => packOptions.find((o) => o.quantity === 10)?.quantity ?? packOptions[0]?.quantity ?? 1
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  /** Drži panel u DOM-u dok traje fadeOut (kao clip-path exit u Search). */
  const [panelInDOM, setPanelInDOM] = useState(false);
  const dispatch = useDispatch();
  const { setIsCartOpen, currencyTag } = useContext(ProductContext);
  const { goToProduct } = useNavigation();
  const navigate = useNavigate();
  const [isAnimating, setIsAnimating] = useState(false);

  const selected = packOptions.find((o) => o.quantity === selectedQty) ?? packOptions[0];

  const cardBadge = useMemo(() => {
    const b = product.card_badge;
    if (b && typeof b === "object") {
      const label = b.labelKey ? t(b.labelKey) : b.label;
      if (typeof label === "string" && label.trim()) {
        return {
          label: label.trim(),
          background:
            b.backgroundColor ?? b.background ?? undefined,
          color: b.color ?? b.textColor ?? undefined,
        };
      }
    }
    if (product.show_offer === true) {
      return {
        label: t("PRODUCT_CARD.OFFER"),
        background: undefined,
        color: undefined,
      };
    }
    return null;
  }, [product.card_badge, product.show_offer, t]);

  useEffect(() => {
    if (!pickerOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") setPickerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pickerOpen]);

  /* Mora pratiti pickerOpen, ne panelInDOM — panelInDOM ostaje true do kraja exit animacije,
   * a inače bi body ostao overflow:hidden zauvek posle prvog otvaranja. */
  useEffect(() => {
    if (!pickerOpen || !isMobileQty) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [pickerOpen, isMobileQty]);

  useEffect(() => {
    if (pickerOpen || !isMobileQty || !panelInDOM) return;
    const id = window.setTimeout(() => {
      setPanelInDOM(false);
    }, MOBILE_QTY_SHEET_UNMOUNT_MS);
    return () => window.clearTimeout(id);
  }, [pickerOpen, isMobileQty, panelInDOM]);

  /** Posle fadeOut panela na desktopu — inače ostaje backdrop stanje / panel u DOM-u. */
  useEffect(() => {
    if (pickerOpen || isMobileQty || !panelInDOM) return;
    const id = window.setTimeout(() => {
      setPanelInDOM(false);
    }, PICKER_CLOSE_MS);
    return () => window.clearTimeout(id);
  }, [pickerOpen, isMobileQty, panelInDOM]);

  const addToCart = () => {
    dispatch(
      cartActions.addToCart({
        product,
        quantity: selectedQty,
      })
    );
    setIsCartOpen(true);
    setIsAnimating(true);
    setPickerOpen(false);
  };

  const handleAnimationComplete = () => {
    setIsAnimating(false);
  };

  const primaryImage = product.images?.find((img) => img.is_primary);
  const secondaryImage = product.images?.find((img) => !img.is_primary);
  const sheetTitleId = `mobile-qty-title-${product.id}`;
  const blurCardImage = pickerOpen && !isMobileQty;

  const goProduct = () =>
    navigate(
      goToProduct(product.category_name, product.name, product.slug)
    );

  const closeDesktopPickerOrNavigate = () => {
    if (pickerOpen && !isMobileQty) {
      setPickerOpen(false);
      return;
    }
    goProduct();
  };

  const mobileQtyMaskPortal =
    pickerOpen &&
    isMobileQty &&
    typeof document !== "undefined" &&
    createPortal(
      <MobileQtyMaskContainer
        type="button"
        aria-label={t("PRODUCT_CARD.CLOSE_QUANTITY_SHEET")}
        onClick={() => setPickerOpen(false)}
      />,
      document.body
    );

  const mobileQtyPortal =
    panelInDOM &&
    isMobileQty &&
    typeof document !== "undefined" &&
    createPortal(
      <>
        <MobileQtySheet
          role="dialog"
          aria-modal="true"
          aria-labelledby={sheetTitleId}
          $isOpen={pickerOpen}
        >
          <MobileQtyHeader>
            <MobileQtyHeaderMain>
              {primaryImage ? (
                <MobileQtyThumb
                  src={primaryImage.thumbnail}
                  alt=""
                  loading="lazy"
                />
              ) : null}
              <MobileQtyHeaderText>
                {product.manufacturer ? (
                  <MobileQtyBrand>{product.manufacturer}</MobileQtyBrand>
                ) : null}
                <MobileQtyName id={sheetTitleId}>
                  {product.category_name ? (
                    <>
                      <ProductTitleCategory>{product.category_name}</ProductTitleCategory>
                      <ProductTitleSep> · </ProductTitleSep>
                    </>
                  ) : null}
                  <ProductNameText>{product.name}</ProductNameText>
                </MobileQtyName>
              </MobileQtyHeaderText>
            </MobileQtyHeaderMain>
            <MobileQtyClose
              type="button"
              aria-label={t("PRODUCT_CARD.CLOSE_QUANTITY_SHEET")}
              onClick={() => setPickerOpen(false)}
            >
              ×
            </MobileQtyClose>
          </MobileQtyHeader>
          <MobileQtyList role="listbox" aria-label={t("PRODUCT_CARD.CHOOSE_QUANTITY")}>
            {packOptions.map((opt) => {
              const isSel = opt.quantity === selectedQty;
              return (
                <MobileQtyRow
                  key={opt.quantity}
                  type="button"
                  role="option"
                  aria-selected={isSel}
                  $selected={isSel}
                  onClick={() => {
                    setSelectedQty(opt.quantity);
                    setPickerOpen(false);
                  }}
                >
                  <MobileQtyRowLabel $selected={isSel}>{opt.label}</MobileQtyRowLabel>
                  <MobileQtyRowPrices>
                    <MobileQtyRowTotal $selected={isSel}>
                      {currencyTag}
                      {opt.total.toFixed(2)}
                    </MobileQtyRowTotal>
                    <MobileQtyRowUnit>
                      {currencyTag}
                      {opt.perUnit.toFixed(2)}
                      {t("PRODUCT_CARD.PER_UNIT")}
                    </MobileQtyRowUnit>
                  </MobileQtyRowPrices>
                  <RadioOuter $selected={isSel}>
                    {isSel ? <CheckMark /> : null}
                  </RadioOuter>
                </MobileQtyRow>
              );
            })}
          </MobileQtyList>
          <MobileQtyFooter>
            <MobileQtyAddButton
              type="button"
              onClick={addToCart}
              disabled={product.is_in_stock === "out_of_stock"}
            >
              {product.is_in_stock !== "out_of_stock"
                ? t("BUTTONS.ADD_TO_CART")
                : `${t("BUTTONS.AVAILABLE_SOON")}!`}
            </MobileQtyAddButton>
          </MobileQtyFooter>
        </MobileQtySheet>
      </>,
      document.body
    );

  return (
    <Card $pickerLift={panelInDOM && !isMobileQty}>
      {mobileQtyMaskPortal}
      {mobileQtyPortal}
      <TopBlock>
        <ImageSection>
          {pickerOpen && !isMobileQty && (
            <ImageHitLayer
              type="button"
              aria-label={t("PRODUCT_CARD.MINIMIZE")}
              onClick={() => setPickerOpen(false)}
            />
          )}
          {cardBadge && !pickerOpen && (
            <ProductCardBadge
              $background={cardBadge.background}
              $foreground={cardBadge.color}
            >
              {cardBadge.label}
            </ProductCardBadge>
          )}
          <Picture onClick={closeDesktopPickerOrNavigate} $secondary_image={secondaryImage}>
            {primaryImage && (
              <ProductImg
                src={primaryImage.thumbnail}
                alt=""
                loading="lazy"
                className="primary-image"
                $blur={blurCardImage}
              />
            )}
            {secondaryImage && (
              <ProductImg
                src={secondaryImage.thumbnail}
                alt=""
                loading="lazy"
                className="secondary-image"
                $blur={blurCardImage}
              />
            )}
          </Picture>
        </ImageSection>
        <BodyInner>
          <BrandRow>
            {product.manufacturer ? <Brand>{product.manufacturer}</Brand> : null}
          </BrandRow>
          <ProductName onClick={closeDesktopPickerOrNavigate}>
            {product.category_name ? (
              <>
                <ProductTitleCategory>{product.category_name}</ProductTitleCategory>
                <ProductTitleSep> · </ProductTitleSep>
              </>
            ) : null}
            <ProductNameText>{product.name}</ProductNameText>
          </ProductName>
        </BodyInner>
      </TopBlock>

      <Body>
        {selected && (
          <QuantityWrap>
            <QtyTrigger
              type="button"
              $open={pickerOpen}
              aria-expanded={pickerOpen}
              aria-haspopup="listbox"
              disabled={product.is_in_stock === "out_of_stock"}
              onClick={() => {
                if (product.is_in_stock === "out_of_stock") return;
                setPickerOpen((o) => {
                  if (!o) setPanelInDOM(true);
                  return !o;
                });
              }}
            >
              <QtyTriggerLeft>
                <QtyPackLabel>{selected.label}</QtyPackLabel>
                <ChevronDown $open={pickerOpen} />
              </QtyTriggerLeft>
              <QtyTriggerPrices>
                <QtyTotalPrice>
                  {currencyTag}
                  {selected.total.toFixed(2)}
                </QtyTotalPrice>
                <QtyUnitHint>
                  {currencyTag}
                  {selected.perUnit.toFixed(2)}
                  {t("PRODUCT_CARD.PER_UNIT")}
                </QtyUnitHint>
              </QtyTriggerPrices>
            </QtyTrigger>
          </QuantityWrap>
        )}

        <AddToCartAnchor>
          {panelInDOM && !isMobileQty && (
            <PickerPanel
              $isOpen={pickerOpen}
              role="listbox"
              aria-label={t("PRODUCT_CARD.CHOOSE_QUANTITY")}
            >
              <MinimizeBar type="button" onClick={() => setPickerOpen(false)}>
                <span>{t("PRODUCT_CARD.MINIMIZE")}</span>
                <ChevronDown $open />
              </MinimizeBar>
              {packOptions.map((opt) => {
                const isSel = opt.quantity === selectedQty;
                return (
                  <PickerRow
                    key={opt.quantity}
                    type="button"
                    role="option"
                    aria-selected={isSel}
                    $selected={isSel}
                    onClick={() => {
                      setSelectedQty(opt.quantity);
                      setPickerOpen(false);
                    }}
                  >
                    <PickerLabel $selected={isSel}>{opt.label}</PickerLabel>
                    <PickerRowPrices>
                      <PickerPrice $selected={isSel}>
                        {currencyTag}
                        {opt.total.toFixed(2)}
                      </PickerPrice>
                      <PickerUnitPrice>
                        {currencyTag}
                        {opt.perUnit.toFixed(2)}
                        {t("PRODUCT_CARD.PER_UNIT")}
                      </PickerUnitPrice>
                    </PickerRowPrices>
                    <RadioOuter $selected={isSel}>
                      {isSel ? <CheckMark /> : null}
                    </RadioOuter>
                  </PickerRow>
                );
              })}
            </PickerPanel>
          )}

          <ButtonWrap>
            <AddButton
              type="button"
              onClick={addToCart}
              disabled={product.is_in_stock === "out_of_stock"}
            >
              {product.is_in_stock !== "out_of_stock"
                ? t("BUTTONS.ADD_TO_CART")
                : `${t("BUTTONS.AVAILABLE_SOON")}!`}
            </AddButton>
            {isAnimating && (
              <AddToCartAnim
                isAnimating={isAnimating}
                onComplete={handleAnimationComplete}
              />
            )}
          </ButtonWrap>
        </AddToCartAnchor>
      </Body>
    </Card>
  );
};

export default ProductCard;
