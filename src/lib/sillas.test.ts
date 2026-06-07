import { describe, it, expect } from 'vitest';
import { buildAmazonHref, reposabrazosNivel, filtrarSillas } from './sillas';
import type { Silla } from './sillas';

describe('buildAmazonHref', () => {
  it('usa el ASIN cuando existe', () => {
    expect(buildAmazonHref({ asin: 'B0C3T865C2' })).toBe(
      'https://www.amazon.es/dp/B0C3T865C2?tag=tuespaciodet-21'
    );
  });

  it('usa búsqueda por nombre como fallback si no hay asin', () => {
    expect(buildAmazonHref({ buscar: 'SIHOO Doro C300' })).toBe(
      'https://www.amazon.es/s?k=SIHOO+Doro+C300&tag=tuespaciodet-21'
    );
  });

  it('devuelve null si no hay asin ni buscar', () => {
    expect(buildAmazonHref({})).toBeNull();
    expect(buildAmazonHref(undefined)).toBeNull();
  });
});

const FIXTURE: Silla[] = [
  { slug: 'a', nombre: 'A', marca: 'A', precioAprox: 320, lumbar: 'dinamico', reposabrazos: '3d', respaldo: 'malla', profundidadRegulable: false, pesoMaxKg: 150, alturaAsientoMinCm: null, alturaAsientoMaxCm: null, reclinacionMaxGrados: 135, garantiaAnios: 3, valoracion: 4.5, puntosFuertes: [], puntosDebiles: [] },
  { slug: 'b', nombre: 'B', marca: 'B', precioAprox: 130, lumbar: 'presion', reposabrazos: '1d', respaldo: 'malla', profundidadRegulable: false, pesoMaxKg: 120, alturaAsientoMinCm: null, alturaAsientoMaxCm: null, reclinacionMaxGrados: null, garantiaAnios: 2, valoracion: 3.5, puntosFuertes: [], puntosDebiles: [] },
  { slug: 'c', nombre: 'C', marca: 'C', precioAprox: 210, lumbar: 'altura', reposabrazos: 'abatibles', respaldo: 'espuma', profundidadRegulable: true, pesoMaxKg: 125, alturaAsientoMinCm: null, alturaAsientoMaxCm: null, reclinacionMaxGrados: null, garantiaAnios: 2, valoracion: 4, puntosFuertes: [], puntosDebiles: [] },
];

describe('reposabrazosNivel', () => {
  it('mapea las etiquetas a número', () => {
    expect(reposabrazosNivel('3d')).toBe(3);
    expect(reposabrazosNivel('1d')).toBe(1);
    expect(reposabrazosNivel('abatibles')).toBe(2);
    expect(reposabrazosNivel('fijo')).toBe(1);
    expect(reposabrazosNivel('ninguno')).toBe(0);
  });
});

describe('filtrarSillas', () => {
  it('sin filtros devuelve todas', () => {
    expect(filtrarSillas(FIXTURE, {}).length).toBe(3);
  });
  it('filtra por precio máximo', () => {
    expect(filtrarSillas(FIXTURE, { precioMax: 215 }).map(s => s.slug)).toEqual(['b', 'c']);
  });
  it('filtra por respaldo', () => {
    expect(filtrarSillas(FIXTURE, { respaldo: 'malla' }).map(s => s.slug)).toEqual(['a', 'b']);
  });
  it('filtra por profundidad regulable', () => {
    expect(filtrarSillas(FIXTURE, { profundidadRegulable: true }).map(s => s.slug)).toEqual(['c']);
  });
  it('filtra por nivel mínimo de reposabrazos', () => {
    expect(filtrarSillas(FIXTURE, { reposabrazosMin: 3 }).map(s => s.slug)).toEqual(['a']);
  });
  it('filtra por carga mínima (pesoMaxKg)', () => {
    expect(filtrarSillas(FIXTURE, { pesoMin: 130 }).map(s => s.slug)).toEqual(['a']);
  });
});

import { ordenarSillas, recomendarSilla, mediaEjesPresentes, notaGlobal, ganadoresPorValor } from './sillas';
import type { Valoraciones } from './sillas';

