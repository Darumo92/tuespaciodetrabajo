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

import { assertAmazonCredentials, getAccessToken, getItems, parseAmazonItem, searchItems } from './amazon-api.mjs';

assertAmazonCredentials();

// --- Format output ---
function formatItem(item) {
  const product = parseAmazonItem(item);

  return {
    nombre: product.title || '(sin título)',
    asin: product.asin,
    precio: product.price || '(sin precio)',
    precioNum: product.priceAmount,
    imagen300: product.image,
    imagenOriginal: product.image,
    url: product.url,
    disponibilidad: product.availabilityMessage || product.availability || '(sin disponibilidad)',
    enlaceArticulo: `/dp/${product.asin}`,
    caracteristicas: product.features.slice(0, 3),
  };
}

function printItem(item) {
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`  ${item.nombre}`);
  console.log(`  ASIN: ${item.asin}`);
  console.log(`  Precio: ${item.precio}`);
  console.log(`  Disponibilidad: ${item.disponibilidad}`);
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
