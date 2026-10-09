export interface AttributionOffer {
  priceAmount: number;
  currency: string;
  seller?: string;
  checkedAt?: string;
  evidenceUrl?: string;
  sourceUrl?: string;
  url?: string;
}

/** Format only complete quotations; the server remains responsible for offer expiry. */
export function formatOfferAttribution(offer: AttributionOffer | null | undefined, locale: 'es-ES' | 'en') {
  if (!offer || !Number.isFinite(offer.priceAmount) || offer.priceAmount <= 0
    || !['EUR', 'USD'].includes(offer.currency) || typeof offer.seller !== 'string' || !offer.seller.trim()) return null;
  const checkedAt = offer.checkedAt ?? '';
  const match = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.exec(checkedAt);
  const date = new Date(checkedAt);
  const calendarDay = match ? new Date(`${match[1]}T00:00:00Z`) : new Date(NaN);
  // Date.parse normalizes impossible calendar days, so check the date portion too.
  if (!match || !Number.isFinite(date.getTime())
    || !Number.isFinite(calendarDay.getTime()) || calendarDay.toISOString().slice(0, 10) !== match[1]
    || Number(match[2]) > 23 || Number(match[3]) > 59 || Number(match[4]) > 59) return null;
  const evidence = offer.evidenceUrl ?? offer.sourceUrl ?? offer.url;
  if (!evidence) return null;
  try {
    const source = new URL(evidence);
    if (!['http:', 'https:'].includes(source.protocol) || source.username || source.password) return null;
    const intlLocale = locale === 'en' ? 'en-US' : 'es-ES';
    return {
      priceText: new Intl.NumberFormat(intlLocale, { style: 'currency', currency: offer.currency }).format(offer.priceAmount),
      seller: offer.seller.trim(), sourceUrl: source.href,
      sourceHost: source.hostname.replace(/^www\./, ''),
      dateText: new Intl.DateTimeFormat(intlLocale, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(date),
      datetimeISO: date.toISOString(),
    };
  } catch {
    return null;
  }
}
