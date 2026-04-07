import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import styled, { css } from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

import { AuthUserContext } from "../context/AuthUserContext";
import APIService from "../services/APIService";
import {
  STATUS_LABELS,
  displayOrderId,
  displayCustomerName,
  isShipmentSent,
} from "../utils/adminOrderHelpers";
import { ShipmentControls, OrderExpandContent } from "../components/admin/AdminOrderMailPieces";

function splitDateTime(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { date: "—", time: "" };
  return {
    date: d.toLocaleDateString(undefined, { day: "2-digit", month: "2-digit", year: "numeric" }),
    time: d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }),
  };
}

const PageWrap = styled.div`
  min-height: calc(100vh - 120px);
  padding: 0 0 2rem;
  background: ${(p) => p.theme.backgroundColor};
  color: ${(p) => p.theme.textColor};
  box-shadow: inset 0 1px 0 color-mix(in srgb, ${(p) => p.theme.primaryColor} 12%, transparent);

  /* Globalni index.css: button { color: bela }, h1/p { color: tamna } — na tamnoj temi to pravi „nevidljiv“ tekst */
  & button {
    color: inherit;
    font-family: inherit;
  }
  & input,
  & select,
  & textarea {
    color: ${(p) => p.theme.textColor};
    background-color: ${(p) => p.theme.backgroundColor};
  }
  & h1,
  & h2,
  & h3,
  & p {
    color: inherit;
  }
`;

/** Ostavlja što više visine za inbox (lista + detalji) ispod headera/filtera */
const INBOX_MAIN_HEIGHT = "calc(100vh - 148px)";

const Inner = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 1rem 1rem 1.25rem;
`;

const Header = styled.header`
  margin-bottom: 0.65rem;
`;

const BackNavRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.45rem 0.65rem;
  margin-bottom: 0.55rem;
`;

const BackButton = styled.button`
  margin: 0;
  padding: 0.15rem 0;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 0.88rem;
  font-weight: 600;
  font-family: inherit;
  color: ${(p) => p.theme.textColor};
  opacity: 0.92;
  text-decoration: underline;
  text-underline-offset: 3px;
  &:hover {
    color: ${(p) => p.theme.primaryColor};
    opacity: 1;
  }
`;

const BackSep = styled.span`
  opacity: 0.4;
  user-select: none;
  font-weight: 500;
`;

const BackHomeLink = styled(Link)`
  font-size: 0.88rem;
  font-weight: 600;
  color: ${(p) => p.theme.primaryColor};
  text-decoration: none;
  &:hover {
    text-decoration: underline;
    text-underline-offset: 3px;
  }
`;

const TitleRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 0.75rem;
`;

const Title = styled.h1`
  margin: 0;
  font-size: clamp(1.25rem, 2.2vw, 1.6rem);
  font-weight: 700;
  color: ${(p) => p.theme.textColor};
`;

const Sub = styled.div`
  margin: 0.35rem 0 0;
  font-size: 0.88rem;
  opacity: 0.85;
  max-width: 34rem;
  color: color-mix(in srgb, ${(p) => p.theme.textColor} 92%, ${(p) => p.theme.backgroundColor});
  line-height: 1.45;
  font-family: inherit;
`;

const GhostButton = styled.button`
  && {
    color: #ffffff;
  }
  border: 1px solid ${(p) => p.theme.primaryColor};
  background: linear-gradient(
    155deg,
    color-mix(in srgb, ${(p) => p.theme.primaryColor} 88%, #000) 0%,
    ${(p) => p.theme.primaryColor} 50%,
    ${(p) => p.theme.primaryColorHover} 100%
  );
  padding: 0.45rem 0.95rem;
  border-radius: 999px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  &:hover:not(:disabled) {
    filter: brightness(1.08);
  }
  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
    && {
      color: #ffffff;
    }
  }
`;

const Toolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  align-items: center;
  margin-bottom: 0.55rem;
`;

const TabGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
`;

const Tab = styled.button`
  border: 1px solid
    ${(p) =>
      p.$active
        ? p.theme.primaryColor
        : `color-mix(in srgb, ${p.theme.textColor} 18%, ${p.theme.backgroundColorHover})`};
  background: ${(p) =>
    p.$active
      ? `linear-gradient(155deg, ${p.theme.primaryColor} 0%, ${p.theme.primaryColorHover} 100%)`
      : `color-mix(in srgb, ${p.theme.backgroundColorHover} 35%, transparent)`};
  padding: 0.4rem 0.85rem;
  border-radius: 999px;
  cursor: pointer;
  font-size: 0.78rem;
  font-weight: 600;
  && {
    color: ${(p) => (p.$active ? "#ffffff" : p.theme.textColor)};
  }
  &:hover:not(:disabled) {
    ${(p) =>
      p.$active
        ? `filter: brightness(1.06);`
        : `border-color: ${p.theme.primaryColor};`}
  }
`;

const SearchInput = styled.input`
  flex: 1;
  min-width: 160px;
  max-width: 320px;
  padding: 0.5rem 0.75rem;
  border-radius: 10px;
  border: 1px solid ${(p) => p.theme.backgroundColorHover};
  background-color: ${(p) => p.theme.backgroundColor};
  color: ${(p) => p.theme.textColor};
  font-size: 0.86rem;
  &::placeholder {
    color: color-mix(in srgb, ${(p) => p.theme.textColor} 45%, ${(p) => p.theme.backgroundColor});
  }
`;

const KbdKey = styled.kbd`
  display: inline-block;
  padding: 0.12em 0.4em;
  margin: 0 0.05em;
  border-radius: 4px;
  font-size: 0.82em;
  font-family: ui-monospace, monospace;
  background: ${(p) => p.theme.backgroundColorHover};
  color: ${(p) => p.theme.textColor};
  border: 1px solid color-mix(in srgb, ${(p) => p.theme.textColor} 15%, ${(p) => p.theme.backgroundColorHover});
`;

const InboxLayout = styled.div`
  display: flex;
  align-items: stretch;
  min-height: ${INBOX_MAIN_HEIGHT};
  max-height: ${INBOX_MAIN_HEIGHT};
  border-radius: 14px;
  border: 1px solid ${(p) => p.theme.backgroundColorHover};
  overflow: hidden;
  background: color-mix(in srgb, ${(p) => p.theme.backgroundColorHover} 22%, ${(p) => p.theme.backgroundColor});
  @media (max-width: 900px) {
    flex-direction: column;
    min-height: min(70vh, ${INBOX_MAIN_HEIGHT});
    max-height: none;
  }
`;

const listRowGrid = css`
  display: grid;
  grid-template-columns: minmax(92px, 1.1fr) minmax(76px, 1fr) minmax(120px, 1.55fr) minmax(118px, 1.35fr) 52px;
  gap: 0.4rem 0.35rem;
  align-items: center;
`;

const ListPane = styled.aside`
  width: min(640px, 52vw);
  min-width: 0;
  min-height: 0;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  border-right: 1px solid ${(p) => p.theme.backgroundColorHover};
  background: color-mix(in srgb, ${(p) => p.theme.backgroundColorHover} 8%, ${(p) => p.theme.backgroundColor});
  max-height: ${INBOX_MAIN_HEIGHT};
  @media (max-width: 900px) {
    width: 100%;
    max-height: 42vh;
    border-right: none;
    border-bottom: 1px solid ${(p) => p.theme.backgroundColorHover};
  }
`;

const ListScroll = styled.div`
  flex: 1;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
