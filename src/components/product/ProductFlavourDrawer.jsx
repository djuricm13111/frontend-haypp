import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import styled, { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import APIService from "../../services/APIService";
import { useNavigation } from "../../utils/navigation";

const slideIn = keyframes`
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
`;

/** Isto kao Login/Cart: klik van panela zatvara; panel hvata klikove (stopPropagation). */
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: var(--zindex-modal-background);
  min-width: 100%;
  height: 100vh;
  height: 100dvh;
  box-sizing: border-box;
  background-color: #0000003a;
`;

const Panel = styled.aside`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: var(--zindex-modal);
  width: min(360px, 76vw);
  max-width: 100%;
  background: var(--bg-200);
  box-shadow: -8px 0 32px rgba(0, 0, 0, 0.18);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: ${slideIn} 0.32s ease-out;
`;

const PanelHeader = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 52px;
  padding: 0 8px 0 4px;
  background-color: var(--primary-100);
  color: var(--bg-100);
`;

const CloseBtn = styled.button`
  all: unset;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  cursor: pointer;
  border-radius: 8px;
  box-sizing: border-box;
  &:focus-visible {
    outline: 2px solid var(--bg-100);
    outline-offset: -4px;
  }
`;

const PanelTitle = styled.h2`
  flex: 1;
  margin: 0;
  padding-right: 40px;
  text-align: center;
  font-family: "Montserrat", var(--font-family), sans-serif;
  font-size: var(--header-dropdown-heading-size);
  font-weight: 500;
  color: var(--bg-100);
`;

const CurrentBlock = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 14px;
  background: var(--bg-100);
`;

const CurrentThumb = styled.div`
  width: 64px;
  height: 64px;
  flex-shrink: 0;
  border-radius: 10px;
  background: var(--bg-100);
  box-shadow: var(--shadow-medium);
  border: 1px solid #e8e8e8;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

const CurrentText = styled.div`
  min-width: 0;
  flex: 1;
`;

const CurrentBrand = styled.p`
  margin: 0 0 4px;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-200);
`;

const CurrentName = styled.p`
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--text-100);
  line-height: 1.25;
`;

const SeriesDivider = styled.p`
  margin: 0;
  padding: 10px 14px 4px;
  text-align: center;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-200);
  background: var(--bg-200);
`;

const SeriesHeading = styled.h3`
  margin: 0;
  padding: 4px 14px 10px;
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--text-100);
  background: var(--bg-200);
`;

const ScrollList = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 0 12px 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const SeriesCard = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 12px;
  text-align: left;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  background: var(--bg-100);
  cursor: pointer;
  font: inherit;
  transition: background 0.15s ease, border-color 0.15s ease, opacity 0.15s ease;
  box-sizing: border-box;

  &:hover:not(:disabled) {
    background: var(--bg-200);
    border-color: #cfcfcf;
  }

  &:focus-visible {
    outline: 2px solid var(--primary-100);
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.48;
    cursor: not-allowed;
  }
`;

const CardThumb = styled.div`
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  border-radius: 50%;
  background: var(--bg-200);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

const CardLabel = styled.span`
  flex: 1;
  min-width: 0;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-100);
  line-height: 1.3;
`;

const StockHint = styled.span`
  color: var(--text-200);
  font-weight: 400;
`;

const RadioOuter = styled.span`
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  border-radius: 50%;
  border: 2px solid ${(p) => (p.$selected ? "var(--primary-100)" : "#c4c4c4")};
  background: ${(p) => (p.$selected ? "var(--primary-100)" : "transparent")};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const RadioDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--bg-100);
`;

const EmptyState = styled.p`
  margin: 16px 14px;
  font-size: var(--font-size-small);
  color: var(--text-200);
  text-align: center;
`;

const LoadingState = styled.p`
  margin: 16px 14px;
  font-size: var(--font-size-small);
  color: var(--text-200);
  text-align: center;
`;

function primaryThumb(images) {
  if (!Array.isArray(images) || images.length === 0) return null;
  const p = images.find((i) => i.is_primary) ?? images[0];
  return p?.thumbnail ?? p?.image ?? null;
}

function rowLabel(p) {
  const nic = Number(p.nicotine);
  const nicStr = Number.isFinite(nic) ? `${nic}mg` : "";
  const parts = [p.flavor, nicStr].filter(Boolean);
  if (parts.length) return parts.join(" ");
  return p.name || "—";
}

function isOutOfStock(p) {
  return p?.is_in_stock === "out_of_stock";
}

/**
 * Bočni meni (desno) — svi proizvodi iz iste kategorije / brenda (product series).
 */
function ProductFlavourDrawer({
  open,
  onClose,
  categorySlug,
  currentProduct,
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { goToProduct } = useNavigation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    if (!categorySlug) return;
    setLoading(true);
    setError(false);
    try {
      const data = await APIService.GetProductsByCategory(categorySlug);
      const list = Array.isArray(data?.products) ? data.products : [];
      setItems(list);
    } catch (e) {
      console.error(e);
      setError(true);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [categorySlug]);

  useEffect(() => {
    if (!open || !categorySlug) return;
    load();
  }, [open, categorySlug, load]);

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  const currentId = currentProduct?.id;
  const thumb = primaryThumb(currentProduct?.images);
  const count = items.length;

  const handlePick = (p) => {
    if (p.id === currentId) {
      onClose();
      return;
    }
    if (isOutOfStock(p)) return;
    navigate(
      goToProduct(p.category_name ?? categorySlug, p.name, p.slug)
    );
    onClose();
  };

  return createPortal(
    <>
      <Overlay onClick={onClose} aria-hidden />
      <Panel
        role="dialog"
        aria-modal="true"
        aria-labelledby="flavour-drawer-title"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <PanelHeader>
          <CloseBtn type="button" onClick={onClose} aria-label={t("HEADER.CLOSE_MENU")}>
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>
          </CloseBtn>
          <PanelTitle id="flavour-drawer-title">
            {t("PRODUCT.FLAVOUR_DRAWER_TITLE")}
          </PanelTitle>
        </PanelHeader>

        {currentProduct && (
          <CurrentBlock>
            <CurrentThumb>
              {thumb ? <img src={thumb} alt="" loading="lazy" /> : null}
            </CurrentThumb>
            <CurrentText>
              {currentProduct.manufacturer ? (
                <CurrentBrand>{currentProduct.manufacturer}</CurrentBrand>
              ) : null}
              <CurrentName>
                {currentProduct.name}
                {Number.isFinite(Number(currentProduct.nicotine))
                  ? ` ${Number(currentProduct.nicotine)}mg`
                  : ""}
              </CurrentName>
            </CurrentText>
          </CurrentBlock>
        )}

        <SeriesDivider>{t("PRODUCT.PRODUCT_SERIES")}</SeriesDivider>
        <SeriesHeading>{t("PRODUCT.SERIES_COUNT", { count })}</SeriesHeading>

        <ScrollList role="list">
          {loading && (
            <LoadingState>{t("PRODUCT.FLAVOUR_DRAWER_LOADING")}</LoadingState>
          )}
          {!loading && error && (
            <EmptyState>{t("PRODUCT.FLAVOUR_DRAWER_ERROR")}</EmptyState>
          )}
          {!loading && !error && items.length === 0 && (
            <EmptyState>{t("PRODUCT.FLAVOUR_DRAWER_EMPTY")}</EmptyState>
          )}
          {!loading &&
            !error &&
            items.map((p) => {
              const selected = p.id === currentId;
              const oos = isOutOfStock(p);
              const disabled = oos && !selected;
              const turl = primaryThumb(p.images);
              return (
                <SeriesCard
                  key={p.id ?? p.slug}
                  type="button"
                  role="listitem"
                  disabled={disabled}
                  aria-disabled={disabled || undefined}
                  title={disabled ? t("PRODUCT.FLAVOUR_DRAWER_OUT_OF_STOCK") : undefined}
                  onClick={() => handlePick(p)}
                >
                  <CardThumb>
                    {turl ? <img src={turl} alt="" loading="lazy" /> : null}
                  </CardThumb>
                  <CardLabel>
                    {rowLabel(p)}
                    {oos ? (
                      <>
                        {" "}
                        <StockHint>({t("BUTTONS.AVAILABLE_SOON")})</StockHint>
                      </>
                    ) : null}
                  </CardLabel>
                  <RadioOuter $selected={selected} aria-hidden>
                    {selected ? <RadioDot /> : null}
                  </RadioOuter>
                </SeriesCard>
              );
            })}
        </ScrollList>
      </Panel>
    </>,
    document.body
  );
}

export default ProductFlavourDrawer;
