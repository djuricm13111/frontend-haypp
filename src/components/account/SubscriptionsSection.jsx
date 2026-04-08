import { useCallback, useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import { useTranslation } from "react-i18next";
import APIService, { normalizeProductListResponse } from "../../services/APIService";
import { getSubscriptionLineFreqLabelKey } from "../../utils/subscriptionLabels";

const pulse = keyframes`
  0% { opacity: 0.5; }
  50% { opacity: 1; }
  100% { opacity: 0.5; }
`;

const confirmFadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const confirmPop = keyframes`
  from {
    opacity: 0;
    transform: scale(0.96) translateY(8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
`;

const Root = styled.div`
  width: 100%;
  max-width: 640px;
`;

const Alert = styled.div`
  margin: 0 0 var(--spacing-md);
  padding: 12px 14px;
  border-radius: var(--border-radius-base);
  font-size: 14px;
  line-height: 1.45;
  background: ${(p) =>
    p.$variant === "error"
      ? "rgba(198, 40, 40, 0.08)"
      : "var(--bg-200)"};
  color: ${(p) =>
    p.$variant === "error" ? "var(--error-color, #b71c1c)" : "var(--text-100)"};
  border: 1px solid
    ${(p) =>
      p.$variant === "error"
        ? "rgba(198, 40, 40, 0.25)"
        : "var(--bg-300)"};
`;

const LoadingBlock = styled.div`
  padding: var(--spacing-xl) var(--spacing-md);
  text-align: center;
  font-size: 14px;
  color: var(--text-200);
  animation: ${pulse} 1.2s ease-in-out infinite;
`;

const EmptyCard = styled.div`
  text-align: center;
  padding: var(--spacing-xl) var(--spacing-lg);
  border-radius: var(--border-radius-large);
  background: linear-gradient(
    165deg,
    var(--bg-200) 0%,
    var(--bg-100) 100%
  );
  border: 1px dashed var(--bg-300);
`;

const EmptyIcon = styled.div`
  width: 56px;
  height: 56px;
  margin: 0 auto var(--spacing-md);
  border-radius: 50%;
  background: var(--bg-100);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-200);
`;

const EmptyText = styled.p`
  margin: 0;
  font-size: 15px;
  line-height: 1.55;
  color: var(--text-200);
  max-width: 28rem;
  margin-left: auto;
  margin-right: auto;
`;

const SubCard = styled.article`
  position: relative;
  margin-bottom: var(--spacing-lg);
  border-radius: var(--border-radius-large);
  background: var(--bg-100);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid var(--bg-300);
  overflow: hidden;
`;

const AccentBar = styled.div`
  height: 4px;
  background: linear-gradient(
    90deg,
    var(--primary-100) 0%,
    var(--primary-200) 100%
  );
`;

const CardInner = styled.div`
  padding: var(--spacing-md) var(--spacing-md) var(--spacing-lg);
`;

const HeadRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
`;

const FreqTitle = styled.h3`
  margin: 0;
  font-family: "Montserrat", sans-serif;
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-100);
  line-height: 1.3;
  letter-spacing: -0.02em;
`;

const StatusPill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 11px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  flex-shrink: 0;
  background: ${(p) =>
    p.$active ? "rgba(0, 120, 90, 0.12)" : "var(--bg-300)"};
  color: ${(p) => (p.$active ? "var(--primary-200)" : "var(--text-200)")};
`;

const StatusDot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${(p) => (p.$active ? "var(--primary-100)" : "var(--text-200)")};
`;

const ScheduleBox = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  margin-bottom: var(--spacing-md);
  border-radius: var(--border-radius-base);
  background: var(--bg-200);
  border: 1px solid var(--bg-300);
  font-size: 13px;
  line-height: 1.45;
  color: var(--text-100);
`;

const ScheduleIcon = styled.span`
  flex-shrink: 0;
  margin-top: 1px;
  color: var(--primary-200);
  opacity: 0.9;
`;

const ItemsLabel = styled.div`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-200);
  margin-bottom: 8px;
`;

const ItemRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  margin-bottom: 8px;
  border-radius: var(--border-radius-base);
  background: var(--bg-200);
  border: 1px solid var(--bg-300);
  transition: border-color 0.15s ease, box-shadow 0.15s ease;

  &:last-of-type {
    margin-bottom: 0;
  }

  &:hover {
    border-color: rgba(0, 0, 0, 0.08);
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.04);
  }
