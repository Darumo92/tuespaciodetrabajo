import fs from 'node:fs/promises';
import path from 'node:path';
import yaml from 'js-yaml';

const root = process.cwd();
const dir = path.join(root, 'src/content/productos');
const files = (await fs.readdir(dir)).filter((f) => f.endsWith('.yaml') || f.endsWith('.yml'));
const slugs = new Set();
const names = new Map();
const errors = [];
const warnings = [];

function getScalar(text, key) {
  const match = text.match(new RegExp(`^${key}:\\s*"?([^"\\n]*)"?\\s*$`, 'm'));
  return match?.[1]?.trim() || null;
}

function hasBlockValue(text, key) {
  return new RegExp(`^${key}:\\s*`, 'm').test(text);
}

const noVacio = (v) => v !== null && v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0);

for (const file of files) {
  const slug = file.replace(/\.ya?ml$/, '');
  const text = await fs.readFile(path.join(dir, file), 'utf8');
  const nombre = getScalar(text, 'nombre');
  const marca = getScalar(text, 'marca');
  const imagen = getScalar(text, 'imagen');
  const fuenteSpecs = getScalar(text, 'fuenteSpecs');

  if (slugs.has(slug)) errors.push(`${file}: slug duplicado`);
  slugs.add(slug);

  if (!nombre) errors.push(`${file}: falta nombre`);
  if (!marca) errors.push(`${file}: falta marca`);
  if (!fuenteSpecs) errors.push(`${file}: falta fuenteSpecs`);
  if (!hasBlockValue(text, 'valoraciones')) errors.push(`${file}: falta valoraciones`);
  if (!hasBlockValue(text, 'paraQuienSi')) errors.push(`${file}: falta paraQuienSi`);
  if (!hasBlockValue(text, 'paraQuienNo')) errors.push(`${file}: falta paraQuienNo`);

  if (imagen?.startsWith('/img/productos/')) {
    const imgPath = path.join(root, 'public', imagen);
    try {
      await fs.access(imgPath);
    } catch {
      errors.push(`${file}: imagen local no existe ${imagen}`);
    }
  }

  const key = `${marca || ''}|${nombre || ''}`.toLowerCase();
  if (names.has(key)) errors.push(`${file}: nombre duplicado con ${names.get(key)}`);
  names.set(key, file);

  // Cobertura bilingüe: el texto visible en ES debe tener equivalente en el bloque `en:`.
  // Falta de `en:` o paridad parcial es WARNING (el fallback es temporalmente válido).
  const data = yaml.load(text) ?? {};
  const en = data.en;
  // Pares ES (campo base) → EN (campo dentro de en:) que deben coexistir si el ES está presente.
  const paresProsa = [
    ['veredicto', 'veredicto'],
    ['idealPara', 'idealPara'],
    ['puntosFuertes', 'puntosFuertes'],
    ['puntosDebiles', 'puntosDebiles'],
    ['paraQuienSi', 'paraQuienSi'],
    ['paraQuienNo', 'paraQuienNo'],
    ['comunidad', 'comunidad'],
  ];
  const tieneProsaEs = paresProsa.some(([es]) => noVacio(data[es]));
  if (tieneProsaEs && !en) {
    warnings.push(`${file}: contenido EN ausente (falta bloque en:)`);
  } else if (en) {
    const faltanEn = paresProsa
      .filter(([es, k]) => noVacio(data[es]) && !noVacio(en[k]))
      .map(([, k]) => k);
    if (faltanEn.length) warnings.push(`${file}: EN parcial, faltan en.${faltanEn.join(', en.')}`);
  }
}

console.log(`Productos revisados: ${files.length}`);

if (warnings.length) {
  console.warn(`\nAvisos i18n (${warnings.length}):`);
  console.warn(warnings.map((w) => `- ${w}`).join('\n'));
}

if (errors.length) {
  console.error(`\nErrores (${errors.length}):`);
  console.error(errors.map((e) => `- ${e}`).join('\n'));
  process.exit(1);
}

console.log('OK: catalogo de productos valido');
