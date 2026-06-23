# Internacionalizacion i18n SEO Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Internacionalizar Tu Espacio de Trabajo con rutas por idioma/mercado, selector visible, hreflang/canonical correctos, contenido localizado profesionalmente y afiliacion Amazon compatible con OneLink.

**Architecture:** Mantener `es-ES` en la raiz actual para no mover URLs espanolas. Anadir rutas localizadas solo cuando exista contenido traducido real: `/en/`, `/fr-fr/`, `/fr-ca/`, `/fr-be/`, `/nl-nl/`, `/nl-be/`, `/de-de/`, `/it-it/`, `/pl-pl/`, `/sv-se/`. El ingles sera unico (`/en/`) para evitar duplicados entre USA, UK y Canada; la diferenciacion comercial se delega en OneLink y en copy no especifico de pais. El idioma se sugiere por navegador/region, pero no se hace hard redirect SEO; el usuario puede cambiar con selector y su preferencia se guarda.

**Tech Stack:** Astro 5 static output, MDX content collections, `@astrojs/sitemap`, CSS plano con custom properties, Cloudflare Pages, Amazon OneLink.

**Strategic Decisions:**
- No crear `en-us`, `en-gb` ni `en-ca`; crear un unico `/en/` con ingles internacional natural.
- No crear `de-be` de inicio; el mercado germanofono belga queda fuera salvo estrategia editorial especifica.
- No traducir automaticamente los 30 articulos. Publicar por lotes pequenos y con revision nativa.
- No cambiar cada URL/ASIN de Amazon en MDX como primera fase. Mantener enlaces base Amazon.es con tag y dejar que OneLink redirija; centralizar builders para que el codigo no quede atado a Amazon.es y para poder activar overrides por mercado si se verifican ASINs locales.
- No usar fallback de cuerpo de articulo espanol en una ruta internacional. Si falta traduccion, la URL no se genera y no entra en hreflang.
- No hacer redireccion dura por IP/idioma en servidor. Usar selector + sugerencia no intrusiva para evitar problemas con Googlebot y usuarios que quieren navegar otra version.

**Current Evidence:**
- `Base.astro` fija `html lang="es"`, `og:locale="es_ES"`, hreflang `es` y schema `inLanguage: es`.
- `Article.astro` fija fechas `es-ES`, breadcrumbs espanoles y Article schema `inLanguage: es`.
- `AffiliateButton`, `ComparisonTable`, `TopPick`, `src/lib/productos.ts` y `public/_redirects` estan acoplados a `amazon.es`, `EUR`, `ES` y `tuespaciodet-21`.
- GSC/GA4 muestran traccion organica baja; la expansion debe ser progresiva.

---

## File Structure

- Create: `src/i18n/locales.ts` - registry canonico de locales, idiomas, monedas, marketplaces, formatos y politicas.
- Create: `src/i18n/ui.ts` - diccionario de UI visible por locale.
- Create: `src/i18n/routes.ts` - helpers de URL, canonical, alternates y slug localizado.
- Create: `src/i18n/content.ts` - helpers para cargar articulos traducidos y equivalencias.
- Create: `src/i18n/amazon.ts` - builders de Amazon/OneLink/disclosures por locale.
- Create: `src/i18n/language-detection.ts` - mapping de navegador/region a locale soportado.
- Create: `src/components/LanguageSelector.astro` - selector visible de idioma.
- Create: `src/components/LanguageSuggestion.astro` - sugerencia no intrusiva de idioma.
- Create: `src/pages/[locale]/index.astro` - home localizada.
- Create: `src/pages/[locale]/[categoria]/index.astro` - categoria localizada.
- Create: `src/pages/[locale]/[categoria]/[slug].astro` - comparativa localizada.
- Create: `src/pages/[locale]/guides/index.astro` - listado de guias en ingles.
- Create: `src/pages/[locale]/guides/[slug].astro` - guia localizada en ingles.
- Create: `src/pages/[locale]/guias/index.astro` - listado de guias para locales no ingleses.
- Create: `src/pages/[locale]/guias/[slug].astro` - guia localizada para locales no ingleses.
- Create: `src/content/articulos-i18n/en/*.mdx` - piloto ingles.
- Create: `src/content/articulos-i18n/de-de/*.mdx` - piloto aleman cuando se apruebe fase editorial.
- Modify: `src/content/config.ts` - nueva collection i18n con `locale`, `translationOf`, `slug`, `categoriaSlug`, `keywords`, `marketNotes`.
- Modify: `astro.config.mjs` - i18n locales, sitemap alternates, filtros y lastmod para traducciones.
- Modify: `src/layouts/Base.astro` - props `locale`, `canonical`, `alternates`, `ogLocale`, `siteName`, UI i18n.
- Modify: `src/layouts/Article.astro` - fechas, breadcrumbs, schema, related, trust line y disclosure localizados.
- Modify: `src/components/Header.astro` - navegacion localizada y selector.
- Modify: `src/components/Footer.astro` - footer, legal y aviso afiliados localizados.
- Modify: `src/components/ArticleCard.astro` - fechas, URL, labels y CTA localizados.
- Modify: `src/components/AffiliateButton.astro` - builder Amazon centralizado y textos localizados.
- Modify: `src/components/ComparisonTable.astro` - moneda/schema/labels/localizacion.
- Modify: `src/components/TopPick.astro` - CTA/schema/localizacion.
- Modify: `src/lib/productos.ts` - builders Amazon con locale opcional.
- Modify: `src/lib/amazon-products.ts` - formato de fecha por locale y cache ES como fuente base.
- Modify: `public/_redirects` - evitar que `/dp/*` rompa experiencia internacional.
- Modify: `public/robots.txt` - confirmar sitemap internacional unico.
- Create: `docs/agent-context/reference_i18n_workflow.md` - flujo editorial para nuevos idiomas.
- Modify: `docs/agent-context/INDEX.md` - registrar nuevo workflow.