`;

const ItemIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: var(--bg-100);
  border: 1px solid var(--bg-300);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-200);
  flex-shrink: 0;
`;

const ItemBody = styled.div`
  flex: 1;
  min-width: 0;
`;

const ItemName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: var(--text-100);
  line-height: 1.35;
  overflow-wrap: anywhere;
`;

const ItemSku = styled.div`
  font-size: 12px;
  color: var(--text-200);
  margin-top: 2px;
`;

const ItemRight = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
`;

const QtyBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  background: var(--bg-100);
  color: var(--text-100);
  border: 1px solid var(--bg-300);
`;

const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  padding: 0;
  border: none;
  border-radius: var(--border-radius-base);
  background: transparent;
  color: var(--error-color, #c62828);
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s ease;

  &:hover {
    background: rgba(198, 40, 40, 0.08);
  }
  &:focus-visible {
    outline: 2px solid var(--primary-100);
    outline-offset: 2px;
  }
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const ActionsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: var(--spacing-md);
`;

const PrimaryBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: var(--border-radius-base);
  font-weight: 600;
  font-size: 14px;
  font-family: inherit;
  cursor: pointer;
  border: none;
  background: var(--primary-100);
  color: var(--bg-100);
  transition: background 0.15s ease, transform 0.1s ease;

  &:hover:not(:disabled) {
    background: var(--primary-200);
  }
  &:active:not(:disabled) {
    transform: scale(0.98);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const OutlineBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: var(--border-radius-base);
  font-weight: 600;
  font-size: 14px;
  font-family: inherit;
  cursor: pointer;
  border: 1px solid var(--bg-300);
  background: var(--bg-100);
  color: var(--text-100);
  transition: border-color 0.15s ease, background 0.15s ease;

  &:hover:not(:disabled) {
    border-color: var(--primary-200);
    background: var(--bg-200);
  }
  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

const DangerOutlineBtn = styled(OutlineBtn)`
  border-color: rgba(198, 40, 40, 0.35);
  color: var(--error-color, #c62828);

  &:hover:not(:disabled) {
    background: rgba(198, 40, 40, 0.06);
    border-color: rgba(198, 40, 40, 0.5);
  }
`;

const AddPanel = styled.div`
  margin-top: var(--spacing-md);
  padding: var(--spacing-md);
  border-radius: var(--border-radius-large);
  background: var(--bg-200);
  border: 1px solid var(--bg-300);
`;

const AddPanelTitle = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: var(--text-100);
  margin-bottom: var(--spacing-sm);
`;

const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-200);
  margin-bottom: var(--spacing-sm);
  text-transform: uppercase;
  letter-spacing: 0.03em;
`;

const SearchWrap = styled.div`
  position: relative;
`;

const SearchIcon = styled.span`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: var(--text-200);
  display: flex;
`;

const Input = styled.input`
  width: 100%;
  box-sizing: border-box;
  padding: 11px 12px 11px 40px;
  border-radius: var(--border-radius-base);
  border: 1px solid var(--bg-300);
  font-size: 15px;
  font-family: inherit;
  background: var(--bg-100);
  color: var(--text-100);
  transition: border-color 0.15s ease, box-shadow 0.15s ease;

  &:focus {
    outline: none;
    border-color: var(--primary-200);
    box-shadow: 0 0 0 3px rgba(0, 100, 80, 0.12);
  }
`;

const QtyInput = styled(Input)`
  padding: 10px 12px;
  max-width: 120px;
`;

const SearchHits = styled.ul`
  list-style: none;
  margin: 0 0 var(--spacing-sm);
  padding: 0;
  max-height: 220px;
  overflow: auto;
  border-radius: var(--border-radius-base);
  border: 1px solid var(--bg-300);
  background: var(--bg-100);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
`;

const HitRow = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: left;
  padding: 10px 12px;
  border: none;
  border-bottom: 1px solid var(--bg-300);
  background: var(--bg-100);
  cursor: pointer;
  font: inherit;
  color: var(--text-100);
  transition: background 0.12s ease;

  &:last-child {
    border-bottom: none;
  }
  &:hover {
    background: var(--bg-200);
  }
`;

const HitThumb = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 8px;
  flex-shrink: 0;
  background: var(--bg-200) center / contain no-repeat;
  border: 1px solid var(--bg-300);
`;

const HitName = styled.span`
  font-size: 14px;
  font-weight: 500;
  line-height: 1.35;
  flex: 1;
  min-width: 0;
`;

const PickedBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  margin-bottom: var(--spacing-sm);
  border-radius: var(--border-radius-base);
  background: rgba(0, 100, 80, 0.08);
  border: 1px solid rgba(0, 100, 80, 0.2);
  font-size: 14px;
  color: var(--text-100);
`;

const SearchingHint = styled.p`
  margin: 0 0 var(--spacing-sm);
  font-size: 13px;
  color: var(--text-200);
  font-style: italic;
`;

const ConfirmOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: var(--zindex-modal);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-md);
  box-sizing: border-box;
  background: rgba(15, 23, 42, 0.48);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  animation: ${confirmFadeIn} 0.2s ease;
`;

const ConfirmPanel = styled.div`
  width: 100%;
  max-width: 420px;
  border-radius: var(--border-radius-large);
  background: var(--bg-100);
  box-shadow:
    0 4px 8px rgba(0, 0, 0, 0.04),
    0 20px 48px rgba(0, 0, 0, 0.16);
  border: 1px solid var(--bg-300);
  overflow: hidden;
  animation: ${confirmPop} 0.22s cubic-bezier(0.22, 1, 0.36, 1);
`;

const ConfirmHero = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-lg) var(--spacing-md) var(--spacing-sm);
  background: linear-gradient(
    180deg,
    rgba(198, 40, 40, 0.07) 0%,
    transparent 100%
  );
