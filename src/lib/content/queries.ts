import { flexDateSortKey } from './dates';
import type {
  AwardEntry,
  EducationEntry,
  ExperienceData,
  ExperienceEntry,
  NewsEntry,
  ProjectEntry,
  PublicationEntry,
  SiteContent,
  SkillGroupEntry,
  TalkEntry,
} from './model';

type Titled = { data: { title: string } };

const byTitle = (a: Titled, b: Titled): number => a.data.title.localeCompare(b.data.title, 'en');

/** Entries with an explicit order come first (ascending); the rest fall back to `tieBreak`. */
function byOrderThen<T>(getOrder: (item: T) => number | undefined, tieBreak: (a: T, b: T) => number) {
  return (a: T, b: T): number => {
    const orderA = getOrder(a);
    const orderB = getOrder(b);
    if (orderA !== undefined && orderB !== undefined && orderA !== orderB) return orderA - orderB;
    if (orderA !== undefined && orderB === undefined) return -1;
    if (orderA === undefined && orderB !== undefined) return 1;
    return tieBreak(a, b);
  };
}

const dateDesc = (a: string, b: string): number => flexDateSortKey(b).localeCompare(flexDateSortKey(a));

/** Ongoing entries (end `null` with a start) sort first, then most recently ended, then undated. */
function recencyKey(start: string | undefined, end: string | null | undefined): string {
  if (end === null && start !== undefined) return '9999-99-99';
  return flexDateSortKey(end ?? start ?? '0000');
}

/* ---------------- generic ---------------- */

export function sortByFlexDateDesc<T>(items: readonly T[], getDate: (item: T) => string): T[] {
  return [...items].sort((a, b) => dateDesc(getDate(a), getDate(b)));
}

/* ---------------- projects ---------------- */

export function selectFeaturedProjects(content: SiteContent, limit = 4): ProjectEntry[] {
  return content.projects
    .filter((entry) => entry.data.featured)
    .sort(byOrderThen<ProjectEntry>((entry) => entry.data.home_order, byTitle))
    .slice(0, limit);
}

/** Projects index: most recently started first, then title. */
export function sortProjectsForIndex(projects: readonly ProjectEntry[]): ProjectEntry[] {
  return [...projects].sort((a, b) => dateDesc(a.data.start_date, b.data.start_date) || byTitle(a, b));
}

export function getProjectById(content: SiteContent, id: string): ProjectEntry | undefined {
  return content.projects.find((entry) => entry.id === id);
}

/** Resolves ids in the given order, skipping unknown ids (validation has already reported them). */
export function getProjectsByIds(content: SiteContent, ids: readonly string[]): ProjectEntry[] {
  return ids.map((id) => getProjectById(content, id)).filter((entry): entry is ProjectEntry => entry !== undefined);
}

/* ---------------- news ---------------- */

export function sortNews(news: readonly NewsEntry[]): NewsEntry[] {
  return [...news].sort((a, b) => b.data.date.localeCompare(a.data.date) || byTitle(a, b));
}

/** Home "Latest": newest items that are not opted out with `featured: false`. */
export function selectLatestNews(content: SiteContent, limit = 4): NewsEntry[] {
  return sortNews(content.news.filter((entry) => entry.data.featured)).slice(0, limit);
}

export function groupNewsByYear(news: readonly NewsEntry[]): { year: number; items: NewsEntry[] }[] {
  const groups = new Map<number, NewsEntry[]>();
  for (const item of sortNews(news)) {
    const year = Number(item.data.date.slice(0, 4));
    groups.set(year, [...(groups.get(year) ?? []), item]);
  }
  return [...groups.entries()].sort((a, b) => b[0] - a[0]).map(([year, items]) => ({ year, items }));
}

/* ---------------- publications ---------------- */

export function sortPublications(publications: readonly PublicationEntry[]): PublicationEntry[] {
  return [...publications].sort(
    (a, b) => b.data.year - a.data.year || (b.data.month ?? 0) - (a.data.month ?? 0) || byTitle(a, b),
  );
}

export function selectFeaturedPublications(content: SiteContent, limit = 5): PublicationEntry[] {
  return content.publications
    .filter((entry) => entry.data.featured)
    .sort(byOrderThen<PublicationEntry>((entry) => entry.data.home_order, byTitle))
    .slice(0, limit);
}

export function getPublicationProjects(content: SiteContent, publication: PublicationEntry): ProjectEntry[] {
  return getProjectsByIds(content, publication.data.project_ids);
}

