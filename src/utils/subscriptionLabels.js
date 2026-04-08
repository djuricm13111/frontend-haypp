/** Intervali pretplate (dani) usklađeni sa cart/checkout i backend validacijom. */
export const SUBSCRIPTION_INTERVAL_DAYS = [14, 31, 62];

/** Podnaslov ispod naslova sekcije „Subscription“ (npr. „Every 2 months“). */
export function getSubscriptionSectionSubtitle(items, t) {
  const days = new Set(
    items
      .map((i) => Number(i.subscriptionIntervalDays))
      .filter((d) => SUBSCRIPTION_INTERVAL_DAYS.includes(d))
  );
  if (days.size === 0) return null;
  if (days.size > 1) return t("CART.SUBSCRIPTION_SECTION_MIXED_FREQ");
  const d = [...days][0];
  if (d === 14) return t("PRODUCT.SUBSCRIBE_FREQ_LABEL_14d");
  if (d === 31) return t("PRODUCT.SUBSCRIBE_FREQ_LABEL_31d");
  if (d === 62) return t("PRODUCT.SUBSCRIBE_FREQ_LABEL_62d");
  return null;
}

/** i18n ključ za jednu stavku korpe (isti tekst kao ispod naslova u CartProduct). */
export function getSubscriptionLineFreqLabelKey(subDays) {
  const d = Number(subDays);
  if (d === 14) return "PRODUCT.SUBSCRIBE_FREQ_LABEL_14d";
  if (d === 31) return "PRODUCT.SUBSCRIBE_FREQ_LABEL_31d";
  if (d === 62) return "PRODUCT.SUBSCRIBE_FREQ_LABEL_62d";
  return null;
}
