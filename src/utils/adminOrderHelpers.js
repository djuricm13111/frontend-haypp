import { parseMoneyAmount } from "./moneyParse";

export const STATUS_LABELS = {
  Pending: "Na čekanju",
  Paid: "Plaćeno",
  Shipped: "Poslato",
  Delivered: "Dostavljeno",
  Canceled: "Otkazano",
};

export const ORDER_STATUS_OPTIONS = Object.keys(STATUS_LABELS);

export const SENT_ORDER_STATUSES = ["Shipped", "Delivered"];

export function isShipmentSent(order) {
  return SENT_ORDER_STATUSES.includes(order?.order_status);
}

export function formatMoney(v) {
  if (v == null) return "—";
  if (typeof v === "object" && v.amount != null) return `${v.amount} ${v.currency || ""}`;
  return String(v);
}

export const ADDRESS_TYPE_LABELS = {
  Home: "Kuća",
  Work: "Posao",
  Other: "Ostalo",
};

export function moneyCurrencyCode(m) {
  if (m == null || typeof m !== "object") return "";
  const c = m.currency;
  if (typeof c === "string") return c;
  if (c && typeof c === "object" && c.code) return c.code;
  return "";
}

export function effectiveUnitForLine(item) {
  const dAmt = parseMoneyAmount(item.discounted_price);
  if (dAmt != null && dAmt > 0) {
    return {
      unit: dAmt,
      currency: moneyCurrencyCode(item.discounted_price) || moneyCurrencyCode(item.price),
    };
  }
  const pAmt = parseMoneyAmount(item.price);
  return {
    unit: pAmt ?? 0,
    currency: moneyCurrencyCode(item.price),
  };
}

export function formatDecimalCurrency(amount, currency) {
  if (!Number.isFinite(amount)) return "—";
  const suf = currency ? ` ${currency}` : "";
  return `${amount.toFixed(2)}${suf}`;
}

export function buildAddressLines(addr) {
  if (!addr) return [];
  const lines = [];
  const line1 = [addr.street, addr.street_number].filter(Boolean).join(" ").trim();
  if (line1) lines.push(line1);
  if (addr.secondary_street) lines.push(String(addr.secondary_street).trim());
  if (addr.building_number) lines.push(`Ulaz / zgrada: ${addr.building_number}`);
  const cityLine = [addr.postal_code, addr.city].filter(Boolean).join(" ").trim();
  if (cityLine) lines.push(cityLine);
  if (addr.country) lines.push(String(addr.country));
  if (addr.type && ADDRESS_TYPE_LABELS[addr.type]) {
    lines.push(`Tip: ${ADDRESS_TYPE_LABELS[addr.type]}`);
  }
  /* Telefon se prikazuje posebno (kopiranje jednim klikom) u admin UI. */
  if (addr.latitude != null && addr.longitude != null) {
    lines.push(`Koordinate: ${addr.latitude}, ${addr.longitude}`);
  }
  return lines;
}

/** Broj telefona iz adrese porudžbine (za prikaz / kopiranje). */
export function getAddressPhone(addr) {
  if (!addr?.phone_number) return null;
  const t = String(addr.phone_number).trim();
  return t || null;
}

/** Prikaz ID porudžbine u adminu. */
export function displayOrderId(order) {
  if (!order) return "—";
  return order.customer_order_id || `#${order.id}`;
}

/** Ime i prezime kupca; rezerva: deo emaila. */
export function displayCustomerName(order) {
  if (!order) return "—";
  const fn = order.user_first_name?.trim?.() ?? "";
  const ln = order.user_last_name?.trim?.() ?? "";
  if (fn || ln) return [fn, ln].filter(Boolean).join(" ");
  if (order.user_email) return order.user_email.split("@")[0];
  return "—";
}
