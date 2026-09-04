import { describe, expect, it } from 'vitest';
import {
  buildActivityStream,
  getProjectActivity,
  groupActivityByYear,
  publicationDate,
  selectLatestActivity,
} from '../src/lib/content/activity';
import { award, content, education, experience, news, project, publication, talk } from './helpers/fixtures';

const keys = (entries: { key: string }[]) => entries.map((entry) => entry.key);

describe('publicationDate', () => {
  it('prefers an explicit date, then year-month, then the year alone', () => {
    expect(publicationDate(publication('p', { date: '2026-05-20', year: 2026, month: 5 }).data)).toBe('2026-05-20');
    expect(publicationDate(publication('p', { year: 2026, month: 5 }).data)).toBe('2026-05');
    expect(publicationDate(publication('p', { year: 2026 }).data)).toBe('2026');
  });
});

describe('buildActivityStream', () => {
  const site = content({
    projects: [project('alpha', { short_title: 'Alpha' })],
    publications: [
      publication('paper', {
        title: 'A paper',
        date: '2026-05-20',
        year: 2026,
        month: 5,
        status: 'published',
        venue: 'A venue',
        doi: '10.1000/xyz123',
        links: { paper: 'https://example.com/paper' },
        project_ids: ['alpha'],
      }),
      publication('draft', { title: 'A draft', year: 2026, status: 'in-preparation' }),
      publication('accepted', { title: 'Accepted paper', year: 2026, status: 'accepted', venue: 'Some conference' }),
    ],
    awards: [award('prize', { title: 'A prize', organization: 'A body', date: '2026-04', description: 'Worth $1.' })],
    talks: [
      talk('keynote', {
        title: 'A keynote',
        event: 'An event',
        location: 'A city',
        date: '2026-03-02',
        type: 'invited',
        links: { slides: 'https://example.com/slides' },
      }),
    ],
    news: [news('irregular', { title: 'Something else', date: '2026-06', type: 'media', summary: 'A note.' })],
  });

  const stream = buildActivityStream(site);

  it('includes publications, awards, talks, and manual news, newest first', () => {
    expect(keys(stream)).toEqual([
      'news:irregular',
      'publication:paper',
      'award:prize',
      'talk:keynote',
      'publication:accepted',
    ]);
  });

  it('omits publications that are still in preparation', () => {
    expect(keys(stream)).not.toContain('publication:draft');
  });

  it('labels each entry by what happened', () => {
    expect(stream.map((entry) => entry.label)).toEqual(['Media', 'Publication', 'Award', 'Invited talk', 'Publication']);
  });

  it('summarizes each source from its own fields', () => {
    const summary = (key: string) => stream.find((entry) => entry.key === key)?.summary;
    expect(summary('publication:paper')).toBe('A venue');
    expect(summary('publication:accepted')).toBe('Some conference · Accepted');
    expect(summary('award:prize')).toBe('A body · Worth $1.');
    expect(summary('talk:keynote')).toBe('Invited talk · An event, A city');
    expect(summary('news:irregular')).toBe('A note.');
  });

  it('carries the links each source offers, with related projects last', () => {
    const links = (key: string) => stream.find((entry) => entry.key === key)?.links.map((link) => link.label);
    expect(links('publication:paper')).toEqual(['Paper', 'DOI', 'Alpha']);
    expect(links('talk:keynote')).toEqual(['Slides']);
    expect(links('award:prize')).toEqual([]);
  });

  it('resolves project links to project pages', () => {
    const entry = stream.find((item) => item.key === 'publication:paper');
    expect(entry?.links.at(-1)).toEqual({ label: 'Alpha', href: '/projects/alpha/' });
    expect(entry?.projectIds).toEqual(['alpha']);
  });

  it('never derives an entry from a project record', () => {
    const withProject = content({ projects: [project('alpha', { start_date: '2026-01' })] });
    expect(buildActivityStream(withProject)).toEqual([]);
  });

  it('derives entries only from publications, awards, talks, and manual news', () => {
    const withPeople = content({
      education: [education('degree', { end_date: '2026-05' })],
      experiences: [experience('job', { start_date: '2026-01' })],
      awards: [award('prize', { date: '2026-02' })],
    });
    expect(keys(buildActivityStream(withPeople))).toEqual(['award:prize']);
    expect([...new Set(stream.map((entry) => entry.source))].sort()).toEqual(['award', 'news', 'publication', 'talk']);
  });
});

describe('selectLatestActivity', () => {
  const site = content({
    awards: [award('a1', { date: '2026-05' }), award('a2', { date: '2026-04' })],
    news: [
      news('shown', { date: '2026-06' }),
      news('hidden', { date: '2026-07', featured: false }),
    ],
  });

  it('returns the newest entries and honours featured: false on manual news', () => {
    expect(keys(selectLatestActivity(site))).toEqual(['news:shown', 'award:a1', 'award:a2']);
  });

  it('applies the limit', () => {
    expect(keys(selectLatestActivity(site, 2))).toEqual(['news:shown', 'award:a1']);
  });
});

describe('groupActivityByYear', () => {
  it('groups newest year first and keeps entries ordered inside each year', () => {
    const site = content({
      awards: [award('a1', { date: '2026-05' }), award('a2', { date: '2025-01' }), award('a3', { date: '2026-01' })],
    });
    const groups = groupActivityByYear(buildActivityStream(site));
    expect(groups.map((group) => group.year)).toEqual([2026, 2025]);
    expect(keys(groups[0].items)).toEqual(['award:a1', 'award:a3']);
  });
});

describe('getProjectActivity', () => {
  const site = content({
    projects: [project('alpha', { short_title: 'Alpha' }), project('beta')],
    publications: [publication('paper', { year: 2026, project_ids: ['alpha'] })],
    talks: [talk('keynote', { date: '2026-02', project_ids: ['alpha'] })],
    awards: [award('prize', { date: '2026-03', project_ids: ['alpha'] })],
    news: [news('note', { date: '2026-04', project_ids: ['alpha'] }), news('other', { date: '2026-05', project_ids: ['beta'] })],
  });

  it('lists only entries the project page does not already show under Outputs', () => {
    expect(keys(getProjectActivity(site, 'alpha'))).toEqual(['news:note', 'award:prize']);
  });

  it('drops the link back to the project whose page this is', () => {
    const entry = getProjectActivity(site, 'alpha')[0];
    expect(entry.links.some((link) => link.href === '/projects/alpha/')).toBe(false);
  });

  it('returns nothing for an unrelated project', () => {
    expect(getProjectActivity(site, 'gamma')).toEqual([]);
  });
});
