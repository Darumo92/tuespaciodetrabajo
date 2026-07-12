import productOffers from '../data/product-offers.json';
import type { Locale } from '../i18n/locales';

export type OfferMarket = 'ES' | 'US';
export type OfferCurrency = 'EUR' | 'USD';
export type OfferSourceType = 'amazon' | 'official' | 'distributor' | 'retailer';

export interface MarketOffer {
  status: 'available' | 'unavailable';
  priceAmount: number | null;
  currency: OfferCurrency;
  url: string | null;
  evidenceUrl: string | null;
  seller: string | null;
  sourceType: OfferSourceType | null;
  condition: 'new' | null;
  checkedAt: string;
  attempts: OfferSourceType[];
}

export interface ProductOffersFile {
  updatedAt: string;
  products: Record<string, Partial<Record<OfferMarket, MarketOffer>>>;
}

export interface GetProductOfferOptions {
  data?: ProductOffersFile;
  now?: Date | string | number;
}

const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
const SOURCE_TYPES: OfferSourceType[] = ['amazon', 'official', 'distributor', 'retailer'];
const ISO_DATE_TIME = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

function isHttpUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function isIsoDateTime(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const match = ISO_DATE_TIME.exec(value);
  if (!match || !Number.isFinite(Date.parse(value))) return false;

  const [, yearText, monthText, dayText, hourText, minuteText, secondText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  return month >= 1
    && month <= 12
    && day >= 1
    && day <= daysInMonth[month - 1]
    && Number(hourText) <= 23
    && Number(minuteText) <= 59
    && Number(secondText) <= 59;
}

export function isUsableProductOffer(
  offer: unknown,
  expectedCurrency: OfferCurrency,
  now: Date | string | number = new Date(),
): offer is MarketOffer {
  if (!offer || typeof offer !== 'object' || Array.isArray(offer)) return false;

  const value = offer as Record<string, unknown>;
  if (value.status !== 'available') return false;
  if (typeof value.priceAmount !== 'number' || !Number.isFinite(value.priceAmount) || value.priceAmount <= 0) return false;
  if (value.currency !== expectedCurrency) return false;
  if (!isHttpUrl(value.url) || !isHttpUrl(value.evidenceUrl)) return false;
  if (typeof value.seller !== 'string' || value.seller.trim() === '') return false;
  if (!SOURCE_TYPES.includes(value.sourceType as OfferSourceType)) return false;
  if (value.condition !== 'new') return false;
  if (!Array.isArray(value.attempts) || !value.attempts.every((attempt) => SOURCE_TYPES.includes(attempt))) return false;
  if (!isIsoDateTime(value.checkedAt)) return false;

  const nowTime = new Date(now).getTime();
  const checkedTime = Date.parse(value.checkedAt);
  return Number.isFinite(nowTime) && checkedTime <= nowTime && nowTime - checkedTime <= MAX_AGE_MS;
}

export function getProductOffer(
  slug: string,
  locale: Locale,
  options: GetProductOfferOptions = {},
): MarketOffer | null {
  const market = locale === 'es-ES' ? 'ES' : locale === 'en' ? 'US' : null;
  const currency = locale === 'es-ES' ? 'EUR' : locale === 'en' ? 'USD' : null;
  if (!market || !currency) return null;

  const data = options.data ?? (productOffers as ProductOffersFile);
  const offer = data.products?.[slug]?.[market];
  return isUsableProductOffer(offer, currency, options.now) ? offer : null;
}
