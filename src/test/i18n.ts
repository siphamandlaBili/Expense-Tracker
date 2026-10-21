import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "../i18n/locales/en.json";

// Deterministic, synchronous i18n for tests: always English, no language
// detection, and a missing key fails the test instead of rendering the key.
export const testI18n = i18n.createInstance();

void testI18n.use(initReactI18next).init({
  lng: "en",
  fallbackLng: false,
  resources: { en: { translation: en } },
  interpolation: { escapeValue: false },
  initAsync: false,
  saveMissing: true,
  missingKeyHandler: (_languages, _namespace, key) => {
    throw new Error(`Missing translation key: "${key}"`);
  },
});
