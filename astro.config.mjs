import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import fs from 'node:fs';
import path from 'node:path';

const SITE_URL = 'https://tuespaciodetrabajo.com';
const I18N_LOCALES = {
  'es-ES': { path: '', hreflang: 'es-ES', guideSegment: 'guias' },
  en: { path: 'en', hreflang: 'en', guideSegment: 'guides' },
};

function readFrontmatter(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const fmMatch = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) return {};

  return Object.fromEntries(
    fmMatch[1]
      .split('\n')
      .map((line) => line.match(/^([A-Za-z0-9_-]+):\s*(.+)$/))
      .filter(Boolean)
      .map((match) => [
        match[1],
        match[2].trim().replace(/^["']|["']$/g, ''),
      ])
  );
}

function absoluteUrl(pathname) {
  return `${SITE_URL}${pathname}`;
}

function localizedPath(locale, segments = []) {
  const prefix = I18N_LOCALES[locale]?.path;
  const clean = [prefix, ...segments].filter(Boolean).map((segment) => String(segment).replace(/^\/+|\/+$/g, ''));
  const path = clean.join('/');
  return `/${path}${path ? '/' : ''}`;
}

function getBaseArticleUrl(article) {
  const prefix = article.tipo === 'informativo' ? 'guias' : article.categoria;
  return absoluteUrl(localizedPath('es-ES', [prefix, article.slug]));
}

function getI18nArticleUrl(article) {
  const locale = article.locale;
  const prefix = article.tipo === 'informativo'
    ? I18N_LOCALES[locale].guideSegment
    : article.categoriaSlug;
  return absoluteUrl(localizedPath(locale, [prefix, article.localizedSlug]));
}

function collectBaseArticles() {
  const dir = path.resolve('src/content/articulos');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.mdx'));

  return files.map((file) => {
    const fm = readFrontmatter(path.join(dir, file));
    return {
      ...fm,
      slug: file.replace('.mdx', ''),
      locale: 'es-ES',
      date: fm.actualizadoEn || fm.fecha,
    };
  });
}

function collectI18nArticles() {
  const root = path.resolve('src/content/articulosI18n');
  if (!fs.existsSync(root)) return [];

  return fs.readdirSync(root, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .flatMap((localeDir) => {
      const dir = path.join(root, localeDir.name);
      return fs.readdirSync(dir)
        .filter(file => file.endsWith('.mdx'))
        .map((file) => {
          const fm = readFrontmatter(path.join(dir, file));
          return {
            ...fm,
            locale: fm.locale,
            date: fm.actualizadoEn || fm.fecha,
          };
        });
    })
    .filter(article => article.locale && article.translationOf && article.localizedSlug);
}

function collectProducts() {
  const dir = path.resolve('src/content/productos');
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir)
    .filter(file => /\.(ya?ml|json)$/.test(file))
    .map((file) => {
      const raw = fs.readFileSync(path.join(dir, file), 'utf-8');
      const tipo = raw.match(/^tipo:\s*["']?([^"'\n]+)["']?/m)?.[1] || 'silla';
      return {
        slug: file.replace(/\.(ya?ml|json)$/, ''),
        tipo,
      };
    });
}

// Map article URLs to their real publication/update dates
function buildDateMap() {
  const map = new Map();

  for (const article of collectBaseArticles()) {
    if (article.date && article.categoria) {
      map.set(getBaseArticleUrl(article), new Date(article.date).toISOString());
    }
  }

  for (const article of collectI18nArticles()) {
    if (article.date && I18N_LOCALES[article.locale]) {
      map.set(getI18nArticleUrl(article), new Date(article.date).toISOString());
    }
  }

  return map;
}

function buildHreflangMap() {
  const map = new Map();
  const baseArticles = collectBaseArticles();
  const i18nArticles = collectI18nArticles();

  const addGroup = (pathsByLocale) => {
    const links = Object.entries(pathsByLocale)
      .filter(([locale]) => I18N_LOCALES[locale])
      .map(([locale, url]) => ({ lang: I18N_LOCALES[locale].hreflang, url }));

    if (pathsByLocale['es-ES']) {
      links.push({ lang: 'x-default', url: pathsByLocale['es-ES'] });
    }

    if (links.length <= 1) return;
    for (const link of links) {
      if (link.lang !== 'x-default') map.set(link.url, links);
    }
  };

  addGroup({
    'es-ES': absoluteUrl(localizedPath('es-ES')),
    en: absoluteUrl(localizedPath('en')),
  });
  addGroup({
    'es-ES': absoluteUrl(localizedPath('es-ES', ['sillas'])),
    en: absoluteUrl(localizedPath('en', ['chairs'])),
  });
  addGroup({
    'es-ES': absoluteUrl(localizedPath('es-ES', ['escritorios'])),
    en: absoluteUrl(localizedPath('en', ['desks'])),
  });
  addGroup({
    'es-ES': absoluteUrl(localizedPath('es-ES', ['accesorios'])),
    en: absoluteUrl(localizedPath('en', ['accessories'])),
  });
  addGroup({
    'es-ES': absoluteUrl(localizedPath('es-ES', ['ambiente'])),
    en: absoluteUrl(localizedPath('en', ['workspace'])),
  });
  addGroup({
    'es-ES': absoluteUrl(localizedPath('es-ES', ['audio-video'])),
    en: absoluteUrl(localizedPath('en', ['audio-video'])),
  });
  addGroup({
    'es-ES': absoluteUrl(localizedPath('es-ES', ['guias'])),
    en: absoluteUrl(localizedPath('en', ['guides'])),
  });
  addGroup({
    'es-ES': absoluteUrl(localizedPath('es-ES', ['articulos'])),
    en: absoluteUrl(localizedPath('en', ['articles'])),
  });
  addGroup({
    'es-ES': absoluteUrl(localizedPath('es-ES', ['catalogo'])),
    en: absoluteUrl(localizedPath('en', ['catalog'])),
  });
  addGroup({
    'es-ES': absoluteUrl(localizedPath('es-ES', ['catalogo', 'silla'])),
    en: absoluteUrl(localizedPath('en', ['catalog', 'chairs'])),
  });
  addGroup({
    'es-ES': absoluteUrl(localizedPath('es-ES', ['catalogo', 'escritorio'])),
    en: absoluteUrl(localizedPath('en', ['catalog', 'standing-desks'])),
  });
  addGroup({
    'es-ES': absoluteUrl(localizedPath('es-ES', ['herramientas'])),
    en: absoluteUrl(localizedPath('en', ['tools'])),
  });
  addGroup({
    'es-ES': absoluteUrl(localizedPath('es-ES', ['herramientas', 'calculadora-ergonomia'])),
    en: absoluteUrl(localizedPath('en', ['tools', 'ergonomic-calculator'])),
  });
  addGroup({
    'es-ES': absoluteUrl(localizedPath('es-ES', ['herramientas', 'selector'])),
    en: absoluteUrl(localizedPath('en', ['tools', 'selector'])),
  });
  addGroup({
    'es-ES': absoluteUrl(localizedPath('es-ES', ['sobre-mi'])),
    en: absoluteUrl(localizedPath('en', ['about'])),
  });
  addGroup({
    'es-ES': absoluteUrl(localizedPath('es-ES', ['metodologia-editorial'])),
    en: absoluteUrl(localizedPath('en', ['editorial-methodology'])),
  });
  addGroup({
    'es-ES': absoluteUrl(localizedPath('es-ES', ['como-probamos-productos'])),
    en: absoluteUrl(localizedPath('en', ['how-we-test-products'])),
  });
  addGroup({
    'es-ES': absoluteUrl(localizedPath('es-ES', ['politica-privacidad'])),
    en: absoluteUrl(localizedPath('en', ['privacy-policy'])),
  });
  addGroup({
    'es-ES': absoluteUrl(localizedPath('es-ES', ['aviso-legal'])),
    en: absoluteUrl(localizedPath('en', ['legal-notice'])),
  });
  addGroup({
    'es-ES': absoluteUrl(localizedPath('es-ES', ['cookies'])),
    en: absoluteUrl(localizedPath('en', ['cookies'])),
  });

  for (const baseArticle of baseArticles) {
    const translations = i18nArticles.filter(article => article.translationOf === baseArticle.slug);
    if (!translations.length) continue;

    addGroup({
      'es-ES': getBaseArticleUrl(baseArticle),
      ...Object.fromEntries(translations.map(article => [article.locale, getI18nArticleUrl(article)])),
    });
  }

  const EN_TIPO_SLUG = { silla: 'chairs', escritorio: 'standing-desks' };
  for (const product of collectProducts()) {
    const enTipo = EN_TIPO_SLUG[product.tipo] ?? product.tipo;
    addGroup({
      'es-ES': absoluteUrl(localizedPath('es-ES', ['catalogo', product.tipo, product.slug])),
      en: absoluteUrl(localizedPath('en', ['catalog', enTipo, product.slug])),
    });
  }

  return map;
}

const dateMap = buildDateMap();
const hreflangMap = buildHreflangMap();

export default defineConfig({
  site: SITE_URL,
  trailingSlash: 'always',
  integrations: [
    mdx(),
    sitemap({
      filter: (page) =>
        !page.includes('/aviso-legal/') &&
        !page.includes('/en/legal-notice/') &&
        !page.includes('/cookies/') &&
        !page.includes('/en/cookies/') &&
        !page.includes('/politica-privacidad/') &&
        !page.includes('/en/privacy-policy/') &&
        !page.includes('/buscar/') &&
        !page.includes('/en/search/') &&
        !page.includes('/en/news/') &&
        !page.includes('/en/updates/') &&
        !page.includes('/tags') &&
        !page.includes('/actualizaciones/') &&
        // Excluye el hub del comparador (es noindex) sin tocar las páginas
        // prebuilt /comparar/<tipo>/<a>-vs-<b>/, que sí deben indexarse.
        !/\/comparar\/[^/]+\/$/.test(page) &&
        !/\/en\/compare\/[^/]+\/$/.test(page) &&
        page !== 'https://tuespaciodetrabajo.com/en/audio-video/' &&
        page !== 'https://tuespaciodetrabajo.com/audio-video/',
      serialize(item) {
        const lastmod = dateMap.get(item.url);
        const links = hreflangMap.get(item.url);
        return {
          ...item,
          ...(lastmod ? { lastmod } : {}),
          ...(links ? { links } : {}),
        };
      },
    }),
  ],
  output: 'static',
  vite: {
    resolve: {
      alias: {
        '@': '/src',
      },
    },
  },
});