`;

const ListHeaderRow = styled.div`
  ${listRowGrid}
  padding: 0.55rem 0.65rem;
  gap: 0.4rem 0.35rem;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: color-mix(in srgb, ${(p) => p.theme.textColor} 72%, ${(p) => p.theme.backgroundColor});
  border-bottom: 1px solid ${(p) => p.theme.backgroundColorHover};
  background: color-mix(in srgb, ${(p) => p.theme.backgroundColorHover} 55%, ${(p) => p.theme.backgroundColor});
  position: sticky;
  top: 0;
  z-index: 2;
  min-width: min(100%, 560px);
`;

const ListHeaderCell = styled.span`
  min-width: 0;
`;

const ListRow = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== "isSelected",
})`
  ${listRowGrid}
  padding: 0.5rem 0.65rem;
  border-bottom: 1px solid color-mix(in srgb, ${(p) => p.theme.backgroundColorHover} 75%, transparent);
  /* Jedan jasan akcent — kompleksni color-mix sa dva % na oba kanala je lako „nevidljiv“ na tamnoj temi */
  background: ${(p) =>
    p.isSelected
      ? `linear-gradient(
          90deg,
          color-mix(in srgb, ${p.theme.primaryColor} 52%, ${p.theme.backgroundColor}) 0%,
          color-mix(in srgb, ${p.theme.primaryColor} 22%, ${p.theme.backgroundColor}) 100%
        )`
      : `color-mix(in srgb, ${p.theme.backgroundColor} 96%, ${p.theme.backgroundColorHover})`};
  box-shadow: ${(p) =>
    p.isSelected
      ? `inset 6px 0 0 0 ${p.theme.primaryColor},
        inset 0 0 0 1px color-mix(in srgb, ${p.theme.primaryColor} 55%, transparent),
        0 0 0 1px color-mix(in srgb, ${p.theme.primaryColor} 25%, transparent)`
      : "none"};
  color: ${(p) => p.theme.textColor};
  cursor: pointer;
  transition: background 0.2s ease, box-shadow 0.2s ease;
  min-width: min(100%, 560px);
  &:hover {
    background: ${(p) =>
      p.isSelected
        ? `linear-gradient(
            90deg,
            color-mix(in srgb, ${p.theme.primaryColor} 60%, ${p.theme.backgroundColor}) 0%,
            color-mix(in srgb, ${p.theme.primaryColor} 28%, ${p.theme.backgroundColor}) 100%
          )`
        : `color-mix(in srgb, ${p.theme.primaryColor} 12%, ${p.theme.backgroundColor})`};
    box-shadow: ${(p) =>
      p.isSelected
        ? `inset 6px 0 0 0 ${p.theme.primaryColorHover},
          inset 0 0 0 1px color-mix(in srgb, ${p.theme.primaryColor} 65%, transparent),
          0 0 0 1px color-mix(in srgb, ${p.theme.primaryColor} 32%, transparent)`
        : "none"};
  }
`;

const CellStatus = styled.span`
  font-size: 0.72rem;
  font-weight: 700;
  line-height: 1.25;
  padding: 0.2rem 0.35rem;
  border-radius: 6px;
  background: color-mix(in srgb, ${(p) => p.theme.secondaryColor} 20%, ${(p) => p.theme.backgroundColor});
  color: ${(p) => p.theme.secondaryColor};
  border: 1px solid color-mix(in srgb, ${(p) => p.theme.secondaryColor} 40%, ${(p) => p.theme.backgroundColorHover});
  text-align: center;
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const CellId = styled.span`
  font-family: ui-monospace, monospace;
  font-size: 0.76rem;
  font-weight: 700;
  color: ${(p) => p.theme.primaryColor};
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CellName = styled.span`
  font-size: 0.78rem;
  font-weight: 600;
  line-height: 1.3;
  min-width: 0;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const CellDate = styled.div`
  font-size: 0.72rem;
  line-height: 1.25;
  color: color-mix(in srgb, ${(p) => p.theme.textColor} 78%, ${(p) => p.theme.backgroundColor});
  min-width: 0;
`;

