import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import fs from 'node:fs';
import path from 'node:path';

// Map article URLs to their real publication/update dates
function buildDateMap() {
  const dir = path.resolve('src/content/articulos');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.mdx'));
  const map = new Map();

  for (const file of files) {
    const raw = fs.readFileSync(path.join(dir, file), 'utf-8');
    const fmMatch = raw.match(/^---\n([\s\S]*?)\n---/);
    if (!fmMatch) continue;

    const fm = fmMatch[1];
    const val = (key) => fm.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'))?.[1]?.trim().replace(/^["']|["']$/g, '');
    const fecha = val('fecha');
    const actualizado = val('actualizadoEn');
    const categoria = val('categoria');
    const tipo = val('tipo');
    const slug = file.replace('.mdx', '');

    const date = actualizado || fecha;
    if (date && categoria) {
      const prefix = tipo === 'informativo' ? 'guias' : categoria;
      const url = `https://tuespaciodetrabajo.com/${prefix}/${slug}/`;
      map.set(url, new Date(date).toISOString());
    }
  }

  return map;
}

const dateMap = buildDateMap();

export default defineConfig({
  site: 'https://tuespaciodetrabajo.com',
  trailingSlash: 'always',
  integrations: [
    mdx(),
    sitemap({
      filter: (page) =>
        !page.includes('/aviso-legal/') &&
        !page.includes('/cookies/') &&
        !page.includes('/politica-privacidad/') &&
        !page.includes('/buscar/') &&
        !page.includes('/tags') &&
        !page.includes('/actualizaciones/') &&
        page !== 'https://tuespaciodetrabajo.com/ambiente/' &&
        page !== 'https://tuespaciodetrabajo.com/audio-video/',
      serialize(item) {
        const lastmod = dateMap.get(item.url);
        return lastmod ? { ...item, lastmod } : item;
      },
    }),
  ],
  output: 'static',
  vite: {
    resolve: {
      alias: {
        '@': '/src',
      },
    },
  },
});
