import { useEffect, useMemo, useState } from "react";
import styled, { keyframes } from "styled-components";
import { createPortal } from "react-dom";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { cartActions } from "../../store/cart-slice";
import { volumeAdjustedUnitPrice } from "../../utils/discount";

const PDP_BLUE = "#001a57";
const SUBSCRIBE_CTA_GREEN = "#1b5e20";

const PACK_QUANTITIES = [1, 5, 10, 20];
const INTERVALS = [
  { days: 14, key: "14d" },
  { days: 31, key: "31d" },
  { days: 62, key: "62d" },
];

const slideIn = keyframes`
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
`;

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: var(--zindex-modal-background, 12000);
  background: rgba(0, 0, 0, 0.4);
  opacity: ${(p) => (p.$visible ? 1 : 0)};
  transition: opacity 0.25s ease;
  pointer-events: ${(p) => (p.$visible ? "auto" : "none")};
`;

const Panel = styled.aside`
  position: fixed;
  right: 0;
  top: 0;
  z-index: var(--zindex-modal, 12001);
  background: var(--bg-100);
  box-sizing: border-box;
  width: 100%;
  height: 100vh;
  max-height: 100dvh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: var(--shadow-large);
  animation: ${slideIn} 0.35s ease-out forwards;

  @media (min-width: 1024px) {
    width: 400px;
    max-width: 400px;
  }

  @media (max-width: 767px) {
    width: 90%;
    max-width: min(90vw, 100%);
  }

  @media (min-width: 768px) and (max-width: 1023px) {
    width: min(360px, 68vw);
    max-width: min(360px, 68vw);
  }
`;

const HeaderBar = styled.header`
  flex-shrink: 0;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 52px;
  padding: 0 12px;
  background: ${PDP_BLUE};
  color: #fff;
`;

const CloseBtn = styled.button`
  position: absolute;
  left: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: #fff;
  cursor: pointer;
  border-radius: var(--border-radius-base);
  font-size: 22px;
  line-height: 1;
  padding: 0;
  &:hover {
    opacity: 0.9;
  }
  &:focus-visible {
    outline: 2px solid #fff;
    outline-offset: 2px;
  }
`;

const HeaderTitle = styled.h2`
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  text-align: center;
  letter-spacing: 0.02em;
  padding: 0 40px;
  color: #fff;
`;

const ScrollBody = styled.div`
  flex: 1;
  min-width: 0;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 12px 0 100px;
  -webkit-overflow-scrolling: touch;
`;

/** Puna širina drawera; sadržaj sužava unutrašnji div. */
const TopPanel = styled.div`
  width: 100%;
  box-sizing: border-box;
  background: var(--bg-200);
  border-top: 1px solid var(--bg-300);
  border-bottom: 1px solid var(--bg-300);
  margin-bottom: 20px;
`;

const TopPanelInner = styled.div`
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
  padding: 12px 16px;
  margin: 0 auto;
`;

/** Ostatak sadržaja ispod gornjeg panela — klasični horizontalni padding. */
const ScrollContentPad = styled.div`
  box-sizing: border-box;
  width: 100%;
  padding: 0 16px;
`;

const ProductBlock = styled.div`
  display: flex;
  gap: 12px;
`;

const Thumb = styled.div`
  width: 72px;
  height: 72px;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
  background: var(--bg-100);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
  }
`;

const ProductText = styled.div`
  min-width: 0;
  flex: 1;
`;

const Brand = styled.p`
  margin: 0 0 4px;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-200);
`;

const ProdName = styled.p`
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-100);
  line-height: 1.35;
`;

const SpecDivider = styled.div`
  height: 1px;
  margin: 12px 0 10px;
  background: var(--bg-300);
`;

const SpecStrip = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  padding-top: 2px;
`;

const SpecCell = styled.div`
  min-width: 0;
  text-align: center;
`;

const SpecLab = styled.div`
  font-size: 11px;
  font-weight: 500;
  color: var(--text-200);
  margin-bottom: 4px;
`;

const SpecVal = styled.div`
  font-size: 12px;
  font-weight: 700;
  color: var(--text-100);
  line-height: 1.25;
`;

const SectionTitle = styled.h3`
  margin: 0 0 10px;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-100);
`;

const PackRow = styled.button`
  display: grid;
  grid-template-columns: 1fr auto auto 20px;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 10px;
  margin-bottom: 8px;
  box-sizing: border-box;
  border-radius: var(--border-radius-base);
  border: 1px solid
    ${(p) => (p.$selected ? PDP_BLUE : "var(--bg-300)")};
  background: var(--bg-100);
  cursor: pointer;
  text-align: left;
  font: inherit;
  color: var(--text-100);
  transition:
    border-color 0.15s ease,
    background 0.15s ease;

  &:hover {
    border-color: ${(p) => (p.$selected ? PDP_BLUE : "var(--text-200)")};
  }
`;

