import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { getCollection } from 'astro:content';
import { COLLECTION_NAMES, type SiteContent } from './model';
import { findRawDateIssues } from './rawdates';
import { assertValidContent, type ValidationIssue } from './validate';

let cached: Promise<SiteContent> | undefined;

/**
 * Re-checks every record's raw source for calendar-invalid dates that the YAML parser would have rolled over.
 * A record whose source file no longer exists is a stale content-cache entry (Astro keeps old entries when a
 * collection directory becomes empty); report it rather than publishing a deleted record.
 */
async function auditRawDates(content: SiteContent): Promise<ValidationIssue[]> {
  const issues: ValidationIssue[] = [];
  for (const collection of COLLECTION_NAMES) {
    for (const entry of content[collection]) {
      if (!entry.filePath) continue;
      let text: string;
      try {
        text = await readFile(path.resolve(entry.filePath), 'utf8');
      } catch {
        issues.push({
          collection,
          id: entry.id,
          message: `source file ${entry.filePath} no longer exists — the content cache is stale; run the build with --force or delete node_modules/.astro`,
        });
        continue;
      }
      for (const issue of findRawDateIssues(text, entry.filePath)) {
        issues.push({ collection, id: entry.id, message: issue.message });
      }
    }
  }
  return issues;
}

async function load(): Promise<SiteContent> {
  const [bios, projects, publications, news, experiences, education, talks, awards, skills] = await Promise.all([
    getCollection('bios'),
    getCollection('projects'),
    getCollection('publications'),
    getCollection('news'),
    getCollection('experiences'),
    getCollection('education'),
    getCollection('talks'),
    getCollection('awards'),
    getCollection('skills'),
  ]);
  const content: SiteContent = { bios, projects, publications, news, experiences, education, talks, awards, skills };
  assertValidContent(content, await auditRawDates(content));
  return content;
}

/**
 * The single entry point pages use to read content. Validation runs once per production build
 * and throws an actionable error on broken records; in dev it reloads per request so edits show up.
 */
export function loadSiteContent(): Promise<SiteContent> {
  if (!import.meta.env.PROD) return load();
  cached ??= load();
  return cached;
}
