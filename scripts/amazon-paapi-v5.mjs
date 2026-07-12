/**
 * Amazon Product Advertising API v5 client (PAAPI v5).
 *
 * Requires AWS SigV4 credentials (different from Creators API OAuth).
 *
 * Env vars:
 *   AMAZON_ACCESS_KEY    — AWS Access Key ID for PAAPI v5
 *   AMAZON_SECRET_KEY    — AWS Secret Access Key for PAAPI v5
 *   AMAZON_PARTNER_TAG   — Amazon Associates tag (same as Creators API)
 *
 * Usage (module):
 *   import { getItems, searchItems, parseAmazonItem, getItemsInBatches } from './amazon-paapi-v5.mjs';
 */

import { createHmac, createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

// --- Config ---

export const MARKETPLACE = 'www.amazon.es';
export const DEFAULT_PARTNER_TAG = 'tuespaciodet-21';
export const PAAPI_HOST = 'webservices.amazon.es';
export const PAAPI_REGION = 'eu-west-1';
export const PAAPI_SERVICE = 'ProductAdvertisingAPI';
export const PAAPI_ENDPOINT = `https://${PAAPI_HOST}/paapi5/getitems`;
export const PAAPI_SEARCH_ENDPOINT = `https://${PAAPI_HOST}/paapi5/searchitems`;

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
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  } catch { /* .env optional */ }
}

export function getPaapiConfig() {
  loadEnv();
  return {
    accessKey: process.env.AMAZON_ACCESS_KEY,
    secretKey: process.env.AMAZON_SECRET_KEY,
    partnerTag: process.env.AMAZON_PARTNER_TAG || DEFAULT_PARTNER_TAG,
  };
}

function assertPaapiCredentials() {
  const config = getPaapiConfig();
  if (!config.accessKey || !config.secretKey) {
    throw new Error(
      'AMAZON_ACCESS_KEY and AMAZON_SECRET_KEY required in .env for PAAPI v5.\n' +
        'Get them from Amazon Associates Central → Tools → Product Advertising API → Manage Your Credentials.'
    );
  }
  return config;
}

// --- AWS Signature V4 ---

function sha256(data) {
  return createHash('sha256').update(data).digest('hex');
}

function hmacSha256(key, data) {
  return createHmac('sha256', key).update(data).digest();
}

function getSignatureKey(secretKey, dateStamp, region, service) {
  const kDate = hmacSha256('AWS4' + secretKey, dateStamp);
  const kRegion = hmacSha256(kDate, region);
  const kService = hmacSha256(kRegion, service);
  const kSigning = hmacSha256(kService, 'aws4_request');
  return kSigning;
}

function signRequest(method, url, headers, body, accessKey, secretKey, region, service) {
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]/g, '').replace(/\.\d{3}Z$/, 'Z').replace(/(\d{8})T(\d{6})Z$/, '$1T$2Z');
  // PAAPI v5 expects: YYYYMMDD'T'HHMMSS'Z'
  const amzDateFormatted = amzDate.substring(0, 8) + 'T' + amzDate.substring(9, 15) + 'Z';
  const dateStamp = amzDateFormatted.substring(0, 8);

  const { hostname, pathname } = new URL(url);
  const contentType = headers['Content-Type'] || 'application/json';

  const signedHeaders = {
    'host': hostname,
    'x-amz-date': amzDateFormatted,
    'x-amz-target': headers['x-amz-target'] || '',
    ...headers,
  };
  delete signedHeaders['Authorization'];
  delete signedHeaders['Content-Type'];

  const payloadHash = sha256(body || '');

  const headerNames = Object.keys(signedHeaders).sort();
  const canonicalHeaders = headerNames.map(k => k.toLowerCase() + ':' + signedHeaders[k].trim()).join('\n');
  const signedHeadersStr = headerNames.join(';');

  const canonicalRequest = [
    method,
    pathname,
    '',
    canonicalHeaders + '\n',
    signedHeadersStr,
    payloadHash,
  ].join('\n');

  const algorithm = 'AWS4-HMAC-SHA256';
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = [
    algorithm,
    amzDateFormatted,
    credentialScope,
    sha256(canonicalRequest),
  ].join('\n');

  const signingKey = getSignatureKey(secretKey, dateStamp, region, service);
  const signature = hmacSha256(signingKey, stringToSign).toString('hex');

  return {
    authorization: `${algorithm} Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeadersStr}, Signature=${signature}`,
    amzDate: amzDateFormatted,
  };
}