const PackLabel = styled.span`
  font-size: 14px;
  font-weight: 600;
`;

const PackTotal = styled.span`
  font-size: 14px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
`;

const PackUnit = styled.span`
  font-size: 12px;
  color: var(--text-200);
  font-variant-numeric: tabular-nums;
`;

const CheckMark = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1px solid ${(p) => (p.$on ? PDP_BLUE : "var(--bg-300)")};
  background: ${(p) => (p.$on ? PDP_BLUE : "transparent")};
  color: #fff;
  font-size: 9px;
  line-height: 1;
  flex-shrink: 0;
`;

const FreqSection = styled.div`
  margin-top: 20px;
`;

const FreqHint = styled.p`
  margin: 4px 0 10px;
  font-size: 12px;
  color: var(--text-200);
  line-height: 1.4;
`;

const FreqSelectWrap = styled.div`
  position: relative;
  border: 1px solid var(--bg-300);
  border-radius: var(--border-radius-base);
  padding: 12px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: var(--bg-100);
`;

const FreqNative = styled.select`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  font-size: 16px;
`;

const FreqDisplay = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: var(--text-100);
`;

const FreqChange = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: ${PDP_BLUE};
  pointer-events: none;
`;

const Footer = styled.div`
  flex-shrink: 0;
  padding: 12px 16px calc(16px + env(safe-area-inset-bottom, 0px));
  border-top: 1px solid var(--bg-300);
  background: var(--bg-100);
`;

const SubscribeCta = styled.button`
  position: relative;
  width: 100%;
  display: block;
  padding: 14px 52px 14px 18px;
  border: none;
  border-radius: var(--border-radius-base);
  background: ${SUBSCRIBE_CTA_GREEN};
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  box-sizing: border-box;
  text-align: center;
  &:hover {
    filter: brightness(1.05);
  }
  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

const CtaIconRight = styled.span`
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  line-height: 0;
`;

const CalendarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
    <rect
      x="3"
      y="5"
      width="18"
      height="16"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <path d="M3 10h18" stroke="currentColor" strokeWidth="1.8" />
    <path
      d="M8 3v4M16 3v4"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

function strengthLabel(nicotine, t) {
  const n = Number(nicotine);
  if (Number.isNaN(n)) return "—";
  if (n < 6) return t("PRODUCT.STRENGTH.MILD");
  if (n > 14) return t("PRODUCT.STRENGTH.STRONG");
  return t("PRODUCT.STRENGTH.REGULAR");
}

/**
 * Bočni panel pretplate — ista širina kao korpa (CartMenu), slide sa desne strane.
 */
