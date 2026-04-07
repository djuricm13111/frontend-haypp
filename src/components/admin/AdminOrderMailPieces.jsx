import React, { useState } from "react";
import styled from "styled-components";

import {
  STATUS_LABELS,
  ORDER_STATUS_OPTIONS,
  isShipmentSent,
  formatMoney,
  buildAddressLines,
  getAddressPhone,
  effectiveUnitForLine,
  formatDecimalCurrency,
} from "../../utils/adminOrderHelpers";

export const Select = styled.select`
  appearance: auto;
  cursor: pointer;
  min-height: 2.75rem;
  padding: 0.45rem 2rem 0.45rem 0.75rem;
  border-radius: 10px;
  border: 1px solid ${(p) => p.theme.backgroundColorHover};
  background-color: ${(p) => p.theme.backgroundColor};
  color: ${(p) => p.theme.textColor};
  font-size: 0.875rem;
  font-weight: 600;
  max-width: 160px;
  line-height: 1.3;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  &:hover {
    border-color: ${(p) => p.theme.primaryColor};
  }
  &:focus {
    outline: none;
    border-color: ${(p) => p.theme.primaryColor};
    box-shadow: 0 0 0 2px color-mix(in srgb, ${(p) => p.theme.primaryColor} 35%, transparent);
  }
`;

const ShipHint = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${(p) => p.theme.textColor};
  opacity: 0.9;
  white-space: nowrap;
`;

const ShipBar = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 120px;
`;

const ShipTrack = styled.div`
  flex: 1;
  height: 6px;
  border-radius: 999px;
  background: color-mix(in srgb, ${(p) => p.theme.backgroundColorHover} 85%, ${(p) => p.theme.backgroundColor});
  overflow: hidden;
`;

const ShipFill = styled.div`
  height: 100%;
  border-radius: 999px;
  width: ${(p) => p.$pct}%;
  background: linear-gradient(90deg, ${(p) => p.theme.secondaryColor}, ${(p) => p.theme.primaryColor});
  transition: width 0.25s ease;
`;

const SelectCompact = styled(Select)`
  max-width: 220px;
  min-width: 140px;
  width: auto;
  flex: 1 1 140px;
  min-height: 2.2rem;
  padding: 0.35rem 1.75rem 0.35rem 0.65rem;
  font-size: 0.8rem;
  font-weight: 500;
  margin-top: 0;
`;

/** Jedan red: traka · zvezda + trenutni status · izmene (select) */
const ShipmentBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.45rem 0.85rem;
  width: 100%;
  min-width: 0;
  color: ${(p) => p.theme.textColor};
  @media (min-width: 720px) {
    flex-wrap: nowrap;
  }
`;

const ShipmentTrackGroup = styled.div`
  flex: 1 1 120px;
  min-width: 96px;
  max-width: min(220px, 100%);
`;

const ShipmentStarGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex: 0 0 auto;
`;

const ShipmentEditGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.45rem;
  flex: 1 1 200px;
  min-width: min(100%, 280px);
  justify-content: flex-end;
  @media (max-width: 719px) {
    justify-content: flex-start;
    flex-basis: 100%;
  }
`;

const InlineFieldLabel = styled.label`
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: color-mix(in srgb, ${(p) => p.theme.textColor} 62%, ${(p) => p.theme.backgroundColor});
  white-space: nowrap;
  flex-shrink: 0;
`;

const StarBtn = styled.button`
  flex-shrink: 0;
  width: 2.75rem;
  height: 2.75rem;
  min-width: 44px;
  min-height: 44px;
  border-radius: 50%;
  border: 2px solid
    ${(p) =>
      p.$active
        ? p.theme.warningColor
        : `color-mix(in srgb, ${p.theme.textColor} 35%, ${p.theme.backgroundColorHover})`};
  background: ${(p) =>
    p.$active
      ? `color-mix(in srgb, ${p.theme.warningColor} 22%, ${p.theme.backgroundColor})`
      : p.theme.backgroundColor};
  color: ${(p) => (p.$active ? p.theme.warningColor : p.theme.textColor)};
  cursor: pointer;
  opacity: ${(p) => (p.$inactive ? 0.45 : 1)};
  font-size: 1.35rem;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: border-color 0.15s ease, transform 0.12s ease, background 0.15s ease;
  &:hover:not(:disabled) {
    border-color: ${(p) => p.theme.warningColor};
    transform: scale(1.05);
  }
  &:active:not(:disabled) {
    transform: scale(0.98);
  }
  &:disabled {
    cursor: not-allowed;
    transform: none;
  }
  &:focus-visible {
    outline: 2px solid ${(p) => p.theme.primaryColor};
    outline-offset: 2px;
  }
