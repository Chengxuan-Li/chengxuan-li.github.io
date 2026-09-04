import { describe, expect, it } from 'vitest';
import { z } from 'astro/zod';
import {
  awardSchema,
  educationSchema,
  experienceSchema,
  flexDate,
  isValidFlexDate,
  isoDate,
  newsSchema,
  projectBaseSchema,
  projectVideoBaseSchema,
  projectVideoSchema,
  publicationSchema,
  recordId,
  skillGroupSchema,
  talkSchema,
} from '../src/lib/content/schemas';

describe('flexDate', () => {
  it.each(['2026', '2026-09', '2026-09-03', '2024-02-29'])('accepts %s', (value) => {
    expect(flexDate.parse(value)).toBe(value);
  });
  it.each(['2026-13', '2026-00', '2026-02-30', '2023-02-29', '09/2026', 'September 2026', '1899', '', '2026-9'])(
    'rejects %s',
    (value) => {
      expect(flexDate.safeParse(value).success).toBe(false);
    },
  );
  it('normalizes Date objects produced by YAML into YYYY-MM-DD', () => {
    expect(flexDate.parse(new Date(Date.UTC(2026, 8, 3)))).toBe('2026-09-03');
  });
  it('accepts a bare year that YAML parsed as a number', () => {
    expect(flexDate.parse(2026)).toBe('2026');
    expect(flexDate.safeParse(2026.5).success).toBe(false);
  });
});

describe('isoDate', () => {
  it('accepts a full date and normalizes Date objects', () => {
    expect(isoDate.parse('2026-09-03')).toBe('2026-09-03');
    expect(isoDate.parse(new Date(Date.UTC(2026, 8, 3)))).toBe('2026-09-03');
  });
  it('rejects month-only and malformed dates', () => {
    expect(isoDate.safeParse('2026-09').success).toBe(false);
    expect(isoDate.safeParse('2026-09-31').success).toBe(false);
  });
});

describe('isValidFlexDate', () => {
  it('validates real calendar dates only', () => {
    expect(isValidFlexDate('2024-02-29')).toBe(true);
    expect(isValidFlexDate('2023-02-29')).toBe(false);
    expect(isValidFlexDate('2101')).toBe(false);
  });
});

describe('recordId', () => {
  it.each(['energy-atlas', 'a1', '2026-09-03-talk'])('accepts %s', (value) => {
    expect(recordId.parse(value)).toBe(value);
  });
  it.each(['Energy_Atlas', '-lead', 'double--hyphen', 'has space', 'trail-', ''])('rejects %s', (value) => {
    expect(recordId.safeParse(value).success).toBe(false);
  });
});

describe('projectBaseSchema', () => {
  it('applies defaults to a minimal record', () => {
    const parsed = projectBaseSchema.parse({ title: 'T', summary: 'S', start_date: '2025-01' });
    expect(parsed).toMatchObject({
      title: 'T',
      summary: 'S',
      start_date: '2025-01',
      status: 'active',
      end_date: null,
      featured: false,
      types: [],
      topics: [],
      technologies: [],
      hero_alt: '',
      related_project_ids: [],
      links: [],
    });
    expect(parsed.home_order).toBeUndefined();
  });
  it('accepts a full record', () => {
    const parsed = projectBaseSchema.parse({
      title: 'T',
      short_title: 'Short',
      summary: 'S',
      positioning: 'P',
      status: 'completed',
      start_date: '2024-01',
      end_date: '2025-06-30',
      featured: true,
      home_order: 2,
      types: ['research', 'software'],
      topics: ['Machine learning'],
      technologies: ['Python'],
      affiliation: 'Somewhere',
      hero_alt: 'Diagram',
      hero_caption: 'Caption',
      related_project_ids: ['other-project'],
      links: [{ label: 'Code', url: 'https://example.com/repo', kind: 'code' }, { label: 'Site', url: 'https://example.com' }],
    });
    expect(parsed.links[1].kind).toBe('other');
    expect(parsed.end_date).toBe('2025-06-30');
  });
  it.each([
    ['missing summary', { title: 'T', start_date: '2025-01' }],
    ['blank title', { title: '   ', summary: 'S', start_date: '2025-01' }],
    ['unknown status', { title: 'T', summary: 'S', start_date: '2025-01', status: 'done' }],
    ['unknown type', { title: 'T', summary: 'S', start_date: '2025-01', types: ['art'] }],
    ['non-http link', { title: 'T', summary: 'S', start_date: '2025-01', links: [{ label: 'x', url: 'ftp://example.com' }] }],
    ['zero home_order', { title: 'T', summary: 'S', start_date: '2025-01', home_order: 0 }],
    ['bad related id', { title: 'T', summary: 'S', start_date: '2025-01', related_project_ids: ['Bad Id'] }],
  ])('rejects %s', (_label, input) => {
    expect(projectBaseSchema.safeParse(input).success).toBe(false);
  });
});

