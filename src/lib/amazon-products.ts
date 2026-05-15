import amazonProducts from '@/data/amazon-products.json';

export interface CachedAmazonProduct {
  asin: string;
  title?: string;
  price?: string;
  priceAmount?: number | null;
  currency?: string | null;
  image?: string;
  url?: string;
  availability?: string;
  availabilityMessage?: string;
  isAvailable?: boolean | null;
  lastCheckedAt?: string;
  leadTime?: string | null;
}

type AmazonCache = {
  updatedAt?: string | null;
  products?: Record<string, CachedAmazonProduct>;
};

const cache = amazonProducts as AmazonCache;

export function extractAmazonAsin(url?: string | null): string | null {
  if (!url) return null;
  const match = url.match(/(?:\/dp\/|\/gp\/product\/)([A-Z0-9]{10})/i);
  return match ? match[1].toUpperCase() : null;
}

export function getCachedAmazonProduct(urlOrAsin?: string | null): CachedAmazonProduct | null {
  const asin = /^[A-Z0-9]{10}$/i.test(urlOrAsin || '')
    ? urlOrAsin!.toUpperCase()
    : extractAmazonAsin(urlOrAsin);

  if (!asin) return null;
  return cache.products?.[asin] ?? null;
}

export function getCachedAmazonPrice(urlOrAsin?: string | null, fallback = ''): string {
  return getCachedAmazonProduct(urlOrAsin)?.price || fallback;
}

export function getCachedAmazonPriceAmount(urlOrAsin?: string | null): number | null {
  const amount = getCachedAmazonProduct(urlOrAsin)?.priceAmount;
  return typeof amount === 'number' ? amount : null;
}

export function getCachedAmazonImage(urlOrAsin?: string | null, fallback = ''): string {
  return getCachedAmazonProduct(urlOrAsin)?.image || fallback;
}

export function getCachedAmazonAvailability(urlOrAsin?: string | null): string | null {
  const product = getCachedAmazonProduct(urlOrAsin);
  return product?.availabilityMessage || product?.availability || null;
}

export function isAmazonProductAvailable(urlOrAsin?: string | null): boolean | null {
  const available = getCachedAmazonProduct(urlOrAsin)?.isAvailable;
  return typeof available === 'boolean' ? available : null;
}

export function formatAmazonLastChecked(urlOrAsin?: string | null): string | null {
  const product = getCachedAmazonProduct(urlOrAsin);
  if (!product) return null;

  const value = product.lastCheckedAt || cache.updatedAt;
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export function getCachedAmazonUrl(urlOrAsin?: string | null, fallback = ''): string {
  return getCachedAmazonProduct(urlOrAsin)?.url || fallback;
}
