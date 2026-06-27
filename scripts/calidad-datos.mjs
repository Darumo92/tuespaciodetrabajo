import fs from 'node:fs/promises';
import path from 'node:path';
import yaml from 'js-yaml';

/**
 * Sistema de calidad de datos del catálogo de sillas.
 *
 * Calcula, por producto, un `calidadDatos` con:
 *   - score (0-100): cobertura ponderada de campos importantes.
 *   - confianza (alto/medio/bajo): según score + presencia de fuente oficial.
 *   - camposFaltantes: rutas de campos importantes vacíos.
 *   - enriquecidoEn: fecha ISO de recálculo.
 *
 * Uso:
 *   node scripts/calidad-datos.mjs                 → informe (solo lectura, todos)
 *   node scripts/calidad-datos.mjs --write a b c   → escribe el bloque en los slugs a,b,c
 *   node scripts/calidad-datos.mjs --write         → escribe en TODO el catálogo
 *
 * La escritura inyecta/actualiza solo el bloque `calidadDatos:` por texto,
 * sin reserializar el YAML (preserva orden, comillas y comentarios).
 */

const root = process.cwd();
const dir = path.join(root, 'src/content/productos');
const HOY = new Date().toISOString().slice(0, 10);

// Campos importantes y su peso. Suman 100. Los críticos para el comparador pesan más.
const PESOS_SPEC = {
  pesoMaxKg: 8,
  alturaAsientoMinCm: 6,
  alturaAsientoMaxCm: 6,
  anchoCm: 5,
  fondoCm: 5,
  mecanismo: 6,
  baseMaterial: 5,
  pesoProductoKg: 4,
  garantiaAnios: 6,
  reclinacionMaxGrados: 4,
  reposacabezas: 4,
  anchoAsientoCm: 4,
  alturaRespaldoCm: 3,
  profundidadAsientoMaxCm: 3,
  asientoMaterial: 3,
  certificacionBifma: 4,
  certificacionEn1335: 3,
};
// lumbar / respaldo / reposabrazos son obligatorios en el schema → siempre presentes.
const PESO_VALORACIONES = 6; // ejes de valoración completos
const PESO_FUENTES = 8; // al menos una fuente estructurada
const PESO_FUENTE_OFICIAL = 4; // al menos una fuente tipo "oficial"

const vacio = (v) => v === null || v === undefined || v === '';

function evalua(data) {
  const specs = data.specs ?? {};
  let score = 0;
  const faltantes = [];

  for (const [campo, peso] of Object.entries(PESOS_SPEC)) {
    if (!vacio(specs[campo])) score += peso;
    else faltantes.push(`specs.${campo}`);
  }

  const val = data.valoraciones ?? {};
  const ejes = ['ergonomia', 'ajustabilidad', 'materiales', 'comodidad', 'calidadPrecio'];
  const valCompletas = ejes.every((e) => !vacio(val[e]));
  if (valCompletas) score += PESO_VALORACIONES;
  else faltantes.push('valoraciones');

  const fuentes = Array.isArray(data.fuentes) ? data.fuentes : [];
  if (fuentes.length > 0) score += PESO_FUENTES;
  else faltantes.push('fuentes');
  const tieneOficial = fuentes.some((f) => f?.tipo === 'oficial');
  if (tieneOficial) score += PESO_FUENTE_OFICIAL;

  score = Math.min(100, Math.round(score));

  let confianza;
  if (tieneOficial && score >= 80) confianza = 'alto';
  else if (fuentes.length > 0 && score >= 55) confianza = 'medio';
  else confianza = 'bajo';

  return { score, confianza, camposFaltantes: faltantes, enriquecidoEn: HOY };
}

function bloqueYaml(q) {
  const faltLine = q.camposFaltantes.length
    ? `  camposFaltantes:\n${q.camposFaltantes.map((c) => `    - "${c}"`).join('\n')}`
    : '  camposFaltantes: []';
  return [
    'calidadDatos:',
    `  score: ${q.score}`,
    `  confianza: "${q.confianza}"`,
    `  enriquecidoEn: "${q.enriquecidoEn}"`,
    faltLine,
    '',
  ].join('\n');
}

function inyecta(text, q) {
  const bloque = bloqueYaml(q);
  // Elimina bloque calidadDatos existente (línea raíz + líneas indentadas).
  let out = text.replace(/^calidadDatos:\n(?:[ \t].*\n|\n)*/m, '');
  // Inserta justo antes de `specs:` (clave raíz, siempre presente y al final).
  if (/^specs:/m.test(out)) {
    out = out.replace(/^specs:/m, `${bloque}specs:`);
  } else {
    out = out.replace(/\n*$/, `\n${bloque}`);
  }
  return out;
}

const args = process.argv.slice(2);
const write = args.includes('--write');
const slugsArg = args.filter((a) => !a.startsWith('--'));

const files = (await fs.readdir(dir)).filter((f) => /\.ya?ml$/.test(f));
const objetivo = slugsArg.length
  ? files.filter((f) => slugsArg.includes(f.replace(/\.ya?ml$/, '')))
  : files;

const filas = [];
for (const file of objetivo) {
  const full = path.join(dir, file);
  const text = await fs.readFile(full, 'utf8');
  const data = yaml.load(text);
  const q = evalua(data);
  filas.push({ slug: file.replace(/\.ya?ml$/, ''), ...q });
  if (write) await fs.writeFile(full, inyecta(text, q), 'utf8');
}

filas.sort((a, b) => a.score - b.score);
console.log(`Productos evaluados: ${filas.length}${write ? ' (escritos)' : ' (solo lectura)'}\n`);
for (const f of filas) {
  console.log(
    `${String(f.score).padStart(3)}  ${f.confianza.padEnd(6)} ${f.slug}` +
      (f.camposFaltantes.length ? `  faltan: ${f.camposFaltantes.length}` : ''),
  );
}
const media = filas.reduce((s, f) => s + f.score, 0) / (filas.length || 1);
console.log(`\nMedia score: ${media.toFixed(1)}`);
