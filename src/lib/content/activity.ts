import { flexDateSortKey } from './dates';
import { newsTypeLabel, publicationStatusLabel, talkTypeLabel } from './format';
import { getText, htmlLang, localizedPath, t, type Locale } from '../i18n';
import type { AwardEntry, NewsEntry, PublicationData, PublicationEntry, SiteContent, TalkEntry } from './model';
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
  /** Language of the resolved title, for mixed-language accessibility. */
  titleLang: 'en' | 'zh-CN';
  summary?: string;
  summaryLang?: 'en' | 'zh-CN';
  /**
   * Where the entry's title points, when the record offers somewhere to go: a publication's or talk's
   * first link (by the priority order below, so YAML key order cannot change it), an award's `url`, or a
   * manual item's first link. Undefined leaves the title as plain text.
   */
  href?: string;
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

function projectLinks(content: SiteContent, projectIds: readonly string[], locale: Locale): ActivityLink[] {
  return projectIds.flatMap((id) => {
    const project = getProjectById(content, id);
    return project
      ? [{ label: getText(project.data.short_title ?? project.data.title, locale), href: localizedPath(`/projects/${id}/`, locale) }]
      : [];
  });
}

function fromPublication(content: SiteContent, entry: PublicationEntry, locale: Locale): ActivityEntry {
  const { data } = entry;
  const doiHref = data.doi ? `https://doi.org/${data.doi}` : undefined;
  const links: ActivityLink[] = [];
  if (data.links.paper) links.push({ label: t(locale, 'label.paper'), href: data.links.paper });
  if (data.links.preprint) links.push({ label: t(locale, 'label.preprint'), href: data.links.preprint });
  if (doiHref) links.push({ label: 'DOI', href: doiHref });
  if (data.links.code) links.push({ label: t(locale, 'label.code'), href: data.links.code });
  const title = getText(data.title, locale);
  const venue = data.venue ? getText(data.venue, locale) : null;
  return {
    key: `publication:${entry.id}`,
    source: 'publication',
    recordId: entry.id,
    date: publicationDate(data),
    label: t(locale, 'newsType.publication'),
    title,
    titleLang: locale === 'zh' && typeof data.title !== 'string' && data.title.zh ? 'zh-CN' : 'en',
    // The DOI is deliberately not a fallback: only an entry under `links` makes the title clickable.
    href: data.links.paper ?? data.links.preprint ?? data.links.code ?? data.links.slides ?? data.links.poster,
    summary: joinParts([venue, data.status === 'published' ? null : publicationStatusLabel(data.status, locale)]),
    summaryLang: locale === 'zh' && data.venue && typeof data.venue !== 'string' && data.venue.zh ? 'zh-CN' : 'en',
    links: [...links, ...projectLinks(content, data.project_ids, locale)],
    projectIds: [...data.project_ids],
    featured: true,
  };
}

function fromAward(content: SiteContent, entry: AwardEntry, locale: Locale): ActivityEntry {
  const { data } = entry;
  const title = getText(data.title, locale);
  const organization = getText(data.organization, locale);
  const description = data.description ? getText(data.description, locale) : undefined;
  return {
    key: `award:${entry.id}`,
    source: 'award',
    recordId: entry.id,
    date: data.date,
    label: t(locale, 'newsType.award'),
    title,
    titleLang: locale === 'zh' && typeof data.title !== 'string' && data.title.zh ? 'zh-CN' : 'en',
    href: data.url,
    summary: joinParts([organization, description]),
    summaryLang: locale === 'zh' && typeof data.organization !== 'string' && data.organization.zh ? 'zh-CN' : 'en',
    links: [
      ...(data.url ? [{ label: t(locale, 'label.details'), href: data.url }] : []),
      ...projectLinks(content, data.project_ids, locale),
    ],
    projectIds: [...data.project_ids],
    featured: true,
  };
}