async function paapiRequest(operation, payload) {
  const { accessKey, secretKey } = assertPaapiCredentials();
  const endpoint = operation === 'getItems' ? PAAPI_ENDPOINT : PAAPI_SEARCH_ENDPOINT;

  const body = JSON.stringify(payload);
  const baseHeaders = {
    'Content-Type': 'application/json',
    'x-amz-target': `com.amazon.paapi5.v1.ProductAdvertisingAPIv1.${operation === 'getItems' ? 'GetItems' : 'SearchItems'}`,
  };

  const { authorization, amzDate } = signRequest(
    'POST',
    endpoint,
    baseHeaders,
    body,
    accessKey,
    secretKey,
    PAAPI_REGION,
    PAAPI_SERVICE
  );

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'host': PAAPI_HOST,
      'x-amz-date': amzDate,
      'x-amz-target': baseHeaders['x-amz-target'],
      'Authorization': authorization,
    },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PAAPI v5 ${operation} failed (${res.status}): ${text}`);
  }

  return res.json();
}

// --- Public API ---

export async function getItems(asins) {
  const { partnerTag } = getPaapiConfig();
  return paapiRequest('getItems', {
    ItemIds: asins,
    ItemIdType: 'ASIN',
    Marketplace: MARKETPLACE,
    PartnerTag: partnerTag,
    PartnerType: 'Associates',
    Resources: [
      'Images.Primary.Large',
      'Images.Primary.Medium',
      'Images.Primary.Small',
      'ItemInfo.Title',
      'ItemInfo.Features',
      'Offers.Listings.Availability',
      'Offers.Listings.Price',
    ],
  });
}

export async function searchItems(keywords, itemCount = 5) {
  const { partnerTag } = getPaapiConfig();
  return paapiRequest('searchItems', {
    Keywords: keywords,
    SearchIndex: 'All',
    ItemCount: itemCount,
    Marketplace: MARKETPLACE,
    PartnerTag: partnerTag,
    PartnerType: 'Associates',
    Resources: [
      'Images.Primary.Large',
      'Images.Primary.Medium',
      'Images.Primary.Small',
      'ItemInfo.Title',
      'ItemInfo.Features',
      'Offers.Listings.Availability',
      'Offers.Listings.Price',
    ],
  });
}

// --- Normalization ---

export function extractAmazonAsin(value) {
  if (!value) return null;
  const match = String(value).match(/(?:\/dp\/|\/gp\/product\/)([A-Z0-9]{10})/i);
  if (match) return match[1].toUpperCase();
  return /^[A-Z0-9]{10}$/i.test(value) ? value.toUpperCase() : null;
}

export function normalizeAmazonImage(url) {
  if (!url) return '';
  return url
    .replace(/_AC_SL\d+_/g, '_AC_SL300_')
    .replace(/_SL\d+_/g, '_AC_SL300_');
}

export function parseAmazonItem(item, checkedAt = new Date().toISOString()) {
  const asin = item.ASIN || item.asin;
  const title = item.ItemInfo?.Title?.DisplayValue || item.itemInfo?.title?.displayValue || '';
  const listing = item.Offers?.Listings?.[0] || item.offersV2?.listings?.[0] || {};
  const price = listing.Price || listing.price || {};
  const availability = listing.Availability || listing.availability || {};

  const displayAmount = price.DisplayAmount || price.displayAmount || '';
  const priceAmount = typeof price.Amount === 'number'
    ? price.Amount
    : typeof price.amount === 'number'
      ? price.amount
      : null;

  const image = normalizeAmazonImage(
    item.Images?.Primary?.Large?.URL ||
    item.Images?.Primary?.Medium?.URL ||
    item.Images?.Primary?.Small?.URL ||
    item.images?.primary?.large?.url ||
    item.images?.primary?.medium?.url ||
    item.images?.primary?.small?.url ||
    ''
  );

  const availabilityMessage = availability.Message || availability.DisplayValue || availability.Type ||
    availability.message || availability.displayValue || availability.type || '';
  const isAvailable = typeof availability.IsAvailable === 'boolean'
    ? availability.IsAvailable
    : typeof availability.isAvailable === 'boolean'
      ? availability.isAvailable
      : availabilityMessage
        ? !/unavailable|agotado|no disponible|currently unavailable/i.test(availabilityMessage)
        : null;

  return {
    asin,
    title,
    price: displayAmount,
    priceAmount,
    currency: price.Currency || price.currency || 'EUR',
    image,
    url: item.DetailPageURL || item.detailPageURL || (asin ? `https://www.amazon.es/dp/${asin}` : ''),
    availability: availability.Type || availability.type || '',
    availabilityMessage,
    isAvailable,
    leadTime: null,
    features: (item.ItemInfo?.Features?.DisplayValues || item.itemInfo?.features?.displayValues || []).slice(0, 5),
    lastCheckedAt: checkedAt,
  };
}

