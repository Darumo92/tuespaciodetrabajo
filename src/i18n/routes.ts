import { DEFAULT_LOCALE, LOCALES, SUPPORTED_LOCALES, type Locale } from './locales';

export const SITE_URL = 'https://tuespaciodetrabajo.com';

export interface AlternateLink {
  hreflang: string;
  href: string;
}

export function localePrefix(locale: Locale): string {
  const path = LOCALES[locale].path;
  return path ? `/${path}` : '';
}

export function absoluteUrl(pathname: string): string {
  const normalized = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${SITE_URL}${normalized}`;
}

export function localizedPath(locale: Locale, segments: string[] = []): string {
  const clean = segments.filter(Boolean).map((segment) => segment.replace(/^\/+|\/+$/g, ''));
  const prefix = localePrefix(locale).replace(/^\/+|\/+$/g, '');
  const path = [prefix, ...clean].filter(Boolean).join('/');
  return `/${path}${path ? '/' : ''}`;
}

export function articlePath(input: {
  locale: Locale;
  tipo: 'comparativa' | 'informativo' | 'noticia';
  categoriaSlug: string;
  slug: string;
}): string {
  const section = input.tipo === 'informativo'
    ? LOCALES[input.locale].guideSegment
    : input.categoriaSlug;
  return localizedPath(input.locale, [section, input.slug]);
}

export function canonicalFor(pathname: string): string {
  return absoluteUrl(pathname);
}

export function buildAlternates(pathsByLocale: Partial<Record<Locale, string>>, includeDefault = true): AlternateLink[] {
  const alternates = SUPPORTED_LOCALES.flatMap((locale) => {
    const pathname = pathsByLocale[locale];
    if (!pathname) return [];
    return [{ hreflang: LOCALES[locale].hreflang, href: absoluteUrl(pathname) }];
  });

  if (includeDefault && pathsByLocale[DEFAULT_LOCALE]) {
    alternates.push({ hreflang: 'x-default', href: absoluteUrl(pathsByLocale[DEFAULT_LOCALE]) });
  }

  return alternates;
}

export function pathLocaleSegment(locale: Locale): string {
  return LOCALES[locale].path;
}
