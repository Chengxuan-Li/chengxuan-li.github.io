// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// GitHub Pages *user* site: served from the domain root, so no `base` path.
export default defineConfig({
  site: 'https://chengxuan-li.github.io',
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  prerenderConflictBehavior: 'error',
  integrations: [sitemap()],
  image: { layout: 'constrained', responsiveStyles: true },
  markdown: {
    shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' } },
  },
});
