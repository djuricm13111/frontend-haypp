export const DOMAIN = "at";
export const DEFAULT_LANGUAGE = "en";

export const convertCurrency = (price, fromCurrency, toCurrency) => {
  if (fromCurrency === toCurrency) {
    // Nema potrebe za konverzijom ako su valute iste
    return price;
  }

  let exchangeRate = 1; // Postavite početni kurs razmene

  // Direktan kurs razmene iz EUR u USD i obrnuto
  const rates = {
    "EUR->USD": 1.1,
    "USD->EUR": 1 / 1.1,
  };

  // Formiranje ključa za pristup odgovarajućem kursu razmene
  const rateKey = `${fromCurrency}->${toCurrency}`;

  // Ako postoji definisan kurs razmene za dati par valuta, koristite ga
  if (rates[rateKey]) {
    exchangeRate = rates[rateKey];
  }

  // Vršite konverziju cene koristeći odabrani kurs razmene
  let convertedPrice = price * exchangeRate;

  // Vraćanje konvertovane cene bez dodatnog zaokruživanja
  // Ovo može pomoći u smanjenju akumulacije grešaka prilikom višestrukih konverzija
  return convertedPrice;
};
export const currencyTags = {
  USD: "$",
  EUR: "€",
};
export const DEFAULT_CURRENCY = "EUR";

export const PRODUCT_CHUNK = 30; // koliko se prozivoda prikazuje odjednom

//CHECKOUT
export const paymentMethods = [
  { name: "Cash on Delivery", code: "cod", available: true },
  { name: "Credit Card", code: "card", available: false },
  // { name: "PayPal", code: "paypal", available: false },
];

export const transportMethods = [
  //{ name: "DHL Standard", price: 8.9, days: 5 },
  { name: "Post - AT", price: 8.9, days: 3 },
  //{ name: "DHL Express Saver", price: 19.9, days: 3 },
];

export const freeShippingThreshold = 50; // Prag za besplatnu dostavu

export const getTransportPrice = (method, totalQuantity) => {
  // Težina jedne jedinice: 0.033 kg
  const weight = totalQuantity * 0.033;

  const getSingleBoxPrice = (kg) => {
    if (kg <= 2) return 6;
    if (kg <= 4) return 7;
    if (kg <= 8) return 8;
    if (kg <= 12) return 9;
    if (kg <= 20) return 11;
    return 12; // max 31.5kg
  };

  // B2B logika: svaka kutija max 7.8kg, obračun po komadu
  const maxPerBox = 7.8;
  const fullBoxes = Math.floor(weight / maxPerBox);
  const remainder = weight % maxPerBox;

  let totalCost = fullBoxes * getSingleBoxPrice(maxPerBox);

  if (remainder > 0) {
    totalCost += getSingleBoxPrice(remainder);
  }

  return totalCost;
};
export const getShippingCostPrice = (fromCurrency, toCurrency) => {
  const price = convertCurrency(20, fromCurrency, toCurrency);
  return price;
};

export const languages = [
  {
    code: "de",
    label: "Deutsch",
    regionLabel: "Austria",
    flag: require("../assets/icons/austria.svg").default,
  },
  {
    code: "en",
    label: "English",
    regionLabel: "United Kingdom",
    flag: require("../assets/icons/united-kingdom.svg").default,
  },
];

export const featured_categories = [
  { name: "Pablo" },
  { name: "Zyn" },
  { name: "Velo" },
];
export const adminEmailList = [
  "djuricm13111@gmail.com",
  "djuricm888@gmail.com",
];