---

## Task 1: Definir locales canonicos

**Files:**
- Create: `src/i18n/locales.ts`
- Create: `src/i18n/ui.ts`

- [ ] **Step 1: Crear registry de locales**

Crear `src/i18n/locales.ts` con esta estructura inicial:

```ts
export const DEFAULT_LOCALE = 'es-ES';

export const LOCALES = {
  'es-ES': {
    path: '',
    hreflang: 'es-ES',
    htmlLang: 'es',
    label: 'Espanol',
    nativeLabel: 'Espanol',
    country: 'ES',
    currency: 'EUR',
    ogLocale: 'es_ES',
    amazonDomain: 'www.amazon.es',
    amazonTag: 'tuespaciodet-21',
    guideSegment: 'guias',
  },
  en: {
    path: 'en',
    hreflang: 'en',
    htmlLang: 'en',
    label: 'English',
    nativeLabel: 'English',
    country: null,
    currency: null,
    ogLocale: 'en_US',
    amazonDomain: 'www.amazon.es',
    amazonTag: 'tuespaciodet-21',
    guideSegment: 'guides',
  },
  'fr-FR': {
    path: 'fr-fr',
    hreflang: 'fr-FR',
    htmlLang: 'fr-FR',
    label: 'French (France)',
    nativeLabel: 'Francais',
    country: 'FR',
    currency: 'EUR',
    ogLocale: 'fr_FR',
    amazonDomain: 'www.amazon.es',
    amazonTag: 'tuespaciodet-21',
    guideSegment: 'guias',
  },
  'fr-CA': {
    path: 'fr-ca',
    hreflang: 'fr-CA',
    htmlLang: 'fr-CA',
    label: 'French (Canada)',
    nativeLabel: 'Francais canadien',
    country: 'CA',
    currency: 'CAD',
    ogLocale: 'fr_CA',
    amazonDomain: 'www.amazon.es',
    amazonTag: 'tuespaciodet-21',
    guideSegment: 'guias',
  },
  'fr-BE': {
    path: 'fr-be',
    hreflang: 'fr-BE',
    htmlLang: 'fr-BE',
    label: 'French (Belgium)',
    nativeLabel: 'Francais belge',
    country: 'BE',
    currency: 'EUR',
    ogLocale: 'fr_BE',
    amazonDomain: 'www.amazon.es',
    amazonTag: 'tuespaciodet-21',
    guideSegment: 'guias',
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
    guideSegment: 'gidsen',
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
    guideSegment: 'gidsen',
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
    guideSegment: 'ratgeber',
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
    guideSegment: 'guide',
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
    guideSegment: 'poradniki',
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
    guideSegment: 'guider',
  },
} as const;

export type Locale = keyof typeof LOCALES;
export const SUPPORTED_LOCALES = Object.keys(LOCALES) as Locale[];
export const PUBLIC_LOCALES = SUPPORTED_LOCALES.filter((locale) => locale !== DEFAULT_LOCALE);

export function getLocaleConfig(locale: Locale) {
  return LOCALES[locale];
}

export function isLocale(value: string | undefined): value is Locale {
  return Boolean(value && value in LOCALES);
}
```

- [ ] **Step 2: Crear diccionario UI base**

Crear `src/i18n/ui.ts` con claves completas para `es-ES` y `en`. Para el resto, dejar `localeReady: false` y no generar paginas hasta tener contenido traducido.

