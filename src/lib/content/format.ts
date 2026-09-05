import { parseFlexDate } from './dates';
import { t, type Locale } from '../i18n';
import type { ExperienceData, NewsData, ProjectData, PublicationData, TalkData } from './model';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const EN_DASH = '–';

/** `2026` → "2026", `2026-09` → "Sep 2026", `2026-09-03` → "3 Sep 2026" (or "Sep 2026" with `'month'`). */
export function formatFlexDate(value: string, precision: 'full' | 'month' = 'full', locale: Locale = 'en'): string {
  const { year, month, day } = parseFlexDate(value);
  if (locale === 'zh') {
    if (month === undefined) return `${year}年`;
    if (day === undefined || precision === 'month') return `${year}年${month}月`;
    return `${year}年${month}月${day}日`;
  }
  if (month === undefined) return String(year);
  const monthName = MONTHS[month - 1];
  if (day === undefined || precision === 'month') return `${monthName} ${year}`;
  return `${day} ${monthName} ${year}`;
}

/** "Jan 2024 – Present", "Jan 2024 – Jun 2025", or "2024" when both ends render the same. */
export function formatDateRange(
  start: string | undefined,
  end: string | null | undefined,
  options: { present?: string; locale?: Locale } = {},
): string {
  const locale = options.locale ?? 'en';
  const present = options.present ?? t(locale, 'label.present');
  if (!start) return end ? formatFlexDate(end, 'month', locale) : '';
  const startText = formatFlexDate(start, 'month', locale);
  if (end === null) return `${startText} ${EN_DASH} ${present}`;
  if (end === undefined) return startText;
  const endText = formatFlexDate(end, 'month', locale);
  return startText === endText ? startText : `${startText} ${EN_DASH} ${endText}`;
}

/**
 * "03 Sep" — the day column of the news timeline; just "May" when only the month is known, and an empty
 * string for a year-only date (the year heading above the entry already says it).
 */
export function formatDayMonth(value: string, locale: Locale = 'en'): string {
  const { month, day } = parseFlexDate(value);
  if (month === undefined) return '';
  if (locale === 'zh') return day === undefined ? `${month}月` : `${month}月${day}日`;
  const monthName = MONTHS[month - 1];
  return day === undefined ? monthName : `${String(day).padStart(2, '0')} ${monthName}`;
}

/** "Sep 2026" — the compact "Latest" list on the home page. */
export function formatMonthYear(value: string, locale: Locale = 'en'): string {
  return formatFlexDate(value, 'month', locale);
}

/**
 * "Journal of Building Performance Simulation, 2025", but "IBPSA-USA SimBuild 2026" unchanged — many
 * conference names already end in their year, and repeating it reads as a typo.
 */
export function formatVenueLine(venue: string | null | undefined, year: number): string {
  if (!venue) return String(year);
  const carriesYear = new RegExp(`(?<!\\d)${year}(?!\\d)`).test(venue);
  return carriesYear ? venue : `${venue}, ${year}`;
}

function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[.,]/g, ' ').replace(/\s+/g, ' ').trim();
}

export interface AuthorPart {
  name: string;
  isSelf: boolean;
}

/** Marks which author strings are the site owner so they can be emphasized. */
export function splitAuthors(authors: readonly string[], nameVariants: readonly string[]): AuthorPart[] {
  const self = new Set(nameVariants.map(normalizeName));
  return authors.map((name) => ({ name, isSelf: self.has(normalizeName(name)) }));
}

/** True for absolute URLs with a scheme (https:, mailto:, …); false for root-relative paths and fragments. */
export function isExternalUrl(href: string): boolean {
  return /^[a-z][a-z0-9+.-]*:/i.test(href);
}

export const PROJECT_STATUS_LABELS: Record<ProjectData['status'], string> = {
  active: 'Active',
  completed: 'Completed',
  paused: 'Paused',
  archived: 'Archived',
};

export const PROJECT_TYPE_LABELS: Record<ProjectData['types'][number], string> = {
  research: 'Research',
  software: 'Software',
  simulation: 'Simulation',
  engineering: 'Engineering',
  teaching: 'Teaching',
};

export const PUBLICATION_STATUS_LABELS: Record<PublicationData['status'], string> = {
  published: 'Published',
  'in-press': 'In press',
  accepted: 'Accepted',
  submitted: 'Submitted',
  preprint: 'Preprint',
  'in-preparation': 'In preparation',
};

export const NEWS_TYPE_LABELS: Record<NewsData['type'], string> = {
  publication: 'Publication',
  talk: 'Talk',
  award: 'Award',
  project: 'Project',
  software: 'Software',
  conference: 'Conference',
  media: 'Media',
  milestone: 'Milestone',
  other: 'Update',
};

export const TALK_TYPE_LABELS: Record<TalkData['type'], string> = {
  invited: 'Invited talk',
  conference: 'Conference talk',
  seminar: 'Seminar',
  webinar: 'Webinar',
  poster: 'Poster',
  workshop: 'Workshop',
  panel: 'Panel',
  other: 'Talk',
};

export const EXPERIENCE_TYPE_LABELS: Record<ExperienceData['type'], string> = {
  research: 'Research experience',
  professional: 'Professional experience',
  teaching: 'Teaching',
  service: 'Service',
};

export function projectStatusLabel(status: ProjectData['status'], locale: Locale = 'en'): string {
  return t(locale, `status.${status}`);
}

export function projectTypeLabel(type: ProjectData['types'][number], locale: Locale = 'en'): string {
  return t(locale, `projectType.${type}`);
}

export function publicationStatusLabel(status: PublicationData['status'], locale: Locale = 'en'): string {
  return t(locale, `status.${status}`);
}

export function newsTypeLabel(type: NewsData['type'], locale: Locale = 'en'): string {
  return t(locale, `newsType.${type}`);
}

export function talkTypeLabel(type: TalkData['type'], locale: Locale = 'en'): string {
  return t(locale, `talkType.${type}`);
}
