import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const productsDir = path.join(root, 'src/content/productos');
const registryPath = path.join(root, 'src/data/product-offers.json');
const markets = ['ES', 'US'];
const currencies = { ES: 'EUR', US: 'USD' };
const sourceTypes = ['amazon', 'official', 'distributor', 'retailer'];
const rootKeys = ['updatedAt', 'products'];
const marketRecordKeys = [
  'status',
  'priceAmount',
  'currency',
  'url',
  'evidenceUrl',
  'seller',
  'sourceType',
  'condition',
  'checkedAt',
  'attempts',
];
const isoDateTime = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;
const maxAgeMs = 30 * 24 * 60 * 60 * 1000;
const errors = [];
const nowTime = process.env.PRODUCT_OFFERS_NOW === undefined
  ? Date.now()
  : Date.parse(process.env.PRODUCT_OFFERS_NOW);

if (!Number.isFinite(nowTime)) errors.push('PRODUCT_OFFERS_NOW debe ser una fecha ISO valida');

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isHttpUrl(value) {
  if (typeof value !== 'string') return false;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function isIsoDateTime(value) {
  if (typeof value !== 'string') return false;
  const match = isoDateTime.exec(value);
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

function rejectUnknownKeys(value, allowedKeys, label) {
  for (const key of Object.keys(value)) {
    if (!allowedKeys.includes(key)) errors.push(`${label}.${key}: clave desconocida`);
  }
}

function validateAttempts(record, label, requireAll = false) {
  if (!Array.isArray(record.attempts) || record.attempts.some((attempt) => !sourceTypes.includes(attempt))) {
    errors.push(`${label}: attempts debe ser un array de fuentes validas`);
    return;
  }
  if (requireAll && sourceTypes.some((source) => !record.attempts.includes(source))) {
    errors.push(`${label}: unavailable debe incluir los cuatro intentos`);
  } else if (requireAll && (record.attempts.length !== sourceTypes.length || new Set(record.attempts).size !== sourceTypes.length)) {
    errors.push(`${label}: unavailable debe incluir exactamente los cuatro intentos sin duplicados`);
  }
}

function validateMarketOffer(record, market, label, pathLabel) {
  if (!isObject(record)) {
    errors.push(`${label}: registro de mercado invalido`);
    return;
  }
  rejectUnknownKeys(record, marketRecordKeys, pathLabel);
  if (record.currency !== currencies[market]) {
    errors.push(`${label}: currency debe ser ${currencies[market]}`);
  }
  if (!isIsoDateTime(record.checkedAt)) {
    errors.push(`${label}: checkedAt debe ser fecha ISO valida`);
  } else if (Number.isFinite(nowTime) && Date.parse(record.checkedAt) > nowTime) {
    errors.push(`${label}: checkedAt no puede estar en el futuro`);
  } else if (Number.isFinite(nowTime) && nowTime - Date.parse(record.checkedAt) > maxAgeMs) {
    errors.push(`${label}: ${record.status} tiene checkedAt de mas de 30 dias`);
  }

  if (record.status === 'available') {
    if (typeof record.priceAmount !== 'number' || !Number.isFinite(record.priceAmount) || record.priceAmount <= 0) {
      errors.push(`${label}: available requiere priceAmount positivo y finito`);
    }
    if (!isHttpUrl(record.url)) errors.push(`${label}: available requiere url http(s)`);
    if (!isHttpUrl(record.evidenceUrl)) errors.push(`${label}: available requiere evidenceUrl http(s)`);
    if (typeof record.seller !== 'string' || record.seller.trim() === '') errors.push(`${label}: available requiere seller`);
    if (!sourceTypes.includes(record.sourceType)) errors.push(`${label}: available requiere sourceType valido`);
    if (record.condition !== 'new') errors.push(`${label}: available requiere condition new`);
    validateAttempts(record, label);
    return;
  }

  if (record.status === 'unavailable') {
    for (const field of ['priceAmount', 'url', 'evidenceUrl', 'seller', 'sourceType', 'condition']) {
      if (record[field] !== null) errors.push(`${label}: unavailable requiere ${field} null`);
    }
    validateAttempts(record, label, true);
    return;
  }

  errors.push(`${label}: status debe ser available o unavailable`);
}

const productFiles = (await fs.readdir(productsDir)).filter((file) => /\.(?:ya?ml|json)$/.test(file));
const slugs = new Set();
for (const file of productFiles) {
  const slug = path.basename(file, path.extname(file));
  if (slugs.has(slug)) errors.push(`${slug}: slug duplicado en src/content/productos`);
  slugs.add(slug);
}

let registry;
try {
  registry = JSON.parse(await fs.readFile(registryPath, 'utf8'));
} catch (error) {
  errors.push(`product-offers.json: JSON invalido (${error.message})`);
  registry = {};
}

if (!isObject(registry)) {
  errors.push('product-offers.json: la raiz debe ser un objeto');
  registry = {};
}
rejectUnknownKeys(registry, rootKeys, 'product-offers.json');
if (!isIsoDateTime(registry.updatedAt)) {
  errors.push('product-offers.json: updatedAt debe ser fecha ISO valida');
} else if (Number.isFinite(nowTime) && Date.parse(registry.updatedAt) > nowTime) {
  errors.push('product-offers.json: updatedAt no puede estar en el futuro');
} else if (Number.isFinite(nowTime) && nowTime - Date.parse(registry.updatedAt) > maxAgeMs) {
  errors.push('product-offers.json: updatedAt tiene mas de 30 dias');
}
if (!isObject(registry.products)) {
  errors.push('product-offers.json: products debe ser un objeto');
  registry.products = {};
}

let esAudited = 0;
let usAudited = 0;

for (const slug of Object.keys(registry.products)) {
  if (!slugs.has(slug)) errors.push(`${slug}: slug desconocido`);
}

for (const slug of slugs) {
  const product = registry.products[slug];
  if (!isObject(product)) {
    errors.push(`${slug}: falta registro de ofertas ES/US`);
    continue;
  }

  for (const market of Object.keys(product)) {
    if (!markets.includes(market)) errors.push(`products.${slug}.${market}: clave desconocida`);
  }

  for (const market of markets) {
    if (!(market in product)) {
      errors.push(`${slug}: falta mercado ${market}`);
      continue;
    }
    if (market === 'ES') esAudited += 1;
    if (market === 'US') usAudited += 1;
    validateMarketOffer(product[market], market, `${slug}.${market}`, `products.${slug}.${market}`);
  }
}

console.log(`Productos: ${slugs.size}`);
console.log(`ES auditados: ${esAudited}/${slugs.size}`);
console.log(`US auditados: ${usAudited}/${slugs.size}`);

if (errors.length) {
  console.error(`\nErrores (${errors.length}):`);
  console.error(errors.map((error) => `- ${error}`).join('\n'));
  process.exit(1);
}

console.log('OK: registro de ofertas valido y completo');