describe('ordenarSillas', () => {
  it('precio ascendente (null al final)', () => {
    expect(ordenarSillas(FIXTURE, 'precio-asc').map(s => s.slug)).toEqual(['b', 'c', 'a']);
  });
  it('precio descendente', () => {
    expect(ordenarSillas(FIXTURE, 'precio-desc').map(s => s.slug)).toEqual(['a', 'c', 'b']);
  });
  it('valoración descendente', () => {
    expect(ordenarSillas(FIXTURE, 'valoracion').map(s => s.slug)).toEqual(['a', 'c', 'b']);
  });
  it('peso máximo descendente', () => {
    expect(ordenarSillas(FIXTURE, 'peso-max').map(s => s.slug)).toEqual(['a', 'c', 'b']);
  });
  it('no muta el array original', () => {
    const copia = [...FIXTURE];
    ordenarSillas(FIXTURE, 'precio-asc');
    expect(FIXTURE).toEqual(copia);
  });
  it('precio-asc no produce NaN con dos precios null', () => {
    const conNulls: Silla[] = [
      { ...FIXTURE[0], slug: 'x', precioAprox: null },
      { ...FIXTURE[1], slug: 'y', precioAprox: null },
      { ...FIXTURE[2], slug: 'z', precioAprox: 200 },
    ];
    const out = ordenarSillas(conNulls, 'precio-asc').map(s => s.slug);
    expect(out[0]).toBe('z');
    expect(out).toHaveLength(3);
    expect(out.slice(1).sort()).toEqual(['x', 'y']);
  });
});

describe('recomendarSilla', () => {
  it('presupuesto bajo elige la más barata válida', () => {
    const r = recomendarSilla(FIXTURE, { presupuesto: 'bajo', altura: 'media' });
    expect(r.silla?.slug).toBe('b');
  });
  it('altura fuera de media prioriza profundidad regulable', () => {
    const r = recomendarSilla(FIXTURE, { presupuesto: 'medio', altura: 'baja' });
    expect(r.silla?.slug).toBe('c');
    expect(r.motivo).toMatch(/profundidad/i);
  });
  it('presupuesto alto con altura media elige la mejor valorada en rango', () => {
    const r = recomendarSilla(FIXTURE, { presupuesto: 'alto', altura: 'media' });
    expect(r.silla?.slug).toBe('a');
  });
  it('si ninguna entra en presupuesto devuelve null con motivo', () => {
    const r = recomendarSilla([], { presupuesto: 'bajo', altura: 'media' });
    expect(r.silla).toBeNull();
    expect(r.motivo).toBeTruthy();
  });
});

const EJES_COMPLETOS: Valoraciones = { ergonomia: 8, ajustabilidad: 8, materiales: 9, comodidad: 7, calidadPrecio: 8 };
const EJES_PARCIALES: Valoraciones = { ergonomia: 9, ajustabilidad: null, materiales: null, comodidad: null, calidadPrecio: 6 };
const EJES_VACIOS: Valoraciones = { ergonomia: null, ajustabilidad: null, materiales: null, comodidad: null, calidadPrecio: null };

describe('mediaEjesPresentes', () => {
  it('promedia solo los ejes con valor', () => {
    expect(mediaEjesPresentes(EJES_COMPLETOS)).toBe(8); // (8+8+9+7+8)/5
    expect(mediaEjesPresentes(EJES_PARCIALES)).toBe(7.5); // (9+6)/2
  });
  it('devuelve null si no hay ningún eje', () => {
    expect(mediaEjesPresentes(EJES_VACIOS)).toBeNull();
    expect(mediaEjesPresentes(undefined)).toBeNull();
  });
});

describe('notaGlobal', () => {
  it('usa la media de ejes presentes (redondeada a 1 decimal)', () => {
    const s = { ...FIXTURE[0], valoraciones: EJES_PARCIALES };
    expect(notaGlobal(s)).toBe(7.5);
  });
  it('cae a valoracion*2 si no hay ejes', () => {
    const s = { ...FIXTURE[0], valoracion: 4.5, valoraciones: EJES_VACIOS };
    expect(notaGlobal(s)).toBe(9); // 4.5 * 2
  });
  it('cae a valoracion*2 si valoraciones es undefined', () => {
    const s = { ...FIXTURE[0], valoracion: 4 };
    expect(notaGlobal(s)).toBe(8);
  });
});

describe('ganadoresPorValor', () => {
  const items = [
    { slug: 'a', valor: 320 },
    { slug: 'b', valor: 130 },
    { slug: 'c', valor: null },
  ];
  it('menor gana (precio), ignora null', () => {
    expect(ganadoresPorValor(items, 'menor')).toEqual(['b']);
  });
  it('mayor gana', () => {
    expect(ganadoresPorValor(items, 'mayor')).toEqual(['a']);
  });
  it('empate marca varios ganadores', () => {
    const t = [{ slug: 'a', valor: 150 }, { slug: 'b', valor: 150 }, { slug: 'c', valor: 90 }];
    expect(ganadoresPorValor(t, 'mayor')).toEqual(['a', 'b']);
  });
  it('todos null → sin ganadores', () => {
    const n = [{ slug: 'a', valor: null }, { slug: 'b', valor: null }];
    expect(ganadoresPorValor(n, 'menor')).toEqual([]);
  });
});
