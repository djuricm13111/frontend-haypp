import { useContext, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { ProductContext } from "../../context/ProductContext";
import APIService from "../../services/APIService";
import { cartActions } from "../../store/cart-slice";
import { downloadOrderInvoicePdf } from "../../utils/orderInvoicePdf";
import { parseMoneyAmount, formatMoneyParsed } from "../../utils/moneyParse";

const PAGE_SIZE = 8;

const MOBILE_MAX = "639px";
const DESKTOP_2COL = "1024px";

const Muted = styled.p`
  margin: 0 0 var(--spacing-md);
  font-size: 14px;
  color: var(--text-200);
  line-height: 1.5;
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  align-items: center;
  margin-top: var(--spacing-md);
`;

const RouterLinkButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 18px;
  border-radius: var(--border-radius-base);
  font-weight: 600;
  font-size: 14px;
  text-decoration: none;
  border: 1px solid var(--primary-200);
  color: var(--primary-200);
  &:hover {
    background: var(--bg-200);
  }
`;

const GhostButton = styled.button`
  padding: 10px 20px;
  border-radius: var(--border-radius-base);
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  border: 1px solid var(--bg-300);
  background: var(--bg-100);
  color: var(--text-100);
  font-family: "Montserrat", sans-serif;
  box-shadow: var(--shadow-small);
  &:hover {
    border-color: var(--primary-200);
    color: var(--primary-200);
  }
`;

const OrdersLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  width: 100%;
  min-width: 0;

  @media (min-width: ${DESKTOP_2COL}) {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--spacing-md);
    align-items: start;
  }
`;

const OrderCard = styled.article`
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: var(--border-radius-large);
  background: var(--bg-100);
  box-shadow: var(--shadow-small);
  overflow: hidden;
  min-width: 0;
`;

/** Zatvorena kartica — čitljivo na telefonu */
const OrderHeaderBar = styled.div`
  padding: 16px;
  background: var(--bg-100);
  border-bottom: ${(p) => (p.$open ? `1px solid var(--bg-300)` : "none")};

  @media (min-width: 720px) {
    padding: var(--spacing-md) var(--spacing-md);
    background: linear-gradient(
      180deg,
      rgba(0, 32, 105, 0.04) 0%,
      var(--bg-100) 100%
    );
  }
`;

const OrderHeaderTop = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  min-width: 0;

  @media (min-width: 720px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
  }
`;

const OrderHeaderMain = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  flex: 1;
`;

const OrderRef = styled.div`
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-100);
  font-family: "Montserrat", sans-serif;
  line-height: 1.35;
  word-break: break-word;
`;

/** Jedan red meta na malom ekranu — manje visine */
const MetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px 14px;
  font-size: 13px;
  line-height: 1.5;
  color: var(--text-200);
`;

const MetaPiece = styled.span`
  strong {
    font-weight: 600;
    color: var(--text-200);
    margin-right: 4px;
  }
  color: var(--text-100);
`;

const HeaderAside = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;

  @media (min-width: 720px) {
    width: auto;
    max-width: 360px;
    align-items: flex-end;
    flex-shrink: 0;
  }
`;

const HeaderButtonRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;

  @media (min-width: 720px) {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: flex-end;
    width: auto;
    gap: 8px;
  }
`;

const ToggleBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 10px 14px;
  border-radius: var(--border-radius-base);
  font-size: 14px;
  font-weight: 600;
  font-family: "Montserrat", sans-serif;
  cursor: pointer;
  width: 100%;
  @media (min-width: 720px) {
    width: auto;
    min-width: 128px;
  }
  /* index.css: button / button:hover — mora && da pobedi globalni ljubičasti hover */
  && {
    border: 1px solid var(--bg-300);
    background-color: var(--bg-100);
    color: var(--text-100);
  }
  &&:hover {
    background-color: var(--bg-200);
    border-color: var(--primary-200);
    color: var(--primary-200);
  }
`;

const PdfBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 10px 14px;
  border-radius: var(--border-radius-base);
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  border: none;
  background: var(--primary-100);
  color: var(--bg-100);
  font-family: "Montserrat", sans-serif;
  width: 100%;
  @media (min-width: 720px) {
    width: auto;
    min-width: 128px;
  }
  box-shadow: 0 2px 6px rgba(0, 32, 105, 0.12);
  &:hover {
    background: var(--primary-200);
  }
`;

const ReorderBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 10px 14px;
  border-radius: var(--border-radius-base);
  border: 1px solid var(--primary-200);
  background: var(--bg-100);
  color: var(--primary-200);
  font-size: 14px;
  font-weight: 600;
  font-family: "Montserrat", sans-serif;
  cursor: pointer;
  width: 100%;
  @media (min-width: 720px) {
    width: auto;
    min-width: 128px;
  }
  &:hover:not(:disabled) {
    background: var(--bg-200);
  }
  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }
`;

/** Iznad korpe (modal ~1050) da korisnik uvek vidi upozorenje. */
const ReorderToastWrap = styled.div`
  position: fixed;
  top: max(12px, env(safe-area-inset-top, 0px));
  left: 50%;
  transform: translateX(-50%);
  z-index: 1070;
  width: min(440px, calc(100vw - 24px));
  padding: 14px 42px 14px 16px;
  box-sizing: border-box;
  border-radius: var(--border-radius-large);
  background: var(--bg-100);
  border: 1px solid rgba(0, 32, 105, 0.2);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.14);
  font-size: 14px;
  line-height: 1.45;
  color: var(--text-100);
`;

const ReorderToastClose = styled.button`
  position: absolute;
  top: 6px;
  right: 6px;
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: var(--border-radius-base);
  background: transparent;
  color: var(--text-200);
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
  &:hover {
    color: var(--text-100);
    background: var(--bg-200);
  }
`;

const TotalLine = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: var(--text-100);
  font-variant-numeric: tabular-nums;
  padding: 4px 0 2px;
  @media (min-width: 720px) {
    padding: 6px 12px;
    border-radius: 999px;
    background: var(--bg-200);
    border: 1px solid var(--bg-300);
    align-self: flex-end;
  }
`;

const OrderBody = styled.div`
  padding: 12px 0;
  background: var(--bg-200);
  border-top: 1px solid var(--bg-300);
  box-sizing: border-box;
  width: 100%;

  @media (min-width: 640px) {
    padding: 16px 12px;
  }

  @media (min-width: 720px) {
    padding: var(--spacing-md);
  }
`;

const SectionTitle = styled.h3`
  margin: 0 12px 12px;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-200);

  @media (min-width: 640px) {
    margin-left: 0;
    margin-right: 0;
  }
