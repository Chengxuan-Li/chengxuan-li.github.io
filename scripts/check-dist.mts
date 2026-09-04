/**
 * Post-build checks for the static output in dist/:
 *   - every required route exists (/, /projects/, /cv/, /news/, every /projects/<id>/, 404.html, sitemap, robots)
 *   - every root-relative href/src/srcset target in the HTML resolves to a file in dist/
 *   - no page carries the repository name as a path prefix (this is a user site with no base path)
 *   - every indexable page has a canonical URL on the site origin
 * Library functions are unit-tested; the CLI runs at the end of `npm run build`.
 */
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export const SITE_URL = 'https://chengxuan-li.github.io';
export const FORBIDDEN_PREFIX = '/chengxuan-li.github.io/';
export const STATIC_ROUTES = ['/', '/projects/', '/publications/', '/cv/', '/news/'];
export const STATIC_FILES = ['404.html', 'sitemap-index.xml', 'robots.txt'];

export interface CheckOptions {
  distDir: string;
  projectIds: string[];
  siteUrl?: string;
}

export interface CheckResult {
  issues: string[];
  pagesChecked: number;
}

async function isFile(file: string): Promise<boolean> {
  try {
    return (await stat(file)).isFile();
  } catch {
    return false;
  }
}

async function isDirectory(dir: string): Promise<boolean> {
  try {
    return (await stat(dir)).isDirectory();
  } catch {
    return false;
  }
}

export async function listHtmlFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await listHtmlFiles(full)));
    else if (entry.name.endsWith('.html')) files.push(full);
  }
  return files.sort();
}

/** Root-relative targets of href/src/srcset/content attributes, with site-absolute URLs normalized and query/hash stripped. */
export function extractLocalRefs(html: string, siteUrl: string = SITE_URL): string[] {
  const refs = new Set<string>();
  const attribute = /\s(?:href|src|srcset|content)=["']([^"']*)["']/g;
  for (const match of html.matchAll(attribute)) {
    const raw = match[1];
    const isSrcset = /\s\d+[wx](,|$)/.test(raw);
    const candidates = isSrcset ? raw.split(',').map((part) => part.trim().split(/\s+/)[0]) : [raw];
    for (let candidate of candidates) {
      if (candidate.startsWith(siteUrl)) candidate = candidate.slice(siteUrl.length) || '/';
      if (!candidate.startsWith('/') || candidate.startsWith('//')) continue;
      const clean = candidate.split('#')[0].split('?')[0];
      if (clean) refs.add(clean);
    }
  }
  return [...refs].sort();
}

/** `/projects/alpha/` → `<dist>/projects/alpha/index.html`; `/robots.txt` → `<dist>/robots.txt`. */
export function routeToFile(distDir: string, route: string): string {
  const target = route.endsWith('/') ? `${route}index.html` : route;
  return path.join(distDir, ...target.split('/').filter(Boolean));
}

export async function checkDist(options: CheckOptions): Promise<CheckResult> {
  const { distDir, projectIds, siteUrl = SITE_URL } = options;
  const issues: string[] = [];

  const requiredRoutes = [...STATIC_ROUTES, ...projectIds.map((id) => `/projects/${id}/`)];
  for (const route of requiredRoutes) {
    const file = routeToFile(distDir, route);
    if (!(await isFile(file))) {
      issues.push(`missing route ${route} (expected ${path.relative(distDir, file).split(path.sep).join('/')})`);
    }
  }
  for (const file of STATIC_FILES) {
    if (!(await isFile(path.join(distDir, file)))) issues.push(`missing file ${file}`);
  }

  const pages = await listHtmlFiles(distDir);
  for (const page of pages) {
    const relative = path.relative(distDir, page).split(path.sep).join('/');
    const html = await readFile(page, 'utf8');

    // Only a *path* that starts with the repository name is wrong (a project-site base path leaking in);
    // the canonical origin itself legitimately contains the same characters after "https://".
    const refs = extractLocalRefs(html, siteUrl);
    if (refs.some((ref) => ref.startsWith(FORBIDDEN_PREFIX))) {
      issues.push(`${relative}: contains the repository-name prefix ${FORBIDDEN_PREFIX}`);
    }

    for (const ref of refs) {
      const target = routeToFile(distDir, ref);
      if (await isFile(target)) continue;
      if (!ref.endsWith('/') && (await isDirectory(path.join(distDir, ...ref.split('/').filter(Boolean))))) {
        issues.push(`${relative}: broken local reference ${ref} (directory routes need a trailing slash)`);
      } else {
        issues.push(`${relative}: broken local reference ${ref}`);
      }
    }

    if (relative !== '404.html') {
      const canonical = /<link rel="canonical" href="([^"]+)"/.exec(html)?.[1];
      if (!canonical) issues.push(`${relative}: missing canonical link`);
      else if (!canonical.startsWith(`${siteUrl}/`)) issues.push(`${relative}: canonical ${canonical} is not on ${siteUrl}`);
    }
  }

  return { issues, pagesChecked: pages.length };
}

/** Project ids: folders under `<contentRoot>/projects` containing `index.md`, or top-level `*.md` files, ignoring `_` prefixes. */
export async function readProjectIds(contentRoot: string): Promise<string[]> {
  const dir = path.join(contentRoot, 'projects');
  const ids: string[] = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('_')) continue;
    if (entry.isDirectory() && (await isFile(path.join(dir, entry.name, 'index.md')))) ids.push(entry.name);
    else if (entry.isFile() && entry.name.endsWith('.md')) ids.push(entry.name.replace(/\.md$/, ''));
  }
  return ids.sort();
}

async function main(): Promise<void> {
  const distDir = path.resolve('dist');
  const contentRoot = path.resolve(process.env.SITE_CONTENT_ROOT ?? 'src/content');
  const projectIds = await readProjectIds(contentRoot);
  const { issues, pagesChecked } = await checkDist({ distDir, projectIds });
  if (issues.length > 0) {
    console.error(`check-dist: ${issues.length} problem(s) across ${pagesChecked} page(s):`);
    for (const issue of issues) console.error(`  - ${issue}`);
    process.exit(1);
  }
  console.log(`check-dist: ${pagesChecked} page(s) OK; ${projectIds.length} project route(s) present; no repository-name prefix.`);
}

const invokedDirectly =
  process.argv[1] !== undefined && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (invokedDirectly) await main();
