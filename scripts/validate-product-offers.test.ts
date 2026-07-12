import { afterEach, describe, expect, it } from 'vitest';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const NOW = '2026-07-10T12:00:00.000Z';
const VALIDATOR = fileURLToPath(new URL('./validate-product-offers.mjs', import.meta.url));
const temporaryRoots: string[] = [];

function availableOffer(currency: 'EUR' | 'USD', checkedAt: string) {
  return {
    status: 'available',
    priceAmount: 199.99,
    currency,
    url: 'https://shop.example.com/products/chair',
    evidenceUrl: 'https://evidence.example.com/products/chair',
    seller: 'Example Shop',
    sourceType: 'retailer',
    condition: 'new',
    checkedAt,
    attempts: ['retailer'],
  };
}

function unavailableOffer(currency: 'EUR' | 'USD', checkedAt: string) {
  return {
    status: 'unavailable',
    priceAmount: null,
    currency,
    url: null,
    evidenceUrl: null,
    seller: null,
    sourceType: null,
    condition: null,
    checkedAt,
    attempts: ['amazon', 'official', 'distributor', 'retailer'],
  };
}

interface RegistryOverrides {
  updatedAt?: string;
  root?: Record<string, unknown>;
  product?: Record<string, unknown>;
}

async function runValidator(esOffer: Record<string, unknown>, overrides: RegistryOverrides = {}) {
  const root = await mkdtemp(path.join(tmpdir(), 'product-offers-validator-'));
  temporaryRoots.push(root);
  await mkdir(path.join(root, 'src/content/productos'), { recursive: true });
  await mkdir(path.join(root, 'src/data'), { recursive: true });
  await writeFile(path.join(root, 'src/content/productos/demo.yaml'), 'nombre: Demo\n');
  await writeFile(path.join(root, 'src/data/product-offers.json'), JSON.stringify({
    updatedAt: overrides.updatedAt ?? NOW,
    products: {
      demo: {
        ES: esOffer,
        US: availableOffer('USD', '2026-07-09T12:00:00.000Z'),
        ...overrides.product,
      },
    },
    ...overrides.root,
  }));

  return spawnSync(process.execPath, [VALIDATOR], {
    cwd: root,
    encoding: 'utf8',
    env: { ...process.env, PRODUCT_OFFERS_NOW: NOW },
  });
}

afterEach(async () => {
  await Promise.all(temporaryRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe('validate-product-offers freshness', () => {
  it('accepts an available offer checked exactly 30 days ago', async () => {
    const result = await runValidator(availableOffer('EUR', '2026-06-10T12:00:00.000Z'));

    expect(result.status).toBe(0);
  });

  it('accepts an available offer checked exactly now', async () => {
    const result = await runValidator(availableOffer('EUR', NOW));

    expect(result.status).toBe(0);
  });

  it('rejects an available offer checked more than 30 days ago', async () => {
    const result = await runValidator(availableOffer('EUR', '2026-06-10T11:59:59.999Z'));

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('available tiene checkedAt de mas de 30 dias');
  });

  it('rejects an available offer checked in the future', async () => {
    const result = await runValidator(availableOffer('EUR', '2026-07-10T12:00:00.001Z'));

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('checkedAt no puede estar en el futuro');
  });

  it('accepts an unavailable offer checked exactly 30 days ago', async () => {
    const result = await runValidator(unavailableOffer('EUR', '2026-06-10T12:00:00.000Z'));

    expect(result.status).toBe(0);
  });

  it('rejects an unavailable offer checked more than 30 days ago', async () => {
    const result = await runValidator(unavailableOffer('EUR', '2026-06-10T11:59:59.999Z'));

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('demo.ES: unavailable tiene checkedAt de mas de 30 dias');
  });

  it('accepts registry updatedAt exactly 30 days ago', async () => {
    const result = await runValidator(availableOffer('EUR', NOW), {
      updatedAt: '2026-06-10T12:00:00.000Z',
    });

    expect(result.status).toBe(0);
  });

  it('accepts registry updatedAt exactly now', async () => {
    const result = await runValidator(availableOffer('EUR', NOW), { updatedAt: NOW });

    expect(result.status).toBe(0);
  });

  it('rejects registry updatedAt more than 30 days ago', async () => {
    const result = await runValidator(availableOffer('EUR', NOW), {
      updatedAt: '2026-06-10T11:59:59.999Z',
    });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('product-offers.json: updatedAt tiene mas de 30 dias');
  });

  it('rejects registry updatedAt in the future', async () => {
    const result = await runValidator(availableOffer('EUR', NOW), {
      updatedAt: '2026-07-10T12:00:00.001Z',
    });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('product-offers.json: updatedAt no puede estar en el futuro');
  });

  it('rejects an impossible ISO calendar date', async () => {
    const result = await runValidator(availableOffer('EUR', '2026-06-31T12:00:00.000Z'));

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('checkedAt debe ser fecha ISO valida');
  });
});

describe('validate-product-offers exact keys', () => {
  it('rejects an unknown root key with its path', async () => {
    const result = await runValidator(availableOffer('EUR', NOW), {
      root: { updateAt: NOW },
    });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('product-offers.json.updateAt: clave desconocida');
  });

  it('rejects an unknown product key with its path', async () => {
    const result = await runValidator(availableOffer('EUR', NOW), {
      product: { EU: availableOffer('EUR', NOW) },
    });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('products.demo.EU: clave desconocida');
  });

  it('rejects an unknown market-record key with its path', async () => {
    const result = await runValidator({
      ...availableOffer('EUR', NOW),
      checkAt: NOW,
    });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('products.demo.ES.checkAt: clave desconocida');
  });
});

describe('validate-product-offers representative schema rules', () => {
  it('rejects the wrong market currency', async () => {
    const result = await runValidator(availableOffer('USD', NOW));

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('currency debe ser EUR');
  });

  it('rejects an unavailable offer without all source attempts', async () => {
    const result = await runValidator({
      status: 'unavailable',
      priceAmount: null,
      currency: 'EUR',
      url: null,
      evidenceUrl: null,
      seller: null,
      sourceType: null,
      condition: null,
      checkedAt: NOW,
      attempts: ['amazon'],
    });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('unavailable debe incluir los cuatro intentos');
  });

  it('rejects duplicate unavailable source attempts', async () => {
    const result = await runValidator({
      ...unavailableOffer('EUR', NOW),
      attempts: ['amazon', 'official', 'distributor', 'retailer', 'amazon'],
    });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('unavailable debe incluir exactamente los cuatro intentos sin duplicados');
  });
});
