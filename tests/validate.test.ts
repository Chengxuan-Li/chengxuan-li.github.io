import { describe, expect, it } from 'vitest';
import { assertValidContent, validateContent } from '../src/lib/content/validate';
import { award, content, education, experience, news, project, publication, skills, talk } from './helpers/fixtures';

describe('validateContent', () => {
  it('returns no issues for consistent content', () => {
    const site = content({
      projects: [project('alpha', { featured: true, home_order: 1, related_project_ids: ['beta'] }), project('beta')],
      publications: [publication('paper', { project_ids: ['alpha'], featured: true, home_order: 1 })],
      news: [
        news('2026-01-01-hello', {
          project_ids: ['alpha'],
          publication_ids: ['paper'],
          talk_ids: ['keynote'],
          award_ids: ['prize'],
        }),
      ],
      talks: [talk('keynote', { project_ids: ['beta'] })],
      awards: [award('prize', { project_ids: ['alpha'] })],
      experiences: [experience('job', { project_ids: ['alpha'], cv_order: 1 }), experience('job2', { cv_order: 2 })],
      education: [education('degree', { start_date: '2019', end_date: '2023-05' })],
      skills: [skills('languages', { order: 1 })],
    });
    expect(validateContent(site)).toEqual([]);
  });

  it('flags a publication that points at an unknown project and lists the known ids', () => {
    const site = content({ projects: [project('alpha')], publications: [publication('paper', { project_ids: ['beta'] })] });
    expect(validateContent(site)).toEqual([
      {
        collection: 'publications',
        id: 'paper',
        message: 'project_ids references unknown projects id "beta" (known: alpha)',
      },
    ]);
  });

  it('flags every dangling reference on a news item', () => {
    const site = content({
      news: [news('item', { project_ids: ['p'], publication_ids: ['q'], talk_ids: ['t'], award_ids: ['a'] })],
    });
    const messages = validateContent(site).map((issue) => issue.message);
    expect(messages).toEqual([
      'project_ids references unknown projects id "p" (known: (none))',
      'publication_ids references unknown publications id "q" (known: (none))',
      'talk_ids references unknown talks id "t" (known: (none))',
      'award_ids references unknown awards id "a" (known: (none))',
    ]);
  });

  it('flags talks, awards, and experiences that reference unknown projects', () => {
    const site = content({
      talks: [talk('t', { project_ids: ['x'] })],
      awards: [award('a', { project_ids: ['x'] })],
      experiences: [experience('e', { project_ids: ['x'] })],
    });
    expect(validateContent(site).map((issue) => `${issue.collection}/${issue.id}`)).toEqual([
      'talks/t',
      'awards/a',
      'experiences/e',
    ]);
  });

  it('flags self-references and unknown related projects', () => {
    const site = content({ projects: [project('alpha', { related_project_ids: ['alpha', 'ghost'] })] });
    expect(validateContent(site).map((issue) => issue.message)).toEqual([
      'related_project_ids references unknown projects id "ghost" (known: alpha)',
      'related_project_ids must not include the project itself',
    ]);
  });

  it('requires home_order on featured projects and publications', () => {
    const site = content({
      projects: [project('alpha', { featured: true })],
      publications: [publication('paper', { featured: true })],
    });
    expect(validateContent(site).map((issue) => issue.message)).toEqual([
      'featured projects need a home_order',
      'featured publications need a home_order',
    ]);
  });

  it('flags two publications that claim the same DOI', () => {
    const site = content({
      publications: [
        publication('a', { doi: '10.1000/xyz123' }),
        publication('b', { doi: '10.1000/xyz123' }),
        publication('c', { doi: '10.1000/other' }),
        publication('d'),
      ],
    });
    expect(validateContent(site).map((issue) => `${issue.collection}/${issue.id}: ${issue.message}`)).toEqual([
      'publications/a: doi 10.1000/xyz123 is also used by b',
      'publications/b: doi 10.1000/xyz123 is also used by a',
    ]);
  });

  it('flags duplicate home_order among featured projects only', () => {
    const site = content({
      projects: [
        project('a', { featured: true, home_order: 1 }),
        project('b', { featured: true, home_order: 1 }),
        project('c', { featured: false, home_order: 1 }),
      ],
    });
    expect(validateContent(site)).toEqual([
      { collection: 'projects', id: 'a', message: 'home_order 1 is also used by b' },
      { collection: 'projects', id: 'b', message: 'home_order 1 is also used by a' },
    ]);
  });

  it('flags duplicate cv_order among experiences and education, and duplicate order among skills', () => {
    const site = content({
      experiences: [experience('e1', { cv_order: 2 }), experience('e2', { cv_order: 2 })],
      education: [education('d1', { cv_order: 1 }), education('d2', { cv_order: 1 })],
      skills: [skills('s1', { order: 3 }), skills('s2', { order: 3 })],
    });
    expect(validateContent(site).map((issue) => `${issue.collection}/${issue.id}`)).toEqual([
      'experiences/e1',
      'experiences/e2',
      'education/d1',
      'education/d2',
      'skills/s1',
      'skills/s2',
    ]);
  });

  it('flags end dates before start dates but tolerates equal or coarser dates', () => {
    const site = content({
      projects: [
        project('p', { start_date: '2024-06', end_date: '2024-05' }),
        project('ok', { start_date: '2024-06', end_date: '2024' }),
      ],
      experiences: [experience('e', { start_date: '2024-06-10', end_date: '2024-06-01' })],
      education: [
        education('d', { start_date: '2020', end_date: '2019' }),
        education('same', { start_date: '2020', end_date: '2020' }),
      ],
    });
    expect(validateContent(site).map((issue) => `${issue.collection}/${issue.id}: ${issue.message}`)).toEqual([
      'projects/p: end_date 2024-05 is before start_date 2024-06',
      'experiences/e: end_date 2024-06-01 is before start_date 2024-06-10',
      'education/d: end_date 2019 is before start_date 2020',
    ]);
  });

  it('flags duplicate and malformed ids', () => {
    const site = content({ projects: [project('alpha'), project('alpha'), project('Bad_Id')] });
    expect(validateContent(site).map((issue) => issue.message)).toEqual([
      'duplicate id "alpha"',
      'id "Bad_Id" must be lowercase words joined by single hyphens — rename the file',
    ]);
  });
});

describe('assertValidContent', () => {
  it('returns silently for valid content', () => {
    expect(() => assertValidContent(content())).not.toThrow();
  });

  it('throws one error that lists every issue', () => {
    const site = content({ publications: [publication('paper', { project_ids: ['ghost'], featured: true })] });
    expect(() => assertValidContent(site)).toThrow(
      /Site content failed validation \(2 issues\):\n- publications\/paper: project_ids references unknown projects id "ghost" \(known: \(none\)\)\n- publications\/paper: featured publications need a home_order/,
    );
  });

  it('includes issues found outside the structured data, such as raw-source date checks', () => {
    const extra = [{ collection: 'news' as const, id: 'item', message: 'date "2026-13-01" is not a real calendar date' }];
    expect(() => assertValidContent(content(), extra)).toThrow(
      /Site content failed validation \(1 issue\):\n- news\/item: date "2026-13-01" is not a real calendar date/,
    );
  });
});