```ts
import type { Locale } from './locales';

export const UI = {
  'es-ES': {
    localeReady: true,
    siteName: 'Tu Espacio de Trabajo',
    skipToContent: 'Saltar al contenido',
    nav: {
      catalog: 'Catalogo',
      guides: 'Guias',
      news: 'Actualidad',
      tools: 'Herramientas',
      search: 'Buscar',
      openMenu: 'Abrir menu',
      closeMenu: 'Cerrar menu',
      changeTheme: 'Cambiar tema',
    },
    article: {
      home: 'Inicio',
      guides: 'Guias',
      by: 'Por',
      published: 'Publicado',
      updated: 'Actualizado',
      minRead: 'min lectura',
      toc: 'En este articulo',
      faqTitle: 'Preguntas frecuentes',
      related: 'Articulos relacionados',
      seeMoreIn: 'Ver mas en',
      backToTop: 'Volver arriba',
      trustLine: 'Analisis independiente. Productos probados de primera mano y precios revisados con regularidad.',
      affiliateDisclosure: 'Este articulo contiene enlaces de afiliados. Si compras a traves de ellos podemos recibir una pequena comision sin coste adicional para ti.',
    },
    commerce: {
      viewOnAmazon: 'Ver en Amazon',
      viewOffer: 'Ver oferta',
      viewPrice: 'Ver precio',
      searchAmazon: 'Buscar en Amazon',
      opensNewTab: 'se abre en nueva pestana',
      reviewed: 'Revisado',
      recommended: 'Recomendado',
      priceAsc: 'Precio bajo a alto',
      priceDesc: 'Precio alto a bajo',
      rating: 'Valoracion',
    },
    language: {
      label: 'Idioma',
      selectorTitle: 'Cambiar idioma',
      suggestion: 'Esta pagina esta disponible en tu idioma.',
      switchTo: 'Cambiar a',
      stayHere: 'Seguir aqui',
    },
    footer: {
      affiliateNotice: 'Aviso de afiliados: tuespaciodetrabajo.com participa en el Programa de Afiliados de Amazon EU. Cuando compras a traves de nuestros enlaces podemos recibir una comision sin coste adicional para ti. No aceptamos pagos por colocar productos en una posicion concreta.',
      rights: 'Todos los derechos reservados',
    },
  },
  en: {
    localeReady: true,
    siteName: 'Tu Espacio de Trabajo',
    skipToContent: 'Skip to content',
    nav: {
      catalog: 'Catalog',
      guides: 'Guides',
      news: 'Updates',
      tools: 'Tools',
      search: 'Search',
      openMenu: 'Open menu',
      closeMenu: 'Close menu',
      changeTheme: 'Change theme',
    },
    article: {
      home: 'Home',
      guides: 'Guides',
      by: 'By',
      published: 'Published',
      updated: 'Updated',
      minRead: 'min read',
      toc: 'In this guide',
      faqTitle: 'Frequently asked questions',
      related: 'Related articles',
      seeMoreIn: 'See more in',
      backToTop: 'Back to top',
      trustLine: 'Independent analysis based on hands-on experience, verified specs, and regular product checks.',
      affiliateDisclosure: 'This article contains affiliate links. As an Amazon Associate, we earn from qualifying purchases at no extra cost to you.',
    },
    commerce: {
      viewOnAmazon: 'View on Amazon',
      viewOffer: 'View offer',
      viewPrice: 'Check price',
      searchAmazon: 'Search on Amazon',
      opensNewTab: 'opens in a new tab',
      reviewed: 'Checked',
      recommended: 'Recommended',
      priceAsc: 'Price: low to high',
      priceDesc: 'Price: high to low',
      rating: 'Rating',
    },
    language: {
      label: 'Language',
      selectorTitle: 'Change language',
      suggestion: 'This page is available in your language.',
      switchTo: 'Switch to',
      stayHere: 'Stay here',
    },
    footer: {
      affiliateNotice: 'Affiliate disclosure: tuespaciodetrabajo.com participates in the Amazon Associates Program. As an Amazon Associate, we earn from qualifying purchases. We do not accept payment to place products in a specific position.',
      rights: 'All rights reserved',
    },
  },
} satisfies Partial<Record<Locale, Record<string, unknown>>>;

export function t(locale: Locale) {
  return UI[locale] ?? UI['es-ES'];
}
```

- [ ] **Step 3: Verificar tipos**

Run: `npm run build`
Expected: build sin errores. Todavia no hay uso de los nuevos modulos.

- [ ] **Step 4: Commit**

```bash
git add src/i18n/locales.ts src/i18n/ui.ts
git commit -m "feat(i18n): add locale registry and UI dictionary"
```

---

## Task 2: Crear helpers de rutas, canonical y alternates

**Files:**
- Create: `src/i18n/routes.ts`
- Create: `src/i18n/content.ts`

- [ ] **Step 1: Crear helpers de ruta**

Crear `src/i18n/routes.ts`:

```ts
import { DEFAULT_LOCALE, LOCALES, type Locale } from './locales';

export const SITE_URL = 'https://tuespaciodetrabajo.com';

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
  const prefix = localePrefix(locale);
  const path = [prefix.replace(/^\/+|\/+$/g, ''), ...clean].filter(Boolean).join('/');
  return `/${path}${path ? '/' : ''}`;
}

export function articlePath(input: {
  locale: Locale;
  tipo: 'comparativa' | 'informativo' | 'noticia';
  categoriaSlug: string;
  slug: string;
}): string {
  const guideSegment = LOCALES[input.locale].guideSegment;
  const section = input.tipo === 'informativo' ? guideSegment : input.categoriaSlug;
  return localizedPath(input.locale, [section, input.slug]);
}

export function canonicalFor(pathname: string): string {
  return absoluteUrl(pathname);
}

export interface AlternateLink {
  hreflang: string;
  href: string;
}

export function buildAlternates(pathsByLocale: Partial<Record<Locale, string>>): AlternateLink[] {
  return Object.entries(pathsByLocale).map(([locale, pathname]) => ({
    hreflang: LOCALES[locale as Locale].hreflang,
    href: absoluteUrl(pathname as string),
  }));
}

export function defaultAlternate(pathname: string): AlternateLink {
  return { hreflang: 'x-default', href: absoluteUrl(pathname || localizedPath(DEFAULT_LOCALE)) };
}
```

