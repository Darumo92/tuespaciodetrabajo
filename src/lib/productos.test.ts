import { describe, it, expect } from 'vitest';
import { mediaEjesPresentes, notaGlobal, ganadoresPorValor, getCampo, seleccionarParesVs, construirIndiceBusqueda } from './productos';
import type { Producto, Valoraciones } from './productos';

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
});
