/**
 * Batch downloads Pexels images for all articles that don't have one yet.
 *
 * Usage:
 *   node scripts/pexels-batch-download.mjs          # download all missing
 *   node scripts/pexels-batch-download.mjs --dry-run # preview queries only
 *
 * Requires PEXELS_API_KEY in .env file.
 * Add optimized queries per article slug in the QUERIES dictionary below.
 */

import { readFileSync, readdirSync, existsSync, mkdirSync } from 'fs';
import { join, basename } from 'path';
import sharp from 'sharp';

// Load .env manually
function loadEnv() {
  try {
    const envFile = readFileSync('.env', 'utf8');
    for (const line of envFile.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex === -1) continue;
      const key = trimmed.slice(0, eqIndex).trim();
      let value = trimmed.slice(eqIndex + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  } catch {}
}

loadEnv();

const API_KEY = process.env.PEXELS_API_KEY;
if (!API_KEY) {
  console.error('Error: PEXELS_API_KEY not found in .env or environment');
  process.exit(1);
}

const ARTICLES_DIR = 'src/content/articulos';
const OUTPUT_DIR = 'public/images/articulos';
const WEBP_QUALITY = 80;
const DELAY_MS = 1000; // Delay between API requests to respect rate limits

const dryRun = process.argv.includes('--dry-run');

/**
 * Optimized Pexels search queries per article slug.
 * Add entries here for better image results.
 * If an article slug is not listed, a generic query will be derived from the slug.
 */
const QUERIES = {
  // Example:
  // 'mejores-sillas-ergonomicas': 'ergonomic office chair home office',
  // 'escritorios-elevables': 'standing desk home office setup',
};

function slugToQuery(slug) {
  // If we have an optimized query, use it
  if (QUERIES[slug]) return QUERIES[slug];

  // Otherwise, derive a generic query from the slug
  return slug
    .replace(/-/g, ' ')
    .replace(/mejores?/g, '')
    .replace(/para/g, '')
    .trim() + ' home office';
}

function getArticleSlugs() {
  try {
    const files = readdirSync(ARTICLES_DIR);
    return files
      .filter(f => f.endsWith('.mdx') || f.endsWith('.md'))
      .map(f => basename(f, f.endsWith('.mdx') ? '.mdx' : '.md'));
  } catch {
    console.error(`Error: Could not read ${ARTICLES_DIR}`);
    process.exit(1);
  }
}

function getExistingImages() {
  try {
    const files = readdirSync(OUTPUT_DIR);
    return new Set(
      files
        .filter(f => f.endsWith('.webp'))
        .map(f => basename(f, '.webp'))
    );
  } catch {
    return new Set();
  }
}

async function searchPexels(query) {
  const url = new URL('https://api.pexels.com/v1/search');
  url.searchParams.set('query', query);
  url.searchParams.set('per_page', '1');
  url.searchParams.set('orientation', 'landscape');

  const res = await fetch(url.toString(), {
    headers: { Authorization: API_KEY },
  });

  if (!res.ok) {
    throw new Error(`Pexels API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

async function downloadAndConvert(imageUrl, outputPath) {
  const res = await fetch(imageUrl);
  if (!res.ok) {
    throw new Error(`Failed to download image: ${res.status}`);
  }

  const buffer = Buffer.from(await res.arrayBuffer());

  await sharp(buffer)
    .webp({ quality: WEBP_QUALITY })
    .toFile(outputPath);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  const slugs = getArticleSlugs();
  const existing = getExistingImages();

  const missing = slugs.filter(slug => !existing.has(slug));

  console.log(`Total articles: ${slugs.length}`);
  console.log(`Already have images: ${existing.size}`);
  console.log(`Missing images: ${missing.length}`);

  if (missing.length === 0) {
    console.log('\n✅ All articles have images!');
    return;
  }

  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log(`\n${dryRun ? '🔍 DRY RUN — queries that would be used:' : '📥 Downloading missing images...'}\n`);

  let downloaded = 0;
  let errors = 0;

  for (const slug of missing) {
    const query = slugToQuery(slug);

    if (dryRun) {
      const source = QUERIES[slug] ? 'custom' : 'auto';
      console.log(`  ${slug} → "${query}" (${source})`);
      continue;
    }

    try {
      console.log(`  Searching: "${query}" for ${slug}...`);

      const data = await searchPexels(query);

      if (!data.photos || data.photos.length === 0) {
        console.log(`  ⚠️  No results for "${query}" — skipping ${slug}`);
        errors++;
        continue;
      }

      const photo = data.photos[0];
      const outputPath = join(OUTPUT_DIR, `${slug}.webp`);

      await downloadAndConvert(photo.src.large2x, outputPath);

      console.log(`  ✅ ${slug}.webp — "${photo.alt || '(no description)'}" by ${photo.photographer}`);
      downloaded++;

      // Rate limit delay
      await sleep(DELAY_MS);
    } catch (err) {
      console.error(`  ❌ Error for ${slug}: ${err.message}`);
      errors++;
    }
  }

  if (!dryRun) {
    console.log(`\n📊 Summary:`);
    console.log(`  Downloaded: ${downloaded}`);
    console.log(`  Errors: ${errors}`);
  }
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
