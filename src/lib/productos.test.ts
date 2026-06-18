import { describe, it, expect } from 'vitest';
import {
  mediaEjesPresentes,
  notaGlobal,
  ganadoresPorValor,
  getCampo,
  seleccionarParesVs,
  construirIndiceBusqueda,
  formatoSpec,
  tramoTexto,
  etiquetaEnum,
  reposabrazosNivel,
  buildAmazonHref,
  buildProductCta,
  claveData,
  valorComparacion,
  datosFiltrado,
} from './productos';
import type { Producto, Valoraciones } from './productos';
import type { FiltroConfig } from './tipos';
import { getTipoConfig } from './tipos';
import type { TipoConfig } from './tipos';

const COMPLETOS: Valoraciones = { ergonomia: 8, ajustabilidad: 8, materiales: 9, comodidad: 7, calidadPrecio: 8 };
const PARCIALES: Valoraciones = { ergonomia: 9, ajustabilidad: null, materiales: null, comodidad: null, calidadPrecio: 6 };
const VACIOS: Valoraciones = { ergonomia: null, ajustabilidad: null, materiales: null, comodidad: null, calidadPrecio: null };

const base = (over: Partial<Producto> = {}): Producto => ({
  slug: 'x', tipo: 'silla', nombre: 'X', marca: 'M', imagen: '', imagenAlt: '',
  tramoPrecio: 2, precioMin: null, precioMax: null, valoracion: 4, valoraciones: VACIOS,
  amazon: { asin: null, buscar: null }, webOficial: null, paraQuienSi: [], paraQuienNo: [],
  puntosFuertes: [], puntosDebiles: [], fuenteSpecs: 'x', specs: { tipo: 'silla', garantiaAnios: 3 } as any, ...over,
});

describe('mediaEjesPresentes', () => {
  it('promedia solo ejes con valor', () => {
    expect(mediaEjesPresentes(COMPLETOS)).toBe(8);
    expect(mediaEjesPresentes(PARCIALES)).toBe(7.5);
  });
  it('null si no hay ejes', () => {
    expect(mediaEjesPresentes(VACIOS)).toBeNull();
    expect(mediaEjesPresentes(undefined)).toBeNull();
  });
});

describe('notaGlobal', () => {
  it('usa media de ejes', () => { expect(notaGlobal(base({ valoraciones: PARCIALES }))).toBe(7.5); });
  it('fallback valoracion*2', () => { expect(notaGlobal(base({ valoracion: 4.5, valoraciones: VACIOS }))).toBe(9); });
});

describe('ganadoresPorValor', () => {
  const items = [{ slug: 'a', valor: 320 }, { slug: 'b', valor: 130 }, { slug: 'c', valor: null }];
  it('menor gana, ignora null', () => { expect(ganadoresPorValor(items, 'menor')).toEqual(['b']); });
  it('mayor gana', () => { expect(ganadoresPorValor(items, 'mayor')).toEqual(['a']); });
  it('empate marca varios', () => {
    expect(ganadoresPorValor([{ slug: 'a', valor: 5 }, { slug: 'b', valor: 5 }], 'mayor')).toEqual(['a', 'b']);
  });
  it('todos null → vacío', () => { expect(ganadoresPorValor([{ slug: 'a', valor: null }], 'menor')).toEqual([]); });
});

describe('getCampo', () => {
  it('lee ruta anidada', () => {
    expect(getCampo(base(), 'specs.garantiaAnios')).toBe(3);
    expect(getCampo(base({ tramoPrecio: 2 }), 'tramoPrecio')).toBe(2);
    expect(getCampo(base(), 'specs.inexistente')).toBeNull();
  });
});

describe('seleccionarParesVs', () => {
  const mk = (slug: string, tramo: number, val: number) => base({ slug, tramoPrecio: tramo, valoracion: val });
  it('empareja productos de tramo igual o adyacente, orden alfabético estable', () => {
    const ps = [mk('aeron', 4, 4.8), mk('leap', 4, 4.7), mk('markus', 1, 4.0)];
    const pares = seleccionarParesVs(ps, 8);
    expect(pares).toContainEqual(['aeron', 'leap']);
    expect(pares.every(([a, b]) => a < b)).toBe(true);
    expect(pares).not.toContainEqual(['aeron', 'markus']); // tramo 4 vs 1 → no
  });
  it('respeta el límite máximo de pares', () => {
    const ps = Array.from({ length: 10 }, (_, i) => mk(`s${i}`, 2, 4));
    expect(seleccionarParesVs(ps, 5).length).toBeLessThanOrEqual(5);
  });
});

