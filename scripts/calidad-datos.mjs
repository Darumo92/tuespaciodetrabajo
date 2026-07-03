import fs from 'node:fs/promises';
import path from 'node:path';
import yaml from 'js-yaml';

/**
 * Sistema de calidad de datos del catálogo de productos (sillas y escritorios).
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

// Campos importantes y su peso por tipo. Cada set de specs suma ~80; el resto
// (valoraciones + fuentes + fuente oficial = 18) completa hasta 100.
// Los críticos para el comparador pesan más.
const PESOS_SPEC_SILLA = {
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
// motor es obligatorio en el schema → siempre presente.
const PESOS_SPEC_ESCRITORIO = {
  cargaMaxKg: 8,
  alturaMinCm: 6,
  alturaMaxCm: 6,
  velocidadMmPorSeg: 6,
  garantiaAnios: 6,
  tableroAnchoCm: 5,
  tableroFondoCm: 5,
  tableroGrosorCm: 4,
  tableroMaterial: 4,
  estructuraMaterial: 4,
  pesoProductoKg: 4,
  memorias: 4,
  anticolision: 4,
  segmentosColumna: 4,
  certificacionTuv: 4,
  nivelRuidoDb: 3,
  pantallaControl: 3,
};
// lumbar / respaldo / reposabrazos (silla) son obligatorios en el schema → siempre presentes.
const EJES_POR_TIPO = {
  silla: ['ergonomia', 'ajustabilidad', 'materiales', 'comodidad', 'calidadPrecio'],
  escritorio: ['velocidad', 'estabilidad', 'capacidadCarga', 'rangoAltura', 'materiales', 'calidadPrecio'],
};
const PESOS_SPEC_POR_TIPO = {
  silla: PESOS_SPEC_SILLA,
  escritorio: PESOS_SPEC_ESCRITORIO,
};
const PESO_VALORACIONES = 6; // ejes de valoración completos
const PESO_FUENTES = 8; // al menos una fuente estructurada
const PESO_FUENTE_OFICIAL = 4; // al menos una fuente tipo "oficial"

const vacio = (v) => v === null || v === undefined || v === '';

// Campos del tablero: N/A reales cuando el producto se vende solo estructura
// (tableroIncluido === false). En ese caso el dato es completo ("no incluido"),
// no un hueco → cuentan como satisfechos y no penalizan el score.
const CAMPOS_TABLERO = ['tableroAnchoCm', 'tableroFondoCm', 'tableroGrosorCm', 'tableroMaterial'];

function evalua(data) {
  const specs = data.specs ?? {};
  const tipo = data.tipo ?? 'silla';
  const pesosSpec = PESOS_SPEC_POR_TIPO[tipo] ?? PESOS_SPEC_SILLA;
  const ejes = EJES_POR_TIPO[tipo] ?? EJES_POR_TIPO.silla;
  const sinTablero = tipo === 'escritorio' && specs.tableroIncluido === false;
  let score = 0;
  const faltantes = [];

  for (const [campo, peso] of Object.entries(pesosSpec)) {
    if (sinTablero && CAMPOS_TABLERO.includes(campo)) score += peso;
    else if (!vacio(specs[campo])) score += peso;
    else faltantes.push(`specs.${campo}`);
  }

  const val = data.valoraciones ?? {};
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
