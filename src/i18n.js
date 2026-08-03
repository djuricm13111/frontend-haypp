import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import translationDE from "./locales/de/translation.json";
import translationEN from "./locales/en/translation.json";
import translationHU from "./locales/hu/translation.json";
import { DEFAULT_LANGUAGE } from "./utils/global_const";

const resources = {
  de: { translation: translationDE },
  en: { translation: translationEN },
  hu: { translation: translationHU },
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
        lookupFromPathIndex: 0,
        caches: [],
      },
      initImmediate: false, // Osigurava da `onInitialized` radi pravilno
      whitelist: ["de", "en", "hu"],
    },
    (err, t) => {
      if (!["en", "de", "hu"].includes(i18n.language)) {
        i18n.changeLanguage(DEFAULT_LANGUAGE); // Postavlja podrazumevani jezik na nemački
      }
    }
  );

export default i18n;
