import { flexDateSortKey } from './dates';
import { NEWS_TYPE_LABELS, PUBLICATION_STATUS_LABELS, TALK_TYPE_LABELS } from './format';
import type { AwardEntry, NewsEntry, ProjectEntry, PublicationData, PublicationEntry, SiteContent, TalkEntry } from './model';
import { getNewsRelations, getProjectById } from './queries';

/**
 * The activity stream behind /news/ and the home page's "Latest" list.
 *
 * News is a *view*, not a hand-maintained collection: publications, awards, and talks each contribute an
 * entry derived from their own record, so a title or date is never duplicated. Anything that does not fit
 * those categories is written by hand in `src/content/news/`. Projects, education, and experience never
 * produce entries on their own — a milestone worth announcing is added as a manual news item.
 */
export type ActivitySource = 'publication' | 'award' | 'talk' | 'news';

export interface ActivityLink {
  label: string;
  href: string;
}

export interface ActivityEntry {
  /** Unique across sources, e.g. `award:nysp2i-competition-2026`. */
  key: string;
  source: ActivitySource;
  recordId: string;
  /** Flex date: `YYYY`, `YYYY-MM`, or `YYYY-MM-DD`. */
  date: string;
  /** Display category, e.g. "Publication", "Award", "Invited talk". */
  label: string;
  title: string;
  summary?: string;
  links: ActivityLink[];
  projectIds: string[];
  /** Manual news can opt out of the home page with `featured: false`; derived entries never do. */
  featured: boolean;
}

/** Publications carry `year` (+ optional `month`); `date` adds day precision when it is known. */
export function publicationDate(data: PublicationData): string {
  if (data.date) return data.date;
  if (data.month !== undefined) return `${data.year}-${String(data.month).padStart(2, '0')}`;
  return String(data.year);
}

function joinParts(parts: (string | null | undefined)[], separator = ' · '): string | undefined {
  const kept = parts.filter((part): part is string => Boolean(part && part.trim()));
  return kept.length > 0 ? kept.join(separator) : undefined;
}

function projectLinks(content: SiteContent, projectIds: readonly string[]): ActivityLink[] {
  return projectIds.flatMap((id) => {
    const project = getProjectById(content, id);
    return project ? [{ label: project.data.short_title ?? project.data.title, href: `/projects/${id}/` }] : [];
  });
}

function fromPublication(content: SiteContent, entry: PublicationEntry): ActivityEntry {
  const { data } = entry;
  const doiHref = data.doi ? `https://doi.org/${data.doi}` : undefined;
  const links: ActivityLink[] = [];
  if (data.links.paper) links.push({ label: 'Paper', href: data.links.paper });
  if (data.links.preprint) links.push({ label: 'Preprint', href: data.links.preprint });
  if (doiHref) links.push({ label: 'DOI', href: doiHref });
  if (data.links.code) links.push({ label: 'Code', href: data.links.code });
  return {
    key: `publication:${entry.id}`,
    source: 'publication',
    recordId: entry.id,
    date: publicationDate(data),
    label: 'Publication',
    title: data.title,
    summary: joinParts([data.venue, data.status === 'published' ? null : PUBLICATION_STATUS_LABELS[data.status]]),
    links: [...links, ...projectLinks(content, data.project_ids)],
    projectIds: [...data.project_ids],
    featured: true,
  };
}

function fromAward(content: SiteContent, entry: AwardEntry): ActivityEntry {
  const { data } = entry;
  return {
    key: `award:${entry.id}`,
    source: 'award',
    recordId: entry.id,
    date: data.date,
    label: 'Award',
    title: data.title,
    summary: joinParts([data.organization, data.description]),
    links: [
      ...(data.url ? [{ label: 'Details', href: data.url }] : []),
      ...projectLinks(content, data.project_ids),
    ],
    projectIds: [...data.project_ids],
    featured: true,
  };
}