- [ ] **Step 2: Crear helper de equivalencias de contenido**

Crear `src/i18n/content.ts`:

```ts
import type { CollectionEntry } from 'astro:content';
import type { Locale } from './locales';
import { articlePath } from './routes';

export type BaseArticle = CollectionEntry<'articulos'>;
export type I18nArticle = CollectionEntry<'articulosI18n'>;

export function baseArticlePath(article: BaseArticle): string {
  return articlePath({
    locale: 'es-ES',
    tipo: article.data.tipo ?? 'comparativa',
    categoriaSlug: article.data.categoria,
    slug: article.slug,
  });
}

export function i18nArticlePath(article: I18nArticle): string {
  return articlePath({
    locale: article.data.locale as Locale,
    tipo: article.data.tipo ?? 'comparativa',
    categoriaSlug: article.data.categoriaSlug,
    slug: article.data.slug,
  });
}
```

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: build sin errores.

- [ ] **Step 4: Commit**

```bash
git add src/i18n/routes.ts src/i18n/content.ts
git commit -m "feat(i18n): add localized URL and alternate helpers"
```

---

## Task 3: Ampliar content collections para articulos i18n

**Files:**
- Modify: `src/content/config.ts`

- [ ] **Step 1: Anadir schema i18n**

En `src/content/config.ts`, anadir `LOCALES_I18N` y la collection `articulosI18n`:

```ts
const LOCALES_I18N = ['en', 'fr-FR', 'fr-CA', 'fr-BE', 'nl-NL', 'nl-BE', 'de-DE', 'it-IT', 'pl-PL', 'sv-SE'] as const;

const articulosI18n = defineCollection({
  type: 'content',
  schema: z.object({
    locale: z.enum(LOCALES_I18N),
    translationOf: z.string(),
    slug: z.string(),
    categoriaSlug: z.string(),
    titulo: z.string(),
    descripcion: z.string(),
    categoria: z.enum(CATEGORIAS),
    tipo: z.enum(TIPOS).default('comparativa'),
    fecha: z.coerce.date(),
    imagen: z.string().optional(),
    imagenAlt: z.string().optional(),
    destacado: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
    keywords: z.array(z.string()).default([]),
    marketNotes: z.array(z.string()).default([]),
    actualizadoEn: z.coerce.date().optional(),
    autor: z.string().default('David Rubio'),
    faqs: z.array(z.object({
      pregunta: z.string(),
      respuesta: z.string(),
    })).optional(),
  }),
});
```

Actualizar export:

```ts
export const collections = { articulos, articulosI18n, productos };
```

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: Astro reconoce la nueva collection aunque no haya archivos.

- [ ] **Step 3: Commit**

```bash
git add src/content/config.ts
git commit -m "feat(content): add localized article collection"
```

---

## Task 4: Parametrizar Base layout para locale, hreflang y selector

**Files:**
- Modify: `src/layouts/Base.astro`
- Create: `src/components/LanguageSelector.astro`
- Create: `src/components/LanguageSuggestion.astro`

- [ ] **Step 1: Crear selector de idiomas**

Crear `src/components/LanguageSelector.astro`:

```astro
---
import { LOCALES, type Locale } from '@/i18n/locales';
import type { AlternateLink } from '@/i18n/routes';
import { t } from '@/i18n/ui';

interface Props {
  locale: Locale;
  alternates: AlternateLink[];
}

const { locale, alternates } = Astro.props;
const ui = t(locale);
const byHrefLang = new Map(alternates.map((item) => [item.hreflang, item.href]));
---

<details class="language-selector">
  <summary aria-label={ui.language.selectorTitle as string}>
    <span>{ui.language.label as string}</span>
    <strong>{LOCALES[locale].nativeLabel}</strong>
  </summary>
  <div class="language-selector-menu">
    {Object.entries(LOCALES).map(([code, cfg]) => {
      const href = byHrefLang.get(cfg.hreflang);
      if (!href) return null;
      return (
        <a href={href} lang={cfg.htmlLang} data-locale={code} class={code === locale ? 'is-active' : ''}>
          {cfg.nativeLabel}
        </a>
      );
    })}
  </div>
</details>
```

- [ ] **Step 2: Crear sugerencia no intrusiva**

Crear `src/components/LanguageSuggestion.astro`:

