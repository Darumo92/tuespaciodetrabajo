import { LOCALES, type Locale } from './locales';

export function buildAmazonUrl(input: { href: string; locale: Locale }): string {
  const cfg = LOCALES[input.locale];
  const normalized = input.href.startsWith('/dp/')
    ? `https://${cfg.amazonDomain}${input.href}`
    : input.href;

  if (normalized.includes('tag=')) return normalized;
  return `${normalized}${normalized.includes('?') ? '&' : '?'}tag=${cfg.amazonTag}`;
}

export function buildAmazonSearchUrl(input: { query: string; locale: Locale }): string {
  const cfg = LOCALES[input.locale];
  return `https://${cfg.amazonDomain}/s?k=${encodeURIComponent(input.query)}&tag=${cfg.amazonTag}`;
}

export function hasVerifiedCommerceLocale(locale: Locale): boolean {
  const cfg = LOCALES[locale];
  return Boolean(cfg.country && cfg.currency);
}