function fromTalk(content: SiteContent, entry: TalkEntry, locale: Locale): ActivityEntry {
  const { data } = entry;
  const links: ActivityLink[] = [];
  if (data.links.slides) links.push({ label: t(locale, 'label.slides'), href: data.links.slides });
  if (data.links.video) links.push({ label: t(locale, 'label.video'), href: data.links.video });
  if (data.links.abstract) links.push({ label: t(locale, 'label.abstract'), href: data.links.abstract });
  if (data.links.event) links.push({ label: t(locale, 'label.event'), href: data.links.event });
  const title = getText(data.title, locale);
  const event = getText(data.event, locale);
  const location = data.location ? getText(data.location, locale) : undefined;
  return {
    key: `talk:${entry.id}`,
    source: 'talk',
    recordId: entry.id,
    date: data.date,
    label: talkTypeLabel(data.type, locale),
    title,
    titleLang: locale === 'zh' && typeof data.title !== 'string' && data.title.zh ? 'zh-CN' : 'en',
    href: data.links.slides ?? data.links.video ?? data.links.event ?? data.links.abstract,
    summary: joinParts([talkTypeLabel(data.type, locale), joinParts([event, location], ', ')]),
    summaryLang: htmlLang(locale),
    links: [...links, ...projectLinks(content, data.project_ids, locale)],
    projectIds: [...data.project_ids],
    featured: true,
  };
}

function fromNews(content: SiteContent, entry: NewsEntry, locale: Locale): ActivityEntry {
  const { data } = entry;
  const relations = getNewsRelations(content, entry);
  const links: ActivityLink[] = [
    ...data.links.map((link) => ({ label: getText(link.label, locale), href: link.url })),
    ...relations.publications.flatMap((publication) => {
      const href = publication.data.links.paper ?? publication.data.links.preprint;
      return href ? [{ label: t(locale, 'label.paper'), href }] : [];
    }),
    ...relations.talks.flatMap((talk) =>
      talk.data.links.slides ? [{ label: t(locale, 'label.slides'), href: talk.data.links.slides }] : [],
    ),
    ...relations.awards.flatMap((award) =>
      award.data.url ? [{ label: t(locale, 'label.award'), href: award.data.url }] : [],
    ),
  ];
  const title = getText(data.title, locale);
  return {
    key: `news:${entry.id}`,
    source: 'news',
    recordId: entry.id,
    date: data.date,
    label: newsTypeLabel(data.type, locale),
    title,
    titleLang: locale === 'zh' && typeof data.title !== 'string' && data.title.zh ? 'zh-CN' : 'en',
    href: data.links[0]?.url,
    summary: data.summary ? getText(data.summary, locale) : undefined,
    summaryLang: data.summary && locale === 'zh' && typeof data.summary !== 'string' && data.summary.zh ? 'zh-CN' : 'en',
    links: [...links, ...projectLinks(content, data.project_ids, locale)],
    projectIds: [...data.project_ids],
    featured: data.featured,
  };
}

/** Every dated event, newest first. Publications still in preparation are not announced. */
export function buildActivityStream(content: SiteContent, locale: Locale = 'en'): ActivityEntry[] {
  const entries: ActivityEntry[] = [
    ...content.publications
      .filter((entry) => entry.data.status !== 'in-preparation')
      .map((entry) => fromPublication(content, entry, locale)),
    ...content.awards.map((entry) => fromAward(content, entry, locale)),
    ...content.talks.map((entry) => fromTalk(content, entry, locale)),
    ...content.news.map((entry) => fromNews(content, entry, locale)),
  ];
  return entries.sort(
    (a, b) =>
      flexDateSortKey(b.date).localeCompare(flexDateSortKey(a.date)) ||
      a.title.localeCompare(b.title, locale === 'zh' ? 'zh-CN' : 'en'),
  );
}

/** Home page "Latest": the newest entries, minus any manual news marked `featured: false`. */
export function selectLatestActivity(content: SiteContent, limit = 4, locale: Locale = 'en'): ActivityEntry[] {
  return buildActivityStream(content, locale)
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
export function getProjectActivity(content: SiteContent, projectId: string, locale: Locale = 'en'): ActivityEntry[] {
  const selfHref = localizedPath(`/projects/${projectId}/`, locale);
  return buildActivityStream(content, locale)
    .filter((entry) => (entry.source === 'news' || entry.source === 'award') && entry.projectIds.includes(projectId))
    .map((entry) => ({ ...entry, links: entry.links.filter((link) => link.href !== selfHref) }));
}
