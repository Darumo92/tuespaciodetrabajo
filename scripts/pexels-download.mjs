/**
 * Downloads an image from Pexels by search query and saves as WebP.
 *
 * Usage:
 *   node scripts/pexels-download.mjs "home office desk setup" my-article-slug
 *   node scripts/pexels-download.mjs "home office desk setup" --list
 *   node scripts/pexels-download.mjs "home office desk setup" my-article-slug --index=2
 *   node scripts/pexels-download.mjs "home office desk setup" my-article-slug --orientation=portrait
 *
 * Requires PEXELS_API_KEY in .env file.
 * Saves to public/images/articulos/<name>.webp (WebP, quality 80).
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import sharp from 'sharp';

// Load .env manually (no dotenv dependency needed)
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
      // Remove surrounding quotes
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  } catch {
    // .env file not found, rely on existing env vars
  }
}

loadEnv();

const API_KEY = process.env.PEXELS_API_KEY;
if (!API_KEY) {
  console.error('Error: PEXELS_API_KEY not found in .env or environment');
  process.exit(1);
}

const OUTPUT_DIR = 'public/images/articulos';
const WEBP_QUALITY = 80;
const PER_PAGE = 15;

// Parse arguments
const args = process.argv.slice(2);
const flags = args.filter(a => a.startsWith('--'));
const positional = args.filter(a => !a.startsWith('--'));

const query = positional[0];
const name = positional[1];
const listOnly = flags.includes('--list');

const indexFlag = flags.find(f => f.startsWith('--index='));
const imageIndex = indexFlag ? parseInt(indexFlag.split('=')[1], 10) - 1 : 0;

const orientationFlag = flags.find(f => f.startsWith('--orientation='));
const orientation = orientationFlag ? orientationFlag.split('=')[1] : 'landscape';

if (!query) {
  console.error('Usage: node scripts/pexels-download.mjs "<query>" [<name>] [--list] [--index=N] [--orientation=landscape|portrait|square]');
  process.exit(1);
}

if (!listOnly && !name) {
  console.error('Error: Provide a name for the file, or use --list to preview results');
  process.exit(1);
}

async function searchPexels(query, orientation) {
  const url = new URL('https://api.pexels.com/v1/search');
  url.searchParams.set('query', query);
  url.searchParams.set('per_page', PER_PAGE.toString());
  url.searchParams.set('orientation', orientation);

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

async function main() {
  console.log(`Searching Pexels for: "${query}" (orientation: ${orientation})\n`);

  const data = await searchPexels(query, orientation);

  if (!data.photos || data.photos.length === 0) {
    console.error('No results found. Try a different query.');
    process.exit(1);
  }

  // List results
  console.log(`Found ${data.photos.length} results:\n`);
  data.photos.forEach((photo, i) => {
    const marker = (!listOnly && i === imageIndex) ? ' ← SELECTED' : '';
    console.log(`  ${i + 1}. ${photo.alt || '(no description)'} — by ${photo.photographer}${marker}`);
    console.log(`     ${photo.url}`);
    console.log(`     ${photo.src.large2x}\n`);
  });

  if (listOnly) {
    console.log('Use without --list to download. Use --index=N to pick a specific result.');
    return;
  }

  if (imageIndex < 0 || imageIndex >= data.photos.length) {
    console.error(`Error: --index=${imageIndex + 1} is out of range (1-${data.photos.length})`);
    process.exit(1);
  }

  const photo = data.photos[imageIndex];
  const imageUrl = photo.src.large2x;

  // Ensure output directory exists
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const outputPath = join(OUTPUT_DIR, `${name}.webp`);

  console.log(`Downloading: ${photo.alt || '(no description)'}`);
  console.log(`By: ${photo.photographer} (${photo.url})`);
  console.log(`Source: ${imageUrl}`);
  console.log(`Output: ${outputPath}\n`);

  await downloadAndConvert(imageUrl, outputPath);

  console.log(`✅ Saved to ${outputPath}`);
  console.log(`\nRemember to credit: Photo by ${photo.photographer} on Pexels`);
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
