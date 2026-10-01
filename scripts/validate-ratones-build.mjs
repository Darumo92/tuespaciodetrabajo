import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { load } from 'js-yaml';

const site = 'https://tuespaciodetrabajo.com';
const slugs = ['logitech-lift', 'logitech-mx-vertical', 'logitech-mx-master-4', 'logitech-signature-m650', 'lamzu-maya-x', 'protoarc-em11-nl', 'trust-verto-wireless'];
const newImages = {
  'protoarc-em11-nl': 'https://m.media-amazon.com/images/I/511qcVCPKbL._AC_SL300_.jpg',
  'trust-verto-wireless': 'https://m.media-amazon.com/images/I/61QNE816-HL._AC_SL300_.jpg',
};
const newAsins = { 'protoarc-em11-nl': 'B0D12PGGKK', 'trust-verto-wireless': 'B07FM2GLNQ' };
const bases = ['/catalogo/raton/', '/en/catalog/mice/'];
const sitemap = readFileSync('dist/sitemap-0.xml', 'utf8');
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
const expected = bases.flatMap(base => [site + base, ...slugs.map(slug => site + base + slug + '/')]);
assert.deepEqual(urls.filter(url => bases.some(base => url.startsWith(site + base))).sort(), expected.sort());

for (const base of bases) {
  for (const slug of ['', ...slugs]) {
    const route = base + (slug ? slug + '/' : '');
    const html = readFileSync('dist' + route + 'index.html', 'utf8');
    assert.ok(html.includes(`rel="canonical" href="${site}${route}"`), route + ' canonical');
    assert.ok(!/<meta name="robots" content="[^"]*noindex/.test(html), route + ' indexable');
    const pair = bases.map(b => site + b + (slug ? slug + '/' : ''));
    for (const target of pair) assert.ok(html.includes(`href="${target}"`), route + ' alternate ' + target);
    assert.ok(!html.includes('-vs-'), route + ' must not link to generated mouse pairs');
    if (slug in newImages) {
      assert.ok(html.includes(newImages[slug]), route + ' recorded product image');
      assert.ok(html.includes(`https://www.amazon.es/dp/${newAsins[slug]}?tag=tuespaciodet-21`.replace('&', '&amp;')),
        route + ' historical ASIN CTA');
      assert.ok(!/https?:\/\/schema\.org\/InStock|["'](?:availability|priceCurrency|lowPrice)["']\s*:|itemprop="availability"|property="product:availability"/i.test(html), route + ' no structured current offer claims');
      assert.ok(html.includes('Amazon Spain') || html.includes('Amazon.es'), route + ' offer caveat');
      const hero = html.match(/<header class="ficha-hero"[\s\S]*?<\/header>/)?.[0];
      assert.ok(hero, route + ' hero present');
      assert.ok(hero.includes(base.startsWith('/en/') ? 'Indicative historical tier:' : 'Tramo histórico orientativo:'), route + ' historical price tier');
      assert.ok(hero.includes(base.startsWith('/en/') ? 'Specs checked 2026-09-30' : 'Especificaciones consultadas 2026-09-30'), route + ' specs date');
      assert.ok(hero.includes(base.startsWith('/en/') ? 'check the exact model, price and availability on Amazon Spain' : 'comprueba el modelo, el precio y la disponibilidad en Amazon.es'), route + ' buyer-facing offer notice');
      assert.ok(hero.includes(base.startsWith('/en/') ? 'we have not verified the current offer' : 'no hemos verificado la oferta actual'), route + ' unverified offer disclosure');
      assert.ok(hero.indexOf('ficha-oferta-contexto') < hero.indexOf('data-cta-kind="amazon-product"'), route + ' notice precedes CTA');
    }
    for (const m of html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
      const schema = JSON.parse(m[1]);
      if (schema['@type'] === 'Product') {
        assert.ok(schema.image?.startsWith('https://m.media-amazon.com/'), route + ' absolute image');
        assert.ok(!schema.review && !schema.aggregateRating, route + ' no invented ratings');
      }
      if (schema['@type'] === 'BreadcrumbList') assert.ok(schema.itemListElement.at(-1).item, route + ' final breadcrumb URL');
    }
    const description = html.match(/<meta name="description" content="([^"]+)"/)?.[1];
    assert.ok(description && description.length >= 120 && description.length <= 155, `${route}: description length ${description?.length}`);
  }
}

for (const route of ['/comparar/raton/', '/en/compare/mice/']) {
  assert.deepEqual(readdirSync('dist' + route), ['index.html'], route + ' no static pairs');
  assert.ok(!urls.some(url => url.startsWith(site + route)), route + ' absent from sitemap');
  assert.match(readFileSync('dist' + route + 'index.html', 'utf8'), /<meta name="robots" content="[^"]*noindex/);
}

for (const file of ['src/content/articulos/mejor-raton-vertical-ergonomico.mdx', 'src/content/articulosI18n/en/best-vertical-ergonomic-mice.mdx']) {
  const source = readFileSync(file, 'utf8');
  const [, fm, body] = source.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  const meta = load(fm);
  assert.ok(meta.titulo.length <= 60, file + ' title');
  assert.ok(meta.descripcion.length >= 120 && meta.descripcion.length <= 155, file + ' description');
  const text = body.replace(/^import .*$/gm, '').replace(/<AffiliateButton[^>]*\/>/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  const words = text.trim().split(/\s+/).length;
  assert.ok(words >= 2000, `${file}: ${words} words`);
  const affiliateCount = (body.match(/<AffiliateButton/g) ?? []).length;
  assert.ok(affiliateCount / words * 1000 <= 5, file + ' affiliate density');
  for (const [, url] of body.matchAll(/\]\((\/[^)]+)\)/g)) {
    const path = url.split('?')[0];
    assert.ok(existsSync('dist' + path + 'index.html'), file + ' internal link ' + path);
  }
  console.log(`${file}: ${words} words, ${affiliateCount} affiliate links, ${meta.faqs.length} FAQs`);
}
console.log('OK: 14 mouse profiles + 2 catalogs indexable; 2 interactive comparisons noindex; no mouse pairs; reciprocal alternates and editorial checks valid.');