```astro
---
import type { Locale } from '@/i18n/locales';
import type { AlternateLink } from '@/i18n/routes';
import { t } from '@/i18n/ui';

interface Props {
  locale: Locale;
  alternates: AlternateLink[];
}

const { locale, alternates } = Astro.props;
const ui = t(locale);
---

<div class="language-suggestion" data-language-suggestion hidden data-current-locale={locale} data-alternates={JSON.stringify(alternates)}>
  <p data-language-suggestion-text>{ui.language.suggestion as string}</p>
  <a href="#" data-language-suggestion-link>{ui.language.switchTo as string}</a>
  <button type="button" data-language-suggestion-close>{ui.language.stayHere as string}</button>
</div>

<script is:inline>
  (function() {
    var root = document.querySelector('[data-language-suggestion]');
    if (!root) return;
    if (localStorage.getItem('preferred-locale')) return;
    var current = root.getAttribute('data-current-locale');
    var alternates = JSON.parse(root.getAttribute('data-alternates') || '[]');
    var langs = navigator.languages || [navigator.language].filter(Boolean);
    var target = null;
    for (var i = 0; i < langs.length; i++) {
      var lang = String(langs[i]).toLowerCase();
      if (lang.startsWith('en')) target = alternates.find(function(a) { return a.hreflang === 'en'; });
      if (lang.startsWith('fr-ca')) target = alternates.find(function(a) { return a.hreflang === 'fr-CA'; });
      if (lang.startsWith('fr-be')) target = alternates.find(function(a) { return a.hreflang === 'fr-BE'; });
      if (lang.startsWith('fr')) target = alternates.find(function(a) { return a.hreflang === 'fr-FR'; });
      if (lang.startsWith('de')) target = alternates.find(function(a) { return a.hreflang === 'de-DE'; });
      if (lang.startsWith('it')) target = alternates.find(function(a) { return a.hreflang === 'it-IT'; });
      if (lang.startsWith('nl-be')) target = alternates.find(function(a) { return a.hreflang === 'nl-BE'; });
      if (lang.startsWith('nl')) target = alternates.find(function(a) { return a.hreflang === 'nl-NL'; });
      if (lang.startsWith('pl')) target = alternates.find(function(a) { return a.hreflang === 'pl-PL'; });
      if (lang.startsWith('sv')) target = alternates.find(function(a) { return a.hreflang === 'sv-SE'; });
      if (target) break;
    }
    if (!target || target.hreflang === current) return;
    var link = root.querySelector('[data-language-suggestion-link]');
    var close = root.querySelector('[data-language-suggestion-close]');
    if (!link || !close) return;
    link.href = target.href;
    link.addEventListener('click', function() { localStorage.setItem('preferred-locale', target.hreflang); });
    close.addEventListener('click', function() {
      localStorage.setItem('preferred-locale', current || 'es-ES');
      root.setAttribute('hidden', '');
    });
    root.removeAttribute('hidden');
  })();
</script>
```

- [ ] **Step 3: Modificar Base props y head**

Actualizar `src/layouts/Base.astro` para aceptar:

```ts
import LanguageSelector from '@/components/LanguageSelector.astro';
import LanguageSuggestion from '@/components/LanguageSuggestion.astro';
import { DEFAULT_LOCALE, LOCALES, type Locale } from '@/i18n/locales';
import { t } from '@/i18n/ui';
import type { AlternateLink } from '@/i18n/routes';

interface Props {
  title: string;
  description: string;
  image?: string;
  canonical?: string;
  alternates?: AlternateLink[];
  locale?: Locale;
  ogType?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  robots?: string;
  noindex?: boolean;
}
```

Usar:

```ts
const {
  title,
  description,
  image,
  canonical,
  alternates = [],
  locale = DEFAULT_LOCALE,
  ogType = 'website',
  publishedTime,
  modifiedTime,
  robots,
  noindex = false,
} = Astro.props;
const localeConfig = LOCALES[locale];
const ui = t(locale);
```

Cambiar:
- `<html lang="es">` por `<html lang={localeConfig.htmlLang}>`.
- `og:locale` por `localeConfig.ogLocale`.
- RSS title/href solo para `es-ES` hasta que exista RSS i18n.
- hreflang fijo por map de `alternates`, anadiendo x-default si se pasa.
- schema `WebSite.inLanguage` por `localeConfig.hreflang`.
- textos de skip link, bottom nav, cookies y labels desde `ui`.

Renderizar:

```astro
<Header locale={locale} alternates={alternates} />
<LanguageSuggestion locale={locale} alternates={alternates} />
```

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: build correcto y HTML espanol equivalente.

- [ ] **Step 5: Commit**

```bash
git add src/layouts/Base.astro src/components/LanguageSelector.astro src/components/LanguageSuggestion.astro
git commit -m "feat(i18n): localize base layout and add language selector"
```

---

## Task 5: Localizar Header, Footer y ArticleCard

**Files:**
- Modify: `src/components/Header.astro`
- Modify: `src/components/Footer.astro`
- Modify: `src/components/ArticleCard.astro`

- [ ] **Step 1: Header recibe locale y alternates**

Actualizar `Header.astro` para:
- aceptar `locale` y `alternates`;
- construir hrefs con `localizedPath(locale, [...])`;
- renderizar `LanguageSelector`;
- traducir labels con `t(locale)`.

- [ ] **Step 2: Footer recibe locale**

Actualizar `Footer.astro` para:
- aceptar `locale`;
- traducir columnas y aviso de afiliados;
- enlazar rutas localizadas cuando existan.

