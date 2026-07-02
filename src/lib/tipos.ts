export type ClaveTipo = 'silla' | 'escritorio';

export interface EjeConfig { clave: string; etiqueta: string; }

export type Comparacion = 'max' | 'igual' | 'min' | 'check' | 'umbral' | 'en';
export type TransformId = 'reposabrazosNivel';
export type FormatoSalida = 'tramoEuros';

export interface FiltroConfig {
  id: string;
  etiqueta: string;
  control: 'rango' | 'select' | 'check';
  comparacion: Comparacion;
  campo: string;
  opciones?: { valor: string; etiqueta: string }[];
  min?: number; max?: number; step?: number;
  umbral?: number;
  transform?: TransformId;
  formatoSalida?: FormatoSalida;
  grupo?: string;
}

export interface GrupoFiltro { id: string; etiqueta: string; etiquetaEn: string; }
export const GRUPOS_FILTRO: GrupoFiltro[] = [
  { id: 'ergonomia',   etiqueta: 'Ergonomía y ajustes', etiquetaEn: 'Ergonomics & adjustments' },
  { id: 'encaje',      etiqueta: 'Encaje corporal',     etiquetaEn: 'Body fit' },
  { id: 'resistencia', etiqueta: 'Resistencia',         etiquetaEn: 'Load capacity' },
];

export interface OrdenConfig {
  id: string;
  etiqueta: string;
  campo: string;
  direccion: 'asc' | 'desc';
}

export interface ChipConfig {
  campo: string;
  formato?: string;
  prefijo?: string;
  prefijoEn?: string;
  mostrarSiNulo?: { etiqueta: string; etiquetaEn?: string };
}

export interface FilaComparador {
  campo: string;
  etiqueta: string;
  direccion?: 'mayor' | 'menor';
  grupo: string;
}
export interface GrupoSpecs { titulo: string; filas: { campo: string; etiqueta: string; formato?: string }[]; }

export interface EnLabels {
  singular: string;
  plural: string;
  breadcrumb: string;
  catalogTitle: string;
  catalogDescription: string;
  catalogH1: string;
  catalogSchemaName: string;
  compareTitle: string;
  compareDescription: string;
  compareH1: string;
  compareIntro: string;
  comparePairIntro: string;
  catalogIntro: string;
  popularHeading: string;
  comparePairTitleSuffix: string;
  comparePairAxes: string;
  metaDatabaseName: string;
}

export interface TipoConfig {
  slug: ClaveTipo;
  labelSingular: string;
  labelPlural: string;
  icono: string;
  enLabels: EnLabels;
  ejes: EjeConfig[];
  filtros: FiltroConfig[];
  ordenaciones: OrdenConfig[];
  tarjetaChips: ChipConfig[];
  comparador: FilaComparador[];
  fichaSpecs: GrupoSpecs[];
}

