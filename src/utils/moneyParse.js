/**
 * Parsira iznos iz API odgovora (djmoney, string, broj, { amount }).
 * @param {unknown} value
 * @returns {number | null}
 */
export function parseMoneyAmount(value) {
  if (value == null || value === "") return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const normalized = value.replace(/\s/g, " ").trim();
    const match = normalized.match(/-?\d+([.,]\d+)?/);
    if (match) {
      const n = parseFloat(match[0].replace(",", "."));
      return Number.isFinite(n) ? n : null;
    }
    return null;
  }
  if (typeof value === "object") {
    const raw = value.amount;
    if (raw != null) {
      if (typeof raw === "number" && Number.isFinite(raw)) return raw;
      if (typeof raw === "string") {
        const n = parseFloat(raw.replace(",", "."));
        return Number.isFinite(n) ? n : null;
      }
    }
  }
  return null;
}

/**
 * @param {unknown} value
 * @param {string} sym
 * @returns {string}
 */
export function formatMoneyParsed(value, sym) {
  const n = parseMoneyAmount(value);
  if (n == null) return "—";
  return `${sym}${n.toFixed(2)}`;
}
