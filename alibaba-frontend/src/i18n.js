import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import I18nextBrowserLanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

import { selectedLanguage } from 'global/variables';

const selectedLanguageOnLocal = localStorage.getItem('autilent-fleet-manager-language');

i18n
  .use(Backend)
  .use(I18nextBrowserLanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    lng: selectedLanguageOnLocal ? selectedLanguageOnLocal : selectedLanguage,
    debug: true,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
