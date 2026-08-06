#!/usr/bin/env node
/**
 * IndexNow submission script for tuespaciodetrabajo.com
 *
 * Hashes source content files (MDX + YAML) to detect real content changes,
 * NOT build artifacts. This prevents submitting all URLs on every build.
 *
 * Usage:
 *   node scripts/indexnow.mjs              # Submit changed URLs
 *   node scripts/indexnow.mjs --all        # Submit all URLs (first time / reset)
 *   node scripts/indexnow.mjs --dry-run    # Show what would be submitted
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join, extname } from 'path';
import { createHash } from 'crypto';
import https from 'https';

const SITE = 'https://tuespaciodetrabajo.com';
const KEY = '1d9244a681114ca19849ee6c53fa5d74';
const KEY_LOCATION = `${SITE}/${KEY}.txt`;
const ENDPOINT = 'https://api.indexnow.org/indexnow';
const STATE_FILE = join(import.meta.dirname, '..', '.indexnow-state.json');
const ROOT = join(import.meta.dirname, '..');
const MAX_URLS_PER_REQUEST = 50;
const DELAY_BETWEEN_BATCHES_MS = 1000;

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const submitAll = args.includes('--all');

// ---------------------------------------------------------------------------
// URL mapping
// ---------------------------------------------------------------------------

const CATEGORIAS = ['sillas', 'escritorios', 'accesorios', 'ambiente', 'audio-video'];

/** Extract a YAML frontmatter field from MDX using simple regex. */
function fmField(content, field) {
  const re = new RegExp(`^${field}:\\s*(.+)$`, 'm');
  const m = content.match(re);
  if (!m) return null;
  let val = m[1].trim();
  // Remove surrounding quotes
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    val = val.slice(1, -1);
  }
  return val;
}

/** Map an MDX article source file to its ES + EN URLs. */
function articleUrls(slug, content) {
  const tipo = fmField(content, 'tipo') || 'comparativa';
  const categoria = fmField(content, 'categoria');
  const urls = [];

  if (tipo === 'informativo') {
    urls.push(`${SITE}/guias/${slug}/`);
    urls.push(`${SITE}/en/guides/${slug}/`);
  } else if (categoria && CATEGORIAS.includes(categoria)) {
    urls.push(`${SITE}/${categoria}/${slug}/`);
    urls.push(`${SITE}/en/${categoria}/${slug}/`);
  }
  return urls;
}

/** Map a YAML product source file to its ES + EN URLs. */
function productUrls(slug, content) {
  const tipoRaw = fmField(content, 'tipo');
  const tipo = tipoRaw ? tipoRaw.replace(/"/g, '').replace(/'/g, '') : null;
  if (!tipo) return [];
  return [
    `${SITE}/catalogo/${tipo}/${slug}/`,
    `${SITE}/en/catalog/${tipo}/${slug}/`,
  ];
}

// ---------------------------------------------------------------------------
// Collect source files and compute hashes
// ---------------------------------------------------------------------------

/** Hash file contents. */
function hashContent(content) {
  return createHash('md5').update(content).digest('hex');
}

/** Collect all source content files and map to URLs with hashes. */
function collectSourcePages() {
  const urlSources = {}; // url → [{ source, hash }]

  function add(url, source, hash) {
    if (!urlSources[url]) urlSources[url] = [];
    urlSources[url].push({ source, hash });
  }

  // MDX articles
  const articulosDir = join(ROOT, 'src', 'content', 'articulos');
  if (existsSync(articulosDir)) {
    for (const file of readdirSync(articulosDir)) {
      if (!file.endsWith('.mdx')) continue;
      const slug = file.replace('.mdx', '');
      const content = readFileSync(join(articulosDir, file), 'utf-8');
      const hash = hashContent(content);
      for (const url of articleUrls(slug, content)) {
        add(url, `articulos/${file}`, hash);
      }
    }
  }

  // YAML products
  const productosDir = join(ROOT, 'src', 'content', 'productos');
  if (existsSync(productosDir)) {
    for (const file of readdirSync(productosDir)) {
      if (!file.endsWith('.yaml')) continue;
      const slug = file.replace('.yaml', '');
      const content = readFileSync(join(productosDir, file), 'utf-8');
      const hash = hashContent(content);
      for (const url of productUrls(slug, content)) {
        add(url, `productos/${file}`, hash);
      }
    }
  }

  // Static pages
  const pagesDir = join(ROOT, 'src', 'pages');
  for (const { url, hash, src } of collectStaticPages(pagesDir, pagesDir)) {
    add(url, src, hash);
  }

  // Merge: when multiple sources map to the same URL, hash their combined hashes
  const entries = [];
  for (const [url, sources] of Object.entries(urlSources)) {
    sources.sort((a, b) => a.source.localeCompare(b.source));
    const combined = sources.map(s => s.hash).join(':');
    entries.push({ url, hash: hashContent(combined) });
  }

  return entries;
}

/** Collect static/template pages from src/pages/ */
function collectStaticPages(dir, baseDir) {
  const entries = [];
  if (!existsSync(dir)) return entries;

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      entries.push(...collectStaticPages(full, baseDir));
    } else if (entry.name.endsWith('.astro')) {
      const content = readFileSync(full, 'utf-8');
      const hash = hashContent(content);

      const rel = full.replace(baseDir, '').replace(/\\/g, '/');
      const urls = staticPageUrls(rel);

      for (const url of urls) {
        entries.push({ url, hash, src: rel });
      }
    }
  }
  return entries;
}

