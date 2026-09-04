import type {
  AwardEntry,
  EducationEntry,
  ExperienceEntry,
  NewsEntry,
  ProjectEntry,
  PublicationEntry,
  SiteContent,
  SkillGroupEntry,
  TalkEntry,
} from '../../src/lib/content/model';

export function project(id: string, data: Partial<ProjectEntry['data']> = {}): ProjectEntry {
  return {
    id,
    data: {
      title: `Project ${id}`,
      summary: `Summary of ${id}.`,
      status: 'active',
      start_date: '2024-01',
      end_date: null,
      published: true,
      featured: false,
      types: [],
      topics: [],
      technologies: [],
      hero_alt: '',
      related_project_ids: [],
      links: [],
      ...data,
    },
  };
}

export function publication(id: string, data: Partial<PublicationEntry['data']> = {}): PublicationEntry {
  return {
    id,
    data: {
      title: `Publication ${id}`,
      authors: ['A. Author', 'C. Li'],
      year: 2025,
      status: 'published',
      type: 'other',
      venue: null,
      links: {},
      project_ids: [],
      featured: false,
      ...data,
    },
  };
}

export function news(id: string, data: Partial<NewsEntry['data']> = {}): NewsEntry {
  return {
    id,
    data: {
      title: `News ${id}`,
      date: '2026-01-01',
      type: 'other',
      project_ids: [],
      publication_ids: [],
      talk_ids: [],
      award_ids: [],
      links: [],
      featured: true,
      ...data,
    },
  };
}

export function experience(id: string, data: Partial<ExperienceEntry['data']> = {}): ExperienceEntry {
  return {
    id,
    data: {
      organization: `Organization ${id}`,
      role: 'Role',
      type: 'professional',
      start_date: '2023-01',
      end_date: null,
      location: null,
      featured: false,
      project_ids: [],
      summary: null,
      bullets: [],
      ...data,
    },
  };
}

export function education(id: string, data: Partial<EducationEntry['data']> = {}): EducationEntry {
  return { id, data: { institution: `Institution ${id}`, degree: 'Degree', end_date: null, details: [], ...data } };
}

export function talk(id: string, data: Partial<TalkEntry['data']> = {}): TalkEntry {
  return {
    id,
    data: { title: `Talk ${id}`, event: 'Event', date: '2025-05', type: 'other', project_ids: [], links: {}, ...data },
  };
}

export function award(id: string, data: Partial<AwardEntry['data']> = {}): AwardEntry {
  return { id, data: { title: `Award ${id}`, organization: 'Organization', date: '2025', project_ids: [], ...data } };
}

export function skills(id: string, data: Partial<SkillGroupEntry['data']> = {}): SkillGroupEntry {
  return { id, data: { category: `Category ${id}`, items: ['Item'], ...data } };
}

export function content(partial: Partial<SiteContent> = {}): SiteContent {
  return {
    projects: [],
    publications: [],
    news: [],
    experiences: [],
    education: [],
    talks: [],
    awards: [],
    skills: [],
    ...partial,
  };
}
