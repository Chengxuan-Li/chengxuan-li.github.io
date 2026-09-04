import { describe, expect, it } from 'vitest';
import * as queries from '../src/lib/content/queries';
import {
  getNewsRelations,
  getProjectRelations,
  getPublicationProjects,
  groupExperiencesByType,
  groupNewsByYear,
  groupPublicationsByYear,
  selectFeaturedExperiences,
  selectFeaturedProjects,
  selectFeaturedPublications,
  selectLatestNews,
  sortByFlexDateDesc,
  sortEducation,
  sortExperiences,
  sortProjectsForIndex,
  sortPublications,
  sortSkills,
} from '../src/lib/content/queries';
import { award, content, education, experience, news, project, publication, skills, talk } from './helpers/fixtures';

const ids = (entries: { id: string }[]) => entries.map((entry) => entry.id);

describe('sortBios', () => {
  it('orders file-derived ids using numeric-aware comparison', () => {
    expect(queries).toHaveProperty('sortBios');
    const bios = [
      { id: '150-words', data: { title: '150 words version', content: 'Long.' } },
      { id: '50-words', data: { title: '50 words version', content: 'Medium.' } },
      { id: '1-sentence', data: { title: '1-sentence version', content: 'Short.' } },
      { id: '100-words', data: { title: '100 words version', content: 'Longer.' } },
    ];
    expect(ids(queries.sortBios(bios))).toEqual(['1-sentence', '50-words', '100-words', '150-words']);
  });
});

describe('sortByFlexDateDesc', () => {
  it('orders newest first across mixed precision', () => {
    const items = [{ d: '2024' }, { d: '2025-02-01' }, { d: '2024-06' }, { d: '2025' }];
    expect(sortByFlexDateDesc(items, (item) => item.d).map((item) => item.d)).toEqual([
      '2025-02-01',
      '2025',
      '2024-06',
      '2024',
    ]);
  });
});

describe('selectFeaturedProjects', () => {
  it('returns featured projects by home_order, limited', () => {
    const site = content({
      projects: [
        project('c', { featured: true, home_order: 3 }),
        project('a', { featured: true, home_order: 1 }),
        project('hidden', { published: false, featured: true, home_order: 1 }),
        project('x'),
        project('b', { featured: true, home_order: 2 }),
      ],
    });
    expect(ids(selectFeaturedProjects(site))).toEqual(['a', 'b', 'c']);
    expect(ids(selectFeaturedProjects(site, 2))).toEqual(['a', 'b']);
  });
});

describe('sortProjectsForIndex', () => {
  it('orders by start date, newest first, then title', () => {
    const projects = [
      project('old', { start_date: '2022-05', title: 'Zeta' }),
      project('new', { start_date: '2025', title: 'Beta' }),
      project('new2', { start_date: '2025', title: 'Alpha' }),
      project('hidden', { published: false, start_date: '2026', title: 'Hidden' }),
    ];
    expect(ids(sortProjectsForIndex(projects))).toEqual(['new2', 'new', 'old']);
  });
});

describe('news selection and grouping', () => {
  const items = [
    news('a', { date: '2026-03-01' }),
    news('b', { date: '2026-09-03' }),
    news('hidden', { date: '2026-12-01', featured: false }),
    news('c', { date: '2025-11-20' }),
    news('d', { date: '2024-01-05' }),
  ];

  it('selectLatestNews returns the newest featured items only', () => {
    expect(ids(selectLatestNews(content({ news: items }), 3))).toEqual(['b', 'a', 'c']);
  });

  it('groupNewsByYear groups newest first and skips empty years', () => {
    const groups = groupNewsByYear(items);
    expect(groups.map((group) => group.year)).toEqual([2026, 2025, 2024]);
    expect(ids(groups[0].items)).toEqual(['hidden', 'b', 'a']);
  });
});

describe('publications', () => {
  it('sortPublications orders by year, month (unknown last), then title', () => {
    const pubs = [
      publication('p1', { year: 2024, title: 'B' }),
      publication('p2', { year: 2025, month: 2, title: 'C' }),
      publication('p3', { year: 2025, month: 11, title: 'A' }),
      publication('p4', { year: 2025, title: 'Z' }),
      publication('p5', { year: 2024, title: 'A' }),
    ];
    expect(ids(sortPublications(pubs))).toEqual(['p3', 'p2', 'p4', 'p5', 'p1']);
  });

  it('selectFeaturedPublications uses home_order and a limit', () => {
    const site = content({
      publications: [
        publication('p1', { featured: true, home_order: 2 }),
        publication('p2', { featured: true, home_order: 1 }),
        publication('p3'),
      ],
    });
    expect(ids(selectFeaturedPublications(site))).toEqual(['p2', 'p1']);
    expect(ids(selectFeaturedPublications(site, 1))).toEqual(['p2']);
  });

  it('groupPublicationsByYear groups newest year first, ordered inside each year', () => {
    const pubs = [
      publication('p1', { year: 2024 }),
      publication('p2', { year: 2026, month: 2, title: 'B' }),
      publication('p3', { year: 2026, month: 9, title: 'A' }),
    ];
    const groups = groupPublicationsByYear(pubs);
    expect(groups.map((group) => group.year)).toEqual([2026, 2024]);
    expect(ids(groups[0].items)).toEqual(['p3', 'p2']);
  });

  it('getPublicationProjects resolves projects in declared order', () => {
    const site = content({
      projects: [project('a'), project('b'), project('hidden', { published: false })],
      publications: [publication('p', { project_ids: ['hidden', 'b', 'a'] })],
    });
    expect(ids(getPublicationProjects(site, site.publications[0]))).toEqual(['b', 'a']);
  });
});