- [ ] **Step 3: ArticleCard recibe locale**

Actualizar `ArticleCard.astro` para:
- aceptar `locale = 'es-ES'`;
- formatear fechas con `new Intl.DateTimeFormat(LOCALES[locale].htmlLang, ...)`;
- resolver URLs con `articlePath`;
- traducir `Leer mas`, `Actualizado`, categorias y lectura.

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: no quedan props obligatorias rotas.

- [ ] **Step 5: Commit**

```bash
git add src/components/Header.astro src/components/Footer.astro src/components/ArticleCard.astro
git commit -m "feat(i18n): localize navigation footer and article cards"
```

---

## Task 6: Localizar Article layout, schema y breadcrumbs

**Files:**
- Modify: `src/layouts/Article.astro`

- [ ] **Step 1: Article recibe locale y alternates**

Actualizar props:

```ts
interface Props {
  articulo: CollectionEntry<'articulos'> | CollectionEntry<'articulosI18n'>;
  locale?: Locale;
  canonical?: string;
  alternates?: AlternateLink[];
}
```

- [ ] **Step 2: Reemplazar hardcoded Spanish**

Cambiar:
- fecha `es-ES` por `LOCALES[locale].htmlLang`;
- `inLanguage: 'es'` por `LOCALES[locale].hreflang`;
- breadcrumbs `Inicio`, `Guias` desde `ui`;
- trust line y disclosure desde `ui.article`;
- `Base` recibe `locale`, `canonical`, `alternates`.

- [ ] **Step 3: Evitar related cross-locale**

Para articulos i18n, related solo debe salir de `articulosI18n` del mismo locale. Para `es-ES`, mantener collection `articulos`.

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: schema Article y BreadcrumbList siguen validos.

- [ ] **Step 5: Commit**

```bash
git add src/layouts/Article.astro
git commit -m "feat(i18n): localize article layout and schema"
```

---

## Task 7: Refactor Amazon para OneLink sin cambiar cada URL

**Files:**
- Create: `src/i18n/amazon.ts`
- Modify: `src/components/AffiliateButton.astro`
- Modify: `src/components/ComparisonTable.astro`
- Modify: `src/components/TopPick.astro`
- Modify: `src/lib/productos.ts`
- Modify: `src/lib/amazon-products.ts`
- Modify: `public/_redirects`

- [ ] **Step 1: Crear builder Amazon centralizado**

Crear `src/i18n/amazon.ts`:

```ts
import { LOCALES, type Locale } from './locales';

export function buildAmazonUrl(input: {
  href: string;
  locale: Locale;
}): string {
  const cfg = LOCALES[input.locale];
  const normalized = input.href.startsWith('/dp/')
    ? `https://${cfg.amazonDomain}${input.href}`
    : input.href;
  if (normalized.includes('tag=')) return normalized;
  return `${normalized}${normalized.includes('?') ? '&' : '?'}tag=${cfg.amazonTag}`;
}

export function buildAmazonSearchUrl(input: {
  query: string;
  locale: Locale;
}): string {
  const cfg = LOCALES[input.locale];
  return `https://${cfg.amazonDomain}/s?k=${encodeURIComponent(input.query)}&tag=${cfg.amazonTag}`;
}

