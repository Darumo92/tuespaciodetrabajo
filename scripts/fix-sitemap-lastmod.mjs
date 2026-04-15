/**
 * Post-build script: adds <lastmod> to sitemap-index.xml entries.
 * @astrojs/sitemap doesn't include lastmod in the index, which can cause
 * Google Search Console to skip re-crawling child sitemaps.
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const indexPath = resolve('dist/sitemap-index.xml');
const now = new Date().toISOString();

let xml = readFileSync(indexPath, 'utf-8');

// Add <lastmod> after each <loc>...</loc> that doesn't already have one
xml = xml.replace(
  /<loc>(.*?)<\/loc>(?!\s*<lastmod>)/g,
  `<loc>$1</loc><lastmod>${now}</lastmod>`
);

writeFileSync(indexPath, xml);
console.log(`✓ sitemap-index.xml: added lastmod ${now}`);
