import { LOCALES, READY_LOCALES, type Locale } from './locales';

const EXACT_MATCHES: Record<string, Locale> = {
  'fr-ca': 'fr-CA',
  'fr-be': 'fr-BE',
  'nl-be': 'nl-BE',
};

const LANGUAGE_MATCHES: Record<string, Locale> = {
  en: 'en',
  fr: 'fr-FR',
  de: 'de-DE',
  it: 'it-IT',
  nl: 'nl-NL',
  pl: 'pl-PL',
  sv: 'sv-SE',
  es: 'es-ES',
};

export function detectPreferredLocale(languages: readonly string[]): Locale | null {
  for (const raw of languages) {
    const normalized = raw.toLowerCase();
    const exact = EXACT_MATCHES[normalized];
    if (exact && LOCALES[exact].localeReady) return exact;

    const language = normalized.split('-')[0];
    const match = LANGUAGE_MATCHES[language];
    if (match && LOCALES[match].localeReady) return match;
  }

  return READY_LOCALES[0] ?? null;
}
