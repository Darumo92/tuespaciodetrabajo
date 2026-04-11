import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

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
        return { ...item, lastmod: new Date().toISOString() };
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
