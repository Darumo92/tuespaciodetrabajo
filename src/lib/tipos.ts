export type ClaveTipo = 'silla';

export interface EjeConfig { clave: string; etiqueta: string; }
export interface FiltroConfig {
  id: string;
  etiqueta: string;
  control: 'rango' | 'select' | 'check';
  campo: string;
  opciones?: { valor: string; etiqueta: string }[];
  min?: number; max?: number; step?: number;
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
    { id: 'precio', etiqueta: 'Tramo de precio máx', control: 'rango', campo: 'tramoPrecio', min: 1, max: 4, step: 1 },
    { id: 'respaldo', etiqueta: 'Respaldo', control: 'select', campo: 'specs.respaldo',
      opciones: [{ valor: 'malla', etiqueta: 'Malla' }, { valor: 'espuma', etiqueta: 'Espuma' }, { valor: 'mixto', etiqueta: 'Mixto' }] },
    { id: 'prof', etiqueta: 'Profundidad regulable', control: 'check', campo: 'specs.profundidadRegulable' },
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
