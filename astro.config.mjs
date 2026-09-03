// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Layout fixtures (`npm run dev:fixtures` / `build:fixtures`) use their own cache so that fixture records can
// never linger in the real content cache when the real collections are empty.
const usingFixtures = Boolean(process.env.SITE_CONTENT_ROOT);

// GitHub Pages *user* site: served from the domain root, so no `base` path.
export default defineConfig({
  site: 'https://chengxuan-li.github.io',
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  cacheDir: usingFixtures ? './node_modules/.astro-fixtures' : './node_modules/.astro',
  prerenderConflictBehavior: 'error',
  integrations: [sitemap()],
  image: { layout: 'constrained', responsiveStyles: true },
  markdown: {
    shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' } },
  },
});