`;

const ConfirmIconWrap = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(198, 40, 40, 0.1);
  color: var(--error-color, #b71c1c);
`;

const ConfirmBody = styled.div`
  padding: 0 var(--spacing-lg) var(--spacing-lg);
  text-align: center;
`;

const ConfirmTitle = styled.h2`
  margin: 0 0 var(--spacing-sm);
  font-family: "Montserrat", sans-serif;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-100);
  line-height: 1.3;
  letter-spacing: -0.02em;
`;

const ConfirmInterval = styled.div`
  display: inline-block;
  margin-bottom: var(--spacing-md);
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  color: var(--primary-200);
  background: rgba(0, 32, 105, 0.06);
  border: 1px solid rgba(0, 32, 105, 0.1);
`;

const ConfirmCopy = styled.p`
  margin: 0 0 var(--spacing-sm);
  font-size: 15px;
  line-height: 1.55;
  color: var(--text-100);
`;

const ConfirmNote = styled.p`
  margin: 0 0 var(--spacing-lg);
  font-size: 13px;
  line-height: 1.45;
  color: var(--text-200);
`;

const ConfirmActions = styled.div`
  display: flex;
  flex-direction: column-reverse;
  gap: 10px;

  @media (min-width: 400px) {
    flex-direction: row;
    justify-content: center;
    flex-wrap: wrap;
  }
`;

const ConfirmBtnPrimary = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0 20px;
  border-radius: var(--border-radius-base);
  font-weight: 600;
  font-size: 15px;
  font-family: inherit;
  cursor: pointer;
  border: none;
  flex: 1;
  min-width: 140px;
  background: var(--error-color, #c62828);
  color: var(--bg-100);
  transition:
    background 0.15s ease,
    opacity 0.15s ease;

  &:hover:not(:disabled) {
    filter: brightness(0.95);
  }
  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }
`;

const ConfirmBtnGhost = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0 20px;
  border-radius: var(--border-radius-base);
  font-weight: 600;
  font-size: 15px;
  font-family: inherit;
  cursor: pointer;
  border: 1px solid var(--bg-300);
  flex: 1;
  min-width: 140px;
  background: var(--bg-100);
  color: var(--text-100);
  transition: border-color 0.15s ease, background 0.15s ease;

  &:hover:not(:disabled) {
    border-color: var(--primary-200);
    background: var(--bg-200);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

function formatApiError(data) {
  if (data == null) return null;
  if (typeof data === "string") return data;
  if (data.detail) return String(data.detail);
  if (Array.isArray(data)) return data.map(String).join(" ");
  const parts = [];
  for (const k of Object.keys(data)) {
    const v = data[k];
    if (Array.isArray(v)) parts.push(v.join(" "));
    else if (v && typeof v === "object") parts.push(JSON.stringify(v));
    else parts.push(String(v));
  }
  return parts.join(" ");
}

function formatWhen(iso, locale) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(locale, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function intervalLabel(t, intervalDays) {
  const key = getSubscriptionLineFreqLabelKey(intervalDays);
  if (key) return t(key);
  return t("ACCOUNT.SUBSCRIPTION_EVERY", { days: intervalDays });
}

function CalendarSvg() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8 2v3M16 2v3M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PackageSvg() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M21 8l-9-4-9 4v10l9 4 9-4V8z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M3.6 8.6L12 12l8.4-3.4M12 22V12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrashSvg() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 002 2h6a2 2 0 002-2l1-12M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlusSvg() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function RepeatSvg() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M17 1l4 4-4 4M21 5H7a4 4 0 00-4 4M7 23l-4-4 4-4M3 19h14a4 4 0 004-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WarningSvg() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function SubscriptionsSection({ accessToken }) {
  const { t, i18n } = useTranslation();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [actionErr, setActionErr] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchHits, setSearchHits] = useState([]);
  const [pickedProduct, setPickedProduct] = useState(null);
  const [addQty, setAddQty] = useState(1);
  const [addForId, setAddForId] = useState(null);
  const [searching, setSearching] = useState(false);
  const [cancelTargetId, setCancelTargetId] = useState(null);
  const [cancelSubmitting, setCancelSubmitting] = useState(false);

  const load = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setErr(null);
    try {
      const data = await APIService.listSubscriptions(accessToken);
      setList(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(formatApiError(e.response?.data) || e.message);
      setList([]);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchHits([]);
      return;
    }
    const tmr = setTimeout(async () => {
      setSearching(true);
      try {
        const raw = await APIService.SearchProducts(searchQuery.trim());
        setSearchHits(normalizeProductListResponse(raw).slice(0, 12));
      } catch {
        setSearchHits([]);
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => clearTimeout(tmr);
  }, [searchQuery]);

  useEffect(() => {
    if (cancelTargetId == null) return;
    const onKey = (e) => {
      if (e.key === "Escape" && !cancelSubmitting) setCancelTargetId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cancelTargetId, cancelSubmitting]);

  useEffect(() => {
    if (cancelTargetId == null) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [cancelTargetId]);

  const closeCancelModal = () => {
    if (cancelSubmitting) return;
    setCancelTargetId(null);
  };

  const confirmCancelSubscription = async () => {
    if (cancelTargetId == null || cancelSubmitting) return;
    setCancelSubmitting(true);
    setActionErr(null);
    try {
      await APIService.cancelSubscription(cancelTargetId, accessToken);
      setCancelTargetId(null);
      await load();
    } catch (e) {
      setActionErr(formatApiError(e.response?.data) || e.message);
    } finally {
      setCancelSubmitting(false);
    }
  };

  const removeItem = async (subId, itemId) => {
    setActionErr(null);
    try {
      await APIService.deleteSubscriptionItem(subId, itemId, accessToken);
      await load();
    } catch (e) {
      setActionErr(formatApiError(e.response?.data) || e.message);
    }
  };

  const addProduct = async (subId) => {
    if (!pickedProduct?.id) {
      setActionErr(t("ACCOUNT.SUBSCRIPTIONS_PICK_PRODUCT"));
      return;
    }
    setActionErr(null);
    try {
      await APIService.addSubscriptionItem(
        subId,
        { product: pickedProduct.id, quantity: Math.max(1, Number(addQty) || 1) },
        accessToken
      );
      setPickedProduct(null);
      setSearchQuery("");
      setSearchHits([]);
      setAddForId(null);
      await load();
    } catch (e) {
      setActionErr(formatApiError(e.response?.data) || e.message);
    }
  };

  const resetAddPanel = () => {
    setAddForId(null);
    setPickedProduct(null);
    setSearchQuery("");
    setSearchHits([]);
    setActionErr(null);
  };

  if (loading) {
    return (
      <LoadingBlock>{t("ACCOUNT.SUBSCRIPTIONS_LOADING")}</LoadingBlock>
    );
  }

  if (err) {
    return <Alert role="alert" $variant="error">{err}</Alert>;
  }

  const pendingCancelSub =
    cancelTargetId != null
      ? list.find((s) => String(s.id) === String(cancelTargetId))
      : null;

  return (
    <Root>
      {actionErr && (
        <Alert role="alert" $variant="error">
          {actionErr}
        </Alert>
      )}
      {!list.length && (
        <EmptyCard>
          <EmptyIcon aria-hidden>
            <RepeatSvg />
          </EmptyIcon>
          <EmptyText>{t("ACCOUNT.SUBSCRIPTIONS_EMPTY")}</EmptyText>
        </EmptyCard>
      )}
      {list.map((sub) => {
        const active = sub.status === "active";
        const items = sub.items || [];
        return (
          <SubCard key={sub.id}>
            <AccentBar />
            <CardInner>
              <HeadRow>
                <FreqTitle>{intervalLabel(t, sub.interval_days)}</FreqTitle>
                <StatusPill $active={active}>
                  <StatusDot $active={active} />
                  {active
                    ? t("ACCOUNT.SUBSCRIPTION_STATUS_ACTIVE")
                    : t("ACCOUNT.SUBSCRIPTION_STATUS_CANCELLED")}
                </StatusPill>
              </HeadRow>

              <ScheduleBox>
                <ScheduleIcon>
                  <CalendarSvg />
                </ScheduleIcon>
                <div>
                  {active
                    ? t("ACCOUNT.SUBSCRIPTION_NEXT", {
                        date: formatWhen(sub.next_order_at, i18n.language),
                      })
                    : t("ACCOUNT.SUBSCRIPTION_ENDED", {
                        date: formatWhen(sub.cancelled_at, i18n.language),
                      })}
                </div>
              </ScheduleBox>

              <ItemsLabel>{t("ACCOUNT.SUBSCRIPTION_ITEMS_TITLE")}</ItemsLabel>
              {items.map((it) => {
                const canRemove = active && items.length > 1;
                const label =
                  it.product_name || `Product #${it.product_id}`;
                return (
                  <ItemRow key={it.id}>
                    <ItemIcon>
                      <PackageSvg />
                    </ItemIcon>
                    <ItemBody>
                      <ItemName>{label}</ItemName>
                      {it.sku ? <ItemSku>{it.sku}</ItemSku> : null}
                    </ItemBody>
                    <ItemRight>
                      <QtyBadge title={t("ACCOUNT.SUBSCRIPTION_QTY")}>
                        ×{it.quantity}
                      </QtyBadge>
                      {canRemove ? (
                        <IconButton
                          type="button"
                          onClick={() => removeItem(sub.id, it.id)}
                          aria-label={t("ACCOUNT.SUBSCRIPTION_REMOVE_ARIA", {
                            name: label,
                          })}
                        >
                          <TrashSvg />
                        </IconButton>
                      ) : null}
                    </ItemRight>
                  </ItemRow>
                );
              })}

              {active && (
                <>
                  {addForId === sub.id ? (
                    <AddPanel>
                      <AddPanelTitle>
                        {t("ACCOUNT.SUBSCRIPTION_ADD_PANEL_TITLE")}
                      </AddPanelTitle>
                      <Field>
                        {t("ACCOUNT.SUBSCRIPTION_SEARCH")}
                        <SearchWrap>
                          <SearchIcon>
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              aria-hidden
                            >
                              <circle
                                cx="11"
                                cy="11"
                                r="7"
                                stroke="currentColor"
                                strokeWidth="1.8"
                              />
                              <path
                                d="M16 16l4 4"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                              />
                            </svg>
                          </SearchIcon>
                          <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={t("ACCOUNT.SUBSCRIPTION_SEARCH_PH")}
                            autoComplete="off"
                          />
                        </SearchWrap>
                      </Field>
                      {searching && (
                        <SearchingHint>{t("ACCOUNT.SUBSCRIPTION_SEARCHING")}</SearchingHint>
                      )}
                      {searchHits.length > 0 && (
                        <SearchHits>
                          {searchHits.map((p) => {
                            const img =
                              p.images?.find((x) => x.is_primary) ||
                              p.images?.[0];
                            return (
                              <li key={p.id}>
                                <HitRow
                                  type="button"
                                  onClick={() => setPickedProduct(p)}
                                >
                                  <HitThumb
                                    style={
                                      img?.thumbnail
                                        ? { backgroundImage: `url(${img.thumbnail})` }
                                        : undefined
                                    }
                                  />
                                  <HitName>{p.name}</HitName>
                                </HitRow>
                              </li>
                            );
                          })}
                        </SearchHits>
                      )}
                      {pickedProduct && (
                        <PickedBanner>
                          <PackageSvg />
                          {t("ACCOUNT.SUBSCRIPTION_SELECTED", {
                            name: pickedProduct.name,
                          })}
                        </PickedBanner>
                      )}
                      <Field>
                        {t("ACCOUNT.SUBSCRIPTION_QTY")}
                        <QtyInput
                          type="number"
                          min={1}
                          value={addQty}
                          onChange={(e) => setAddQty(e.target.value)}
                        />
                      </Field>
                      <ActionsRow>
                        <PrimaryBtn
                          type="button"
                          onClick={() => addProduct(sub.id)}
                        >
                          {t("ACCOUNT.SUBSCRIPTION_ADD_BTN")}
                        </PrimaryBtn>
                        <OutlineBtn type="button" onClick={resetAddPanel}>
                          {t("ACCOUNT.ADDRESS_CANCEL")}
                        </OutlineBtn>
                      </ActionsRow>
                    </AddPanel>
                  ) : (
                    <ActionsRow>
                      <OutlineBtn
                        type="button"
                        onClick={() => {
                          setAddForId(sub.id);
                          setActionErr(null);
                        }}
                      >
                        <PlusSvg />
                        {t("ACCOUNT.SUBSCRIPTION_ADD_PRODUCT")}
                      </OutlineBtn>
                      <DangerOutlineBtn
                        type="button"
                        onClick={() => {
                          setActionErr(null);
                          setCancelTargetId(sub.id);
                        }}
                      >
                        {t("ACCOUNT.SUBSCRIPTION_CANCEL")}
                      </DangerOutlineBtn>
                    </ActionsRow>
                  )}
                </>
              )}
            </CardInner>
          </SubCard>
        );
      })}

      {cancelTargetId != null && pendingCancelSub && (
        <ConfirmOverlay
          role="presentation"
          onClick={closeCancelModal}
        >
          <ConfirmPanel
            role="dialog"
            aria-modal="true"
            aria-labelledby="subscription-cancel-title"
            onClick={(e) => e.stopPropagation()}
          >
            <ConfirmHero>
              <ConfirmIconWrap>
                <WarningSvg />
              </ConfirmIconWrap>
            </ConfirmHero>
            <ConfirmBody>
              <ConfirmTitle id="subscription-cancel-title">
                {t("ACCOUNT.SUBSCRIPTION_CANCEL_MODAL_TITLE")}
              </ConfirmTitle>
              <ConfirmInterval>
                {intervalLabel(t, pendingCancelSub.interval_days)}
              </ConfirmInterval>
              <ConfirmCopy>
                {t("ACCOUNT.SUBSCRIPTION_CANCEL_MODAL_BODY")}
              </ConfirmCopy>
              <ConfirmNote>
                {t("ACCOUNT.SUBSCRIPTION_CANCEL_MODAL_NOTE")}
              </ConfirmNote>
              <ConfirmActions>
                <ConfirmBtnGhost
                  type="button"
                  onClick={closeCancelModal}
                  disabled={cancelSubmitting}
                >
                  {t("ACCOUNT.SUBSCRIPTION_CANCEL_MODAL_BACK")}
                </ConfirmBtnGhost>
                <ConfirmBtnPrimary
                  type="button"
                  onClick={confirmCancelSubscription}
                  disabled={cancelSubmitting}
                >
                  {cancelSubmitting
                    ? t("ACCOUNT.SUBSCRIPTION_CANCEL_MODAL_SUBMITTING")
                    : t("ACCOUNT.SUBSCRIPTION_CANCEL_MODAL_CONFIRM")}
                </ConfirmBtnPrimary>
              </ConfirmActions>
            </ConfirmBody>
          </ConfirmPanel>
        </ConfirmOverlay>
      )}
    </Root>
  );
}
