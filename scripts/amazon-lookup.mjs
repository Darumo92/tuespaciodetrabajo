/**
 * Looks up Amazon.es products via Creators API (v3.2 EU credentials).
 *
 * Usage:
 *   node scripts/amazon-lookup.mjs B0D5CLMJHK              # lookup by ASIN
 *   node scripts/amazon-lookup.mjs B0D5CLMJHK B09V3KXJPB   # multiple ASINs
 *   node scripts/amazon-lookup.mjs --search "silla ergonomica" # search by keyword
 *
 * Requires in .env:
 *   AMAZON_CLIENT_ID, AMAZON_CLIENT_SECRET, AMAZON_PARTNER_TAG
 */

import { readFileSync } from 'fs';

// --- .env loader (same pattern as pexels-download.mjs) ---
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
      if (!process.env[key]) process.env[key] = value;
    }
  } catch { /* no .env file */ }
}

loadEnv();

const CLIENT_ID = process.env.AMAZON_CLIENT_ID;
const CLIENT_SECRET = process.env.AMAZON_CLIENT_SECRET;
const PARTNER_TAG = process.env.AMAZON_PARTNER_TAG || 'tuespaciodet-21';
const MARKETPLACE = 'www.amazon.es';
const API_BASE = 'https://creatorsapi.amazon/catalog/v1';

// v3.2 EU token endpoint (Login with Amazon)
const TOKEN_ENDPOINT = 'https://api.amazon.co.uk/auth/o2/token';

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Error: AMAZON_CLIENT_ID and AMAZON_CLIENT_SECRET required in .env');
  process.exit(1);
}

// --- OAuth token (v3.x LwA) ---
async function getAccessToken() {
  const res = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      scope: 'creatorsapi::default',
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OAuth token failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  return data.access_token;
}

// --- Creators API request ---
async function apiRequest(token, operation, payload) {
  const res = await fetch(`${API_BASE}/${operation}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'x-marketplace': MARKETPLACE,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Creators API ${operation} failed (${res.status}): ${text}`);
  }

  return res.json();
}

// --- GetItems (ASIN lookup) ---
async function getItems(token, asins) {
  return apiRequest(token, 'getItems', {
    itemIds: asins,
    itemIdType: 'ASIN',
    marketplace: MARKETPLACE,
    partnerTag: PARTNER_TAG,
    resources: [
      'images.primary.large',
      'images.primary.medium',
      'images.primary.small',
      'itemInfo.title',
      'itemInfo.features',
      'offersV2.listings.price',
    ],
  });
}

// --- SearchItems ---
async function searchItems(token, keywords) {
  return apiRequest(token, 'searchItems', {
    keywords,
    marketplace: MARKETPLACE,
    partnerTag: PARTNER_TAG,
    searchIndex: 'All',
    itemCount: 5,
    resources: [
      'images.primary.large',
      'images.primary.medium',
      'images.primary.small',
      'itemInfo.title',
      'itemInfo.features',
      'offersV2.listings.price',
    ],
  });
}

// --- Format output ---
function formatItem(item) {
  const title = item.itemInfo?.title?.displayValue || '(sin título)';
  const asin = item.asin;

  // Price: try offersV2 first
  const listing = item.offersV2?.listings?.[0];
  const price = listing?.price?.displayAmount || '(sin precio)';
  const priceAmount = listing?.price?.amount || null;

  // Images
  const imgLarge = item.images?.primary?.large?.url || '';
  const imgMedium = item.images?.primary?.medium?.url || '';
  const imgSmall = item.images?.primary?.small?.url || '';
  const img300 = imgLarge
    ? imgLarge.replace(/_SL\d+_/, '_SL300_')
    : imgMedium || imgSmall;

  const url = item.detailPageURL || `https://www.amazon.es/dp/${asin}`;
  const features = item.itemInfo?.features?.displayValues || [];

  return {
    nombre: title,
    asin,
    precio: price,
    precioNum: priceAmount,
    imagen300: img300,
    imagenOriginal: imgLarge || imgMedium,
    url,
    enlaceArticulo: `/dp/${asin}`,
    caracteristicas: features.slice(0, 3),
  };
}

function printItem(item) {
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`  ${item.nombre}`);
  console.log(`  ASIN: ${item.asin}`);
  console.log(`  Precio: ${item.precio}`);
  console.log(`  Imagen (300px): ${item.imagen300}`);
  console.log(`  Link artículo: ${item.enlaceArticulo}`);
  if (item.caracteristicas.length > 0) {
    console.log(`  Características:`);
    item.caracteristicas.forEach(f => console.log(`    • ${f}`));
  }
}

// --- Main ---
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log(`Uso:
  node scripts/amazon-lookup.mjs B0D5CLMJHK              # buscar por ASIN
  node scripts/amazon-lookup.mjs B0D5CLMJHK B09V3KXJPB   # varios ASINs
  node scripts/amazon-lookup.mjs --search "silla ergonomica" # buscar por keyword`);
  process.exit(0);
}

try {
  console.log('Obteniendo token OAuth (v3.2 EU → api.amazon.co.uk)...');
  const token = await getAccessToken();
  console.log('Token obtenido ✓');

  if (args[0] === '--search') {
    const keywords = args.slice(1).join(' ');
    if (!keywords) {
      console.error('Error: proporciona un término de búsqueda');
      process.exit(1);
    }
    console.log(`\nBuscando: "${keywords}"\n`);
    const data = await searchItems(token, keywords);

    const items = data.searchResult?.items || [];
    if (items.length === 0) {
      console.log('No se encontraron resultados.');
      process.exit(0);
    }

    items.map(formatItem).forEach(printItem);
    console.log(`\n${'─'.repeat(60)}`);
    console.log(`\n${items.length} resultado(s)`);
  } else {
    // ASIN lookup
    const asins = args.filter(a => /^[A-Z0-9]{10}$/.test(a));
    if (asins.length === 0) {
      console.error('Error: proporciona ASINs válidos (10 caracteres alfanuméricos)');
      process.exit(1);
    }
    console.log(`\nBuscando ${asins.length} ASIN(s): ${asins.join(', ')}\n`);
    const data = await getItems(token, asins);

    if (data.itemsResult?.items) {
      data.itemsResult.items.map(formatItem).forEach(printItem);
      console.log(`\n${'─'.repeat(60)}`);
    }

    if (data.errors) {
      console.log('\nErrores:');
      data.errors.forEach(e => console.log(`  ⚠ ${e.code}: ${e.message}`));
    }
  }
} catch (err) {
  console.error(`\nError: ${err.message}`);
  process.exit(1);
}