const CellDateLine = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ListStarBtn = styled.button`
  width: 44px;
  height: 44px;
  min-width: 44px;
  min-height: 44px;
  padding: 0;
  border-radius: 50%;
  border: 2px solid
    ${(p) =>
      p.$filled
        ? p.theme.warningColor
        : `color-mix(in srgb, ${p.theme.textColor} 30%, ${p.theme.backgroundColorHover})`};
  background: ${(p) =>
    p.$filled
      ? `color-mix(in srgb, ${p.theme.warningColor} 22%, ${p.theme.backgroundColor})`
      : p.theme.backgroundColor};
  color: ${(p) => (p.$filled ? p.theme.warningColor : p.theme.textColor)};
  font-size: 1.15rem;
  line-height: 1;
  cursor: ${(p) => (p.$disabled ? "not-allowed" : "pointer")};
  opacity: ${(p) => (p.$disabled ? 0.4 : 1)};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  justify-self: center;
  &:hover:not(:disabled) {
    border-color: ${(p) => p.theme.warningColor};
    transform: scale(1.06);
  }
  &:focus-visible {
    outline: 2px solid ${(p) => p.theme.primaryColor};
    outline-offset: 2px;
  }
`;

const DetailPane = styled.section`
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: ${(p) => p.theme.backgroundColor};
  max-height: ${INBOX_MAIN_HEIGHT};
  @media (max-width: 900px) {
    max-height: none;
    flex: 1;
    min-height: 48vh;
  }
`;

const DetailToolbar = styled.div`
  flex-shrink: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.4rem;
  padding: 0.45rem 0.65rem;
  border-bottom: 1px solid ${(p) => p.theme.backgroundColorHover};
  background: color-mix(in srgb, ${(p) => p.theme.backgroundColorHover} 45%, ${(p) => p.theme.backgroundColor});
  color: ${(p) => p.theme.textColor};
  @media (max-width: 560px) {
    flex-direction: column;
    align-items: stretch;
    gap: 0.35rem;
  }
`;

const NavCluster = styled.div`
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex-wrap: nowrap;
  flex: 1 1 auto;
  min-width: 0;
  justify-content: center;
  @media (max-width: 560px) {
    width: 100%;
    order: 1;
  }
`;

const NavBtn = styled.button`
  && {
    color: #ffffff;
  }
  border: 1px solid color-mix(in srgb, ${(p) => p.theme.primaryColor} 70%, #000);
  background: linear-gradient(
    160deg,
    color-mix(in srgb, ${(p) => p.theme.primaryColor} 92%, #000) 0%,
    ${(p) => p.theme.primaryColor} 45%,
    ${(p) => p.theme.primaryColorHover} 100%
  );
  padding: 0.75rem 1.35rem;
  min-height: 52px;
  min-width: 52px;
  border-radius: 12px;
  font-size: 1.05rem;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  line-height: 1.2;
  flex: 1 1 0;
  min-width: 0;
  &:hover:not(:disabled) {
    filter: brightness(1.09);
  }
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    && {
      color: #ffffff;
    }
  }
  &:focus-visible {
    outline: 2px solid ${(p) => p.theme.primaryColor};
    outline-offset: 2px;
  }
  @media (max-width: 600px) {
    padding: 0.55rem 0.45rem;
    font-size: 0.88rem;
    min-height: 46px;
    border-radius: 10px;
  }
  @media (max-width: 480px) {
    padding: 0.5rem 0.35rem;
    min-height: 44px;
    font-size: 0.8rem;
  }
`;

/** Na uskom ekranu samo strelice da oba dugmeta stanu u red. */
const NavBtnLabelLong = styled.span`
  @media (max-width: 480px) {
    display: none;
  }
`;

const NavBtnLabelShort = styled.span`
  display: none;
  font-size: 1.2rem;
  line-height: 1;
  @media (max-width: 480px) {
    display: inline;
  }
`;

