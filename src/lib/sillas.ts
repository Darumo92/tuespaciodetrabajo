export const AMAZON_TAG = 'tuespaciodet-21';

export interface SillaAmazon {
  asin?: string;
  buscar?: string;
}

export function buildAmazonHref(amazon?: SillaAmazon): string | null {
  if (amazon?.asin) {
    return `https://www.amazon.es/dp/${amazon.asin}?tag=${AMAZON_TAG}`;
  }
  if (amazon?.buscar) {
    const q = encodeURIComponent(amazon.buscar).replace(/%20/g, '+');
    return `https://www.amazon.es/s?k=${q}&tag=${AMAZON_TAG}`;
  }
  return null;
}