function fromTalk(content: SiteContent, entry: TalkEntry): ActivityEntry {
  const { data } = entry;
  const links: ActivityLink[] = [];
  if (data.links.slides) links.push({ label: 'Slides', href: data.links.slides });
  if (data.links.video) links.push({ label: 'Video', href: data.links.video });
  if (data.links.abstract) links.push({ label: 'Abstract', href: data.links.abstract });
  if (data.links.event) links.push({ label: 'Event', href: data.links.event });
  return {
    key: `talk:${entry.id}`,
    source: 'talk',
    recordId: entry.id,
    date: data.date,
    label: TALK_TYPE_LABELS[data.type],
    title: data.title,
    summary: joinParts([TALK_TYPE_LABELS[data.type], joinParts([data.event, data.location], ', ')]),
    links: [...links, ...projectLinks(content, data.project_ids)],
    projectIds: [...data.project_ids],
    featured: true,
  };
}

function fromNews(content: SiteContent, entry: NewsEntry): ActivityEntry {
  const { data } = entry;
  const relations = getNewsRelations(content, entry);
  const links: ActivityLink[] = [
    ...data.links.map((link) => ({ label: link.label, href: link.url })),
    ...relations.publications.flatMap((publication) => {
      const href = publication.data.links.paper ?? publication.data.links.preprint;
      return href ? [{ label: 'Paper', href }] : [];
    }),
    ...relations.talks.flatMap((talk) => (talk.data.links.slides ? [{ label: 'Slides', href: talk.data.links.slides }] : [])),
    ...relations.awards.flatMap((award) => (award.data.url ? [{ label: 'Award', href: award.data.url }] : [])),
  ];
  return {
    key: `news:${entry.id}`,
    source: 'news',
    recordId: entry.id,
    date: data.date,
    label: NEWS_TYPE_LABELS[data.type],
    title: data.title,
    summary: data.summary,
    links: [...links, ...projectLinks(content, data.project_ids)],
    projectIds: [...data.project_ids],
    featured: data.featured,
  };
}

/** Every dated event, newest first. Publications still in preparation are not announced. */
export function buildActivityStream(content: SiteContent): ActivityEntry[] {
  const entries: ActivityEntry[] = [
    ...content.publications
      .filter((entry) => entry.data.status !== 'in-preparation')
      .map((entry) => fromPublication(content, entry)),
    ...content.awards.map((entry) => fromAward(content, entry)),
    ...content.talks.map((entry) => fromTalk(content, entry)),
    ...content.news.map((entry) => fromNews(content, entry)),
  ];
  return entries.sort(
    (a, b) => flexDateSortKey(b.date).localeCompare(flexDateSortKey(a.date)) || a.title.localeCompare(b.title, 'en'),
  );
}

/** Home page "Latest": the newest entries, minus any manual news marked `featured: false`. */
export function selectLatestActivity(content: SiteContent, limit = 4): ActivityEntry[] {
  return buildActivityStream(content)
    .filter((entry) => entry.featured)
    .slice(0, limit);
}

export function groupActivityByYear(entries: readonly ActivityEntry[]): { year: number; items: ActivityEntry[] }[] {
  const groups = new Map<number, ActivityEntry[]>();
  for (const entry of entries) {
    const year = Number(entry.date.slice(0, 4));
    groups.set(year, [...(groups.get(year) ?? []), entry]);
  }
  return [...groups.entries()].sort((a, b) => b[0] - a[0]).map(([year, items]) => ({ year, items }));
}

/**
 * A project page's chronology. Publications and talks are left out because the page already lists them
 * under Outputs; what remains is awards and hand-written news, with the link back to this page removed.
 */
export function getProjectActivity(content: SiteContent, projectId: string): ActivityEntry[] {
  return buildActivityStream(content)
    .filter((entry) => (entry.source === 'news' || entry.source === 'award') && entry.projectIds.includes(projectId))
    .map((entry) => ({ ...entry, links: entry.links.filter((link) => link.href !== `/projects/${projectId}/`) }));
}