const CounterText = styled.span`
  font-size: 0.78rem;
  color: color-mix(in srgb, ${(p) => p.theme.textColor} 78%, ${(p) => p.theme.backgroundColor});
  min-width: 3.25rem;
  flex: 0 0 auto;
  text-align: center;
  @media (max-width: 480px) {
    font-size: 0.72rem;
    min-width: 2.75rem;
  }
`;

const DetailHint = styled.span`
  margin: 0;
  font-size: 0.72rem;
  color: color-mix(in srgb, ${(p) => p.theme.textColor} 58%, ${(p) => p.theme.backgroundColor});
  flex: 0 0 auto;
  max-width: 100%;
  @media (max-width: 560px) {
    text-align: center;
    width: 100%;
    order: 2;
  }
`;

const DetailScroll = styled.div`
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0.35rem 0.45rem 0.65rem;
  -webkit-overflow-scrolling: touch;
  color: ${(p) => p.theme.textColor};
  background: ${(p) => p.theme.backgroundColor};
`;

const ShipmentWrap = styled.div`
  flex-shrink: 0;
  padding: 0.4rem 0.65rem;
  border-bottom: 1px solid ${(p) => p.theme.backgroundColorHover};
  background: ${(p) => p.theme.backgroundColor};
  color: ${(p) => p.theme.textColor};
`;

const ErrorBox = styled.div`
  padding: 0.75rem;
  border-radius: 10px;
  background: color-mix(in srgb, ${(p) => p.theme.errorColor} 14%, ${(p) => p.theme.backgroundColor});
  color: ${(p) => p.theme.errorColor};
  margin-bottom: 1rem;
`;

const LoadingWrap = styled.div`
  padding: 2.5rem;
  text-align: center;
  color: color-mix(in srgb, ${(p) => p.theme.textColor} 72%, ${(p) => p.theme.backgroundColor});
`;

const EmptyState = styled.div`
  padding: 2rem;
  text-align: center;
  color: color-mix(in srgb, ${(p) => p.theme.textColor} 70%, ${(p) => p.theme.backgroundColor});
`;