// --- Batching ---

export async function getItemsInBatches(asins, options = {}) {
  const delay = Number(options.delay ?? 1200);
  const retries = Number(options.retries ?? 2);
  const batchSize = Number(options.batchSize ?? 10);
  const checkedAt = new Date().toISOString();
  const products = [];
  const errors = [];

  for (let i = 0; i < asins.length; i += batchSize) {
    const batch = asins.slice(i, i + batchSize);
    let attempt = 0;

    while (attempt <= retries) {
      try {
        const data = await getItems(batch);
        const items = data.ItemsResult?.Items || [];
        products.push(...items.map(item => parseAmazonItem(item, checkedAt)));
        if (data.Errors) errors.push(...data.Errors.map(error => ({ ...error, batch })));
        break;
      } catch (error) {
        attempt += 1;
        if (attempt > retries) {
          errors.push({ code: 'REQUEST_FAILED', message: error.message, batch });
          break;
        }
        await sleep(delay * attempt);
      }
    }

    if (i + batchSize < asins.length) await sleep(delay);
  }

  return { products, errors, checkedAt };
}

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// --- Test CLI ---

async function main() {
  const args = process.argv.slice(2);
  try {
    assertPaapiCredentials();
  } catch (e) {
    console.log('PAAPI v5 not configured:', e.message.split('\n')[0]);
    console.log('Add AMAZON_ACCESS_KEY and AMAZON_SECRET_KEY to .env');
    process.exit(1);
  }

  if (args.length === 0 || args[0] === '--search') {
    const keywords = args[0] === '--search' ? args.slice(1).join(' ') : 'silla ergonomica';
    if (!keywords) { console.log('Usage: node scripts/amazon-paapi-v5.mjs --search "keywords" | ASIN...'); process.exit(0); }
    console.log('Searching PAAPI v5:', keywords);
    try {
      const data = await searchItems(keywords);
      const items = data.SearchResult?.Items || [];
      console.log('Results:', items.length);
      for (const item of items) {
        const p = parseAmazonItem(item);
        console.log(`  ${p.asin} | ${p.price} | ${p.title.substring(0, 80)}`);
      }
    } catch (e) {
      console.error('Search error:', e.message);
    }
  } else {
    const asins = args.filter(a => /^[A-Z0-9]{10}$/.test(a));
    if (asins.length === 0) { console.log('No valid ASINs'); process.exit(1); }
    console.log('Looking up ASINs via PAAPI v5:', asins.join(', '));
    try {
      const data = await getItems(asins);
      const items = data.ItemsResult?.Items || [];
      for (const item of items) {
        const p = parseAmazonItem(item);
        console.log(`  ${p.asin} | ${p.price} | ${p.title}`);
      }
    } catch (e) {
      console.error('GetItems error:', e.message);
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
