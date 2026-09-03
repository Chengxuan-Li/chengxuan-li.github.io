import { parse } from 'yaml';
import { isValidFlexDate } from './schemas';

/**
 * Astro parses `.yaml` records and Markdown frontmatter with js-yaml, whose default schema turns
 * date-like scalars into JavaScript Dates and silently rolls invalid ones over (`2026-02-30` becomes
 * 2 March 2026). By the time the Zod schema runs, the original text is gone. These helpers re-read the
 * raw source with a parser that keeps such scalars as text, so an impossible date fails the build.
 */
export const DATE_FIELDS = ['date', 'start_date', 'end_date'] as const;

export interface RawDateIssue {
  field: string;
  value: string;
  message: string;
}

const FRONTMATTER_RE = /^﻿?---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/;

/** The whole text for YAML files, or just the frontmatter block for Markdown files ('' when absent). */
export function extractYamlSource(text: string, filePath: string): string {
  if (/\.(md|mdx|markdown)$/i.test(filePath)) {
    const match = FRONTMATTER_RE.exec(text);
    return match ? match[1] : '';
  }
  return text;
}

export function findRawDateIssues(text: string, filePath: string): RawDateIssue[] {
  const source = extractYamlSource(text, filePath);
  if (source.trim() === '') return [];

  let data: unknown;
  try {
    data = parse(source);
  } catch {
    return []; // Astro reports YAML syntax errors itself, with line numbers
  }
  if (data === null || typeof data !== 'object' || Array.isArray(data)) return [];

  const record = data as Record<string, unknown>;
  const issues: RawDateIssue[] = [];
  for (const field of DATE_FIELDS) {
    if (!(field in record)) continue;
    const value = record[field];
    if (value === null || value === undefined) continue;
    const asText = typeof value === 'number' && Number.isInteger(value) ? String(value) : value;
    if (typeof asText === 'string' && isValidFlexDate(asText)) continue;
    const shown = typeof asText === 'string' ? asText : JSON.stringify(value);
    issues.push({
      field,
      value: shown,
      message: `${field} "${shown}" is not a real calendar date (write YYYY, YYYY-MM, or YYYY-MM-DD)`,
    });
  }
  return issues;
}
