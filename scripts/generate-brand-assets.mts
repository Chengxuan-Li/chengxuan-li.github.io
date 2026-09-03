/**
 * Generates raster brand assets from src/site.config.ts and public/favicon.svg:
 *   public/images/og/default.png                              1200×630 social preview fallback
 *   public/favicon.png                                        32×32 PNG icon fallback
 *   public/apple-touch-icon.png                               180×180
 *   fixtures/content/projects/fixture-{alpha,beta}/hero.png   synthetic hero images for layout checks
 * Usage: npm run brand-assets
 */
import { mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { roleLine, siteConfig } from '../src/site.config.ts';

const SERIF = "'Palatino Linotype', Palatino, 'Book Antiqua', Georgia, serif";
const MONO = "Consolas, 'Cascadia Mono', Menlo, monospace";
const PAPER = '#f7f6f2';
const INK = '#17191c';
const INK_2 = '#4b5460';
const RULE = '#d8d5cd';
const ACCENT = '#0e5a70';

function escapeXml(value: string): string {
  const map: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return value.replace(/[&<>"']/g, (char) => map[char] ?? char);
}

function ogSvg(): string {
  const host = new URL(siteConfig.url).host;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M40 0H0V40" fill="none" stroke="${RULE}" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="1200" height="630" fill="${PAPER}"/>
  <rect width="1200" height="630" fill="url(#grid)"/>
  <rect x="80" y="96" width="6" height="438" fill="${ACCENT}"/>
  <text x="126" y="300" font-family="${SERIF}" font-size="84" fill="${INK}">${escapeXml(siteConfig.name)}</text>
  <text x="128" y="360" font-family="${MONO}" font-size="24" letter-spacing="3" fill="${INK_2}">${escapeXml(roleLine().toUpperCase())}</text>
  <text x="126" y="412" font-family="${SERIF}" font-style="italic" font-size="30" fill="${INK_2}">${escapeXml(siteConfig.affiliation)}</text>
  <text x="128" y="512" font-family="${MONO}" font-size="22" fill="${INK_2}">${escapeXml(host)}</text>
</svg>`;
}

function fixtureHeroSvg(label: string, hue: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 1600 1000">
  <defs>
    <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
      <path d="M50 0H0V50" fill="none" stroke="${RULE}" stroke-width="2"/>
    </pattern>
  </defs>
  <rect width="1600" height="1000" fill="${PAPER}"/>
  <rect width="1600" height="1000" fill="url(#grid)"/>
  <circle cx="1150" cy="420" r="260" fill="${hue}" fill-opacity="0.18"/>
  <path d="M100 780 C 400 300, 700 900, 1500 350" fill="none" stroke="${hue}" stroke-width="10"/>
  <text x="100" y="180" font-family="${MONO}" font-size="40" letter-spacing="6" fill="${INK_2}">SYNTHETIC FIXTURE</text>
  <text x="100" y="260" font-family="${SERIF}" font-size="72" fill="${INK}">${escapeXml(label)}</text>
</svg>`;
}

async function writePng(file: string, svg: string, width: number, height: number): Promise<void> {
  await mkdir(path.dirname(file), { recursive: true });
  await sharp(Buffer.from(svg), { density: 144 }).resize(width, height).png().toFile(file);
  console.log(`wrote ${file}`);
}

const favicon = await readFile('public/favicon.svg', 'utf8');
await writePng('public/images/og/default.png', ogSvg(), 1200, 630);
await writePng('public/favicon.png', favicon, 32, 32);
await writePng('public/apple-touch-icon.png', favicon, 180, 180);
await writePng('fixtures/content/projects/fixture-alpha/hero.png', fixtureHeroSvg('Fixture Alpha', ACCENT), 1600, 1000);
await writePng('fixtures/content/projects/fixture-beta/hero.png', fixtureHeroSvg('Fixture Beta', '#b4561b'), 1600, 1000);
