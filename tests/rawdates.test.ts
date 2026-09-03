import { describe, expect, it } from 'vitest';
import { extractYamlSource, findRawDateIssues } from '../src/lib/content/rawdates';

describe('extractYamlSource', () => {
  it('returns the whole text for YAML files', () => {
    expect(extractYamlSource('title: T\ndate: 2026-01-01\n', 'src/content/news/x.yaml')).toBe('title: T\ndate: 2026-01-01\n');
  });
  it('returns only the frontmatter block for Markdown files', () => {
    const text = '---\ntitle: T\nstart_date: 2026-01\n---\n\n## Problem\n\nBody with --- inside.\n';
    expect(extractYamlSource(text, 'src/content/projects/x/index.md')).toBe('title: T\nstart_date: 2026-01');
  });
  it('tolerates CRLF line endings and a BOM, and returns an empty string without frontmatter', () => {
    expect(extractYamlSource('﻿---\r\ntitle: T\r\n---\r\nBody', 'a/index.md')).toBe('title: T');
    expect(extractYamlSource('## Just a body', 'a/index.md')).toBe('');
  });
});

describe('findRawDateIssues', () => {
  it('flags dates that a lenient YAML parser would silently roll over', () => {
    const issues = findRawDateIssues('title: T\ndate: 2026-13-01\n', 'src/content/news/x.yaml');
    expect(issues).toEqual([
      {
        field: 'date',
        value: '2026-13-01',
        message: 'date "2026-13-01" is not a real calendar date (write YYYY, YYYY-MM, or YYYY-MM-DD)',
      },
    ]);
  });

  it('checks every date field, including frontmatter in Markdown', () => {
    const text = '---\ntitle: T\nstart_date: 2024-02-30\nend_date: 2024-06-31\n---\nBody';
    expect(findRawDateIssues(text, 'src/content/projects/x/index.md').map((issue) => issue.field)).toEqual([
      'start_date',
      'end_date',
    ]);
  });

  it('accepts valid dates at every precision, bare years, quoted dates, and null', () => {
    const text = 'date: 2026-09-03\nstart_date: 2026\nend_date: null\nother: 2026-99-99\n';
    expect(findRawDateIssues(text, 'x.yaml')).toEqual([]);
    expect(findRawDateIssues('start_date: "2026-09"\nend_date: ~\n', 'x.yaml')).toEqual([]);
  });

  it('ignores files without frontmatter and YAML it cannot parse', () => {
    expect(findRawDateIssues('## Body only', 'x/index.md')).toEqual([]);
    expect(findRawDateIssues('date: [unclosed\n', 'x.yaml')).toEqual([]);
  });

  it('flags non-scalar date values', () => {
    const issues = findRawDateIssues('date:\n  - 2026-01-01\n', 'x.yaml');
    expect(issues).toHaveLength(1);
    expect(issues[0].field).toBe('date');
  });
});