describe('experiences and education', () => {
  it('sortExperiences puts cv_order first, then current roles, then most recently ended', () => {
    const items = [
      experience('ended-late', { start_date: '2020-01', end_date: '2024-06' }),
      experience('current', { start_date: '2019-01', end_date: null }),
      experience('pinned', { start_date: '2010-01', end_date: '2012-01', cv_order: 1 }),
      experience('ended-early', { start_date: '2021-01', end_date: '2022-01' }),
    ];
    expect(ids(sortExperiences(items))).toEqual(['pinned', 'current', 'ended-late', 'ended-early']);
  });

  it('selectFeaturedExperiences filters and limits', () => {
    const site = content({
      experiences: [experience('a', { featured: true }), experience('b'), experience('c', { featured: true, cv_order: 1 })],
    });
    expect(ids(selectFeaturedExperiences(site))).toEqual(['c', 'a']);
    expect(ids(selectFeaturedExperiences(site, 1))).toEqual(['c']);
  });

  it('groupExperiencesByType keeps every type key', () => {
    const groups = groupExperiencesByType([experience('r', { type: 'research' }), experience('t', { type: 'teaching' })]);
    expect(ids(groups.research)).toEqual(['r']);
    expect(ids(groups.teaching)).toEqual(['t']);
    expect(groups.professional).toEqual([]);
    expect(groups.service).toEqual([]);
  });

  it('sortEducation orders in-progress first, then by completion date, undated last', () => {
    const items = [
      education('done', { start_date: '2015', end_date: '2019' }),
      education('undated'),
      education('current', { start_date: '2023', end_date: null }),
      education('recent', { end_date: '2023-05' }),
    ];
    expect(ids(sortEducation(items))).toEqual(['current', 'recent', 'done', 'undated']);
  });

  it('sortSkills uses order then category', () => {
    const items = [skills('b', { category: 'B' }), skills('a', { category: 'A' }), skills('z', { category: 'Z', order: 1 })];
    expect(ids(sortSkills(items))).toEqual(['z', 'a', 'b']);
  });
});

describe('relations', () => {
  const site = content({
    projects: [project('alpha', { related_project_ids: ['beta', 'gamma'] }), project('beta'), project('gamma')],
    publications: [
      publication('old', { year: 2023, project_ids: ['alpha'] }),
      publication('new', { year: 2025, project_ids: ['alpha', 'beta'] }),
      publication('other', { project_ids: ['beta'] }),
    ],
    news: [
      news('n1', {
        date: '2025-01-01',
        project_ids: ['alpha'],
        publication_ids: ['new'],
        talk_ids: ['t1'],
        award_ids: ['a1'],
      }),
      news('n2', { date: '2026-01-01', project_ids: ['alpha'] }),
    ],
    talks: [talk('t1', { date: '2024-05', project_ids: ['alpha'] }), talk('t2', { date: '2025-05', project_ids: ['alpha'] })],
    awards: [award('a1', { project_ids: ['alpha'] })],
  });

  it('getProjectRelations performs reverse lookups sorted newest first', () => {
    const relations = getProjectRelations(site, 'alpha');
    expect(ids(relations.publications)).toEqual(['new', 'old']);
    expect(ids(relations.news)).toEqual(['n2', 'n1']);
    expect(ids(relations.talks)).toEqual(['t2', 't1']);
    expect(ids(relations.awards)).toEqual(['a1']);
    expect(ids(relations.related)).toEqual(['beta', 'gamma']);
  });

  it('getProjectRelations returns empty lists for unknown projects', () => {
    const relations = getProjectRelations(site, 'nope');
    expect(relations).toEqual({ publications: [], news: [], talks: [], awards: [], related: [] });
  });

  it('getNewsRelations resolves every declared id', () => {
    const relations = getNewsRelations(site, site.news[0]);
    expect(ids(relations.projects)).toEqual(['alpha']);
    expect(ids(relations.publications)).toEqual(['new']);
    expect(ids(relations.talks)).toEqual(['t1']);
    expect(ids(relations.awards)).toEqual(['a1']);
  });
});