`;

const CompactStatusHint = styled.span`
  font-size: 0.78rem;
  font-weight: 600;
  color: color-mix(in srgb, ${(p) => p.theme.textColor} 88%, ${(p) => p.theme.backgroundColor});
  line-height: 1.25;
  min-width: 0;
  max-width: 11rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ExpandPanel = styled.div`
  padding: ${(p) => (p.$inbox ? "0.5rem 0.65rem 0.75rem" : "1rem 1.1rem 1.15rem")};
  background: ${(p) => p.theme.backgroundColor};
  color: ${(p) => p.theme.textColor};
  border-top: ${(p) =>
    p.$inbox ? "none" : `1px solid ${p.theme.backgroundColorHover}`};
  font-size: ${(p) => (p.$inbox ? "0.82rem" : "0.84rem")};
  line-height: 1.55;
`;

const ItemsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 0.65rem;
  font-size: 0.8rem;
  color: ${(p) => p.theme.textColor};
  th,
  td {
    text-align: left;
    padding: 0.45rem 0.35rem;
    border-bottom: 1px solid color-mix(in srgb, ${(p) => p.theme.backgroundColorHover} 75%, transparent);
    vertical-align: middle;
    color: inherit;
  }
  th:nth-child(3),
  th:nth-child(4),
  td:nth-child(3),
  td:nth-child(4) {
    text-align: right;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }
`;

const ItemsTableInbox = styled(ItemsTable)`
  margin-top: 0.45rem;
  font-size: 0.78rem;
  th,
  td {
    padding: 0.32rem 0.28rem;
  }
`;

const AddressSection = styled.div`
  margin-bottom: 0.5rem;
`;

const AddressHeading = styled.div`
  font-weight: 700;
  font-size: 0.88rem;
  margin-bottom: 0.4rem;
  color: ${(p) => p.theme.textColor};
`;

const AddressLines = styled.div`
  line-height: 1.5;
  color: color-mix(in srgb, ${(p) => p.theme.textColor} 94%, ${(p) => p.theme.backgroundColor});
`;

/** Jedan vizuelni red: naslov + ceo tekst adrese (prelomi, bez skraćivanja). */
const AddressRowInbox = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.35rem 0.55rem;
  margin-bottom: 0.45rem;
  line-height: 1.45;
`;

const AddressTitleInline = styled.span`
  font-weight: 700;
  font-size: 0.88rem;
  color: ${(p) => p.theme.textColor};
  flex-shrink: 0;
`;

const AddressFullLine = styled.div`
  flex: 1 1 12rem;
  min-width: 0;
  color: color-mix(in srgb, ${(p) => p.theme.textColor} 94%, ${(p) => p.theme.backgroundColor});
  word-break: break-word;
  overflow-wrap: anywhere;
`;

const PhoneBlock = styled.div`
  margin-top: 0.55rem;
  font-size: 0.86rem;
  line-height: 1.45;
  color: ${(p) => p.theme.textColor};
`;

const PhoneBlockInbox = styled(PhoneBlock)`
  margin-top: 0.4rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem 0.5rem;
`;

const PhoneLabel = styled.span`
  font-weight: 700;
  margin-right: 0.35rem;
`;

const PhoneCopyBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  max-width: 100%;
  flex-wrap: wrap;
  padding: 0.25rem 0.5rem;
  margin: 0;
  border-radius: 8px;
  border: 1px solid ${(p) => p.theme.backgroundColorHover};
  background: color-mix(in srgb, ${(p) => p.theme.primaryColor} 10%, ${(p) => p.theme.backgroundColor});
  color: ${(p) => p.theme.textColor};
  font-size: inherit;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  cursor: pointer;
  text-align: left;
  transition: border-color 0.15s ease, background 0.15s ease;
  &:hover {
    border-color: ${(p) => p.theme.primaryColor};
    background: color-mix(in srgb, ${(p) => p.theme.primaryColor} 16%, ${(p) => p.theme.backgroundColor});
  }
  &:focus-visible {
    outline: 2px solid ${(p) => p.theme.primaryColor};
    outline-offset: 2px;
  }