export function amazonDisclosureRequired(locale: Locale): boolean {
  return locale !== 'es-ES' || true;
}
```

Nota de implementacion: de inicio `amazonDomain` sigue en `www.amazon.es` para todos los locales porque OneLink usa la tienda origen espanola. No se cambian ASINs en MDX. Si mas adelante se verifican ASINs locales, se anadira override por producto/locale.

- [ ] **Step 2: AffiliateButton recibe locale**

Actualizar `AffiliateButton.astro`:
- prop `locale?: Locale`;
- usar `buildAmazonUrl`;
- label desde `ui.commerce`;
- sr-only traducido.

- [ ] **Step 3: ComparisonTable recibe locale**

Actualizar:
- prop `locale?: Locale`;
- `priceCurrency` desde `LOCALES[locale].currency` solo si existe moneda verificada;
- `applicableCountry` y `addressCountry` desde `LOCALES[locale].country` solo si existe pais canonico;
- labels de ordenar y CTA desde `ui.commerce`;
- no mostrar precios convertidos si cache sigue en EUR. Para `/en/`, mostrar "Check price" y omitir `Offer` en Product schema hasta tener precio/moneda local verificada.

- [ ] **Step 4: TopPick recibe locale**

Actualizar:
- prop `locale?: Locale`;
- builder Amazon centralizado;
- CTA traducido;
- no mostrar precio EUR en locales de moneda no EUR salvo si el precio viene verificado para ese mercado.

- [ ] **Step 5: Productos helpers aceptan locale**

Actualizar `buildAmazonHref`, `buildAmazonSearchHref` y `buildProductCta` para aceptar `locale: Locale = 'es-ES'`.

- [ ] **Step 6: Revisar redirect /dp**

Cambiar `public/_redirects` para documentar que `/dp/*` es fallback legacy ES, no mecanismo i18n. Mantenerlo solo para URLs espanolas erroneas. No usar `/dp/*` en contenido internacional nuevo; componentes deben resolver a URL absoluta.

- [ ] **Step 7: Tests existentes**

Run: `npm test`
Expected: tests de `src/lib/productos.test.ts` actualizados para ES y un caso `en` con dominio origen OneLink.

- [ ] **Step 8: Build**

Run: `npm run build`
Expected: build correcto.

- [ ] **Step 9: Commit**

```bash
git add src/i18n/amazon.ts src/components/AffiliateButton.astro src/components/ComparisonTable.astro src/components/TopPick.astro src/lib/productos.ts src/lib/amazon-products.ts public/_redirects src/lib/productos.test.ts
git commit -m "feat(i18n): centralize Amazon OneLink URL handling"
```

---

## Task 8: Crear rutas localizadas para home, categorias y articulos

**Files:**
- Create: `src/pages/[locale]/index.astro`
- Create: `src/pages/[locale]/[categoria]/index.astro`
- Create: `src/pages/[locale]/[categoria]/[slug].astro`
- Create: `src/pages/[locale]/guides/index.astro`
- Create: `src/pages/[locale]/guides/[slug].astro`
- Create: `src/pages/[locale]/guias/index.astro`
- Create: `src/pages/[locale]/guias/[slug].astro`

- [ ] **Step 1: Home localizada**

Crear `src/pages/[locale]/index.astro` con `getStaticPaths()` solo para locales con `UI[locale].localeReady === true` y contenido aprobado. De inicio generar solo `en`.

- [ ] **Step 2: Categorias localizadas**

Crear ruta dinamica que lee articulos i18n por `locale` y `categoriaSlug`. Si no hay articulos, no generar path.

- [ ] **Step 3: Articulos comparativa localizados**

Crear ruta dinamica desde `articulosI18n` con `tipo !== 'informativo'`.

- [ ] **Step 4: Guias inglesas en `/en/guides/`**

Crear listado y detalle para `locale === 'en'` con segmento `guides`.

- [ ] **Step 5: Guias no inglesas con segmento local**

Crear rutas por locale no ingles con segmento de `LOCALES[locale].guideSegment`.

- [ ] **Step 6: Build**

Run: `npm run build`
Expected: no se generan rutas vacias; solo rutas con contenido i18n.

- [ ] **Step 7: Commit**

```bash
git add src/pages/[locale]
git commit -m "feat(i18n): add localized route structure"
```

---

## Task 9: Sitemap internacional y hreflang reciproco

**Files:**
- Modify: `astro.config.mjs`
- Create: `scripts/validate-hreflang.mjs`

- [ ] **Step 1: Configurar i18n Astro**

Anadir a `astro.config.mjs`:

```js
i18n: {
  locales: ['es-ES', 'en', 'fr-FR', 'fr-CA', 'fr-BE', 'nl-NL', 'nl-BE', 'de-DE', 'it-IT', 'pl-PL', 'sv-SE'],
  defaultLocale: 'es-ES',
  routing: {
    prefixDefaultLocale: false,
  },
},
```

- [ ] **Step 2: Sitemap con alternates**

Actualizar `serialize(item)` para anadir `links` cuando una URL tenga equivalentes publicados. Usar helpers de equivalencias para que cada grupo incluya solo versiones reales.

- [ ] **Step 3: Script de validacion hreflang**

Crear `scripts/validate-hreflang.mjs` que:
- lee `dist/**/*.html`;
- extrae canonical y `link[rel=alternate]`;
- comprueba canonical self-referencing;
- comprueba que cada alternate devuelve reciprocidad en su HTML generado;
- falla si una pagina internacional tiene `hreflang=es` apuntando a si misma sin version espanola equivalente.

- [ ] **Step 4: Package script**

Anadir:

```json
"validate:hreflang": "node scripts/validate-hreflang.mjs"
```

- [ ] **Step 5: Build + validar**

Run:

```bash
npm run build
npm run validate:hreflang
```

Expected: sitemap contiene `xhtml:link` y validacion pasa.

- [ ] **Step 6: Commit**

```bash
git add astro.config.mjs scripts/validate-hreflang.mjs package.json package-lock.json
git commit -m "feat(seo): generate and validate international hreflang"
```

---

## Task 10: Piloto editorial ingles unico

**Files:**
- Create: `src/content/articulos-i18n/en/best-ergonomic-office-chairs.mdx`
- Create: `src/content/articulos-i18n/en/how-to-set-up-an-ergonomic-home-office.mdx`
- Modify: `docs/agent-context/reference_i18n_workflow.md`

- [ ] **Step 1: Seleccionar URLs piloto**

Piloto recomendado:
- ES `mejor-silla-ergonomica-calidad-precio` -> EN `best-ergonomic-office-chairs`
- ES `ergonomia-teletrabajo-postura-correcta` -> EN `how-to-set-up-an-ergonomic-home-office`

Justificacion: una comparativa comercial y una guia informativa de confianza.

- [ ] **Step 2: Redactar/transcrear ingles**

Reglas:
- ingles internacional natural, no especificamente US/UK;
- evitar spelling muy marcado cuando haya alternativa neutral;
- no mencionar USD/GBP/CAD en el cuerpo salvo que el precio este verificado localmente;
- CTA: "Check price on Amazon";
- disclosure Amazon en ingles obligatorio;
- mantener experiencia real del autor sin inventar productos ni pruebas.

- [ ] **Step 3: Validar no literalidad**

Checklist:
- title distinto, no traduccion palabra por palabra;
- H1 orientado a query inglesa;
- slug ingles corto;
- intro reescrita;
- FAQs adaptadas;
- internal links solo a equivalentes ingleses existentes;
- sin enlaces internos a paginas espanolas desde cuerpo ingles salvo selector/hreflang.

- [ ] **Step 4: Build**

Run:

```bash
npm run build
npm run validate:hreflang
```

- [ ] **Step 5: Commit**

```bash
git add src/content/articulos-i18n/en docs/agent-context/reference_i18n_workflow.md
git commit -m "content(en): publish first localized pilot articles"
```

---

## Task 11: QA tecnico y SEO

**Files:**
- Create: `scripts/validate-i18n-content.mjs`
- Modify: `package.json`

- [ ] **Step 1: Crear validator de contenido i18n**

Crear script que falle si:
- una traduccion no tiene `translationOf`;
- `slug` no coincide con URL generada;
- `descripcion` supera 155 caracteres;
- una URL i18n contiene links internos a `/sillas/`, `/guias/`, `/accesorios/` espanoles sin equivalencia;
- una pagina internacional contiene frases espanolas visibles de UI conocidas.

- [ ] **Step 2: Anadir script**

```json
"validate:i18n": "node scripts/validate-i18n-content.mjs"
```

- [ ] **Step 3: Ejecutar QA**

Run:

```bash
npm run test
npm run validate:i18n
npm run build
npm run validate:hreflang
```

- [ ] **Step 4: Commit**

```bash
git add scripts/validate-i18n-content.mjs package.json package-lock.json
git commit -m "test(i18n): add localized content validation"
```

---

## Task 12: Documentar workflow para nuevos idiomas

**Files:**
- Create: `docs/agent-context/reference_i18n_workflow.md`
- Modify: `docs/agent-context/INDEX.md`

- [ ] **Step 1: Crear workflow i18n**

Documento debe incluir:
- no usar traduccion literal;
- no publicar locale sin editor/revision nativa;
- no generar URL si falta traduccion;
- no usar precios convertidos sin verificar Amazon/local marketplace;
- no inventar ASINs ni URLs locales;
- usar OneLink como baseline;
- solo crear overrides locales cuando ASIN/URL este verificado;
- diferenciar `fr-FR`, `fr-CA`, `fr-BE`, `nl-NL`, `nl-BE`;
- ingles unico `/en/`, no por pais.

- [ ] **Step 2: Registrar en INDEX**

Anadir fila:

```md
- [Workflow i18n SEO](reference_i18n_workflow.md) - Reglas para localizacion, hreflang, slugs, selector de idioma y afiliacion Amazon OneLink.
```

- [ ] **Step 3: Commit**

```bash
git add docs/agent-context/reference_i18n_workflow.md docs/agent-context/INDEX.md
git commit -m "docs(i18n): add international SEO localization workflow"
```

---

## Final QA Checklist

- [ ] `npm run test` pasa.
- [ ] `npm run validate:i18n` pasa.
- [ ] `npm run build` pasa.
- [ ] `npm run validate:hreflang` pasa.
- [ ] El HTML raiz sigue en espanol y conserva URLs actuales.
- [ ] `/en/` existe y no hay `en-us`, `en-gb`, `en-ca`.
- [ ] El selector aparece en header/footer y lista solo equivalentes disponibles.
- [ ] La sugerencia de idioma no fuerza redireccion.
- [ ] Canonical es self-referencing en cada URL.
- [ ] Hreflang es reciproco y solo incluye paginas existentes.
- [ ] `x-default` apunta a `/` mientras no exista selector global dedicado.
- [ ] No hay cuerpo espanol renderizado en `/en/`.
- [ ] CTAs, disclosures y labels estan localizados.
- [ ] Amazon links siguen usando tag vigente y dejan actuar OneLink.
- [ ] No se muestran precios en moneda no verificada.
- [ ] Schema Product usa moneda/pais coherentes o evita `offers` si no hay precio local fiable.
- [ ] Sitemap incluye alternates `xhtml:link`.
- [ ] `robots.txt` apunta al sitemap correcto.
- [ ] CSP se regenera solo con `npm run build`; no se editan hashes manualmente.

---

## Execution Order

1. Task 1-3: infraestructura i18n sin cambiar comportamiento publico.
2. Task 4-6: UI/layout/schema localizados.
3. Task 7: Amazon OneLink centralizado.
4. Task 8-9: rutas, canonical, sitemap y hreflang.
5. Task 10: piloto ingles unico.
6. Task 11-12: QA y documentacion.

Recommended execution mode: subagent-driven development, one task per subagent, with review after each task.