`;

/** Desktop: tabela */
const ItemsHead = styled.div`
  display: none;
  @media (min-width: 640px) {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 64px 80px 92px;
    gap: 8px 10px;
    padding: 10px 12px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    color: var(--text-200);
    background: var(--bg-100);
    border-radius: var(--border-radius-base);
    border: 1px solid var(--bg-300);
  }
`;

const Num = styled.span`
  text-align: right;
  font-variant-numeric: tabular-nums;
`;

const ItemRowDesktop = styled.div`
  display: none;
  @media (min-width: 640px) {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 64px 80px 92px;
    gap: 8px 10px;
    align-items: start;
    padding: 12px;
    font-size: 13px;
    border-bottom: 1px solid var(--bg-300);
    background: var(--bg-100);
    &:last-child {
      border-bottom: none;
      border-radius: 0 0 var(--border-radius-base) var(--border-radius-base);
    }
  }
`;

const ProductName = styled.div`
  line-height: 1.45;
  font-size: 14px;
`;

/** Isti obrazac kao ProductCard: kategorija · naziv */
const OrderLineCategory = styled.span`
  color: var(--text-200);
  font-weight: 400;
`;

const OrderLineSep = styled.span`
  color: var(--text-200);
  font-weight: 400;
`;

const OrderLineTitle = styled.span`
  color: var(--text-100);
  font-weight: 500;
`;

/** Mobilni: kartica po stavci — puna širina */
const ItemMobile = styled.div`
  display: block;
  padding: 14px 12px;
  border-bottom: 1px solid var(--bg-300);
  box-sizing: border-box;
  width: 100%;

  &:first-child {
    padding-top: 8px;
  }
  &:last-child {
    border-bottom: none;
    padding-bottom: 8px;
  }

  @media (min-width: 640px) {
    display: none;
  }
