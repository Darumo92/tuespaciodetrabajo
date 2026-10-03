import { readFileSync } from 'node:fs';
import { load } from 'js-yaml';
import { describe, expect, it } from 'vitest';
import type { Producto } from '../productos';
import { buildProductCta, etiquetaEnum, productPath } from '../productos';
import { getSelectorConfig, resolveEligibleSelectorConfigs, SELECTOR_CONFIGS } from './config';
import { projectSelectorProduct } from './payload';
import { scoreProducts } from './scoring';

const slugs = ['logitech-lift', 'logitech-mx-vertical', 'logitech-mx-master-4', 'logitech-signature-m650', 'lamzu-maya-x', 'protoarc-em11-nl', 'trust-verto-wireless', 'anker-ak-uba-vertical', 'perixx-perimice-513'];
const products = slugs.map(slug => ({ slug, ...load(readFileSync(new URL(`../../content/productos/${slug}.yaml`, import.meta.url), 'utf8')) as object })) as Producto[];

describe('selector con el primer lote de ratones', () => {
  it('loads nine mice and four relevant questions', () => {
    const cfg = resolveEligibleSelectorConfigs(SELECTOR_CONFIGS, products).find(c => c.tipo === 'raton');
    expect(cfg?.products).toHaveLength(9);
    expect(cfg?.questions.map(q => q.id)).toEqual(['mano', 'formato', 'conexion', 'prioridad']);
  });
  it('no recomienda como Bluetooth el MAYA X y conserva limitaciones EN', () => {
    const cfg = getSelectorConfig('raton');
    expect(cfg).toBeDefined();
    const results = scoreProducts(products.map(p => projectSelectorProduct(p, 'en')), { conexion: 'bluetooth' }, cfg!, products.length);
    expect(results.slice(0, 3).every(r => r.producto.specs.bluetooth === true)).toBe(true);
    const maya = results.find(r => r.producto.slug === 'lamzu-maya-x')!;
    expect(maya.violations[0]?.field).toBe('specs.bluetooth');
    expect(maya.producto.limitaciones?.length).toBeGreaterThan(0);
  });
  it('marca lateralidad incompatible y datos desconocidos sin inventar coincidencias', () => {
    const cfg = getSelectorConfig('raton');
    expect(cfg).toBeDefined();
    const results = scoreProducts(products.map(p => projectSelectorProduct(p, 'es-ES')), { mano: 'izquierda', prioridad: 'multidispositivo' }, cfg!, products.length);
    expect(results.every(r => r.violations.some(t => t.field === 'specs.mano'))).toBe(true);
    const m650 = results.find(r => r.producto.slug === 'logitech-signature-m650')!;
    expect(m650.missingFields).toContain('specs.multidispositivo');
    expect(m650.traces.find(t => t.field === 'specs.multidispositivo')?.state).toBe('missing');
  });
  it('keeps both documented ASIN links and bilingual limitations without a current offer assertion', () => {
    for (const [slug, asin] of [['protoarc-em11-nl', 'B0D12PGGKK'], ['trust-verto-wireless', 'B07FM2GLNQ']]) {
      const mouse = products.find(p => p.slug === slug)!;
      expect(mouse.amazon.asin).toBe(asin);
      expect(mouse.precioMin).toBeUndefined();
      expect(mouse.valoracion).toBeNull();
      expect(mouse.historicalOfferContext).toBe(true);
      expect(mouse.en?.limitaciones?.join(' ')).toMatch(/current Amazon Spain/);
      expect(mouse.limitaciones?.join(' ')).toMatch(/actuales|actual/);
      expect(productPath(mouse, 'es-ES')).toBe(`/catalogo/raton/${slug}/`);
      expect(productPath(mouse, 'en')).toBe(`/en/catalog/mice/${slug}/`);
      for (const locale of ['es-ES', 'en'] as const) {
        expect(buildProductCta({ amazon: mouse.amazon, nombre: mouse.nombre, marca: mouse.marca, locale })).toMatchObject({
          href: `https://www.amazon.es/dp/${asin}?tag=tuespaciodet-21`,
          kind: 'amazon-product',
        });
      }
    }
    const protoarc = products.find(p => p.slug === 'protoarc-em11-nl')!;
    const trust = products.find(p => p.slug === 'trust-verto-wireless')!;
    expect(protoarc.specs).toMatchObject({ bluetooth: true, multidispositivo: true, cableDatos: null });
    expect(trust.specs).toMatchObject({ bluetooth: false, alimentacion: 'aaa', largoMm: null, pesoG: null });
    expect(etiquetaEnum('alimentacion', 'aaa', 'es-ES')).toBe('Dos pilas AAA');
    expect(etiquetaEnum('alimentacion', 'aaa', 'en')).toBe('Two AAA batteries');
  });
  it('uses exact-model search CTAs for the new pair without permanent prices or ratings', () => {
    for (const slug of ['anker-ak-uba-vertical', 'perixx-perimice-513']) {
      const mouse = products.find(p => p.slug === slug)!;
      expect(mouse.amazon.asin).toBeUndefined();
      expect(mouse.amazon.buscar).toBeTruthy();
      expect(mouse.precioMin).toBeUndefined();
      expect(mouse.precioMax).toBeUndefined();
      expect(mouse.tramoPrecio).toBe(1);
      expect(mouse.valoracion).toBeNull();
      expect(mouse.valoraciones).toEqual({});
      expect(mouse.verificadoEn).toBe('2026-10-03');
      expect(mouse.en?.metodologia?.join(' ')).toMatch(/not tested/);
      expect(mouse.limitaciones?.join(' ')).toMatch(/orientativo/);
      expect(mouse.en?.limitaciones?.join(' ')).toMatch(/No US offer is confirmed/);
      for (const locale of ['es-ES', 'en'] as const) {
        const cta = buildProductCta({ amazon: mouse.amazon, nombre: mouse.nombre, marca: mouse.marca, locale });
        expect(cta?.kind).toBe('amazon-search');
        const url = new URL(cta.href!);
        expect(url.origin + url.pathname).toBe('https://www.amazon.es/s');
        expect(url.searchParams.get('k')).toBe(mouse.amazon.buscar);
        expect(url.searchParams.get('tag')).toBe('tuespaciodet-21');
        expect(productPath(mouse, locale)).toBe(locale === 'en' ? `/en/catalog/mice/${slug}/` : `/catalogo/raton/${slug}/`);
      }
    }
  });
  it('matches wired Perixx use and flags wireless Anker in both locales', () => {
    for (const locale of ['es-ES', 'en'] as const) {
      const results = scoreProducts(products.map(p => projectSelectorProduct(p, locale)), { conexion: 'cable' }, getSelectorConfig('raton')!, products.length);
      const perixx = results.find(r => r.producto.slug === 'perixx-perimice-513')!;
      const anker = results.find(r => r.producto.slug === 'anker-ak-uba-vertical')!;
      expect(perixx.violations).toEqual([]);
      expect(perixx.traces.find(t => t.field === 'specs.cableDatos')?.state).toBe('match');
      expect(anker.violations.some(t => t.field === 'specs.cableDatos')).toBe(true);
      expect(results.indexOf(perixx)).toBeLessThan(results.indexOf(anker));
    }
    expect(products.find(p => p.slug === 'perixx-perimice-513')!.specs).toMatchObject({ alimentacion: 'usb', receptor: null, largoMm: null, anchoMm: null, altoMm: null, pesoG: null });
    expect(products.find(p => p.slug === 'anker-ak-uba-vertical')!.specs).toMatchObject({ alimentacion: 'aaa', bluetooth: false, largoMm: 120, anchoMm: 62.8, altoMm: 74.8, pesoG: null });
  });
  it('keeps unknown weights missing rather than a lightweight match', () => {
    const results = scoreProducts(products.map(p => projectSelectorProduct(p, 'en')), { prioridad: 'peso' }, getSelectorConfig('raton')!, products.length);
    for (const slug of ['anker-ak-uba-vertical', 'perixx-perimice-513']) {
      const result = results.find(r => r.producto.slug === slug)!;
      expect(result.missingFields).toContain('specs.pesoG');
      expect(result.traces.find(t => t.field === 'specs.pesoG')?.state).toBe('missing');
    }
  });
});