const silla: TipoConfig = {
  slug: 'silla',
  labelSingular: 'Silla',
  labelPlural: 'Sillas',
  icono: '🪑',
  enLabels: {
    singular: 'chair',
    plural: 'chairs',
    breadcrumb: 'Chairs',
    catalogTitle: 'Ergonomic Office Chairs | Product Catalog',
    catalogDescription: 'Compare ergonomic office chairs with verified specs, editorial scores, price tiers and side-by-side product comparisons.',
    catalogH1: 'Ergonomic office chairs',
    catalogSchemaName: 'Ergonomic office chairs for home offices',
    compareTitle: 'Office Chair Comparison Tool | Tu Espacio de Trabajo',
    compareDescription: 'Compare ergonomic office chairs side by side using verified specs, editorial scores, price tiers and adjustment data.',
    compareH1: 'Compare ergonomic office chairs',
    compareIntro: 'Choose two to four chairs from the catalog and compare the specs that matter for long home-office sessions.',
    comparePairIntro: 'Side-by-side comparison of two ergonomic office chairs in a similar buying context. Highlighted cells show the better value for each row.',
    catalogIntro: 'Use the filters to compare verified chair specs: backrest type, armrests, weight capacity, recommended user height and editorial scores.',
    popularHeading: 'Popular chair comparisons',
    comparePairTitleSuffix: 'Chair Specs',
    comparePairAxes: 'ergonomics, adjustability, materials, price tier',
    metaDatabaseName: 'Chair Database',
  },
  ejes: [
    { clave: 'ergonomia', etiqueta: 'Ergonomía' },
    { clave: 'ajustabilidad', etiqueta: 'Ajustabilidad' },
    { clave: 'materiales', etiqueta: 'Materiales' },
    { clave: 'comodidad', etiqueta: 'Comodidad' },
    { clave: 'calidadPrecio', etiqueta: 'Calidad-precio' },
  ],
  filtros: [
    { id: 'precio', etiqueta: 'Precio máximo', control: 'rango', comparacion: 'max',
      campo: 'tramoPrecio', min: 1, max: 4, step: 1, formatoSalida: 'tramoEuros' },
    { id: 'marca', etiqueta: 'Marca', control: 'select', comparacion: 'en', campo: 'marca' },
    { id: 'respaldo', etiqueta: 'Respaldo', control: 'select', comparacion: 'igual', campo: 'specs.respaldo', grupo: 'ergonomia',
      opciones: [{ valor: '', etiqueta: 'Cualquiera' }, { valor: 'malla', etiqueta: 'Malla' },
        { valor: 'espuma', etiqueta: 'Espuma' }, { valor: 'mixto', etiqueta: 'Mixto' }] },
    { id: 'brazos', etiqueta: 'Reposabrazos mín.', control: 'select', comparacion: 'min',
      campo: 'specs.reposabrazos', grupo: 'ergonomia', transform: 'reposabrazosNivel',
      opciones: [{ valor: '0', etiqueta: 'Cualquiera' }, { valor: '2', etiqueta: '2D o superior' },
        { valor: '3', etiqueta: '3D o superior' }, { valor: '4', etiqueta: '4D' }] },
    { id: 'prof', etiqueta: 'Profundidad regulable', control: 'check', comparacion: 'check',
      campo: 'specs.profundidadRegulable', grupo: 'ergonomia' },
    { id: 'peso', etiqueta: 'Soporta 130 kg o más', control: 'check', comparacion: 'umbral',
      campo: 'specs.pesoMaxKg', grupo: 'resistencia', umbral: 130 },
    { id: 'altura-min', etiqueta: 'Apta desde altura', control: 'rango', comparacion: 'max',
      campo: 'specs.alturaRecomendadaMinCm', grupo: 'encaje', min: 150, max: 190, step: 5 },
    { id: 'altura-max', etiqueta: 'Apta hasta altura', control: 'rango', comparacion: 'min',
      campo: 'specs.alturaRecomendadaMaxCm', grupo: 'encaje', min: 160, max: 210, step: 5 },
    { id: 'reposacabezas', etiqueta: 'Reposacabezas', control: 'select', comparacion: 'igual', campo: 'specs.reposacabezas', grupo: 'ergonomia',
      opciones: [{ valor: '', etiqueta: 'Cualquiera' }, { valor: 'ajustable', etiqueta: 'Ajustable' }, { valor: 'fijo', etiqueta: 'Fijo' }, { valor: 'ninguno', etiqueta: 'Sin reposacabezas' }] },
  ],
  ordenaciones: [
    { id: 'valoracion', etiqueta: 'Mejor valoradas', campo: 'valoracion', direccion: 'desc' },
    { id: 'precio-asc', etiqueta: 'Precio bajo a alto', campo: 'tramoPrecio', direccion: 'asc' },
    { id: 'precio-desc', etiqueta: 'Precio alto a bajo', campo: 'tramoPrecio', direccion: 'desc' },
    { id: 'peso-max', etiqueta: 'Mayor carga', campo: 'specs.pesoMaxKg', direccion: 'desc' },
  ],
  tarjetaChips: [
    { campo: 'specs.lumbar', prefijo: 'Lumbar ', prefijoEn: 'Lumbar ', formato: 'enumLower:lumbar' },
    { campo: 'specs.respaldo', formato: 'enum:respaldo' },
    { campo: 'specs.pesoMaxKg', formato: 'kg' },
    { campo: 'specs.garantiaAnios', formato: 'anios', mostrarSiNulo: { etiqueta: 'garantía n/d', etiquetaEn: 'warranty n/a' } },
    { campo: 'specs.alturaRecomendadaMaxCm', formato: 'cm', prefijo: 'Hasta ', prefijoEn: 'Up to ' },
    { campo: 'specs.profundidadAsientoMaxCm', formato: 'cm', prefijo: 'Asiento ', prefijoEn: 'Seat ' },
  ],
  comparador: [
    { grupo: 'Valoración por ejes', campo: 'valoraciones.ergonomia', etiqueta: 'Ergonomía', direccion: 'mayor' },
    { grupo: 'Valoración por ejes', campo: 'valoraciones.ajustabilidad', etiqueta: 'Ajustabilidad', direccion: 'mayor' },
    { grupo: 'Valoración por ejes', campo: 'valoraciones.materiales', etiqueta: 'Materiales', direccion: 'mayor' },
    { grupo: 'Valoración por ejes', campo: 'valoraciones.comodidad', etiqueta: 'Comodidad', direccion: 'mayor' },
    { grupo: 'Valoración por ejes', campo: 'valoraciones.calidadPrecio', etiqueta: 'Calidad-precio', direccion: 'mayor' },
    { grupo: 'Precio y garantía', campo: 'tramoPrecio', etiqueta: 'Tramo de precio', direccion: 'menor' },
    { grupo: 'Precio y garantía', campo: 'specs.garantiaAnios', etiqueta: 'Garantía (años)', direccion: 'mayor' },
    { grupo: 'Construcción', campo: 'specs.pesoMaxKg', etiqueta: 'Peso máximo (kg)', direccion: 'mayor' },
    { grupo: 'Construcción', campo: 'specs.reclinacionMaxGrados', etiqueta: 'Reclinación máx (°)', direccion: 'mayor' },
  ],
  fichaSpecs: [
    { titulo: 'Ergonomía y ajustes', filas: [
      { campo: 'specs.lumbar', etiqueta: 'Soporte lumbar' },
      { campo: 'specs.reposabrazos', etiqueta: 'Reposabrazos' },
      { campo: 'specs.profundidadRegulable', etiqueta: 'Profundidad regulable', formato: 'bool' },
      { campo: 'specs.reclinacionMaxGrados', etiqueta: 'Reclinación máx.', formato: 'grados' },
      { campo: 'specs.mecanismo', etiqueta: 'Mecanismo' },
    ]},
    { titulo: 'Construcción y materiales', filas: [
      { campo: 'specs.respaldo', etiqueta: 'Respaldo' },
      { campo: 'specs.baseMaterial', etiqueta: 'Base' },
      { campo: 'specs.certificacionBifma', etiqueta: 'Certificación BIFMA', formato: 'bool' },
      { campo: 'specs.pesoMaxKg', etiqueta: 'Peso máximo soportado', formato: 'kg' },
      { campo: 'specs.pesoProductoKg', etiqueta: 'Peso del producto', formato: 'kg' },
    ]},
    { titulo: 'Dimensiones y garantía', filas: [
      { campo: 'specs.anchoCm', etiqueta: 'Ancho', formato: 'cm' },
      { campo: 'specs.fondoCm', etiqueta: 'Fondo', formato: 'cm' },
      { campo: 'specs.garantiaAnios', etiqueta: 'Garantía', formato: 'anios' },
    ]},
  ],
};

