import { readFileSync } from 'node:fs';

export const MARKETPLACE = 'www.amazon.es';
export const DEFAULT_PARTNER_TAG = 'tuespaciodet-21';
export const API_BASE = 'https://creatorsapi.amazon/catalog/v1';
export const TOKEN_ENDPOINT = 'https://api.amazon.co.uk/auth/o2/token';

export function loadEnv() {
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
  } catch {
    // .env is optional for commands that do not hit the API.
  }
}

export function getAmazonConfig() {
  loadEnv();
  return {
    clientId: process.env.AMAZON_CLIENT_ID,
    clientSecret: process.env.AMAZON_CLIENT_SECRET,
    partnerTag: process.env.AMAZON_PARTNER_TAG || DEFAULT_PARTNER_TAG,
  };
}

export function assertAmazonCredentials() {
  const config = getAmazonConfig();
  if (!config.clientId || !config.clientSecret) {
    throw new Error('AMAZON_CLIENT_ID and AMAZON_CLIENT_SECRET required in .env');
  }
  return config;
}

export async function getAccessToken() {
  const { clientId, clientSecret } = assertAmazonCredentials();
  const res = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
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

export async function apiRequest(token, operation, payload) {
  const res = await fetch(`${API_BASE}/${operation}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
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

export async function getItems(token, asins) {
  const { partnerTag } = getAmazonConfig();
  return apiRequest(token, 'getItems', {
    itemIds: asins,
    itemIdType: 'ASIN',
    marketplace: MARKETPLACE,
    partnerTag,
    resources: [
      'images.primary.large',
      'images.primary.medium',
      'images.primary.small',
      'itemInfo.title',
      'itemInfo.features',
      'offersV2.listings.availability',
      'offersV2.listings.price',
    ],
  });
}

export async function searchItems(token, keywords, itemCount = 5) {
  const { partnerTag } = getAmazonConfig();
  return apiRequest(token, 'searchItems', {
    keywords,
    marketplace: MARKETPLACE,
    partnerTag,
    searchIndex: 'All',
    itemCount,
    resources: [
      'images.primary.large',
      'images.primary.medium',
      'images.primary.small',
      'itemInfo.title',
      'itemInfo.features',
      'offersV2.listings.availability',
      'offersV2.listings.price',
    ],
  });
}

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
  const asin = item.asin || item.ASIN;
  const title = item.itemInfo?.title?.displayValue || '';
  const listing = item.offersV2?.listings?.[0] || {};
  const money = listing.price?.money || listing.price || {};
  const availability = listing.availability || {};
  const deliveryInfo = listing.deliveryInfo || {};
  const displayAmount = money.displayAmount || listing.price?.displayAmount || '';
  const priceAmount = typeof money.amount === 'number'
    ? money.amount
    : typeof listing.price?.amount === 'number'
      ? listing.price.amount
      : null;
  const image = normalizeAmazonImage(
    item.images?.primary?.large?.url ||
    item.images?.primary?.medium?.url ||
    item.images?.primary?.small?.url ||
    ''
  );
  const availabilityMessage = availability.message || availability.displayValue || availability.type || '';
  const isAvailable = typeof availability.isAvailable === 'boolean'
    ? availability.isAvailable
    : availabilityMessage
      ? !/unavailable|agotado|no disponible|currently unavailable/i.test(availabilityMessage)
      : null;

  return {
    asin,
    title,
    price: displayAmount,
    priceAmount,
    currency: money.currency || listing.price?.currency || 'EUR',
    image,
    url: item.detailPageURL || (asin ? `https://www.amazon.es/dp/${asin}` : ''),
    availability: availability.type || '',
    availabilityMessage,
    isAvailable,
    leadTime: deliveryInfo.message || deliveryInfo.deliveryMessage || null,
    features: item.itemInfo?.features?.displayValues?.slice(0, 5) || [],
    lastCheckedAt: checkedAt,
  };
}

export async function getItemsInBatches(asins, options = {}) {
  const delay = Number(options.delay ?? 1200);
  const retries = Number(options.retries ?? 2);
  const batchSize = Number(options.batchSize ?? 10);
  const token = await getAccessToken();
  const checkedAt = new Date().toISOString();
  const products = [];
  const errors = [];

  for (let i = 0; i < asins.length; i += batchSize) {
    const batch = asins.slice(i, i + batchSize);
    let attempt = 0;

    while (attempt <= retries) {
      try {
        const data = await getItems(token, batch);
        const items = data.itemsResult?.items || [];
        products.push(...items.map(item => parseAmazonItem(item, checkedAt)));
        if (data.errors) errors.push(...data.errors.map(error => ({ ...error, batch })));
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