/** Map an Astro page template path to its output URLs. */
function staticPageUrls(relPath) {
  // Strip file extension and leading slash
  let path = relPath.replace(/\.astro$/, '');
  if (path.startsWith('/')) path = path.slice(1);

  // Handle [locale] dynamic routes — these generate both ES and EN
  if (path.startsWith('[locale]/')) {
    const rest = path.replace('[locale]/', '');
    const routes = rest.split('/').map(seg => {
      if (seg === 'index') return '';
      if (seg.startsWith('[') && seg.endsWith(']')) return ':' + seg.slice(1, -1);
      return seg;
    }).filter(s => s !== '');

    // For dynamic segments we can't enumerate all values, so hash the template
    // and map to a canonical placeholder. The actual URLs will be submitted when
    // the corresponding content file changes.
    // For static segments (no [param]), generate concrete URLs.
    if (rest === 'index') {
      return [`${SITE}/`, `${SITE}/en/`];
    }
    // Dynamic routes like [locale]/[categoria]/[slug].astro or
    // [locale]/catalog/[tipo]/[slug].astro — too many combinations.
    // We skip these; individual pages are covered by source file hashing.
    return [];
  }

  // Handle [categoria] dynamic routes (ES only, no locale prefix)
  if (path.startsWith('[categoria]/')) {
    return [];
  }

  // Handle concrete ES routes
  const parts = path.split('/');
  const last = parts[parts.length - 1];
  if (last === 'index') {
    const dir = parts.slice(0, -1).join('/');
    const urlPath = dir ? `/${dir}/` : '/';
    return [`${SITE}${urlPath}`];
  }

  // Concrete page like /sobre-mi, /aviso-legal
  return [`${SITE}/${path}/`];
}

// ---------------------------------------------------------------------------
// State management
// ---------------------------------------------------------------------------

function loadState() {
  if (!existsSync(STATE_FILE)) return {};
  try {
    return JSON.parse(readFileSync(STATE_FILE, 'utf-8'));
  } catch {
    return {};
  }
}

function saveState(state) {
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
}

// ---------------------------------------------------------------------------
// API submission
// ---------------------------------------------------------------------------

function submitUrls(urls) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      host: 'tuespaciodetrabajo.com',
      key: KEY,
      keyLocation: KEY_LOCATION,
      urlList: urls,
    });

    const req = https.request(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(body),
      },
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('\n  IndexNow — tuespaciodetrabajo.com\n');

  const pages = collectSourcePages();
  console.log(`  Scanned: ${pages.length} source pages mapped to URLs`);

  const prevState = loadState();
  const newState = {};

  let changed = [];
  let added = [];

  for (const page of pages) {
    newState[page.url] = page.hash;

    if (submitAll) {
      changed.push(page.url);
    } else if (!prevState[page.url]) {
      added.push(page.url);
    } else if (prevState[page.url] !== page.hash) {
      changed.push(page.url);
    }
  }

  // Detect removed pages
  const removed = Object.keys(prevState).filter(url => !newState[url]);

  const toSubmit = [...new Set([...changed, ...added])];

  console.log(`  Changed: ${changed.length}`);
  console.log(`  Added:   ${added.length}`);
  console.log(`  Removed: ${removed.length}`);
  console.log(`  Total to submit: ${toSubmit.length}\n`);

  if (toSubmit.length === 0) {
    console.log('  ✓ No content changes detected. Nothing to submit.\n');
    saveState(newState);
    return;
  }

  if (dryRun) {
    console.log('  [DRY RUN] Would submit:');
    toSubmit.slice(0, 20).forEach(url => console.log(`    ${url}`));
    if (toSubmit.length > 20) console.log(`    ... and ${toSubmit.length - 20} more`);
    console.log('');
    return;
  }

  // Submit in small batches with delays (streaming mode)
  const totalBatches = Math.ceil(toSubmit.length / MAX_URLS_PER_REQUEST);
  for (let i = 0; i < toSubmit.length; i += MAX_URLS_PER_REQUEST) {
    const batch = toSubmit.slice(i, i + MAX_URLS_PER_REQUEST);
    const batchNum = Math.floor(i / MAX_URLS_PER_REQUEST) + 1;
    console.log(`  Submitting batch ${batchNum}/${totalBatches} (${batch.length} URLs)...`);

    try {
      const result = await submitUrls(batch);
      if (result.status === 200 || result.status === 202) {
        console.log(`  ✓ Accepted (HTTP ${result.status})`);
      } else {
        console.log(`  ⚠ HTTP ${result.status}: ${result.body}`);
      }
    } catch (err) {
      console.error(`  ✗ Error: ${err.message}`);
    }

    if (i + MAX_URLS_PER_REQUEST < toSubmit.length) {
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES_MS));
    }
  }

  saveState(newState);
  console.log(`\n  State saved. Done.\n`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
