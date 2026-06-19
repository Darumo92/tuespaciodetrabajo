import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const dir = path.join(root, 'src/content/productos');
const files = (await fs.readdir(dir)).filter((f) => f.endsWith('.yaml') || f.endsWith('.yml'));
const slugs = new Set();
const names = new Map();
const errors = [];

function getScalar(text, key) {
  const match = text.match(new RegExp(`^${key}:\\s*"?([^"\\n]*)"?\\s*$`, 'm'));
  return match?.[1]?.trim() || null;
}

function hasBlockValue(text, key) {
  return new RegExp(`^${key}:\\s*`, 'm').test(text);
}

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
}

console.log(`Productos revisados: ${files.length}`);

if (errors.length) {
  console.error(errors.map((e) => `- ${e}`).join('\n'));
  process.exit(1);
}

console.log('OK: catalogo de productos valido');