describe('projectVideoBaseSchema', () => {
  it('accepts a supported external video with accessible text', () => {
    expect(
      projectVideoBaseSchema.parse({
        url: 'https://vimeo.com/123456789',
        title: 'Project demonstration',
        caption: 'A short walkthrough.',
      }),
    ).toEqual({
      url: 'https://vimeo.com/123456789',
      title: 'Project demonstration',
      caption: 'A short walkthrough.',
      autoplay: false,
      fit: 'contain',
    });
  });

  it('accepts autoplay and cover cropping for a direct MP4', () => {
    expect(
      projectVideoBaseSchema.parse({
        url: 'https://media.example.com/demo.mp4',
        title: 'Project demonstration',
        autoplay: true,
        fit: 'cover',
      }),
    ).toMatchObject({ autoplay: true, fit: 'cover' });
  });

  it.each([
    ['unsupported host', { url: 'https://example.com/watch/123', title: 'Demo' }],
    ['insecure direct file', { url: 'http://example.com/demo.mp4', title: 'Demo' }],
    ['missing title', { url: 'https://example.com/demo.mp4' }],
    ['unknown key', { url: 'https://example.com/demo.mp4', title: 'Demo', playsinline: true }],
  ])('rejects %s', (_label, input) => {
    expect(projectVideoBaseSchema.safeParse(input).success).toBe(false);
  });
});

describe('projectVideoSchema', () => {
  const schema = projectVideoSchema(z.string());

  it('accepts a co-located poster for a direct MP4 video', () => {
    expect(
      schema.safeParse({
        url: 'https://media.example.com/demo.mp4',
        title: 'Project demonstration',
        poster: './video-poster.png',
      }).success,
    ).toBe(true);
  });

  it('rejects a poster for a hosted video that cannot use it', () => {
    const result = schema.safeParse({
      url: 'https://vimeo.com/123456789',
      title: 'Project demonstration',
      poster: './video-poster.png',
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0]?.path).toEqual(['poster']);
  });

  it.each([
    ['autoplay', { autoplay: true }],
    ['cover cropping', { fit: 'cover' }],
  ])('rejects %s for a hosted embed that cannot honor it', (_label, options) => {
    expect(
      schema.safeParse({
        url: 'https://vimeo.com/123456789',
        title: 'Project demonstration',
        ...options,
      }).success,
    ).toBe(false);
  });
});

describe('publicationSchema', () => {
  const base = { title: 'Paper', authors: ['A. Author', 'C. Li'], year: 2026, status: 'submitted' };
  it('applies defaults', () => {
    const parsed = publicationSchema.parse(base);
    expect(parsed).toMatchObject({ venue: null, type: 'other', links: {}, project_ids: [], featured: false });
  });
  it('accepts links, doi, and month', () => {
    const parsed = publicationSchema.parse({
      ...base,
      month: 5,
      doi: '10.1000/xyz123',
      venue: 'Venue',
      links: { paper: 'https://example.com/paper', code: 'https://example.com/code' },
    });
    expect(parsed.links.paper).toBe('https://example.com/paper');
  });
  it.each([
    ['no authors', { ...base, authors: [] }],
    ['missing status', { title: 'Paper', authors: ['A'], year: 2026 }],
    ['unknown status', { ...base, status: 'maybe' }],
    ['bad doi', { ...base, doi: 'doi:10.1/abc' }],
    ['bad year', { ...base, year: 26 }],
    ['month 13', { ...base, month: 13 }],
    ['bad link', { ...base, links: { paper: 'not a url' } }],
  ])('rejects %s', (_label, input) => {
    expect(publicationSchema.safeParse(input).success).toBe(false);
  });
});

