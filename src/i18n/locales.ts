export const DEFAULT_LOCALE = 'es-ES';

export const LOCALES = {
  'es-ES': {
    path: '',
    hreflang: 'es-ES',
    htmlLang: 'es',
    label: 'Spanish',
    nativeLabel: 'Español',
    country: 'ES',
    currency: 'EUR',
    ogLocale: 'es_ES',
    amazonDomain: 'www.amazon.es',
    amazonTag: 'tuespaciodet-21',
    guideSegment: 'guias',
    localeReady: true,
  },
  en: {
    path: 'en',
    hreflang: 'en',
    htmlLang: 'en',
    label: 'English',
    nativeLabel: 'English',
    country: null,
    currency: 'USD',
    ogLocale: 'en_US',
    amazonDomain: 'www.amazon.es',
    amazonTag: 'tuespaciodet-21',
    guideSegment: 'guides',
    localeReady: true,
  },
  'fr-FR': {
    path: 'fr-fr',
    hreflang: 'fr-FR',
    htmlLang: 'fr-FR',
    label: 'French (France)',
    nativeLabel: 'Français',
    country: 'FR',
    currency: 'EUR',
    ogLocale: 'fr_FR',
    amazonDomain: 'www.amazon.es',
    amazonTag: 'tuespaciodet-21',
    guideSegment: 'guides',
    localeReady: false,
  },
  'fr-CA': {
    path: 'fr-ca',
    hreflang: 'fr-CA',
    htmlLang: 'fr-CA',
    label: 'French (Canada)',
    nativeLabel: 'Français canadien',
    country: 'CA',
    currency: 'CAD',
    ogLocale: 'fr_CA',
    amazonDomain: 'www.amazon.es',
    amazonTag: 'tuespaciodet-21',
    guideSegment: 'guides',
    localeReady: false,
  },
  'fr-BE': {
    path: 'fr-be',
    hreflang: 'fr-BE',
    htmlLang: 'fr-BE',
    label: 'French (Belgium)',
    nativeLabel: 'Français belge',
    country: 'BE',
    currency: 'EUR',
    ogLocale: 'fr_BE',
    amazonDomain: 'www.amazon.es',
    amazonTag: 'tuespaciodet-21',
    guideSegment: 'guides',
    localeReady: false,
  },
  'nl-NL': {
    path: 'nl-nl',
    hreflang: 'nl-NL',
    htmlLang: 'nl-NL',
    label: 'Dutch (Netherlands)',
    nativeLabel: 'Nederlands',
    country: 'NL',
    currency: 'EUR',
    ogLocale: 'nl_NL',
    amazonDomain: 'www.amazon.es',
    amazonTag: 'tuespaciodet-21',
    guideSegment: 'guides',
    localeReady: false,
  },
  'nl-BE': {
    path: 'nl-be',
    hreflang: 'nl-BE',
    htmlLang: 'nl-BE',
    label: 'Dutch (Belgium)',
    nativeLabel: 'Vlaams',
    country: 'BE',
    currency: 'EUR',
    ogLocale: 'nl_BE',
    amazonDomain: 'www.amazon.es',
    amazonTag: 'tuespaciodet-21',
    guideSegment: 'guides',
    localeReady: false,
  },
  'de-DE': {
    path: 'de-de',
    hreflang: 'de-DE',
    htmlLang: 'de-DE',
    label: 'German',
    nativeLabel: 'Deutsch',
    country: 'DE',
    currency: 'EUR',
    ogLocale: 'de_DE',
    amazonDomain: 'www.amazon.es',
    amazonTag: 'tuespaciodet-21',
    guideSegment: 'guides',
    localeReady: false,
  },
  'it-IT': {
    path: 'it-it',
    hreflang: 'it-IT',
    htmlLang: 'it-IT',
    label: 'Italian',
    nativeLabel: 'Italiano',
    country: 'IT',
    currency: 'EUR',
    ogLocale: 'it_IT',
    amazonDomain: 'www.amazon.es',
    amazonTag: 'tuespaciodet-21',
    guideSegment: 'guides',
    localeReady: false,
  },
  'pl-PL': {
    path: 'pl-pl',
    hreflang: 'pl-PL',
    htmlLang: 'pl-PL',
    label: 'Polish',
    nativeLabel: 'Polski',
    country: 'PL',
    currency: 'PLN',
    ogLocale: 'pl_PL',
    amazonDomain: 'www.amazon.es',
    amazonTag: 'tuespaciodet-21',
    guideSegment: 'guides',
    localeReady: false,
  },
  'sv-SE': {
    path: 'sv-se',
    hreflang: 'sv-SE',
    htmlLang: 'sv-SE',
    label: 'Swedish',
    nativeLabel: 'Svenska',
    country: 'SE',
    currency: 'SEK',
    ogLocale: 'sv_SE',
    amazonDomain: 'www.amazon.es',
    amazonTag: 'tuespaciodet-21',
    guideSegment: 'guides',
    localeReady: false,
  },
} as const;

export type Locale = keyof typeof LOCALES;
export const SUPPORTED_LOCALES = Object.keys(LOCALES) as Locale[];
export const PUBLIC_LOCALES = SUPPORTED_LOCALES.filter((locale) => locale !== DEFAULT_LOCALE);
export const READY_LOCALES = SUPPORTED_LOCALES.filter((locale) => LOCALES[locale].localeReady);

export function getLocaleConfig(locale: Locale) {
  return LOCALES[locale];
}

export function isLocale(value: string | undefined): value is Locale {
  return Boolean(value && value in LOCALES);
}

export function localeFromPath(path: string | undefined): Locale | null {
  if (!path) return DEFAULT_LOCALE;
  const normalized = path.replace(/^\/+|\/+$/g, '').toLowerCase();
  const match = SUPPORTED_LOCALES.find((locale) => LOCALES[locale].path === normalized);
  return match ?? null;
}