`;

const MobileNums = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px 10px;
  margin-top: 12px;
  width: 100%;
`;

const MobileCell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
`;

const MobileLabel = styled.span`
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-200);
`;

const MobileVal = styled.span`
  font-size: clamp(15px, 4.5vw, 18px);
  font-weight: 600;
  color: var(--text-100);
  font-variant-numeric: tabular-nums;
  word-break: break-word;
  line-height: 1.3;
`;

const ItemsStack = styled.div`
  width: 100%;
  max-width: 100%;
  border-radius: var(--border-radius-base);
  border: 1px solid var(--bg-300);
  overflow: hidden;
  background: var(--bg-100);
  box-sizing: border-box;

  @media (max-width: ${MOBILE_MAX}) {
    border: none;
    border-radius: 0;
    background: var(--bg-100);
    overflow: visible;
  }
`;

const SummaryBlock = styled.div`
  margin-top: 16px;
  padding: 16px 12px 0;
  border-top: 1px solid var(--bg-300);

  @media (min-width: 640px) {
    padding-left: 0;
    padding-right: 0;
  }
`;

const SummaryLine = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
  font-size: 14px;
  color: var(--text-200);
  margin-bottom: 8px;
  span:last-child {
    font-weight: 600;
    color: var(--text-100);
    font-variant-numeric: tabular-nums;
  }
`;

const SummaryTotal = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-100);
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--bg-300);
  span:last-child {
    font-variant-numeric: tabular-nums;
  }
`;

const AddrBlock = styled.div`
  margin: 16px 12px 0;
  padding: 14px;
  border-radius: var(--border-radius-base);
  background: var(--bg-100);
  border: 1px solid var(--bg-300);

  @media (min-width: 640px) {
    margin-left: 0;
    margin-right: 0;
  }
  font-size: 13px;
  line-height: 1.55;
  color: var(--text-200);
  white-space: pre-line;

  strong {
    display: block;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--text-200);
    margin-bottom: 8px;
  }
`;

const LoadMoreWrap = styled.div`
  display: flex;
  justify-content: center;
  margin-top: var(--spacing-lg);
  width: 100%;

  @media (min-width: ${DESKTOP_2COL}) {
    grid-column: 1 / -1;
  }
`;

function sumOrderLineTotals(order) {
  let s = 0;
  let any = false;
  for (const it of order.order_items || []) {
    const q = Number(it.quantity) || 0;
    const u = parseMoneyAmount(it.price);
    if (u != null) {
      s += q * u;
      any = true;
    }
  }
  return any ? s : null;
}

function formatOrderDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return String(iso);
  }
}

function orderRefLabel(order) {
  if (order?.customer_order_id) return order.customer_order_id;
  return `#${order?.id ?? "—"}`;
}

function OrderLineProductLabel({ item }) {
  const p = item?.product_details;
  if (!p) return "—";
  const category = p.category_name ? String(p.category_name).trim() : "";
  const name = p.name ? String(p.name).trim() : "";
  if (!category && !name) return "—";
  if (category && name) {
    return (
      <>
        <OrderLineCategory>{category}</OrderLineCategory>
        <OrderLineSep> · </OrderLineSep>
        <OrderLineTitle>{name}</OrderLineTitle>
      </>
    );
  }
  return <OrderLineTitle>{name || category}</OrderLineTitle>;
}

/** Isto pravilo kao na PDP / kartici proizvoda: `out_of_stock` se ne sme dodati u korpu. */
function productIsAvailableForCart(product) {
  return product?.is_in_stock !== "out_of_stock";
}

function lineTotalAmount(item) {
  const q = Number(item.quantity) || 0;
  const unit = parseMoneyAmount(item.price);
  if (unit == null) return null;
  return q * unit;
}

function paymentMethodLabel(code, t) {
  if (!code) return "—";
  const key = String(code).toLowerCase();
  const map = { cod: "COD", card: "CARD", paypal: "PAYPAL" };
  const k = map[key] || String(code).toUpperCase();
  return t(`PAYMENT_METHOD.${k}`, { defaultValue: String(code) });
}