/** Publications grouped for the /publications/ page: newest year first, sorted inside each year. */
export function groupPublicationsByYear(
  publications: readonly PublicationEntry[],
): { year: number; items: PublicationEntry[] }[] {
  const groups = new Map<number, PublicationEntry[]>();
  for (const entry of sortPublications(publications)) {
    groups.set(entry.data.year, [...(groups.get(entry.data.year) ?? []), entry]);
  }
  return [...groups.entries()].sort((a, b) => b[0] - a[0]).map(([year, items]) => ({ year, items }));
}

/* ---------------- experiences, education, talks, awards, skills ---------------- */

export function sortExperiences(experiences: readonly ExperienceEntry[]): ExperienceEntry[] {
  return [...experiences].sort(
    byOrderThen(
      (entry) => entry.data.cv_order,
      (a, b) =>
        recencyKey(b.data.start_date, b.data.end_date).localeCompare(recencyKey(a.data.start_date, a.data.end_date)) ||
        dateDesc(a.data.start_date, b.data.start_date),
    ),
  );
}

export function selectFeaturedExperiences(content: SiteContent, limit = 3): ExperienceEntry[] {
  return sortExperiences(content.experiences.filter((entry) => entry.data.featured)).slice(0, limit);
}

export type ExperienceType = ExperienceData['type'];

export function groupExperiencesByType(experiences: readonly ExperienceEntry[]): Record<ExperienceType, ExperienceEntry[]> {
  const groups: Record<ExperienceType, ExperienceEntry[]> = { research: [], professional: [], teaching: [], service: [] };
  for (const entry of sortExperiences(experiences)) groups[entry.data.type].push(entry);
  return groups;
}

export function sortEducation(education: readonly EducationEntry[]): EducationEntry[] {
  return [...education].sort(
    byOrderThen(
      (entry) => entry.data.cv_order,
      (a, b) => recencyKey(b.data.start_date, b.data.end_date).localeCompare(recencyKey(a.data.start_date, a.data.end_date)),
    ),
  );
}

export function sortTalks(talks: readonly TalkEntry[]): TalkEntry[] {
  return sortByFlexDateDesc(talks, (entry) => entry.data.date);
}

export function sortAwards(awards: readonly AwardEntry[]): AwardEntry[] {
  return sortByFlexDateDesc(awards, (entry) => entry.data.date);
}

export function sortSkills(skills: readonly SkillGroupEntry[]): SkillGroupEntry[] {
  return [...skills].sort(
    byOrderThen(
      (entry) => entry.data.order,
      (a, b) => a.data.category.localeCompare(b.data.category, 'en'),
    ),
  );
}

/* ---------------- relations ---------------- */

export interface ProjectRelations {
  publications: PublicationEntry[];
  news: NewsEntry[];
  talks: TalkEntry[];
  awards: AwardEntry[];
  related: ProjectEntry[];
}

/** Reverse lookups: everything that declares `project_ids` containing `projectId`, newest first. */
export function getProjectRelations(content: SiteContent, projectId: string): ProjectRelations {
  const project = getProjectById(content, projectId);
  const mentions = (ids: readonly string[]) => ids.includes(projectId);
  return {
    publications: sortPublications(content.publications.filter((entry) => mentions(entry.data.project_ids))),
    news: sortNews(content.news.filter((entry) => mentions(entry.data.project_ids))),
    talks: sortTalks(content.talks.filter((entry) => mentions(entry.data.project_ids))),
    awards: sortAwards(content.awards.filter((entry) => mentions(entry.data.project_ids))),
    related: getProjectsByIds(content, project?.data.related_project_ids ?? []),
  };
}

export interface NewsRelations {
  projects: ProjectEntry[];
  publications: PublicationEntry[];
  talks: TalkEntry[];
  awards: AwardEntry[];
}

export function getNewsRelations(content: SiteContent, item: NewsEntry): NewsRelations {
  const pick = <T extends { id: string }>(entries: readonly T[], ids: readonly string[]): T[] =>
    ids.map((id) => entries.find((entry) => entry.id === id)).filter((entry): entry is T => entry !== undefined);
  return {
    projects: getProjectsByIds(content, item.data.project_ids),
    publications: pick(content.publications, item.data.publication_ids),
    talks: pick(content.talks, item.data.talk_ids),
    awards: pick(content.awards, item.data.award_ids),
  };
}
