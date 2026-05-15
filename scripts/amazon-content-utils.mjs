import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { extractAmazonAsin } from './amazon-api.mjs';

export const CONTENT_DIR = path.resolve('src/content/articulos');

export function parseArgs(argv = process.argv.slice(2)) {
  const args = {
    delay: 1200,
    retries: 2,
    limit: 0,
    article: '',
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--delay') args.delay = Number(argv[++i] || args.delay);
    else if (arg === '--retries') args.retries = Number(argv[++i] || args.retries);
    else if (arg === '--limit') args.limit = Number(argv[++i] || args.limit);
    else if (arg === '--article' || arg === '--slug') args.article = argv[++i] || '';
  }

  return args;
}

export function readContentFiles(article = '') {
  const files = readdirSync(CONTENT_DIR)
    .filter(file => file.endsWith('.mdx'))
    .filter(file => !article || file.replace(/\.mdx$/, '').includes(article));

  return files.map(file => {
    const filePath = path.join(CONTENT_DIR, file);
    return {
      slug: file.replace(/\.mdx$/, ''),
      file,
      filePath,
      content: readFileSync(filePath, 'utf8'),
    };
  });
}

export function extractAmazonRefs(files) {
  const refs = [];
  const seen = new Set();
  const urlRegex = /(?:https?:\/\/www\.amazon\.es)?\/(?:dp|gp\/product)\/([A-Z0-9]{10})/gi;

  for (const file of files) {
    let match;
    while ((match = urlRegex.exec(file.content))) {
      const asin = extractAmazonAsin(match[0]);
      if (!asin) continue;

      const key = `${file.slug}:${asin}`;
      if (seen.has(key)) continue;
      seen.add(key);

      refs.push({
        asin,
        slug: file.slug,
        filePath: file.filePath,
        editorialPrice: extractNearbyField(file.content, match.index, 'precio'),
        editorialImage: extractNearbyField(file.content, match.index, 'imagen'),
        editorialName: extractNearbyField(file.content, match.index, 'nombre'),
      });
    }
  }

  return refs;
}

export function uniqueAsins(refs, limit = 0) {
  const asins = [...new Set(refs.map(ref => ref.asin))];
  return limit > 0 ? asins.slice(0, limit) : asins;
}

function extractNearbyField(content, index, field) {
  const objectStart = content.lastIndexOf('{', index);
  const objectEnd = content.indexOf('}', index);
  if (objectStart !== -1 && objectEnd !== -1 && objectEnd - objectStart < 1400) {
    const objectSlice = content.slice(objectStart, objectEnd + 1);
    const objectMatch = objectSlice.match(new RegExp(`${field}:\\s*["']([^"']+)["']`));
    if (objectMatch) return objectMatch[1];
  }

  const start = Math.max(0, index - 700);
  const end = Math.min(content.length, index + 700);
  const slice = content.slice(start, end);
  const match = slice.match(new RegExp(`${field}:\\s*["']([^"']+)["']`));
  return match?.[1] || '';
}

export function groupRefsByAsin(refs) {
  return refs.reduce((acc, ref) => {
    acc[ref.asin] ||= [];
    acc[ref.asin].push(ref);
    return acc;
  }, {});
}

export function parsePriceAmount(price) {
  if (!price) return null;
  const match = String(price).match(/(\d+[.,]?\d*)/);
  return match ? Number(match[1].replace(',', '.')) : null;
}
