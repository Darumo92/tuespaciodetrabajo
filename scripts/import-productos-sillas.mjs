import fs from 'node:fs/promises';
import path from 'node:path';

const input = process.argv[2];
if (!input) {
  console.error('Uso: node scripts/import-productos-sillas.mjs docs/research/sillas/lote.csv');
  process.exit(1);
}

const text = await fs.readFile(input, 'utf8');
const [headerLine, ...rows] = text.trim().split(/\r?\n/);
const headers = headerLine.split(',');

function parseRow(line) {
  const values = line.split(',');
  return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? '']));
}

function yamlString(v) {
  return JSON.stringify(v ?? '');
}

function yamlBool(v) {
  return String(v).toLowerCase() === 'true' ? 'true' : 'false';
}

function renderMercadosAmazon(row) {
  const raw = String(row.asinByMarket || '').trim();
  if (!raw) return '[]';
  const rows = raw.split(';').map((entry) => {
    const [mercado, asin] = entry.split(':').map((v) => v.trim());
    if (!mercado || !asin) return null;
    return `  - mercado: ${yamlString(mercado)}
    asin: ${yamlString(asin)}
    disponibilidad: "available"
    verificadoEn: ${yamlString(row.verificadoEn)}`;
  }).filter(Boolean);
  return rows.length ? `\n${rows.join('\n')}` : '[]';
}

function render(row) {
  return `tipo: "silla"
nombre: ${yamlString(row.nombre)}
marca: ${yamlString(row.marca)}
imagen: ${yamlString(row.imagen)}
imagenAlt: ${yamlString(row.imagenAlt)}
tramoPrecio: ${Number(row.tramoPrecio || 2)}
precioMin: null
precioMax: null
valoracion: ${Number(row.valoracion || 0)}
valoraciones:
  ergonomia: null
  ajustabilidad: null
  materiales: null
  comodidad: null
  calidadPrecio: null
amazon:
  asin: ${row.asinPrimary ? yamlString(row.asinPrimary) : 'null'}
  buscar: ${row.amazonBuscar ? yamlString(row.amazonBuscar) : 'null'}
amazonPrimaryMarket: ${row.amazonPrimaryMarket ? yamlString(row.amazonPrimaryMarket) : '"ES"'}
mercadosAmazon: ${renderMercadosAmazon(row)}
oneLinkReady: ${yamlBool(row.oneLinkReady)}
webOficial: ${row.webOficial ? yamlString(row.webOficial) : 'null'}
idealPara: ${yamlString(row.idealPara)}
veredicto: ${yamlString(row.veredicto)}
comunidad: ""
paraQuienSi: []
paraQuienNo: []
puntosFuertes: []
puntosDebiles: []
fuenteSpecs: ${yamlString(row.fuenteSpecs)}
verificadoEn: ${yamlString(row.verificadoEn)}
specs:
  tipo: "silla"
  lumbar: "fijo"
  respaldo: "malla"
  reposabrazos: "fijo"
  profundidadRegulable: false
  reclinacionMaxGrados: null
  pesoMaxKg: null
  alturaAsientoMinCm: null
  alturaAsientoMaxCm: null
  anchoCm: null
  fondoCm: null
  mecanismo: null
  baseMaterial: null
  certificacionBifma: null
  pesoProductoKg: null
  garantiaAnios: null
`;
}

const outDir = path.join(process.cwd(), 'src/content/productos');

for (const line of rows.filter(Boolean)) {
  const row = parseRow(line);
  if (!row.slug) throw new Error(`Fila sin slug: ${line}`);
  const file = path.join(outDir, `${row.slug}.yaml`);
  await fs.writeFile(file, render(row), { flag: 'wx' });
  console.log(`created ${file}`);
}