describe('construirIndiceBusqueda', () => {
  it('incluye productos y artículos con su entidad', () => {
    const idx = construirIndiceBusqueda(
      [base({ slug: 'aeron', nombre: 'Aeron', marca: 'Herman Miller' })],
      [{ slug: 'guia', titulo: 'Guía sillas', categoria: 'sillas', tipo: 'comparativa' }]
    );
    expect(idx).toContainEqual(expect.objectContaining({ entidad: 'producto', slug: 'aeron', titulo: 'Aeron' }));
    expect(idx).toContainEqual(expect.objectContaining({ entidad: 'articulo', slug: 'guia' }));
  });

  it('enlaza artículos informativos a /guias/', () => {
    const idx = construirIndiceBusqueda(
      [],
      [{ slug: 'ergonomia', titulo: 'Ergonomía', categoria: 'sillas', tipo: 'informativo' }]
    );
    expect(idx[0].url).toBe('/guias/ergonomia/');
  });
});

describe('formatoSpec', () => {
  it('n/d para null', () => { expect(formatoSpec(null, 'kg')).toBe('n/d'); });
  it('n/d para booleano ausente', () => { expect(formatoSpec(null, 'bool')).toBe('n/d'); });
  it('aplica sufijos', () => {
    expect(formatoSpec(150, 'kg')).toBe('150 kg');
    expect(formatoSpec(135, 'grados')).toBe('135°');
    expect(formatoSpec(3, 'anios')).toBe('3 años');
    expect(formatoSpec(48, 'cm')).toBe('48 cm');
  });
  it('bool', () => { expect(formatoSpec(true, 'bool')).toBe('Sí'); expect(formatoSpec(false, 'bool')).toBe('No'); });
});

describe('tramoTexto', () => {
  it('símbolos €', () => { expect(tramoTexto(1)).toBe('€'); expect(tramoTexto(4)).toBe('€€€€'); });
});

describe('etiquetaEnum', () => {
  it('traduce y cae al valor crudo', () => {
    expect(etiquetaEnum('lumbar', 'dinamico')).toBe('Dinámico autoajustable');
    expect(etiquetaEnum('respaldo', 'malla')).toBe('Malla');
    expect(etiquetaEnum('lumbar', 'desconocido')).toBe('desconocido');
  });
});

describe('reposabrazosNivel', () => {
  it('mapea a nivel numérico', () => {
    expect(reposabrazosNivel('3d')).toBe(3);
    expect(reposabrazosNivel('ninguno')).toBe(0);
  });
});

describe('buildAmazonHref', () => {
  it('construye enlace afiliado solo con ASIN verificado', () => {
    expect(buildAmazonHref({ asin: 'B0TEST1234', buscar: null })).toBe('https://www.amazon.es/dp/B0TEST1234?tag=tuespaciodet-21');
    expect(buildAmazonHref({ asin: null, buscar: 'silla ergonomica' })).toBeNull();
    expect(buildAmazonHref({ asin: null, buscar: null })).toBeNull();
  });
});

describe('buildProductCta', () => {
  it('prioriza ASIN verificado', () => {
    expect(buildProductCta({
      amazon: { asin: 'B0TEST1234', buscar: 'silla ergonomica' },
      webOficial: 'https://example.com',
      nombre: 'Demo',
    })).toEqual({
      href: 'https://www.amazon.es/dp/B0TEST1234?tag=tuespaciodet-21',
      label: 'Ver precio en Amazon',
      kind: 'amazon-product',
      sponsored: true,
    });
  });

  it('usa busqueda directa en Amazon cuando no hay ASIN pero si query', () => {
    expect(buildProductCta({
      amazon: { asin: null, buscar: 'IKEA MARKUS silla oficina' },
      webOficial: null,
      nombre: 'IKEA MARKUS',
    })).toEqual({
      href: 'https://www.amazon.es/s?k=IKEA%20MARKUS%20silla%20oficina&tag=tuespaciodet-21',
      label: 'Buscar en Amazon',
      kind: 'amazon-search',
      sponsored: true,
    });
  });

  it('genera busqueda Amazon desde nombre y marca si no hay query manual', () => {
    expect(buildProductCta({
      amazon: { asin: null, buscar: null },
      webOficial: 'https://example.com/producto',
      nombre: 'Aeron',
      marca: 'Herman Miller',
    })).toEqual({
      href: 'https://www.amazon.es/s?k=Herman%20Miller%20Aeron&tag=tuespaciodet-21',
      label: 'Buscar en Amazon',
      kind: 'amazon-search',
      sponsored: true,
    });
  });

  it('no duplica la marca si el nombre ya la incluye', () => {
    expect(buildProductCta({
      amazon: { asin: null, buscar: null },
      webOficial: null,
      nombre: 'Herman Miller Aeron',
      marca: 'Herman Miller',
    }).href).toBe('https://www.amazon.es/s?k=Herman%20Miller%20Aeron&tag=tuespaciodet-21');
  });

  it('devuelve estado sin tienda si la busqueda Amazon esta desactivada', () => {
    expect(buildProductCta({
      amazon: { asin: null, buscar: null },
      webOficial: null,
      nombre: 'Sin destino',
      disableAmazonSearch: true,
    })).toEqual({
      href: null,
      label: 'Sin tienda verificada',
      kind: 'unavailable',
      sponsored: false,
    });
  });
});

