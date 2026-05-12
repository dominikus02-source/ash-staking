import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import en from './en.json';
import id from './id.json';

const resources = {
  en: { translation: en },
  id: { translation: id },
};

// Deteksi bahasa bawaan HP
const getLanguage = () => {
  const locales = Localization.getLocales();
  return locales[0]?.languageCode === 'id' ? 'id' : 'en'; 
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, 
    },
  });

export default i18n;