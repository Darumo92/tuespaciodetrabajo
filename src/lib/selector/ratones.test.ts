import { readFileSync } from 'node:fs';
import { load } from 'js-yaml';
import { describe, expect, it } from 'vitest';
import type { Producto } from '../productos';
import { getSelectorConfig, resolveEligibleSelectorConfigs, SELECTOR_CONFIGS } from './config';
import { projectSelectorProduct } from './payload';
import { scoreProducts } from './scoring';

const slugs = ['logitech-lift', 'logitech-mx-vertical', 'logitech-mx-master-4', 'logitech-signature-m650', 'lamzu-maya-x'];
const products = slugs.map(slug => ({ slug, ...load(readFileSync(new URL(`../../content/productos/${slug}.yaml`, import.meta.url), 'utf8')) as object })) as Producto[];

describe('selector con el primer lote de ratones', () => {
  it('habilita ratones con cinco fichas y cuatro preguntas útiles', () => {
    const cfg = resolveEligibleSelectorConfigs(SELECTOR_CONFIGS, products).find(c => c.tipo === 'raton');
    expect(cfg?.products).toHaveLength(5);
    expect(cfg?.questions.map(q => q.id)).toEqual(['mano', 'formato', 'conexion', 'prioridad']);
  });
  it('no recomienda como Bluetooth el MAYA X y conserva limitaciones EN', () => {
    const cfg = getSelectorConfig('raton');
    expect(cfg).toBeDefined();
    const results = scoreProducts(products.map(p => projectSelectorProduct(p, 'en')), { conexion: 'bluetooth' }, cfg!, 5);
    expect(results.slice(0, 3).every(r => r.producto.specs.bluetooth === true)).toBe(true);
    const maya = results.find(r => r.producto.slug === 'lamzu-maya-x')!;
    expect(maya.violations[0]?.field).toBe('specs.bluetooth');
    expect(maya.producto.limitaciones?.length).toBeGreaterThan(0);
  });
  it('marca lateralidad incompatible y datos desconocidos sin inventar coincidencias', () => {
    const cfg = getSelectorConfig('raton');
    expect(cfg).toBeDefined();
    const results = scoreProducts(products.map(p => projectSelectorProduct(p, 'es-ES')), { mano: 'izquierda', prioridad: 'multidispositivo' }, cfg!, 5);
    expect(results.every(r => r.violations.some(t => t.field === 'specs.mano'))).toBe(true);
    const m650 = results.find(r => r.producto.slug === 'logitech-signature-m650')!;
    expect(m650.missingFields).toContain('specs.multidispositivo');
    expect(m650.traces.find(t => t.field === 'specs.multidispositivo')?.state).toBe('missing');
  });
});
