/**
 * Post-build script: scans all HTML files in dist/ for inline executable
 * scripts, calculates their SHA-256 hashes, and updates the CSP in
 * public/_headers. Then copies the updated _headers to dist/.
 *
 * Skips <script type="application/ld+json"> since those are data blocks,
 * not executable JavaScript, and browsers don't enforce CSP on them.
 */

import { readFileSync, writeFileSync, readdirSync, copyFileSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';

const DIST_DIR = 'dist';
const HEADERS_FILE = 'public/_headers';
const DIST_HEADERS = 'dist/_headers';

function walkHtml(dir) {
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walkHtml(full));
    else if (entry.name.endsWith('.html')) files.push(full);
  }
  return files;
}

const hashes = new Set();
const scriptRe = /<script([^>]*)>([\s\S]*?)<\/script>/g;

for (const file of walkHtml(DIST_DIR)) {
  const html = readFileSync(file, 'utf8');
  let m;
  while ((m = scriptRe.exec(html)) !== null) {
    const attrs = m[1];
    const content = m[2];
    if (/\bsrc\s*=/.test(attrs)) continue;
    if (/type\s*=\s*["']application\/ld\+json["']/i.test(attrs)) continue;
    if (/type\s*=\s*["']application\/json["']/i.test(attrs)) continue;
    if (/type\s*=\s*["']importmap["']/i.test(attrs)) continue;
    if (content.trim()) {
      const hash = createHash('sha256').update(content).digest('base64');
      hashes.add(`'sha256-${hash}'`);
    }
  }
}

console.log(`Found ${hashes.size} unique inline executable script hashes`);

const hashList = [...hashes].sort().join(' ');
const scriptSrc = `script-src 'self' ${hashList} https://www.googletagmanager.com https://static.cloudflareinsights.com https://www.clarity.ms https://scripts.clarity.ms`;

let headers = readFileSync(HEADERS_FILE, 'utf8');
headers = headers.replaceAll(
  /script-src\s[^;]+/g,
  scriptSrc
);
writeFileSync(HEADERS_FILE, headers, 'utf8');
copyFileSync(HEADERS_FILE, DIST_HEADERS);
console.log('Updated CSP script-src in public/_headers and dist/_headers');
