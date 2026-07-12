import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const SITE_URL = 'https://tuespaciodetrabajo.com';
const ES_URL = `${SITE_URL}/herramientas/selector/`;
const EN_URL = `${SITE_URL}/en/tools/selector/`;
const SELECTOR_ALTERNATES = [
  ['es-ES', ES_URL],
  ['en', EN_URL],
  ['x-default', ES_URL],
];
const SITEMAP_GROUPS = [
  [
    ['es-ES', `${SITE_URL}/herramientas/`],
    ['en', `${SITE_URL}/en/tools/`],
    ['x-default', `${SITE_URL}/herramientas/`],
  ],
  [
    ['es-ES', `${SITE_URL}/herramientas/calculadora-ergonomia/`],
    ['en', `${SITE_URL}/en/tools/ergonomic-calculator/`],
    ['x-default', `${SITE_URL}/herramientas/calculadora-ergonomia/`],
  ],
  SELECTOR_ALTERNATES,
];
const HTML_BASELINE_BYTES = { 'es-ES': 781847, en: 777254 };
const MAX_BASELINE_RATIO = 0.85;
const INBOUND_LINKS = [
  { file: 'index.html', selectorPath: '/herramientas/selector/', body: true },
  { file: 'en/index.html', selectorPath: '/en/tools/selector/', body: true },
  { file: 'herramientas/index.html', selectorPath: '/herramientas/selector/', body: true },
  { file: 'en/tools/index.html', selectorPath: '/en/tools/selector/', body: true },
  { file: 'catalogo/index.html', selectorPath: '/herramientas/selector/', body: true },
  { file: 'en/catalog/index.html', selectorPath: '/en/tools/selector/', body: true },
  { file: 'sillas/index.html', selectorPath: '/herramientas/selector/', tipo: 'silla' },
  { file: 'escritorios/index.html', selectorPath: '/herramientas/selector/', tipo: 'escritorio' },
  { file: 'en/chairs/index.html', selectorPath: '/en/tools/selector/', tipo: 'silla' },
  { file: 'en/desks/index.html', selectorPath: '/en/tools/selector/', tipo: 'escritorio' },
  { file: 'catalogo/silla/index.html', selectorPath: '/herramientas/selector/', tipo: 'silla' },
  { file: 'catalogo/escritorio/index.html', selectorPath: '/herramientas/selector/', tipo: 'escritorio' },
  { file: 'en/catalog/chairs/index.html', selectorPath: '/en/tools/selector/', tipo: 'silla' },
  { file: 'en/catalog/standing-desks/index.html', selectorPath: '/en/tools/selector/', tipo: 'escritorio' },
  { file: 'accesorios/index.html', selectorPath: '/herramientas/selector/', unmapped: true },
  { file: 'en/accessories/index.html', selectorPath: '/en/tools/selector/', unmapped: true },
];

function decodeHtml(value) {
  return value
    .replaceAll('&#39;', "'")
    .replaceAll('&quot;', '"')
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>');
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function firstMatch(html, regex, file, label, errors) {
  const match = html.match(regex);
  if (!match) {
    errors.push(`${file}: missing ${label}`);
    return null;
  }
  return decodeHtml(match.slice(1).find((value) => value !== undefined));
}

function parseJsonScripts(html, type, file, errors) {
  const pattern = new RegExp(`<script[^>]*type=["']${escapeRegex(type)}["'][^>]*>([\\s\\S]*?)<\\/script>`, 'gi');
  return [...html.matchAll(pattern)].flatMap((match, index) => {
    try {
      return [JSON.parse(match[1])];
    } catch (error) {
      errors.push(`${file}: invalid ${type} script ${index + 1}: ${error.message}`);
      return [];
    }
  });
}

function expectedDescription(locale, count) {
  return locale === 'en'
    ? `Answer a few questions and we'll recommend the 3 best chairs or desks for your body, space, and budget. Based on real specs from ${count} products.`
    : `Responde unas preguntas y descubre las 3 mejores sillas o escritorios para tu cuerpo, espacio y presupuesto, usando specs reales de ${count} productos.`;
}

function visibleText(html) {
  return decodeHtml(html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' '));
}