function OrderHistorySection({ orders, isEmailVerified }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { setIsCartOpen } = useContext(ProductContext);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [expandedIds, setExpandedIds] = useState([]);
  const [reorderBusyId, setReorderBusyId] = useState(null);
  const [reorderNotice, setReorderNotice] = useState(null);

  const sorted = useMemo(
    () =>
      [...(orders || [])].sort((a, b) => {
        const ta = a?.created_at ? new Date(a.created_at).getTime() : 0;
        const tb = b?.created_at ? new Date(b.created_at).getTime() : 0;
        return tb - ta;
      }),
    [orders]
  );

  const visible = sorted.slice(0, visibleCount);
  const hasMore = sorted.length > visible.length;

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [sorted.length]);

  useEffect(() => {
    if (!reorderNotice) return;
    const timer = window.setTimeout(() => setReorderNotice(null), 14000);
    return () => window.clearTimeout(timer);
  }, [reorderNotice]);

  const buildPdfLabels = (order) => ({
    title: t("ACCOUNT.INVOICE_PDF_TITLE"),
    orderRef: t("ACCOUNT.INVOICE_ORDER_REF"),
    date: t("ACCOUNT.INVOICE_DATE"),
    status: t("ACCOUNT.ORDER_STATUS"),
    shipTo: t("ACCOUNT.INVOICE_SHIP_TO"),
    phone: t("LABELS.PHONE_NUMBER"),
    colProduct: t("ACCOUNT.ORDER_ITEMS_PRODUCT"),
    colAmount: t("ACCOUNT.ORDER_COL_AMOUNT"),
    colPrice: t("ACCOUNT.ORDER_COL_PRICE"),
    colLineTotal: t("ACCOUNT.ORDER_COL_LINE_TOTAL"),
    subtotal: t("CHECKOUT.SUBTOTAL"),
    shipping: t("CHECKOUT.SHIPPING"),
    vat: t("CART.VAT"),
    vatIncluded: t("CART.INCLUDED"),
    totalLabel: t("ACCOUNT.INVOICE_TOTAL_SIMPLE"),
    filePrefix: t("ACCOUNT.INVOICE_FILE_PREFIX"),
    paymentLine: order.payment_method
      ? `${t("CHECKOUT.PAYMENT")}: ${paymentMethodLabel(order.payment_method, t)}`
      : "",
  });

  const handlePdf = (order) => {
    try {
      downloadOrderInvoicePdf(order, buildPdfLabels(order));
    } catch (err) {
      console.error(err);
    }
  };

  const handleReorder = async (order) => {
    const oid = order.id;
    const items = order.order_items || [];
    if (!items.length) return;

    setReorderBusyId(oid);
    setReorderNotice(null);

    dispatch(cartActions.resetCart());

    let added = 0;
    let skippedOutOfStock = 0;
    let skippedOther = 0;

    for (const item of items) {
      const slug = item.product_details?.slug;
      const qty = Number(item.quantity) || 0;
      if (!slug || qty <= 0) {
        skippedOther += 1;
        continue;
      }
      try {
        const product = await APIService.GetProductBySlug(slug);
        if (!productIsAvailableForCart(product)) {
          skippedOutOfStock += 1;
          continue;
        }
        dispatch(
          cartActions.addToCart({
            product: { ...product, slug },
            quantity: qty,
          })
        );
        added += 1;
      } catch (e) {
        console.error(e);
        skippedOther += 1;
      }
    }

    setReorderBusyId(null);

    const failed = skippedOutOfStock + skippedOther;
    if (failed > 0) {
      let message;
      if (skippedOutOfStock > 0 && skippedOther === 0) {
        message =
          added > 0
            ? t("ACCOUNT.REORDER_NOTICE_PARTIAL_OOS", {
                count: skippedOutOfStock,
              })
            : t("ACCOUNT.REORDER_NOTICE_ALL_OOS");
      } else if (skippedOutOfStock > 0 && skippedOther > 0) {
        message =
          added > 0
            ? t("ACCOUNT.REORDER_NOTICE_MIXED_PARTIAL", {
                stockCount: skippedOutOfStock,
                otherCount: skippedOther,
              })
            : t("ACCOUNT.REORDER_NOTICE_MIXED_ALL_FAILED", {
                stockCount: skippedOutOfStock,
                otherCount: skippedOther,
              });
      } else {
        message =
          added > 0
            ? t("ACCOUNT.REORDER_PARTIAL", { count: skippedOther })
            : t("ACCOUNT.REORDER_ALL_FAILED");
      }
      setReorderNotice({
        orderId: oid,
        message,
      });
    }

    setIsCartOpen(true);
  };

  if (!isEmailVerified) {
    return (
      <>
        <Muted>{t("ACCOUNT.ORDERS_NEED_VERIFICATION")}</Muted>
        <Actions>
          <RouterLinkButton to="/verify">{t("ACCOUNT.VERIFY_EMAIL_CTA")}</RouterLinkButton>
        </Actions>
      </>
    );
  }

  if (!sorted.length) {
    return <Muted>{t("ACCOUNT.NO_ORDERS")}</Muted>;
  }

  const reorderToast =
    typeof document !== "undefined" && reorderNotice
      ? createPortal(
          <ReorderToastWrap role="alert">
            {reorderNotice.message}
            <ReorderToastClose
              type="button"
              aria-label={t("ACCOUNT.REORDER_TOAST_DISMISS")}
              onClick={() => setReorderNotice(null)}
            >
              ×
            </ReorderToastClose>
          </ReorderToastWrap>,
          document.body
        )
      : null;

  return (
    <>
      {reorderToast}
      <OrdersLayout>
        {visible.map((order) => {
          const id = order.id;
          const open = expandedIds.includes(id);
          const sym = order.currency_symbol || "€";

          const subApi = parseMoneyAmount(order.subtotal);
          const sumLines = sumOrderLineTotals(order);
          const subtotalDisplay =
            subApi != null
              ? `${sym}${subApi.toFixed(2)}`
              : sumLines != null
                ? `${sym}${sumLines.toFixed(2)}`
                : "—";

          return (
            <OrderCard key={id}>
              <OrderHeaderBar $open={open}>
                <OrderHeaderTop>
                  <OrderHeaderMain>
                    <OrderRef>{orderRefLabel(order)}</OrderRef>
                    <MetaRow>
                      <MetaPiece>
                        <strong>{t("ACCOUNT.ORDER_DATE")}</strong>
                        {formatOrderDate(order.created_at)}
                      </MetaPiece>
                      <MetaPiece>
                        <strong>{t("ACCOUNT.ORDER_STATUS")}</strong>
                        {order.order_status ?? "—"}
                      </MetaPiece>
                      {order.payment_method ? (
                        <MetaPiece>
                          <strong>{t("CHECKOUT.PAYMENT")}</strong>
                          {paymentMethodLabel(order.payment_method, t)}
                        </MetaPiece>
                      ) : null}
                    </MetaRow>
                  </OrderHeaderMain>
                  <HeaderAside>
                    <TotalLine>
                      {t("ACCOUNT.ORDER_TOTAL")}:{" "}
                      {formatMoneyParsed(order.total_price, sym)}
                    </TotalLine>
                    <HeaderButtonRow>
                      <PdfBtn type="button" onClick={() => handlePdf(order)}>
                        {t("ACCOUNT.ORDER_DOWNLOAD_PDF")}
                      </PdfBtn>
                      <ReorderBtn
                        type="button"
                        disabled={
                          reorderBusyId === id ||
                          !(order.order_items && order.order_items.length)
                        }
                        onClick={() => handleReorder(order)}
                      >
                        {reorderBusyId === id
                          ? t("ACCOUNT.REORDERING")
                          : t("ACCOUNT.ORDER_REORDER")}
                      </ReorderBtn>
                      <ToggleBtn
                        type="button"
                        onClick={() =>
                          setExpandedIds((prev) =>
                            open ? prev.filter((x) => x !== id) : [...prev, id]
                          )
                        }
                        aria-expanded={open}
                      >
                        {open
                          ? t("ACCOUNT.ORDER_HIDE_DETAILS")
                          : t("ACCOUNT.ORDER_SHOW_DETAILS")}
                      </ToggleBtn>
                    </HeaderButtonRow>
                  </HeaderAside>
                </OrderHeaderTop>
              </OrderHeaderBar>

              {open ? (
                <OrderBody>
                  <SectionTitle>{t("CHECKOUT.SUMMARY")}</SectionTitle>

                  <ItemsStack>
                    <ItemsHead>
                      <span>{t("ACCOUNT.ORDER_ITEMS_PRODUCT")}</span>
                      <Num>{t("ACCOUNT.ORDER_COL_AMOUNT")}</Num>
                      <Num>{t("ACCOUNT.ORDER_COL_PRICE")}</Num>
                      <Num>{t("ACCOUNT.ORDER_COL_LINE_TOTAL")}</Num>
                    </ItemsHead>
                    {(order.order_items || []).map((item, idx) => {
                      const unit = parseMoneyAmount(item.price);
                      const lt = lineTotalAmount(item);
                      const qty = item.quantity ?? "—";
                      const priceStr =
                        unit != null ? `${sym}${unit.toFixed(2)}` : "—";
                      const lineStr =
                        lt != null ? `${sym}${lt.toFixed(2)}` : "—";

                      return (
                        <div key={idx}>
                          <ItemRowDesktop>
                            <ProductName>
                              <OrderLineProductLabel item={item} />
                            </ProductName>
                            <Num>{qty}</Num>
                            <Num>{priceStr}</Num>
                            <Num>{lineStr}</Num>
                          </ItemRowDesktop>
                          <ItemMobile>
                            <ProductName>
                              <OrderLineProductLabel item={item} />
                            </ProductName>
                            <MobileNums>
                              <MobileCell>
                                <MobileLabel>
                                  {t("ACCOUNT.ORDER_COL_AMOUNT")}
                                </MobileLabel>
                                <MobileVal>{qty}</MobileVal>
                              </MobileCell>
                              <MobileCell>
                                <MobileLabel>
                                  {t("ACCOUNT.ORDER_COL_PRICE")}
                                </MobileLabel>
                                <MobileVal>{priceStr}</MobileVal>
                              </MobileCell>
                              <MobileCell>
                                <MobileLabel>
                                  {t("ACCOUNT.ORDER_COL_LINE_TOTAL")}
                                </MobileLabel>
                                <MobileVal>{lineStr}</MobileVal>
                              </MobileCell>
                            </MobileNums>
                          </ItemMobile>
                        </div>
                      );
                    })}
                  </ItemsStack>

                  <SummaryBlock>
                    <SummaryLine>
                      <span>{t("CHECKOUT.SUBTOTAL")}</span>
                      <span>{subtotalDisplay}</span>
                    </SummaryLine>
                    <SummaryLine>
                      <span>{t("CHECKOUT.SHIPPING")}</span>
                      <span>{formatMoneyParsed(order.shipping_cost, sym)}</span>
                    </SummaryLine>
                    <SummaryLine>
                      <span>{t("CART.VAT")}</span>
                      <span>{t("CART.INCLUDED")}</span>
                    </SummaryLine>
                    <SummaryTotal>
                      <span>{t("ACCOUNT.INVOICE_TOTAL_SIMPLE")}</span>
                      <span>{formatMoneyParsed(order.total_price, sym)}</span>
                    </SummaryTotal>
                  </SummaryBlock>

                  {order.address_details ? (
                    <AddrBlock>
                      <strong>{t("ACCOUNT.INVOICE_SHIP_TO")}</strong>
                      {[
                        [order.address_details.street, order.address_details.street_number]
                          .filter(Boolean)
                          .join(" "),
                        [order.address_details.postal_code, order.address_details.city]
                          .filter(Boolean)
                          .join(" "),
                        order.address_details.country,
                        order.address_details.phone_number,
                      ]
                        .filter(Boolean)
                        .join("\n")}
                    </AddrBlock>
                  ) : null}
                </OrderBody>
              ) : null}
            </OrderCard>
          );
        })}

        {hasMore ? (
          <LoadMoreWrap>
            <GhostButton
              type="button"
              onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
            >
              {t("ACCOUNT.ORDERS_SHOW_MORE")}
            </GhostButton>
          </LoadMoreWrap>
        ) : null}
      </OrdersLayout>
    </>
  );
}

export default OrderHistorySection;