const productoSilla = {
  slug: 'demo', tipo: 'silla', nombre: 'Demo', marca: 'X', imagen: '', imagenAlt: '',
  tramoPrecio: 3, precioMin: null, precioMax: null, valoracion: 4.5,
  valoraciones: { ergonomia: null, ajustabilidad: null, materiales: null, comodidad: null, calidadPrecio: null },
  amazon: { asin: null, buscar: null }, webOficial: null,
  paraQuienSi: [], paraQuienNo: [], puntosFuertes: [], puntosDebiles: [], fuenteSpecs: '',
  specs: { tipo: 'silla', respaldo: 'malla', reposabrazos: '3d', profundidadRegulable: true, pesoMaxKg: 150 },
} as never;

describe('datosFiltrado: silla', () => {
  it('emite los 6 data-c-<clave> derivados de filtros y ordenaciones', () => {
    const cfg = getTipoConfig('silla') as TipoConfig;
    const d = datosFiltrado(productoSilla, cfg);
    expect(d['data-c-tramoprecio']).toBe('3');
    expect(d['data-c-respaldo']).toBe('malla');
    expect(d['data-c-reposabrazos']).toBe('3'); // nivel de 3d
    expect(d['data-c-profundidadregulable']).toBe('1');
    expect(d['data-c-pesomaxkg']).toBe('150');
    expect(d['data-c-valoracion']).toBe('4.5');
    expect(Object.keys(d).length).toBe(6); // precio/peso comparten clave con sus ordenaciones
  });
});

// Mock de categoría nueva: añadir un TipoConfig => la card y el filtrado funcionan sin tocar componentes.
const escritorio: TipoConfig = {
  slug: 'escritorio' as never, labelSingular: 'Escritorio', labelPlural: 'Escritorios', icono: '🖥️',
  ejes: [],
  filtros: [
    { id: 'altura', etiqueta: 'Altura mín. máx', control: 'rango', comparacion: 'max', campo: 'specs.alturaMinCm', min: 60, max: 80, step: 1 },
    { id: 'motor', etiqueta: 'Motorizado', control: 'check', comparacion: 'check', campo: 'specs.motorizado' },
  ],
  ordenaciones: [
    { id: 'rango', etiqueta: 'Mayor recorrido', campo: 'specs.alturaMaxCm', direccion: 'desc' },
  ],
  tarjetaChips: [
    { campo: 'specs.motorizado', formato: 'bool', prefijo: 'Motor: ' },
  ],
  comparador: [], fichaSpecs: [],
};

describe('datosFiltrado: categoría nueva (escritorio mock)', () => {
  it('deriva data-c-* de la nueva config sin código específico', () => {
    const p = { specs: { tipo: 'escritorio', alturaMinCm: 65, alturaMaxCm: 125, motorizado: true } } as never;
    const d = datosFiltrado(p, escritorio);
    expect(d['data-c-alturamincm']).toBe('65');
    expect(d['data-c-motorizado']).toBe('1');
    expect(d['data-c-alturamaxcm']).toBe('125');
    expect(Object.keys(d).length).toBe(3);
  });
});

describe('claveData', () => {
  it('normaliza rutas a clave alfanumérica en minúsculas', () => {
    expect(claveData('specs.pesoMaxKg')).toBe('pesomaxkg');
    expect(claveData('tramoPrecio')).toBe('tramoprecio');
    expect(claveData('valoracion')).toBe('valoracion');
    expect(claveData('specs.profundidadRegulable')).toBe('profundidadregulable');
  });
});

describe('valorComparacion: transform reposabrazosNivel', () => {
  const filtro: FiltroConfig = {
    id: 'brazos', etiqueta: '', control: 'select', comparacion: 'min',
    campo: 'specs.reposabrazos', transform: 'reposabrazosNivel',
  };
  it('mapea el enum de reposabrazos a su nivel numérico', () => {
    const p = { specs: { reposabrazos: '4d' } } as never;
    expect(valorComparacion(p, filtro)).toBe('4');
  });
});

import { construirChips } from './productos';

describe('construirChips: silla', () => {
  const cfg = getTipoConfig('silla') as TipoConfig;

  it('reproduce los chips actuales (lumbar/respaldo/peso/garantía)', () => {
    const p = { specs: { tipo: 'silla', lumbar: '5d', respaldo: 'mixto', pesoMaxKg: 150, garantiaAnios: 5 } } as never;
    const chips = construirChips(p, cfg);
    expect(chips.map((c) => c.texto)).toEqual(['Lumbar 5d ajustable', 'Malla + cojín', '150 kg', '5 años']);
    expect(chips.every((c) => !c.nd)).toBe(true);
  });

  it('garantía null muestra el fallback con nd:true', () => {
    const p = { specs: { tipo: 'silla', lumbar: 'fijo', respaldo: 'malla', pesoMaxKg: 120, garantiaAnios: null } } as never;
    const chips = construirChips(p, cfg);
    expect(chips[chips.length - 1]).toEqual({ texto: 'garantía n/d', nd: true });
  });
});