const escritorio: TipoConfig = {
  slug: 'escritorio',
  labelSingular: 'Escritorio',
  labelPlural: 'Escritorios',
  icono: '🖥️',
  enLabels: {
    singular: 'standing desk',
    plural: 'standing desks',
    breadcrumb: 'Standing desks',
    catalogTitle: 'Electric Standing Desks | Product Catalog',
    catalogDescription: 'Compare electric standing desks with verified specs, editorial scores, price tiers and side-by-side product comparisons.',
    catalogH1: 'Electric standing desks',
    catalogSchemaName: 'Electric standing desks for home offices',
    compareTitle: 'Standing Desk Comparison Tool | Tu Espacio de Trabajo',
    compareDescription: 'Compare electric standing desks side by side using verified specs, editorial scores, price tiers and lift data.',
    compareH1: 'Compare electric standing desks',
    compareIntro: 'Choose two to four desks from the catalog and compare the specs that matter for long home-office sessions.',
    comparePairIntro: 'Side-by-side comparison of two electric standing desks in a similar buying context. Highlighted cells show the better value for each row.',
    catalogIntro: 'Use the filters to compare verified standing desk specs: motor type, load capacity, height range, tabletop and editorial scores.',
    popularHeading: 'Popular standing desk comparisons',
    comparePairTitleSuffix: 'Standing Desk Specs',
    comparePairAxes: 'speed, stability, load capacity, price tier',
    metaDatabaseName: 'Standing Desk Database',
  },
  ejes: [
    { clave: 'velocidad', etiqueta: 'Velocidad' },
    { clave: 'estabilidad', etiqueta: 'Estabilidad' },
    { clave: 'capacidadCarga', etiqueta: 'Capacidad de carga' },
    { clave: 'rangoAltura', etiqueta: 'Rango de altura' },
    { clave: 'materiales', etiqueta: 'Materiales' },
    { clave: 'calidadPrecio', etiqueta: 'Calidad-precio' },
  ],
  filtros: [
    { id: 'precio', etiqueta: 'Precio máximo', control: 'rango', comparacion: 'max',
      campo: 'tramoPrecio', min: 1, max: 4, step: 1, formatoSalida: 'tramoEuros' },
    { id: 'marca', etiqueta: 'Marca', control: 'select', comparacion: 'en', campo: 'marca' },
    { id: 'motor', etiqueta: 'Motor', control: 'select', comparacion: 'igual', campo: 'specs.motor',
      opciones: [{ valor: '', etiqueta: 'Cualquiera' }, { valor: 'doble', etiqueta: 'Doble motor' },
        { valor: 'simple', etiqueta: 'Motor simple' }, { valor: 'manual', etiqueta: 'Manual' }] },
    { id: 'tablero', etiqueta: 'Tablero incluido', control: 'check', comparacion: 'check',
      campo: 'specs.tableroIncluido' },
    { id: 'carga', etiqueta: 'Soporta 100 kg o más', control: 'check', comparacion: 'umbral',
      campo: 'specs.cargaMaxKg', umbral: 100 },
    { id: 'anticolision', etiqueta: 'Anticolisión', control: 'check', comparacion: 'check',
      campo: 'specs.anticolision' },
    { id: 'memorias', etiqueta: '2+ posiciones de memoria', control: 'check', comparacion: 'umbral',
      campo: 'specs.memorias', umbral: 2 },
    { id: 'altura-min', etiqueta: 'Baja hasta (altura mín.)', control: 'rango', comparacion: 'max',
      campo: 'specs.alturaMinCm', min: 55, max: 80, step: 5 },
  ],
  ordenaciones: [
    { id: 'valoracion', etiqueta: 'Mejor valorados', campo: 'valoracion', direccion: 'desc' },
    { id: 'precio-asc', etiqueta: 'Precio bajo a alto', campo: 'tramoPrecio', direccion: 'asc' },
    { id: 'precio-desc', etiqueta: 'Precio alto a bajo', campo: 'tramoPrecio', direccion: 'desc' },
    { id: 'carga-max', etiqueta: 'Mayor carga', campo: 'specs.cargaMaxKg', direccion: 'desc' },
    { id: 'velocidad', etiqueta: 'Más rápido', campo: 'specs.velocidadMmPorSeg', direccion: 'desc' },
  ],
  tarjetaChips: [
    { campo: 'specs.motor', prefijo: 'Motor ', prefijoEn: '' },
    { campo: 'specs.cargaMaxKg', formato: 'kg' },
    { campo: 'specs.tableroIncluido', formato: 'bool', prefijo: 'Tablero ', prefijoEn: 'Tabletop ' },
    { campo: 'specs.garantiaAnios', formato: 'anios', mostrarSiNulo: { etiqueta: 'garantía n/d', etiquetaEn: 'warranty n/a' } },
    { campo: 'specs.alturaMinCm', formato: 'cm', prefijo: 'Desde ', prefijoEn: 'From ' },
    { campo: 'specs.alturaMaxCm', formato: 'cm', prefijo: 'Hasta ', prefijoEn: 'Up to ' },
  ],
  comparador: [
    { grupo: 'Valoración por ejes', campo: 'valoraciones.velocidad', etiqueta: 'Velocidad', direccion: 'mayor' },
    { grupo: 'Valoración por ejes', campo: 'valoraciones.estabilidad', etiqueta: 'Estabilidad', direccion: 'mayor' },
    { grupo: 'Valoración por ejes', campo: 'valoraciones.capacidadCarga', etiqueta: 'Capacidad de carga', direccion: 'mayor' },
    { grupo: 'Valoración por ejes', campo: 'valoraciones.rangoAltura', etiqueta: 'Rango de altura', direccion: 'mayor' },
    { grupo: 'Valoración por ejes', campo: 'valoraciones.materiales', etiqueta: 'Materiales', direccion: 'mayor' },
    { grupo: 'Valoración por ejes', campo: 'valoraciones.calidadPrecio', etiqueta: 'Calidad-precio', direccion: 'mayor' },
    { grupo: 'Precio y garantía', campo: 'tramoPrecio', etiqueta: 'Tramo de precio', direccion: 'menor' },
    { grupo: 'Precio y garantía', campo: 'specs.garantiaAnios', etiqueta: 'Garantía (años)', direccion: 'mayor' },
    { grupo: 'Movimiento y estructura', campo: 'specs.velocidadMmPorSeg', etiqueta: 'Velocidad (mm/s)', direccion: 'mayor' },
    { grupo: 'Movimiento y estructura', campo: 'specs.cargaMaxKg', etiqueta: 'Carga máxima (kg)', direccion: 'mayor' },
    { grupo: 'Movimiento y estructura', campo: 'specs.alturaMaxCm', etiqueta: 'Altura máxima (cm)', direccion: 'mayor' },
  ],
  fichaSpecs: [
    { titulo: 'Motor y movimiento', filas: [
      { campo: 'specs.motor', etiqueta: 'Motor' },
      { campo: 'specs.velocidadMmPorSeg', etiqueta: 'Velocidad de subida' },
      { campo: 'specs.nivelRuidoDb', etiqueta: 'Nivel de ruido (dB)' },
      { campo: 'specs.segmentosColumna', etiqueta: 'Tramos de columna' },
    ]},
    { titulo: 'Altura y carga', filas: [
      { campo: 'specs.alturaMinCm', etiqueta: 'Altura mínima', formato: 'cm' },
      { campo: 'specs.alturaMaxCm', etiqueta: 'Altura máxima', formato: 'cm' },
      { campo: 'specs.cargaMaxKg', etiqueta: 'Carga máxima', formato: 'kg' },
      { campo: 'specs.estructuraMaterial', etiqueta: 'Material de estructura' },
      { campo: 'specs.pesoProductoKg', etiqueta: 'Peso del producto', formato: 'kg' },
    ]},
    { titulo: 'Tablero', filas: [
      { campo: 'specs.tableroIncluido', etiqueta: 'Tablero incluido', formato: 'bool' },
      { campo: 'specs.tableroMaterial', etiqueta: 'Material del tablero' },
      { campo: 'specs.tableroAnchoCm', etiqueta: 'Ancho del tablero', formato: 'cm' },
      { campo: 'specs.tableroFondoCm', etiqueta: 'Fondo del tablero', formato: 'cm' },
      { campo: 'specs.tableroGrosorCm', etiqueta: 'Grosor del tablero', formato: 'cm' },
    ]},
    { titulo: 'Control y funciones', filas: [
      { campo: 'specs.pantallaControl', etiqueta: 'Panel de control' },
      { campo: 'specs.memorias', etiqueta: 'Posiciones de memoria' },
      { campo: 'specs.anticolision', etiqueta: 'Anticolisión', formato: 'bool' },
      { campo: 'specs.puertoUsb', etiqueta: 'Puerto USB', formato: 'bool' },
    ]},
    { titulo: 'Garantía y certificación', filas: [
      { campo: 'specs.garantiaAnios', etiqueta: 'Garantía', formato: 'anios' },
      { campo: 'specs.certificacionTuv', etiqueta: 'Certificación TÜV', formato: 'bool' },
      { campo: 'specs.certificacionEmc', etiqueta: 'Certificación EMC', formato: 'bool' },
    ]},
  ],
};

export const TIPOS: Record<ClaveTipo, TipoConfig> = { silla, escritorio };
export const TIPOS_CON_DATOS: ClaveTipo[] = ['silla', 'escritorio'];

export function getTipoConfig(slug: string): TipoConfig | undefined {
  return (TIPOS as Record<string, TipoConfig>)[slug];
}
