import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { checkDist, extractLocalRefs, readProjectIds, routeToFile } from '../scripts/check-dist.mts';

const SITE = 'https://chengxuan-li.github.io';

function page(body: string, canonicalPath: string | null = '/'): string {
  const canonical = canonicalPath === null ? '' : `<link rel="canonical" href="${SITE}${canonicalPath}">`;
  return `<!doctype html><html><head><title>t</title>${canonical}</head><body>${body}</body></html>`;
}

async function write(root: string, relative: string, contents: string): Promise<void> {
  const file = path.join(root, ...relative.split('/'));
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, contents, 'utf8');
}

async function validDist(root: string): Promise<void> {
  await write(
    root,
    'index.html',
    page('<a href="/projects/">Projects</a><img src="/_astro/a.webp" srcset="/_astro/a-1.webp 480w, /_astro/a-2.webp 800w">', '/'),
  );
  await write(root, 'projects/index.html', page('<a href="/projects/alpha/">Alpha</a>', '/projects/'));
  await write(
    root,
    'projects/alpha/index.html',
    page('<a href="/cv/#publications">CV</a><a href="https://example.com">ext</a>', '/projects/alpha/'),
  );
  await write(root, 'publications/index.html', page('<a href="/cv/">CV</a>', '/publications/'));
  await write(root, 'cv/index.html', page('<a href="/news/">News</a>', '/cv/'));
  await write(root, 'news/index.html', page('<a href="/">Home</a>', '/news/'));
  await write(root, '404.html', page('<a href="/">Home</a>', null));
  await write(root, 'sitemap-index.xml', '<sitemapindex/>');
  await write(root, 'robots.txt', 'User-agent: *\nAllow: /\n');
  await write(root, '_astro/a.webp', 'x');
  await write(root, '_astro/a-1.webp', 'x');
  await write(root, '_astro/a-2.webp', 'x');
}

describe('extractLocalRefs', () => {
  it('collects root-relative href/src/srcset targets and normalizes site-absolute URLs', () => {
    const html = `<a href="/projects/?x=1#top">a</a><img src="${SITE}/images/og/default.png"><img srcset="/_astro/a.webp 480w, /_astro/b.webp 800w"><a href="https://example.com/">e</a><a href="mailto:x@y.z">m</a><a href="//cdn.example/x">p</a><a href="#top">f</a><meta content="width=device-width">`;
    expect(extractLocalRefs(html, SITE)).toEqual(['/_astro/a.webp', '/_astro/b.webp', '/images/og/default.png', '/projects/']);
  });
});

describe('routeToFile', () => {
  it('maps directory routes to index.html and files to themselves', () => {
    expect(routeToFile('dist', '/projects/alpha/')).toBe(path.join('dist', 'projects', 'alpha', 'index.html'));
    expect(routeToFile('dist', '/')).toBe(path.join('dist', 'index.html'));
    expect(routeToFile('dist', '/robots.txt')).toBe(path.join('dist', 'robots.txt'));
  });
});

describe('checkDist', () => {
  let root: string;
  beforeEach(async () => {
    root = await mkdtemp(path.join(os.tmpdir(), 'check-dist-'));
  });
  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it('passes a complete build', async () => {
    await validDist(root);
    const result = await checkDist({ distDir: root, projectIds: ['alpha'], siteUrl: SITE });
    expect(result).toEqual({ issues: [], pagesChecked: 7 });
  });

  it('reports missing routes and files', async () => {
    await validDist(root);
    await rm(path.join(root, 'news'), { recursive: true });
    await rm(path.join(root, 'robots.txt'));
    const { issues } = await checkDist({ distDir: root, projectIds: ['alpha', 'beta'], siteUrl: SITE });
    expect(issues).toEqual([
      'missing route /news/ (expected news/index.html)',
      'missing route /projects/beta/ (expected projects/beta/index.html)',
      'missing file robots.txt',
      'cv/index.html: broken local reference /news/',
    ]);
  });

  it('reports the repository-name prefix, broken references, and missing or foreign canonicals', async () => {
    await validDist(root);
    await write(
      root,
      'cv/index.html',
      page('<a href="/chengxuan-li.github.io/projects/">bad</a><a href="/nope/">x</a><a href="/projects">no-slash</a>', '/cv/'),
    );
    await write(root, 'news/index.html', page('<a href="/">Home</a>', null));
    await write(
      root,
      'projects/index.html',
      page('<a href="/">Home</a>', null).replace('</head>', '<link rel="canonical" href="https://elsewhere.example/projects/"></head>'),
    );
    const { issues } = await checkDist({ distDir: root, projectIds: ['alpha'], siteUrl: SITE });
    expect(issues).toEqual([
      'cv/index.html: contains the repository-name prefix /chengxuan-li.github.io/',
      'cv/index.html: broken local reference /chengxuan-li.github.io/projects/',
      'cv/index.html: broken local reference /nope/',
      'cv/index.html: broken local reference /projects (directory routes need a trailing slash)',
      'news/index.html: missing canonical link',
      'projects/index.html: canonical https://elsewhere.example/projects/ is not on https://chengxuan-li.github.io',
    ]);
  });
});

describe('readProjectIds', () => {
  it('reads folder and file ids and ignores _ prefixes', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'content-'));
    await write(root, 'projects/alpha/index.md', '---\n---\n');
    await write(root, 'projects/_template/index.md', '---\n---\n');
    await write(root, 'projects/beta.md', '---\n---\n');
    await write(root, 'projects/_draft.md', '---\n---\n');
    await write(root, 'projects/notes/readme.txt', 'x');
    expect(await readProjectIds(root)).toEqual(['alpha', 'beta']);
    await rm(root, { recursive: true, force: true });
  });
});
