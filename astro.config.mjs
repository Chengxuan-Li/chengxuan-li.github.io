// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import { satteri } from '@astrojs/markdown-satteri';
import tableScroll from './src/lib/markdown/table-scroll.ts';

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
  i18n: {
    locales: ['en', 'zh'],
    defaultLocale: 'en',
    routing: { prefixDefaultLocale: false },
  },
  integrations: [sitemap(), mdx()],
  image: { layout: 'constrained', responsiveStyles: true },
  markdown: {
    processor: satteri({ hastPlugins: [tableScroll] }),
    shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' } },
  },
});