export default function ProductSubscribeDrawer({
  open,
  onClose,
  product,
  initialPackQuantity,
  currencyTag,
  onAdded,
}) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [packQty, setPackQty] = useState(initialPackQuantity ?? 10);
  const [intervalDays, setIntervalDays] = useState(31);

  useEffect(() => {
    if (!open || !product) return;
    if (product.is_mix_pack) {
      setPackQty(1);
    } else {
      setPackQty(initialPackQuantity ?? 10);
    }
    setIntervalDays(31);
  }, [open, product?.id, product?.is_mix_pack, initialPackQuantity]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const primaryImage = useMemo(() => {
    if (!product?.images?.length) return null;
    return (
      product.images.find((img) => img.is_primary) || product.images[0]
    );
  }, [product]);

  const lineTotals = useMemo(() => {
    if (!product) return {};
    const out = {};
    for (const q of PACK_QUANTITIES) {
      const unit = volumeAdjustedUnitPrice(product, q);
      out[q] = {
        unit,
        line: unit * q,
      };
    }
    return out;
  }, [product]);

  const freqLabel = useMemo(() => {
    const opt = INTERVALS.find((o) => o.days === intervalDays);
    if (!opt) return t("PRODUCT.SUBSCRIBE_INTERVAL_OPTION", { days: 31 });
    return t(`PRODUCT.SUBSCRIBE_FREQ_LABEL_${opt.key}`);
  }, [intervalDays, t]);

  if (!open || typeof document === "undefined" || !product) return null;

  const handleSubscribe = () => {
    dispatch(
      cartActions.addToCart({
        product,
        quantity: packQty,
        subscriptionIntervalDays: intervalDays,
      })
    );
    onAdded?.();
    onClose();
  };

  return createPortal(
    <>
      <Backdrop
        $visible={open}
        role="presentation"
        onClick={onClose}
        aria-hidden={!open}
      />
      <Panel
        role="dialog"
        aria-modal="true"
        aria-labelledby="subscribe-drawer-title"
        onClick={(e) => e.stopPropagation()}
      >
        <HeaderBar>
          <CloseBtn
            type="button"
            onClick={onClose}
            aria-label={t("PRODUCT.SUBSCRIBE_CLOSE")}
          >
            ×
          </CloseBtn>
          <HeaderTitle id="subscribe-drawer-title">
            {t("PRODUCT.SUBSCRIBE_TITLE")}
          </HeaderTitle>
        </HeaderBar>

        <ScrollBody>
          <TopPanel>
            <TopPanelInner>
              <ProductBlock>
                <Thumb>
                  {primaryImage?.thumbnail ? (
                    <img
                      src={primaryImage.thumbnail}
                      alt=""
                      width={72}
                      height={72}
                    />
                  ) : null}
                </Thumb>
                <ProductText>
                  <Brand>{product.category_name || "—"}</Brand>
                  <ProdName>
                    {product.name}
                    {product.nicotine != null ? ` ${product.nicotine}mg` : ""}
                  </ProdName>
                </ProductText>
              </ProductBlock>
              <SpecDivider />
              <SpecStrip>
                <SpecCell>
                  <SpecLab>{t("PRODUCT.SUBSCRIBE_SPEC_FORMAT")}</SpecLab>
                  <SpecVal>{product.format || "—"}</SpecVal>
                </SpecCell>
                <SpecCell>
                  <SpecLab>{t("PRODUCT.SUBSCRIBE_SPEC_STRENGTH")}</SpecLab>
                  <SpecVal>{strengthLabel(product.nicotine, t)}</SpecVal>
                </SpecCell>
                <SpecCell>
                  <SpecLab>{t("PRODUCT.SUBSCRIBE_SPEC_FLAVOR")}</SpecLab>
                  <SpecVal>{product.flavor || "—"}</SpecVal>
                </SpecCell>
              </SpecStrip>
            </TopPanelInner>
          </TopPanel>

          <ScrollContentPad>
            {!product.is_mix_pack && (
              <>
                <SectionTitle>{t("PRODUCT.SUBSCRIBE_PACK_TITLE")}</SectionTitle>
                {PACK_QUANTITIES.map((q) => {
                  const lt = lineTotals[q];
                  const selected = packQty === q;
                  return (
                    <PackRow
                      key={q}
                      type="button"
                      $selected={selected}
                      onClick={() => setPackQty(q)}
                    >
                      <PackLabel>
                        {q === 1
                          ? t("PRODUCT.DOSE", { defaultValue: "1-pack" })
                          : t("PRODUCT.PACK", {
                              quantity: q,
                              defaultValue: `${q}-pack`,
                            })}
                      </PackLabel>
                      <PackTotal>
                        {currencyTag}
                        {lt.line.toFixed(2)}
                      </PackTotal>
                      <PackUnit>
                        {currencyTag}
                        {lt.unit.toFixed(2)}
                        {t("PRODUCT_CARD.PER_UNIT")}
                      </PackUnit>
                      <CheckMark $on={selected}>{selected ? "✓" : ""}</CheckMark>
                    </PackRow>
                  );
                })}
              </>
            )}

            <FreqSection>
              <SectionTitle>
                {t("PRODUCT.SUBSCRIBE_FREQUENCY_TITLE")}
              </SectionTitle>
              <FreqHint>{t("PRODUCT.SUBSCRIBE_FREQUENCY_HINT")}</FreqHint>
              <FreqSelectWrap>
                <FreqDisplay>{freqLabel}</FreqDisplay>
                <FreqChange>{t("PRODUCT.SUBSCRIBE_FREQUENCY_CHANGE")}</FreqChange>
                <FreqNative
                  aria-label={t("PRODUCT.SUBSCRIBE_INTERVAL")}
                  value={intervalDays}
                  onChange={(e) => setIntervalDays(Number(e.target.value))}
                >
                  {INTERVALS.map((o) => (
                    <option key={o.days} value={o.days}>
                      {t(`PRODUCT.SUBSCRIBE_FREQ_LABEL_${o.key}`)}
                    </option>
                  ))}
                </FreqNative>
              </FreqSelectWrap>
            </FreqSection>
          </ScrollContentPad>
        </ScrollBody>

        <Footer>
          <SubscribeCta type="button" onClick={handleSubscribe}>
            {t("PRODUCT.SUBSCRIBE_CTA")}
            <CtaIconRight aria-hidden>
              <CalendarIcon />
            </CtaIconRight>
          </SubscribeCta>
        </Footer>
      </Panel>
    </>,
    document.body
  );
}
