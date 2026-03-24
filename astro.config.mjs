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
        !page.includes('/actualizaciones/'),
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
