import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { getItemsInBatches } from './amazon-api.mjs';
import {
  extractAmazonRefs,
  groupRefsByAsin,
  parseArgs,
  parsePriceAmount,
  readContentFiles,
  uniqueAsins,
} from './amazon-content-utils.mjs';

const REPORT_DIR = path.resolve('reports/amazon-products');
const args = parseArgs();
const files = readContentFiles(args.article);
const refs = extractAmazonRefs(files);
const refsByAsin = groupRefsByAsin(refs);
const asins = uniqueAsins(refs, args.limit);

if (asins.length === 0) {
  console.log('No Amazon ASINs found.');
  process.exit(0);
}

console.log(`Auditing ${asins.length} Amazon ASIN(s)...`);
console.log(`Delay: ${args.delay}ms | Retries: ${args.retries}${args.article ? ` | Article: ${args.article}` : ''}`);

const { products, errors, checkedAt } = await getItemsInBatches(asins, {
  delay: args.delay,
  retries: args.retries,
});

const productByAsin = Object.fromEntries(products.filter(p => p.asin).map(p => [p.asin, p]));
const rows = [];

for (const asin of asins) {
  const product = productByAsin[asin];
  const productRefs = refsByAsin[asin] || [];
  const issues = [];

  if (!product) {
    issues.push('ASIN no encontrado');
  } else {
    if (!product.price) issues.push('sin precio');
    if (!product.image) issues.push('sin imagen');
    if (!product.availabilityMessage && !product.availability) issues.push('sin disponibilidad');
    if (product.isAvailable === false) issues.push('no disponible');
    if (product.leadTime && /\b(1|2|3|4|5|6|7|8|9)\s*(semana|month|mes)/i.test(product.leadTime)) issues.push(`lead time raro: ${product.leadTime}`);

    const editorialNames = productRefs.map(ref => ref.editorialName).filter(Boolean);
    if (product.title && editorialNames.some(name => titleLooksDifferent(name, product.title))) {
      issues.push('titulo posiblemente distinto');
    }

    const apiPrice = product.priceAmount;
    const editorialPrices = productRefs.map(ref => parsePriceAmount(ref.editorialPrice)).filter(price => price !== null);
    if (typeof apiPrice === 'number' && editorialPrices.some(price => price && Math.abs(apiPrice - price) / price > 0.2)) {
      issues.push('diferencia de precio >20%');
    }
  }

  rows.push({ asin, product, refs: productRefs, issues });
}

const date = checkedAt.slice(0, 10);
const reportPath = path.join(REPORT_DIR, `audit-${date}.md`);
mkdirSync(REPORT_DIR, { recursive: true });
writeFileSync(reportPath, renderReport(rows, errors, checkedAt));

console.log(`Report written: ${reportPath}`);
console.log(`Products found: ${products.length} | Errors: ${errors.length}`);

function renderReport(rows, errors, checkedAt) {
  const issueRows = rows.filter(row => row.issues.length > 0);
  const lines = [
    '# Auditoría Amazon Products',
    '',
    `Fecha: ${checkedAt}`,
    `ASINs auditados: ${rows.length}`,
    `Con incidencias: ${issueRows.length}`,
    '',
    '## Incidencias',
    '',
  ];

  if (issueRows.length === 0) {
    lines.push('Sin incidencias detectadas.', '');
  } else {
    lines.push('| ASIN | Artículos | Producto API | Precio API | Disponibilidad | Incidencias |', '| --- | --- | --- | --- | --- | --- |');
    for (const row of issueRows) {
      lines.push(`| ${row.asin} | ${row.refs.map(ref => ref.slug).join('<br>')} | ${escapeCell(row.product?.title || '-')} | ${escapeCell(row.product?.price || '-')} | ${escapeCell(row.product?.availabilityMessage || row.product?.availability || '-')} | ${escapeCell(row.issues.join(', '))} |`);
    }
    lines.push('');
  }

  lines.push('## Todos los productos', '', '| ASIN | Artículos | Producto API | Precio API | Imagen | Disponibilidad |', '| --- | --- | --- | --- | --- | --- |');
  for (const row of rows) {
    lines.push(`| ${row.asin} | ${row.refs.map(ref => ref.slug).join('<br>')} | ${escapeCell(row.product?.title || '-')} | ${escapeCell(row.product?.price || '-')} | ${row.product?.image ? 'sí' : 'no'} | ${escapeCell(row.product?.availabilityMessage || row.product?.availability || '-')} |`);
  }

  if (errors.length > 0) {
    lines.push('', '## Errores API', '');
    for (const error of errors) {
      lines.push(`- ${error.code || 'ERROR'}: ${error.message || JSON.stringify(error)}`);
    }
  }

  return `${lines.join('\n')}\n`;
}

function titleLooksDifferent(editorialName, apiTitle) {
  const normalize = value => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
  const editorialTokens = normalize(editorialName).split(' ').filter(token => token.length > 2);
  const api = normalize(apiTitle);
  if (editorialTokens.length === 0) return false;
  const matched = editorialTokens.filter(token => api.includes(token)).length;
  return matched / editorialTokens.length < 0.45;
}

function escapeCell(value) {
  return String(value).replace(/\|/g, '\\|').replace(/\n/g, ' ');
}
