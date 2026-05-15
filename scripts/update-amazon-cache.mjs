import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { DEFAULT_PARTNER_TAG, MARKETPLACE, getItemsInBatches } from './amazon-api.mjs';
import { extractAmazonRefs, parseArgs, readContentFiles, uniqueAsins } from './amazon-content-utils.mjs';

const CACHE_PATH = path.resolve('src/data/amazon-products.json');
const args = parseArgs();
const files = readContentFiles(args.article);
const refs = extractAmazonRefs(files);
const asins = uniqueAsins(refs, args.limit);

if (asins.length === 0) {
  console.log('No Amazon ASINs found.');
  process.exit(0);
}

console.log(`Updating Amazon cache for ${asins.length} ASIN(s)...`);
console.log(`Delay: ${args.delay}ms | Retries: ${args.retries}${args.article ? ` | Article: ${args.article}` : ''}`);

const currentCache = readExistingCache();
const { products, errors, checkedAt } = await getItemsInBatches(asins, {
  delay: args.delay,
  retries: args.retries,
});

const productsByAsin = { ...(currentCache.products || {}) };
for (const product of products) {
  if (product.asin) productsByAsin[product.asin] = product;
}

const cache = {
  updatedAt: checkedAt,
  marketplace: MARKETPLACE,
  partnerTag: process.env.AMAZON_PARTNER_TAG || currentCache.partnerTag || DEFAULT_PARTNER_TAG,
  products: args.article || args.limit > 0
    ? productsByAsin
    : Object.fromEntries(
        asins
          .filter(asin => productsByAsin[asin])
          .map(asin => [asin, productsByAsin[asin]])
      ),
};

mkdirSync(path.dirname(CACHE_PATH), { recursive: true });
writeFileSync(CACHE_PATH, `${JSON.stringify(cache, null, 2)}\n`);

console.log(`Cache written: ${CACHE_PATH}`);
console.log(`Fetched: ${products.length} | Errors: ${errors.length}`);

if (errors.length > 0) {
  console.log('\nErrors:');
  for (const error of errors) {
    console.log(`- ${error.code || 'ERROR'}: ${error.message || JSON.stringify(error)}`);
  }
}

function readExistingCache() {
  try {
    return JSON.parse(readFileSync(CACHE_PATH, 'utf8'));
  } catch {
    return { products: {} };
  }
}
