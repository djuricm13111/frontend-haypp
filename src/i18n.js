import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import translationDE from "./locales/de/translation.json"; // Nemački prevod
import translationEN from "./locales/en/translation.json"; // Nemački prevod
import { DEFAULT_LANGUAGE } from "./utils/global_const";

const resources = {
  de: { translation: translationDE }, // Samo nemački jezik
  en: { translation: translationEN },
};

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init(
    {
      resources,
      fallbackLng: DEFAULT_LANGUAGE, // Ako ne prepozna jezik, koristi nemački
      interpolation: { escapeValue: false },
      detection: {
        order: ["path", "navigator"],
        caches: [],
      },
      initImmediate: false, // Osigurava da `onInitialized` radi pravilno
      whitelist: ["de", "en"], // Lista podržanih jezika
    },
    (err, t) => {
      if (i18n.language !== "de" && !["en", "de"].includes(i18n.language)) {
        i18n.changeLanguage(DEFAULT_LANGUAGE); // Postavlja podrazumevani jezik na nemački
      }
    }
  );

export default i18n;
