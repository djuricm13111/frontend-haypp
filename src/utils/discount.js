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