`;

const PhoneCopied = styled.span`
  font-size: 0.72rem;
  font-weight: 700;
  color: ${(p) => p.theme.secondaryColor};
`;

function CopyablePhone({ phone, inbox }) {
  const [copied, setCopied] = useState(false);
  if (!phone) return null;

  const Block = inbox ? PhoneBlockInbox : PhoneBlock;

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(phone);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = phone;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2200);
      } catch {
        /* ignore */
      }
    }
  };

  return (
    <Block>
      <PhoneLabel>Telefon:</PhoneLabel>
      <PhoneCopyBtn type="button" onClick={handleClick} title="Klik za kopiranje broja">
        {phone}
        {copied ? <PhoneCopied>Kopirano</PhoneCopied> : <span aria-hidden="true"> 📋</span>}
      </PhoneCopyBtn>
    </Block>
  );
}

const TotalsBlock = styled.div`
  margin-top: 1rem;
  padding-top: 0.85rem;
  border-top: 1px solid color-mix(in srgb, ${(p) => p.theme.primaryColor} 22%, ${(p) => p.theme.backgroundColorHover});
  max-width: 22rem;
  margin-left: auto;
`;

const TotalsBlockInbox = styled(TotalsBlock)`
  margin-top: 0.55rem;
  padding-top: 0.55rem;
`;

const TotalsLine = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1rem;
  font-size: 0.82rem;
  margin-bottom: 0.4rem;
  color: color-mix(in srgb, ${(p) => p.theme.textColor} 92%, ${(p) => p.theme.backgroundColor});
`;

const TotalsGrand = styled(TotalsLine)`
  margin-top: 0.55rem;
  padding-top: 0.55rem;
  border-top: 1px solid ${(p) => p.theme.backgroundColorHover};
  font-weight: 700;
  font-size: 0.9rem;
  color: ${(p) => p.theme.textColor};
`;

const ProductCell = styled.div`
  display: flex;
  align-items: center;
  gap: 0.65rem;
  min-width: 0;
`;

const ThumbWrap = styled.div`
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  border-radius: 10px;
  overflow: hidden;
  background: ${(p) => p.theme.backgroundColorHover};
  border: 1px solid ${(p) => p.theme.backgroundColorHover};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ThumbImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

const ThumbPlaceholder = styled.span`
  font-size: 0.62rem;
  line-height: 1.2;
  color: ${(p) => p.theme.textColor};
  opacity: 0.38;
  text-align: center;
  padding: 0.2rem;
  max-width: 100%;
`;

const ProductTitle = styled.div`
  font-size: 0.82rem;
  line-height: 1.35;
  min-width: 0;
  color: ${(p) => p.theme.textColor};
