import type { TipoConfig } from './tipos';

/** Las notas subjetivas quedan vacías: este catálogo compara datos publicados. */
export const raton: TipoConfig = {
  slug: 'raton', labelSingular: 'Ratón', labelPlural: 'Ratones', icono: '🖱️',
  paresAutomaticos: false,
  enLabels: {
    singular: 'mouse', plural: 'mice', breadcrumb: 'Mice',
    catalogTitle: 'Mice for Remote Work | Product Catalog',
    catalogDescription: 'Compare mice for remote work by shape, size, weight and connectivity. Check verified specifications and the limitations of each model before buying.',
    catalogH1: 'Mice for remote work', catalogSchemaName: 'Mice for remote work',
    compareTitle: 'Compare Mice for Remote Work',
    compareDescription: 'Compare two to four mice side by side: shape, dimensions, weight, wireless connections and power. Find the differences that matter for your desk.',
    compareH1: 'Compare mice', compareIntro: 'Choose two to four mice and compare their published specifications.',
    comparePairIntro: 'Compare published mouse specifications.',
    catalogIntro: 'Start with shape and connection type, then check dimensions and power. These five profiles explain the trade-offs; missing data is shown as n/a.',
    popularHeading: 'Mouse comparisons', comparePairTitleSuffix: 'Mouse Specs',
    comparePairAxes: 'shape, dimensions, connectivity and power', metaDatabaseName: 'Mouse Catalog',
  },
  ejes: [],
  filtros: [
    { id: 'precio', etiqueta: 'Precio máximo', control: 'rango', comparacion: 'max', campo: 'tramoPrecio', min: 1, max: 4, step: 1, formatoSalida: 'tramoEuros' },
    { id: 'marca', etiqueta: 'Marca', control: 'select', comparacion: 'en', campo: 'marca' },
    { id: 'formato', etiqueta: 'Formato', control: 'select', comparacion: 'igual', campo: 'specs.formato', opciones: [
      { valor: '', etiqueta: 'Cualquiera' }, { valor: 'vertical', etiqueta: 'Vertical' }, { valor: 'convencional', etiqueta: 'Convencional' },
    ] },
    { id: 'bluetooth', etiqueta: 'Bluetooth', control: 'check', comparacion: 'check', campo: 'specs.bluetooth' },
    { id: 'silencioso', etiqueta: 'Clics silenciosos', control: 'check', comparacion: 'check', campo: 'specs.clicSilencioso' },
    { id: 'multidispositivo', etiqueta: 'Cambio entre equipos', control: 'check', comparacion: 'check', campo: 'specs.multidispositivo' },
  ],
  ordenaciones: [
    { id: 'precio-asc', etiqueta: 'Precio bajo a alto', campo: 'tramoPrecio', direccion: 'asc' },
    { id: 'precio-desc', etiqueta: 'Precio alto a bajo', campo: 'tramoPrecio', direccion: 'desc' },
    { id: 'peso', etiqueta: 'Menor peso', campo: 'specs.pesoG', direccion: 'asc' },
  ],
  tarjetaChips: [
    { campo: 'specs.formato', formato: 'enum:formato' },
    { campo: 'specs.pesoG', formato: 'g' },
    { campo: 'specs.mano', formato: 'enum:mano' },
  ],
  comparador: [
    { grupo: 'Formato y tamaño', campo: 'specs.formato', etiqueta: 'Formato' },
    { grupo: 'Formato y tamaño', campo: 'specs.mano', etiqueta: 'Mano' },
    { grupo: 'Formato y tamaño', campo: 'specs.largoMm', etiqueta: 'Largo (mm)' },
    { grupo: 'Formato y tamaño', campo: 'specs.anchoMm', etiqueta: 'Ancho (mm)' },
    { grupo: 'Formato y tamaño', campo: 'specs.altoMm', etiqueta: 'Alto (mm)' },
    { grupo: 'Formato y tamaño', campo: 'specs.pesoG', etiqueta: 'Peso (g)' },
    { grupo: 'Conexión y alimentación', campo: 'specs.bluetooth', etiqueta: 'Bluetooth' },
    { grupo: 'Conexión y alimentación', campo: 'specs.receptor', etiqueta: 'Receptor compatible' },
    { grupo: 'Conexión y alimentación', campo: 'specs.cableDatos', etiqueta: 'Uso por cable USB' },
    { grupo: 'Conexión y alimentación', campo: 'specs.multidispositivo', etiqueta: 'Cambio entre equipos' },
    { grupo: 'Conexión y alimentación', campo: 'specs.alimentacion', etiqueta: 'Alimentación' },
    { grupo: 'Conexión y alimentación', campo: 'specs.clicSilencioso', etiqueta: 'Clics silenciosos' },
    { grupo: 'Precio y garantía', campo: 'tramoPrecio', etiqueta: 'Tramo de precio' },
  ],
  fichaSpecs: [
    { titulo: 'Formato y tamaño', filas: [
      { campo: 'specs.formato', etiqueta: 'Formato' }, { campo: 'specs.mano', etiqueta: 'Mano' },
      { campo: 'specs.largoMm', etiqueta: 'Largo', formato: 'mm' }, { campo: 'specs.anchoMm', etiqueta: 'Ancho', formato: 'mm' },
      { campo: 'specs.altoMm', etiqueta: 'Alto', formato: 'mm' }, { campo: 'specs.pesoG', etiqueta: 'Peso', formato: 'g' },
    ] },
    { titulo: 'Conexión y alimentación', filas: [
      { campo: 'specs.bluetooth', etiqueta: 'Bluetooth', formato: 'bool' },
      { campo: 'specs.receptor', etiqueta: 'Receptor compatible' },
      { campo: 'specs.cableDatos', etiqueta: 'Uso por cable USB', formato: 'bool' },
      { campo: 'specs.multidispositivo', etiqueta: 'Cambio entre equipos', formato: 'bool' },
      { campo: 'specs.alimentacion', etiqueta: 'Alimentación' },
      { campo: 'specs.clicSilencioso', etiqueta: 'Clics silenciosos', formato: 'bool' },
    ] },
  ],
};

export const mouseLabelsEn: Record<string, string> = {
  'Formato y tamaño': 'Shape and size', 'Conexión y alimentación': 'Connection and power',
  'Formato': 'Shape', 'Mano': 'Hand', 'Largo': 'Length', 'Alto': 'Height', 'Peso': 'Weight',
  'Largo (mm)': 'Length (mm)', 'Ancho (mm)': 'Width (mm)', 'Alto (mm)': 'Height (mm)', 'Peso (g)': 'Weight (g)',
  'Receptor compatible': 'Compatible receiver', 'Uso por cable USB': 'USB wired use',
  'Cambio entre equipos': 'Device switching', 'Alimentación': 'Power', 'Clics silenciosos': 'Quiet clicks',
  'Vertical': 'Vertical', 'Convencional': 'Conventional', 'Menor peso': 'Lowest weight',
};
