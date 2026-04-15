function calculateDiscount(quantity) {
  if (quantity >= 50) {
    return 0.2;
  } else if (quantity >= 10) {
    return 0.17;
  } else {
    return 0;
  }
}
export function calculatePrice(price, quantity) {
  const discount = calculateDiscount(quantity);
  const discountedPrice = price * (1 - discount);
  return parseFloat(discountedPrice.toFixed(2));
}

/**
 * Jedinička cena sa popustom po ukupnoj količini u korpi.
 * Mix pack / bundle (`is_mix_pack`) — bez volumenskog popusta (ostaje lista cena).
 */
export function volumeAdjustedUnitPrice(product, totalQuantityForDiscount) {
  const p = Number(product?.price);
  if (!Number.isFinite(p)) return 0;
  if (product?.is_mix_pack) {
    return parseFloat(p.toFixed(2));
  }
  return calculatePrice(p, totalQuantityForDiscount);
}