function readRequired(file, errors) {
  if (!existsSync(file)) {
    errors.push(`${file}: generated file is missing; run "npx astro build" first`);
    return null;
  }
  return readFileSync(file, 'utf8');
}

function oneTipo(matches, file, errors, sourceKind) {
  if (matches.length !== 1) {
    errors.push(`${file}: ambiguous ${sourceKind} tipo declaration; expected exactly one, found ${matches.length}`);
    return null;
  }
  const tipo = matches[0].trim();
  if (!tipo) {
    errors.push(`${file}: ${sourceKind} tipo declaration is blank`);
    return null;
  }
  return tipo;
}

function deriveEligibleInventory(sourceDir, errors) {
  const productDir = resolve(sourceDir, 'content/productos');
  const configDir = resolve(sourceDir, 'lib/selector');
  if (!existsSync(productDir)) errors.push(`${productDir}: source product directory is missing`);
  if (!existsSync(configDir)) errors.push(`${configDir}: selector config directory is missing`);
  if (!existsSync(productDir) || !existsSync(configDir)) return null;

  const products = readdirSync(productDir)
    .filter((file) => /\.(?:ya?ml|json)$/.test(file))
    .map((file) => {
      const path = resolve(productDir, file);
      const source = readFileSync(path, 'utf8');
      let matches;
      if (file.endsWith('.json')) {
        try {
          const parsed = JSON.parse(source);
          matches = typeof parsed.tipo === 'string' ? [parsed.tipo] : [];
        } catch (error) {
          errors.push(`${path}: invalid product JSON: ${error.message}`);
          matches = [];
        }
      } else {
        matches = [...source.matchAll(/^tipo:\s*["']?([^"'\s#]+)["']?\s*(?:#.*)?$/gm)].map((match) => match[1]);
      }
      return { slug: file.replace(/\.(?:ya?ml|json)$/, ''), tipo: oneTipo(matches, path, errors, 'product') };
    });
  if (products.length === 0) errors.push(`${productDir}: no product source files found`);
  const duplicateSlugs = products.map(({ slug }) => slug).filter((slug, index, all) => all.indexOf(slug) !== index);
  if (duplicateSlugs.length) errors.push(`${productDir}: duplicate product slugs: ${[...new Set(duplicateSlugs)].join(', ')}`);

  const configFiles = readdirSync(configDir).filter((file) => /^config-.+\.ts$/.test(file));
  if (configFiles.length === 0) errors.push(`${configDir}: no selector config source files found`);
  const configTypes = configFiles.flatMap((file) => {
    const path = resolve(configDir, file);
    const source = readFileSync(path, 'utf8');
    const matches = [...source.matchAll(/\btipo\s*:\s*(["'])([^"']+)\1/g)].map((match) => match[2]);
    const tipo = oneTipo(matches, path, errors, 'selector config');
    return tipo ? [tipo] : [];
  });
  const duplicateTypes = configTypes.filter((tipo, index, all) => all.indexOf(tipo) !== index);
  if (duplicateTypes.length) errors.push(`${configDir}: duplicate selector config tipos: ${[...new Set(duplicateTypes)].join(', ')}`);

  const counts = Object.fromEntries(configTypes.map((tipo) => [
    tipo,
    products.filter((product) => product.tipo === tipo).length,
  ]));
  const eligibleTypes = configTypes.filter((tipo) => counts[tipo] >= 5).sort();
  return {
    count: eligibleTypes.reduce((total, tipo) => total + counts[tipo], 0),
    counts,
    eligibleTypes,
  };
}

function parseRuntimePayload(html, file, errors) {
  if (/data-selector-schema-lookup/.test(html)) {
    errors.push(`${file}: duplicate data-selector-schema-lookup payload must not be emitted`);
  }
  const matches = [...html.matchAll(/<script[^>]*type=["']application\/json["'][^>]*data-selector-payload[^>]*>([\s\S]*?)<\/script>/gi)];
  if (matches.length !== 1) {
    errors.push(`${file}: expected exactly one data-selector-payload script; found ${matches.length}`);
  }
  const match = matches[0];
  if (!match) {
    return null;
  }
  if (match[1].includes('<')) errors.push(`${file}: selector payload contains an unescaped "<"`);
  try {
    return JSON.parse(match[1]);
  } catch (error) {
    errors.push(`${file}: invalid selector payload JSON: ${error.message}`);
    return null;
  }
}

function anchorHrefs(html) {
  return [...html.matchAll(/<a\b[^>]*\bhref=(?:"([^"]*)"|'([^']*)')[^>]*>/gi)]
    .map((match) => decodeHtml(match[1] ?? match[2]));
}

export function validateSelectorBuild(options = {}) {
  const distDir = resolve(options.distDir ?? 'dist');
  const sourceDir = resolve(options.sourceDir ?? 'src');
  const errors = [];
  const inventory = deriveEligibleInventory(sourceDir, errors);
  const expectedCount = inventory?.count ?? null;
  if (inventory && (!Number.isInteger(expectedCount) || expectedCount <= 0)) {
    errors.push(`${sourceDir}: independently derived eligible product count must be positive; got ${expectedCount}`);
  }

  const pages = [
    {
      locale: 'es-ES', file: resolve(distDir, 'herramientas/selector/index.html'),
      title: 'Recomendador de sillas y escritorios para home office', canonical: ES_URL,
      appName: 'Recomendador de sillas y escritorios', breadcrumbName: 'Recomendador de sillas y escritorios',
    },
    {
      locale: 'en', file: resolve(distDir, 'en/tools/selector/index.html'),
      title: 'Chair & Standing Desk Finder | Tu Espacio de Trabajo', canonical: EN_URL,
      appName: 'Chair & standing desk finder', breadcrumbName: 'Chair & standing desk finder',
    },
  ];
  const parsedPages = [];

  for (const page of pages) {
    const html = readRequired(page.file, errors);
    if (!html) continue;
    const payload = parseRuntimePayload(html, page.file, errors);
    parsedPages.push({ ...page, html, payload });
  }

  for (const page of parsedPages) {
    const products = Array.isArray(page.payload?.products) ? page.payload.products : [];
    const configs = Array.isArray(page.payload?.configs) ? page.payload.configs : [];
    if (!Array.isArray(page.payload?.products)) errors.push(`${page.file}: runtime selector payload products must be an array`);
    if (!Array.isArray(page.payload?.configs)) errors.push(`${page.file}: runtime selector payload configs must be an array`);
    if (expectedCount && products.length !== expectedCount) {
      errors.push(`${page.file}: runtime selector payload has ${products.length} products; source inventory requires ${expectedCount}`);
    }
    const slugs = products.map((product) => product?.slug).filter((slug) => typeof slug === 'string');
    if (slugs.length !== products.length || new Set(slugs).size !== slugs.length) {
      errors.push(`${page.file}: runtime selector payload product slugs must be complete and unique`);
    }
    if (products.some((product) => product?.locale !== page.locale)) {
      errors.push(`${page.file}: runtime selector payload contains a product from the wrong locale`);
    }
    const configTypes = configs.map((config) => config?.tipo).filter((tipo) => typeof tipo === 'string').sort();
    if (configTypes.length !== configs.length || new Set(configTypes).size !== configTypes.length) {
      errors.push(`${page.file}: runtime selector payload config tipos must be complete and unique`);
    }
    if (inventory && JSON.stringify(configTypes) !== JSON.stringify(inventory.eligibleTypes)) {
      errors.push(`${page.file}: runtime eligible config tipos ${JSON.stringify(configTypes)} do not match source ${JSON.stringify(inventory.eligibleTypes)}`);
    }
    if (inventory) {
      for (const tipo of inventory.eligibleTypes) {
        const config = configs.find((candidate) => candidate?.tipo === tipo);
        if (config?.productCount !== inventory.counts[tipo]) {
          errors.push(`${page.file}: config ${tipo} declares ${JSON.stringify(config?.productCount)} products; source requires ${inventory.counts[tipo]}`);
        }
        const runtimeCount = products.filter((product) => product?.tipo === tipo).length;
        if (runtimeCount !== inventory.counts[tipo]) {
          errors.push(`${page.file}: config ${tipo} has ${runtimeCount} runtime products; source requires ${inventory.counts[tipo]}`);
        }
      }
    }

    const title = firstMatch(page.html, /<title>([\s\S]*?)<\/title>/i, page.file, 'title', errors);
    if (title !== null && title !== page.title) errors.push(`${page.file}: title is ${JSON.stringify(title)}; expected ${JSON.stringify(page.title)}`);
    const description = firstMatch(page.html, /<meta\s+name=["']description["']\s+content=(?:"([^"]*)"|'([^']*)')/i, page.file, 'meta description', errors);
    if (description !== null && expectedCount) {
      const expected = expectedDescription(page.locale, expectedCount);
      if (description !== expected) errors.push(`${page.file}: meta description is stale; expected exact source-count copy ${JSON.stringify(expected)}`);
      if (description.length < 140 || description.length > 155) errors.push(`${page.file}: meta description length is ${description.length}; expected 140-155 characters`);
    }
    const canonical = firstMatch(page.html, /<link\s+rel=["']canonical["']\s+href=["']([^"']*)["']/i, page.file, 'canonical link', errors);
    if (canonical !== null && canonical !== page.canonical) errors.push(`${page.file}: canonical is ${canonical}; expected ${page.canonical}`);
    const robots = firstMatch(page.html, /<meta\s+name=["']robots["']\s+content=["']([^"']*)["']/i, page.file, 'robots meta', errors);
    if (robots?.toLowerCase().includes('noindex')) errors.push(`${page.file}: robots meta is noindex; selector pages must be indexable`);
    const alternates = [...page.html.matchAll(/<link\s+rel=["']alternate["']\s+hreflang=["']([^"']+)["']\s+href=["']([^"']+)["']/gi)]
      .map((match) => [match[1], decodeHtml(match[2])]);
    if (JSON.stringify(alternates) !== JSON.stringify(SELECTOR_ALTERNATES)) {
      errors.push(`${page.file}: hreflang links are ${JSON.stringify(alternates)}; expected ${JSON.stringify(SELECTOR_ALTERNATES)}`);
    }

    const schemas = parseJsonScripts(page.html, 'application/ld+json', page.file, errors);
    const application = schemas.find((schema) => schema['@type'] === 'WebApplication');
    const validApplication = application
      && application.name === page.appName
      && application.url === page.canonical
      && application.description === expectedDescription(page.locale, expectedCount)
      && application.applicationCategory === 'LifestyleApplication'
      && application.operatingSystem === 'Web'
      && application.isAccessibleForFree === true
      && application.inLanguage === page.locale
      && application.offers?.price === 0
      && application.offers?.priceCurrency === 'EUR';
    if (!validApplication) errors.push(`${page.file}: WebApplication JSON-LD does not match the approved localized free-EUR app contract and source count`);
    const breadcrumb = schemas.find((schema) => schema['@type'] === 'BreadcrumbList');
    const finalItem = breadcrumb?.itemListElement?.at(-1);
    if (!breadcrumb || finalItem?.name !== page.breadcrumbName || finalItem?.item !== page.canonical) {
      errors.push(`${page.file}: BreadcrumbList final item must be ${page.breadcrumbName} at ${page.canonical}`);
    }
    if (schemas.some((schema) => schema['@type'] === 'ItemList')) errors.push(`${page.file}: found a static ItemList; result schema must only be created after selector:results`);

    const maxBytes = Math.floor(HTML_BASELINE_BYTES[page.locale] * MAX_BASELINE_RATIO);
    const actualBytes = statSync(page.file).size;
    if (actualBytes > maxBytes) errors.push(`${page.file}: raw HTML is ${actualBytes} bytes; expected at most ${maxBytes} (${MAX_BASELINE_RATIO * 100}% of measured baseline)`);
    if (page.locale === 'en') {
      const text = visibleText(page.html);
      for (const spanish of ['Encuentra la silla', 'Responde unas preguntas', 'Herramientas', 'Recomendador de sillas', 'sillas y escritorios']) {
        if (text.includes(spanish)) errors.push(`${page.file}: visible English page contains Spanish copy ${JSON.stringify(spanish)}`);
      }
    }

    if (!/@media\s*\(max-width:\s*960px\)/.test(page.html)) {
      errors.push(`${page.file}: missing generated 960px header mobile-menu contract`);
    }
    const primaryNav = page.html.match(/<nav\b[^>]*class=["'][^"']*\bnav\b[^"']*["'][^>]*>[\s\S]*?<\/nav>/i)?.[0];
    if (!primaryNav) {
      errors.push(`${page.file}: missing generated primary navigation`);
    } else {
      const navAnchors = [...primaryNav.matchAll(/<a\b[^>]*>/gi)].map((match) => match[0]);
      const activeAnchors = navAnchors.filter((anchor) => {
        const classes = anchor.match(/\bclass=["']([^"']*)["']/i)?.[1].split(/\s+/) ?? [];
        return classes.includes('nav-link') && classes.includes('active');
      });
      if (activeAnchors.length !== 1) {
        errors.push(`${page.file}: expected exactly one active primary navigation link; found ${activeAnchors.length}`);
      } else {
        const href = decodeHtml(activeAnchors[0].match(/\bhref=["']([^"']*)["']/i)?.[1] ?? '');
        const expectedHref = page.locale === 'en' ? '/en/tools/' : '/herramientas/';
        if (href !== expectedHref || /\baria-current=["']page["']/i.test(activeAnchors[0])) {
          errors.push(`${page.file}: active primary navigation must be the parent tools link without aria-current=page`);
        }
      }
    }
  }

  if (existsSync(distDir)) {
    const sitemapFiles = readdirSync(distDir).filter((name) => /^sitemap-\d+\.xml$/.test(name)).map((name) => resolve(distDir, name));
    if (sitemapFiles.length === 0) errors.push(`${distDir}: no sitemap-N.xml file found`);
    const sitemap = sitemapFiles.map((file) => readFileSync(file, 'utf8')).join('\n');
    for (const group of SITEMAP_GROUPS) {
      for (const [, url] of group.slice(0, 2)) {
        const entry = sitemap.match(new RegExp(`<url>\\s*<loc>${escapeRegex(url)}<\\/loc>[\\s\\S]*?<\\/url>`))?.[0];
        if (!entry) {
          errors.push(`sitemap: missing localized tool URL ${url}`);
          continue;
        }
        for (const [hreflang, href] of group) {
          if (!entry.includes(`hreflang="${hreflang}"`) || !entry.includes(`href="${href}"`)) {
            errors.push(`sitemap: ${url} is missing reciprocal hreflang ${hreflang} -> ${href}`);
          }
        }
      }
    }

    let selectorInboundCount = 0;
    for (const contract of INBOUND_LINKS) {
      const file = resolve(distDir, contract.file);
      const html = readRequired(file, errors);
      if (!html) continue;
      const hrefs = anchorHrefs(html);
      const bodyHrefs = anchorHrefs(html.replace(/<header\b[\s\S]*?<\/header>/i, ''));
      const contextualPrefix = `${contract.selectorPath}?tipo=`;
      if (contract.body) {
        const count = bodyHrefs.filter((href) => href === contract.selectorPath).length;
        if (count < 1) errors.push(`${file}: expected a body inbound link to ${contract.selectorPath} independently from the global header`);
        else selectorInboundCount += 1;
      } else if (contract.tipo) {
        const expected = `${contract.selectorPath}?tipo=${contract.tipo}`;
        if (!hrefs.includes(expected)) errors.push(`${file}: missing contextual selector inbound link ${expected}`);
        else selectorInboundCount += 1;
      } else if (contract.unmapped && hrefs.some((href) => href.startsWith(contextualPrefix))) {
        errors.push(`${file}: unmapped category must not link to a contextual selector tipo`);
      }
    }
    if (selectorInboundCount === 0) errors.push('selector pages are orphaned: no key inbound links were found');
  }

  if (errors.length) throw new Error(`Selector build validation failed:\n- ${errors.join('\n- ')}`);
  return { productCount: expectedCount, pages: parsedPages.length };
}

const isCli = process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
if (isCli) {
  try {
    const result = validateSelectorBuild();
    console.log(`Selector build valid: ${result.pages} pages, ${result.productCount} eligible products`);
  } catch (error) {
    console.error(`[validate:selector-build] ${error.message}`);
    process.exitCode = 1;
  }
}
