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
