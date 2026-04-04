import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en/translation.json';
import fr from './locales/fr/translation.json';
import ar from './locales/ar/translation.json';
import es from './locales/es/translation.json';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr },
    ar: { translation: ar },
    es: { translation: es },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;

/**
 * Detect the UI language from a selected country name.
 * Called in RegionSelectionModal when a country is selected.
 */
export function detectLanguage(country: string): string {
  const french = new Set([
    'France', 'Belgium', 'Switzerland', 'Canada', 'Luxembourg', 'Monaco',
    'Ivory Coast', 'Senegal', 'Mali', 'Burkina Faso', 'Niger', 'Chad',
    'Cameroon', 'Gabon', 'Congo', 'DR Congo', 'Madagascar', 'Togo', 'Benin',
  ]);
  const arabic = new Set([
    'United Arab Emirates', 'Saudi Arabia', 'Bahrain', 'Kuwait', 'Qatar',
    'Oman', 'Jordan', 'Lebanon', 'Egypt', 'Iraq', 'Syria', 'Yemen',
    'Libya', 'Algeria', 'Morocco', 'Tunisia', 'Sudan', 'Palestine',
  ]);
  const spanish = new Set([
    'Spain', 'Mexico', 'Argentina', 'Colombia', 'Chile', 'Peru',
    'Venezuela', 'Ecuador', 'Bolivia', 'Paraguay', 'Uruguay',
    'Costa Rica', 'Panama', 'Honduras', 'El Salvador', 'Guatemala',
    'Nicaragua', 'Dominican Republic', 'Cuba',
  ]);

  if (arabic.has(country)) return 'ar';
  if (french.has(country)) return 'fr';
  if (spanish.has(country)) return 'es';
  return 'en';
}

/**
 * Apply RTL direction to <html> for Arabic.
 */
export function applyDirection(lang: string) {
  document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  document.documentElement.setAttribute('lang', lang);
}
