#!/usr/bin/env node
/**
 * IndexNow submission script for tuespaciodetrabajo.com
 *
 * Detects which URLs changed since the last submission and notifies
 * Bing/Yandex/etc. via the IndexNow protocol.
 *
 * Usage:
 *   node scripts/indexnow.mjs              # Submit changed URLs
 *   node scripts/indexnow.mjs --all        # Submit all URLs (first time / reset)
 *   node scripts/indexnow.mjs --dry-run    # Show what would be submitted
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';
import https from 'https';

const SITE = 'https://tuespaciodetrabajo.com';
const KEY = 'b968ae571ae6a242eb6ef27eef7d5ec9';
const KEY_LOCATION = `${SITE}/${KEY}.txt`;
const ENDPOINT = 'https://api.indexnow.org/indexnow';
const STATE_FILE = join(import.meta.dirname, '..', '.indexnow-state.json');
const DIST_DIR = join(import.meta.dirname, '..', 'dist');
const MAX_URLS_PER_REQUEST = 10000;

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const submitAll = args.includes('--all');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Hash the contents of an HTML file to detect changes. */
function hashFile(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  return createHash('md5').update(content).digest('hex');
}

/** Recursively find all index.html files in dist/ and map to URLs. */
function collectPages() {
  const pages = [];

  function walk(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.name === 'index.html') {
        const rel = dir.replace(DIST_DIR, '').replace(/\\/g, '/');
        const url = rel ? `${SITE}${rel}/` : `${SITE}/`;
        pages.push({ url, path: full, hash: hashFile(full) });
      }
    }
  }

  walk(DIST_DIR);
  return pages;
}

/** Load previous state (url → hash map). */
function loadState() {
  if (!existsSync(STATE_FILE)) return {};
  try {
    return JSON.parse(readFileSync(STATE_FILE, 'utf-8'));
  } catch {
    return {};
  }
}

/** Save current state. */
function saveState(state) {
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
}

/** POST URLs to IndexNow API. */
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

  if (!existsSync(DIST_DIR)) {
    console.error('  ✗ dist/ not found. Run npm run build first.');
    process.exit(1);
  }

  const pages = collectPages();
  console.log(`  Scanned: ${pages.length} pages in dist/`);

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
    console.log('  ✓ No changes to submit.\n');
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

  // Submit in batches
  for (let i = 0; i < toSubmit.length; i += MAX_URLS_PER_REQUEST) {
    const batch = toSubmit.slice(i, i + MAX_URLS_PER_REQUEST);
    console.log(`  Submitting batch ${Math.floor(i / MAX_URLS_PER_REQUEST) + 1} (${batch.length} URLs)...`);

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
  }

  saveState(newState);
  console.log(`\n  State saved. Done.\n`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
