export type ClaveTipo = 'silla';

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
}

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

export interface TipoConfig {
  slug: ClaveTipo;
  labelSingular: string;
  labelPlural: string;
  icono: string;
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
    { id: 'respaldo', etiqueta: 'Respaldo', control: 'select', comparacion: 'igual', campo: 'specs.respaldo',
      opciones: [{ valor: '', etiqueta: 'Cualquiera' }, { valor: 'malla', etiqueta: 'Malla' },
        { valor: 'espuma', etiqueta: 'Espuma' }, { valor: 'mixto', etiqueta: 'Mixto' }] },
    { id: 'brazos', etiqueta: 'Reposabrazos mín.', control: 'select', comparacion: 'min',
      campo: 'specs.reposabrazos', transform: 'reposabrazosNivel',
      opciones: [{ valor: '0', etiqueta: 'Cualquiera' }, { valor: '2', etiqueta: '2D o superior' },
        { valor: '3', etiqueta: '3D o superior' }, { valor: '4', etiqueta: '4D' }] },
    { id: 'prof', etiqueta: 'Profundidad regulable', control: 'check', comparacion: 'check',
      campo: 'specs.profundidadRegulable' },
    { id: 'peso', etiqueta: 'Soporta 130 kg o más', control: 'check', comparacion: 'umbral',
      campo: 'specs.pesoMaxKg', umbral: 130 },
    { id: 'altura-min', etiqueta: 'Apta desde altura', control: 'rango', comparacion: 'max',
      campo: 'specs.alturaRecomendadaMinCm', min: 150, max: 190, step: 5 },
    { id: 'altura-max', etiqueta: 'Apta hasta altura', control: 'rango', comparacion: 'min',
      campo: 'specs.alturaRecomendadaMaxCm', min: 160, max: 210, step: 5 },
    { id: 'reposacabezas', etiqueta: 'Reposacabezas', control: 'select', comparacion: 'igual', campo: 'specs.reposacabezas',
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

export const TIPOS: Record<ClaveTipo, TipoConfig> = { silla };
export const TIPOS_CON_DATOS: ClaveTipo[] = ['silla'];

export function getTipoConfig(slug: string): TipoConfig | undefined {
  return (TIPOS as Record<string, TipoConfig>)[slug];
}