export default function AdminOrdersInbox() {
  const navigate = useNavigate();
  const { authTokens, userProfile } = useContext(AuthUserContext);
  const [queue, setQueue] = useState("to_send");
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [busy, setBusy] = useState({});

  const isStaff = useMemo(() => {
    if (userProfile?.is_staff) return true;
    if (!authTokens?.access) return false;
    try {
      const d = jwtDecode(authTokens.access);
      return d.is_staff === true;
    } catch {
      return false;
    }
  }, [authTokens, userProfile]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 350);
    return () => clearTimeout(t);
  }, [q]);

  const load = useCallback(async () => {
    if (!authTokens?.access || !isStaff) return;
    setLoading(true);
    setError(null);
    try {
      const data = await APIService.adminListOrders(authTokens.access, {
        queue: queue === "all" ? undefined : queue,
        q: debouncedQ || undefined,
      });
      const list = Array.isArray(data) ? data : [];
      setOrders(list);
    } catch (e) {
      setError(e.response?.data?.detail || e.message || "Greška pri učitavanju.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [authTokens, isStaff, queue, debouncedQ]);

  useEffect(() => {
    load();
  }, [load]);

  const index = useMemo(
    () => orders.findIndex((o) => o.id === selectedId),
    [orders, selectedId]
  );

  useEffect(() => {
    if (orders.length === 0) {
      setSelectedId(null);
      return;
    }
    if (selectedId == null || !orders.some((o) => o.id === selectedId)) {
      setSelectedId(orders[0].id);
    }
  }, [orders, selectedId]);

  const selectedOrder = useMemo(
    () => orders.find((o) => o.id === selectedId) || null,
    [orders, selectedId]
  );

  const goPrev = useCallback(() => {
    setSelectedId((id) => {
      const idx = orders.findIndex((o) => o.id === id);
      if (idx <= 0) return id;
      return orders[idx - 1].id;
    });
  }, [orders]);

  const goNext = useCallback(() => {
    setSelectedId((id) => {
      const idx = orders.findIndex((o) => o.id === id);
      if (idx < 0 || idx >= orders.length - 1) return id;
      return orders[idx + 1].id;
    });
  }, [orders]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest("input, textarea, select, [contenteditable]")) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goPrev, goNext]);

  const setBusyKey = (key, v) => setBusy((prev) => ({ ...prev, [key]: v }));

  const onStatusChange = async (orderId, order_status) => {
    if (!authTokens?.access) return;
    setBusyKey(`o-${orderId}`, true);
    setError(null);
    try {
      const updated = await APIService.adminPatchOrderStatus(
        authTokens.access,
        orderId,
        order_status
      );
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, ...updated } : o)));
    } catch (e) {
      setError(e.response?.data?.error || e.message || "Greška.");
    } finally {
      setBusyKey(`o-${orderId}`, false);
    }
  };

  const onStarMark = async (orderId) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order || !authTokens?.access) return;
    if (order.order_status === "Canceled") return;
    if (isShipmentSent(order)) return;
    await onStatusChange(orderId, "Shipped");
  };

  const goBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  if (!authTokens?.access) {
    return (
      <PageWrap>
        <Inner>
          <BackNavRow>
            <BackButton type="button" onClick={goBack}>
              ← Nazad
            </BackButton>
            <BackSep aria-hidden>·</BackSep>
            <BackHomeLink to="/">Početna</BackHomeLink>
          </BackNavRow>
          <Title>Porudžbine — inbox</Title>
          <Sub>Prijavite se nalogom sa is_staff.</Sub>
        </Inner>
      </PageWrap>
    );
  }

  if (!isStaff) {
    return (
      <PageWrap>
        <Inner>
          <BackNavRow>
            <BackButton type="button" onClick={goBack}>
              ← Nazad
            </BackButton>
            <BackSep aria-hidden>·</BackSep>
            <BackHomeLink to="/">Početna</BackHomeLink>
          </BackNavRow>
          <Title>Pristup odbijen</Title>
          <Sub>Samo za administratore.</Sub>
        </Inner>
      </PageWrap>
    );
  }

  return (
    <PageWrap>
      <Inner>
        <BackNavRow>
          <BackButton type="button" onClick={goBack}>
            ← Nazad
          </BackButton>
          <BackSep aria-hidden>·</BackSep>
          <BackHomeLink to="/">Početna</BackHomeLink>
        </BackNavRow>
        <Header>
          <TitleRow>
            <div>
              <Title>Porudžbine</Title>
              <Sub>
                Izaberite porudžbinu na listi levo — detalji su desno. Tipke{" "}
                <KbdKey>←</KbdKey> / <KbdKey>→</KbdKey> za prethodnu / sledeću.
              </Sub>
            </div>
            <GhostButton type="button" onClick={load} disabled={loading}>
              Osveži listu
            </GhostButton>
          </TitleRow>
        </Header>

        {error && <ErrorBox>{String(error)}</ErrorBox>}

        <Toolbar>
          <TabGroup>
            <Tab type="button" $active={queue === "to_send"} onClick={() => setQueue("to_send")}>
              Za slanje
            </Tab>
            <Tab type="button" $active={queue === "all"} onClick={() => setQueue("all")}>
              Sve
            </Tab>
            <Tab type="button" $active={queue === "sent"} onClick={() => setQueue("sent")}>
              Poslato
            </Tab>
          </TabGroup>
          <SearchInput
            placeholder="Pretraga…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </Toolbar>

        {loading && <LoadingWrap>Učitavanje…</LoadingWrap>}

        {!loading && orders.length === 0 && (
          <EmptyState>Nema porudžbina za izabrane filtere.</EmptyState>
        )}

        {!loading && orders.length > 0 && (
          <InboxLayout>
            <ListPane>
              <ListScroll>
                <ListHeaderRow>
                  <ListHeaderCell>Status</ListHeaderCell>
                  <ListHeaderCell>ID</ListHeaderCell>
                  <ListHeaderCell>Ime</ListHeaderCell>
                  <ListHeaderCell>Datum i vreme</ListHeaderCell>
                  <ListHeaderCell style={{ textAlign: "center" }} title="Brza oznaka Poslato">
                    ★
                  </ListHeaderCell>
                </ListHeaderRow>
                {orders.map((o) => {
                  const starFilled = o.order_status !== "Pending";
                  const sent = isShipmentSent(o);
                  const canceled = o.order_status === "Canceled";
                  const starDisabled = !!busy[`o-${o.id}`] || canceled || sent;
                  const { date, time } = splitDateTime(o.created_at);
                  return (
                    <ListRow
                      key={o.id}
                      isSelected={Number(o.id) === Number(selectedId)}
                      onClick={() => setSelectedId(o.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setSelectedId(o.id);
                        }
                      }}
                    >
                      <CellStatus title={STATUS_LABELS[o.order_status] || o.order_status}>
                        {STATUS_LABELS[o.order_status] || o.order_status}
                      </CellStatus>
                      <CellId title={displayOrderId(o)}>{displayOrderId(o)}</CellId>
                      <CellName title={displayCustomerName(o)}>{displayCustomerName(o)}</CellName>
                      <CellDate>
                        <CellDateLine>{date}</CellDateLine>
                        <CellDateLine>{time}</CellDateLine>
                      </CellDate>
                      <ListStarBtn
                        type="button"
                        $filled={starFilled}
                        $disabled={starDisabled}
                        disabled={starDisabled}
                        title={
                          canceled
                            ? "Otkazano"
                            : sent
                              ? "Već poslato / dostavljeno"
                              : starFilled
                                ? "Označi kao poslato (trenutno nije na čekanju)"
                                : "Na čekanju — klik za Poslato"
                        }
                        aria-label={
                          starFilled
                            ? "Status nije na čekanju; klik za poslato ako je dostupno"
                            : "Na čekanju; klik za označavanje poslato"
                        }
                        aria-pressed={starFilled}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!starDisabled) onStarMark(o.id);
                        }}
                      >
                        {starFilled ? "★" : "☆"}
                      </ListStarBtn>
                    </ListRow>
                  );
                })}
              </ListScroll>
            </ListPane>

            <DetailPane>
              {selectedOrder && (
                <>
                  <DetailToolbar>
                    <NavCluster>
                      <NavBtn type="button" onClick={goPrev} disabled={index <= 0} aria-label="Prethodna porudžbina">
                        <NavBtnLabelLong>← Prethodna</NavBtnLabelLong>
                        <NavBtnLabelShort aria-hidden>←</NavBtnLabelShort>
                      </NavBtn>
                      <CounterText>
                        {index + 1} / {orders.length}
                      </CounterText>
                      <NavBtn
                        type="button"
                        onClick={goNext}
                        disabled={index < 0 || index >= orders.length - 1}
                        aria-label="Sledeća porudžbina"
                      >
                        <NavBtnLabelLong>Sledeća →</NavBtnLabelLong>
                        <NavBtnLabelShort aria-hidden>→</NavBtnLabelShort>
                      </NavBtn>
                    </NavCluster>
                    <DetailHint>Strelice na tastaturi · {displayOrderId(selectedOrder)}</DetailHint>
                  </DetailToolbar>
                  <ShipmentWrap>
                    <ShipmentControls
                      order={selectedOrder}
                      busyOrder={!!busy[`o-${selectedOrder.id}`]}
                      onStarMark={onStarMark}
                      onStatusChange={onStatusChange}
                    />
                  </ShipmentWrap>
                  <DetailScroll>
                    <OrderExpandContent order={selectedOrder} inbox />
                  </DetailScroll>
                </>
              )}
            </DetailPane>
          </InboxLayout>
        )}
      </Inner>
    </PageWrap>
  );
}
