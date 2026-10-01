import { readFileSync } from 'node:fs';
import { load } from 'js-yaml';
import { describe, expect, it } from 'vitest';
import type { Producto } from '../productos';
import { buildProductCta, etiquetaEnum, productPath } from '../productos';
import { getSelectorConfig, resolveEligibleSelectorConfigs, SELECTOR_CONFIGS } from './config';
import { projectSelectorProduct } from './payload';
import { scoreProducts } from './scoring';

const slugs = ['logitech-lift', 'logitech-mx-vertical', 'logitech-mx-master-4', 'logitech-signature-m650', 'lamzu-maya-x', 'protoarc-em11-nl', 'trust-verto-wireless'];
const products = slugs.map(slug => ({ slug, ...load(readFileSync(new URL(`../../content/productos/${slug}.yaml`, import.meta.url), 'utf8')) as object })) as Producto[];

describe('selector con el primer lote de ratones', () => {
  it('loads seven mice and four relevant questions', () => {
    const cfg = resolveEligibleSelectorConfigs(SELECTOR_CONFIGS, products).find(c => c.tipo === 'raton');
    expect(cfg?.products).toHaveLength(7);
    expect(cfg?.questions.map(q => q.id)).toEqual(['mano', 'formato', 'conexion', 'prioridad']);
  });
  it('no recomienda como Bluetooth el MAYA X y conserva limitaciones EN', () => {
    const cfg = getSelectorConfig('raton');
    expect(cfg).toBeDefined();
    const results = scoreProducts(products.map(p => projectSelectorProduct(p, 'en')), { conexion: 'bluetooth' }, cfg!, 7);
    expect(results.slice(0, 3).every(r => r.producto.specs.bluetooth === true)).toBe(true);
    const maya = results.find(r => r.producto.slug === 'lamzu-maya-x')!;
    expect(maya.violations[0]?.field).toBe('specs.bluetooth');
    expect(maya.producto.limitaciones?.length).toBeGreaterThan(0);
  });
  it('marca lateralidad incompatible y datos desconocidos sin inventar coincidencias', () => {
    const cfg = getSelectorConfig('raton');
    expect(cfg).toBeDefined();
    const results = scoreProducts(products.map(p => projectSelectorProduct(p, 'es-ES')), { mano: 'izquierda', prioridad: 'multidispositivo' }, cfg!, 7);
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
});