describe('newsSchema', () => {
  it('applies defaults and normalizes YAML dates', () => {
    const parsed = newsSchema.parse({ title: 'N', date: new Date(Date.UTC(2026, 8, 3)) });
    expect(parsed).toMatchObject({
      date: '2026-09-03',
      type: 'other',
      project_ids: [],
      publication_ids: [],
      talk_ids: [],
      award_ids: [],
      links: [],
      featured: true,
    });
  });
  it('accepts month precision but rejects year-only dates and malformed links', () => {
    expect(newsSchema.parse({ title: 'N', date: '2026-09' }).date).toBe('2026-09');
    expect(newsSchema.safeParse({ title: 'N', date: '2026' }).success).toBe(false);
    expect(newsSchema.safeParse({ title: 'N', date: '2026-13' }).success).toBe(false);
    expect(newsSchema.safeParse({ title: 'N', date: '2026-09-03', links: [{ label: 'x' }] }).success).toBe(false);
  });
});

describe('experienceSchema', () => {
  it('applies defaults', () => {
    const parsed = experienceSchema.parse({ organization: 'Org', role: 'Role', start_date: '2023-08' });
    expect(parsed).toMatchObject({
      type: 'professional',
      end_date: null,
      location: null,
      featured: false,
      project_ids: [],
      summary: null,
      bullets: [],
    });
  });
  it('rejects an unknown type', () => {
    expect(experienceSchema.safeParse({ organization: 'Org', role: 'Role', start_date: '2023-08', type: 'hobby' }).success).toBe(false);
  });
});

describe('educationSchema', () => {
  it('needs only institution and degree', () => {
    const parsed = educationSchema.parse({ institution: 'U', degree: 'PhD' });
    expect(parsed).toMatchObject({ institution: 'U', degree: 'PhD', end_date: null, details: [] });
    expect(parsed.start_date).toBeUndefined();
  });
});

describe('talkSchema, awardSchema, skillGroupSchema', () => {
  it('parse minimal records with defaults', () => {
    expect(talkSchema.parse({ title: 'T', event: 'E', date: '2025-05' })).toMatchObject({ type: 'other', project_ids: [], links: {} });
    expect(awardSchema.parse({ title: 'A', organization: 'O', date: '2025' })).toMatchObject({ project_ids: [] });
    expect(skillGroupSchema.parse({ category: 'Languages', items: ['Python'] })).toMatchObject({
      category: 'Languages',
      items: ['Python'],
    });
  });
  it('rejects an unknown link key instead of silently dropping it', () => {
    const talkWithTypo = { title: 'T', event: 'E', date: '2026-02', links: { watch: 'https://example.com/v' } };
    expect(talkSchema.safeParse(talkWithTypo).success).toBe(false);
    expect(talkSchema.parse({ title: 'T', event: 'E', date: '2026-02', links: { video: 'https://example.com/v' } }).links.video)
      .toBe('https://example.com/v');
    expect(
      publicationSchema.safeParse({
        title: 'P',
        authors: ['A'],
        year: 2026,
        status: 'published',
        links: { pdf: 'https://example.com/p' },
      }).success,
    ).toBe(false);
  });

  it('rejects an unknown top-level field, so a mistyped key is not ignored', () => {
    expect(talkSchema.safeParse({ title: 'T', event: 'E', date: '2026-02', locatio: 'Ithaca' }).success).toBe(false);
    expect(awardSchema.safeParse({ title: 'A', organization: 'O', date: '2025', ur: 'https://example.com' }).success).toBe(false);
  });

  it('accepts every talk type, including webinars', () => {
    expect(talkSchema.parse({ title: 'T', event: 'E', date: '2026-02', type: 'webinar' }).type).toBe('webinar');
    expect(talkSchema.safeParse({ title: 'T', event: 'E', date: '2026-02', type: 'Webinar' }).success).toBe(false);
  });
  it('reject empty skill lists and bad talk links', () => {
    expect(skillGroupSchema.safeParse({ category: 'Languages', items: [] }).success).toBe(false);
    expect(talkSchema.safeParse({ title: 'T', event: 'E', date: '2025-05', links: { slides: 'nope' } }).success).toBe(false);
  });
});