`;

export function ShipmentControls({ order, busyOrder, onStarMark, onStatusChange }) {
  const sent = isShipmentSent(order);
  const pct = sent ? 100 : 0;
  /** Puna zvezda = bilo šta osim „Na čekanju“; prazna samo za Pending. */
  const starFilled = order.order_status !== "Pending";
  const canceled = order.order_status === "Canceled";
  const starDisabled = busyOrder || canceled || sent;
  const starInactive = canceled || busyOrder;

  const statusSelectId = `admin-order-status-${order.id}`;

  return (
    <ShipmentBar>
      <ShipmentTrackGroup>
        <ShipBar>
          <ShipTrack>
            <ShipFill $pct={pct} />
          </ShipTrack>
          <ShipHint>{sent ? "Poslato" : "Čeka"}</ShipHint>
        </ShipBar>
      </ShipmentTrackGroup>
      <ShipmentStarGroup>
        <StarBtn
          type="button"
          disabled={starDisabled}
          $active={starFilled}
          $inactive={starInactive}
          onClick={() => onStarMark(order.id)}
          title={
            canceled
              ? "Porudžbina je otkazana"
              : sent
                ? "Već označeno kao poslato ili dostavljeno"
                : starFilled
                  ? "Porudžbina više nije na čekanju — klik za Poslato"
                  : "Na čekanju — klik za brzu oznaku Poslato"
          }
          aria-label={
            canceled
              ? "Otkazano"
              : sent
                ? "Pošiljka je već poslata ili dostavljena"
                : starFilled
                  ? "Nije na čekanju; označi kao poslato"
                  : "Na čekanju; označi kao poslato"
          }
          aria-pressed={starFilled}
        >
          {starFilled ? "★" : "☆"}
        </StarBtn>
        <CompactStatusHint title={STATUS_LABELS[order.order_status] || order.order_status}>
          {STATUS_LABELS[order.order_status] || order.order_status}
        </CompactStatusHint>
      </ShipmentStarGroup>
      <ShipmentEditGroup>
        <InlineFieldLabel htmlFor={statusSelectId}>Izmene</InlineFieldLabel>
        <SelectCompact
          id={statusSelectId}
          value={order.order_status}
          disabled={busyOrder}
          onChange={(e) => onStatusChange(order.id, e.target.value)}
          aria-label="Izmena statusa porudžbine"
        >
          {ORDER_STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s] || s}
            </option>
          ))}
        </SelectCompact>
      </ShipmentEditGroup>
    </ShipmentBar>
  );
}

/**
 * @param {{ order: object, inbox?: boolean }} props
 */
export function OrderExpandContent({ order, inbox }) {
  const addrLines = buildAddressLines(order.address_details);
  const phone = getAddressPhone(order.address_details);
  const ItemsTableEl = inbox ? ItemsTableInbox : ItemsTable;
  const TotalsBlockEl = inbox ? TotalsBlockInbox : TotalsBlock;

  const addressInlineText =
    addrLines.length > 0
      ? addrLines.join(" · ")
      : !phone
        ? "Nema sačuvane adrese za ovu porudžbinu."
        : "—";

  return (
    <ExpandPanel $inbox={!!inbox}>
      {inbox ? (
        <>
          <AddressRowInbox>
            <AddressTitleInline>Adresa za dostavu:</AddressTitleInline>
            <AddressFullLine>{addressInlineText}</AddressFullLine>
          </AddressRowInbox>
          <CopyablePhone phone={phone} inbox />
        </>
      ) : (
        <AddressSection>
          <AddressHeading>Adresa za dostavu</AddressHeading>
          {addrLines.length > 0 ? (
            <AddressLines>
              {addrLines.map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </AddressLines>
          ) : (
            !phone && (
              <div style={{ opacity: 0.75 }}>Nema sačuvane adrese za ovu porudžbinu.</div>
            )
          )}
          <CopyablePhone phone={phone} />
        </AddressSection>
      )}

      <div style={{ marginTop: "0.5rem", opacity: 0.85, fontSize: "0.85rem" }}>
        {order.transport_method} · {order.payment_method}
      </div>
      {order.note ? (
        <div style={{ marginTop: "0.55rem", fontSize: "0.82rem", opacity: 0.9 }}>
          <strong>Napomena:</strong> {order.note}
        </div>
      ) : null}

      {order.order_items?.length > 0 ? (
        <ItemsTableEl>
          <thead>
            <tr>
              <th>Proizvod</th>
              <th style={{ width: 52 }}>Kol.</th>
              <th>Jed. cena</th>
              <th>Ukupno</th>
            </tr>
          </thead>
          <tbody>
            {order.order_items.map((it) => {
              const { unit, currency } = effectiveUnitForLine(it);
              const qty = it.quantity ?? 1;
              const lineTotal = unit * qty;
              return (
                <tr key={it.id}>
                  <td>
                    <ProductCell>
                      <ThumbWrap>
                        {it.image_url ? (
                          <ThumbImg src={it.image_url} alt="" loading="lazy" />
                        ) : (
                          <ThumbPlaceholder>bez slike</ThumbPlaceholder>
                        )}
                      </ThumbWrap>
                      <ProductTitle>{it.label}</ProductTitle>
                    </ProductCell>
                  </td>
                  <td>{qty}</td>
                  <td>{formatDecimalCurrency(unit, currency)}</td>
                  <td>{formatDecimalCurrency(lineTotal, currency)}</td>
                </tr>
              );
            })}
          </tbody>
        </ItemsTableEl>
      ) : (
        <div style={{ marginTop: "0.65rem", opacity: 0.75 }}>Nema stavki u porudžbini.</div>
      )}

      <TotalsBlockEl>
        <TotalsLine>
          <span>Međuzbir</span>
          <span>{formatMoney(order.subtotal)}</span>
        </TotalsLine>
        <TotalsLine>
          <span>Dostava</span>
          <span>{formatMoney(order.shipping_cost)}</span>
        </TotalsLine>
        <TotalsGrand>
          <span>Ukupno</span>
          <span>{formatMoney(order.total_price)}</span>
        </TotalsGrand>
      </TotalsBlockEl>
    </ExpandPanel>
  );
}
