import { z } from 'astro/zod';
import { resolveExternalVideoUrl } from './video';

/* ------------------------------------------------------------------ */
/* Primitives                                                          */
/* ------------------------------------------------------------------ */

/**
 * YAML turns an unquoted `2026-09-03` into a Date and a bare `2026` into a number; normalize both back to
 * text so every date is validated the same way. (Calendar-invalid dates that YAML rolled over are caught
 * separately from the raw source — see `rawdates.ts`.)
 */
function coerceDateInput(value: unknown): unknown {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === 'number' && Number.isInteger(value)) return String(value);
  return value;
}

export const FLEX_DATE_RE = /^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/;

/** True for `YYYY`, `YYYY-MM`, or `YYYY-MM-DD` that denote a real calendar date between 1900 and 2100. */
export function isValidFlexDate(value: string): boolean {
  const match = FLEX_DATE_RE.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  if (year < 1900 || year > 2100) return false;
  if (match[2] === undefined) return true;
  const month = Number(match[2]);
  if (month < 1 || month > 12) return false;
  if (match[3] === undefined) return true;
  const day = Number(match[3]);
  const probe = new Date(Date.UTC(year, month - 1, day));
  return probe.getUTCMonth() === month - 1 && probe.getUTCDate() === day;
}

/** `YYYY`, `YYYY-MM`, or `YYYY-MM-DD` — month and day precision are optional. */
export const flexDate = z.preprocess(
  coerceDateInput,
  z.string().refine(isValidFlexDate, { message: 'Expected a date written as YYYY, YYYY-MM, or YYYY-MM-DD' }),
);

/** `YYYY-MM` or `YYYY-MM-DD` — dated activity needs at least month precision. */
export const monthDate = z.preprocess(
  coerceDateInput,
  z.string().refine((value) => /^\d{4}-\d{2}(?:-\d{2})?$/.test(value) && isValidFlexDate(value), {
    message: 'Expected a date written as YYYY-MM or YYYY-MM-DD',
  }),
);

/** A full `YYYY-MM-DD` date. */
export const isoDate = z.preprocess(
  coerceDateInput,
  z.string().refine((value) => /^\d{4}-\d{2}-\d{2}$/.test(value) && isValidFlexDate(value), {
    message: 'Expected a full date written as YYYY-MM-DD',
  }),
);

export const ID_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** A record id: the target entry's file (or folder) name — lowercase words joined by single hyphens. */
export const recordId = z.string().regex(ID_RE, {
  message: 'Ids are lowercase letters/digits joined by single hyphens and must match the target file name',
});
export const idList = z.array(recordId).default([]);

export const httpUrl = z.url({ protocol: /^https?$/, message: 'Expected an absolute http(s) URL' });

const text = z.string().trim().min(1, { message: 'Must not be empty' });
const orderInt = z.number().int().positive({ message: 'Order values are positive integers (1 = first)' });

/* ------------------------------------------------------------------ */
/* Projects                                                            */
/* ------------------------------------------------------------------ */

export const PROJECT_STATUSES = ['active', 'completed', 'paused', 'archived'] as const;
export const PROJECT_TYPES = ['research', 'software', 'simulation', 'engineering', 'teaching'] as const;
export const PROJECT_LINK_KINDS = ['code', 'demo', 'paper', 'docs', 'data', 'other'] as const;

export const projectLinkSchema = z.strictObject({
  label: text,
  url: httpUrl,
  kind: z.enum(PROJECT_LINK_KINDS).default('other'),
});

export const projectVideoBaseSchema = z.strictObject({
  url: z
    .string()
    .trim()
    .refine((value) => resolveExternalVideoUrl(value) !== null, {
      message: 'Expected an HTTPS YouTube, Vimeo, or direct MP4 URL',
    }),
  title: text,
  caption: text.optional(),
  autoplay: z.boolean().default(false),
  fit: z.enum(['contain', 'cover']).default('contain'),
});

export function projectVideoSchema<TPoster extends z.ZodType>(posterSchema: TPoster) {
  return projectVideoBaseSchema
    .extend({ poster: posterSchema.optional() })
    .refine(
      (video) => video.poster === undefined || resolveExternalVideoUrl(video.url)?.kind === 'file',
      {
        message: 'Poster images are only supported for direct MP4 video URLs',
        path: ['poster'],
      },
    )
    .refine(
      (video) => !video.autoplay || resolveExternalVideoUrl(video.url)?.kind === 'file',
      {
        message: 'Autoplay is only supported for direct MP4 video URLs',
        path: ['autoplay'],
      },
    )
    .refine(
      (video) => video.fit !== 'cover' || resolveExternalVideoUrl(video.url)?.kind === 'file',
      {
        message: 'Cover cropping is only supported for direct MP4 video URLs',
        path: ['fit'],
      },
    );
}

/** Frontmatter of `src/content/projects/<slug>/index.md`. `hero_image` is added in `content.config.ts` via `image()`. */
export const projectBaseSchema = z.strictObject({
  title: text,
  short_title: text.optional(),
  /** One sentence for cards. */
  summary: text,
  /** Optional slightly longer framing used on the project page header. */
  positioning: text.optional(),
  status: z.enum(PROJECT_STATUSES).default('active'),
  start_date: flexDate,
  end_date: flexDate.nullable().default(null),
  featured: z.boolean().default(false),
  home_order: orderInt.optional(),
  types: z.array(z.enum(PROJECT_TYPES)).default([]),
  /** Display-ready topic labels, e.g. "Inverse problems". */
  topics: z.array(text).default([]),
  technologies: z.array(text).default([]),
  affiliation: text.optional(),
  /** Alt text for the hero image; leave empty only when the image is decorative. */
  hero_alt: z.string().default(''),
  hero_caption: text.optional(),
  related_project_ids: idList,
  links: z.array(projectLinkSchema).default([]),
});

/* ------------------------------------------------------------------ */
/* Publications                                                        */
/* ------------------------------------------------------------------ */

export const PUBLICATION_STATUSES = ['published', 'in-press', 'accepted', 'submitted', 'preprint', 'in-preparation'] as const;
export const PUBLICATION_TYPES = ['journal', 'conference', 'workshop', 'preprint', 'thesis', 'report', 'other'] as const;

export const publicationSchema = z.strictObject({
  title: text,
  /** Author names in publication order, exactly as they appear on the paper. */
  authors: z.array(text).min(1, { message: 'List at least one author' }),
  year: z.number().int().min(1900).max(2100),
  month: z.number().int().min(1).max(12).optional(),
  /** Full publication date when known; drives the position in the news stream. Falls back to year/month. */
  date: flexDate.optional(),
  status: z.enum(PUBLICATION_STATUSES),
  type: z.enum(PUBLICATION_TYPES).default('other'),
  venue: text.nullable().default(null),
  doi: z
    .string()
    .regex(/^10\.\d{4,9}\/\S+$/, { message: 'Expected a bare DOI such as 10.1000/xyz123' })
    .optional(),
  links: z
    .strictObject({
      paper: httpUrl.optional(),
      preprint: httpUrl.optional(),
      code: httpUrl.optional(),
      slides: httpUrl.optional(),
      poster: httpUrl.optional(),
    })
    .default({}),
  project_ids: idList,
  featured: z.boolean().default(false),
  home_order: orderInt.optional(),
  /** Free-form note shown after the citation, e.g. "Equal contribution". */
  note: text.optional(),
});

/* ------------------------------------------------------------------ */
/* News                                                                */
/* ------------------------------------------------------------------ */

export const NEWS_TYPES = [
  'publication',
  'talk',
  'award',
  'project',
  'software',
  'conference',
  'media',
  'milestone',
  'other',
] as const;

export const newsSchema = z.strictObject({
  title: text,
  /** Full date when known; month precision (e.g. an award announced in "May 2026") is accepted. */
  date: monthDate,
  type: z.enum(NEWS_TYPES).default('other'),
  summary: text.optional(),
  project_ids: idList,
  publication_ids: idList,
  talk_ids: idList,
  award_ids: idList,
  links: z.array(z.strictObject({ label: text, url: httpUrl })).default([]),
  /** `false` keeps the item off the home page "Latest" list. */
  featured: z.boolean().default(true),
});

/* ------------------------------------------------------------------ */
/* Experience, education, talks, awards, skills                        */
/* ------------------------------------------------------------------ */

export const EXPERIENCE_TYPES = ['research', 'professional', 'teaching', 'service'] as const;

export const experienceSchema = z.strictObject({
  organization: text,
  role: text,
  type: z.enum(EXPERIENCE_TYPES).default('professional'),
  start_date: flexDate,
  end_date: flexDate.nullable().default(null),
  location: text.nullable().default(null),
  url: httpUrl.optional(),
  featured: z.boolean().default(false),
  cv_order: orderInt.optional(),
  project_ids: idList,
  summary: text.nullable().default(null),
  bullets: z.array(text).default([]),
});

export const educationSchema = z.strictObject({
  institution: text,
  degree: text,
  field: text.optional(),
  start_date: flexDate.optional(),
  end_date: flexDate.nullable().default(null),
  location: text.optional(),
  url: httpUrl.optional(),
  details: z.array(text).default([]),
  cv_order: orderInt.optional(),
});

export const TALK_TYPES = ['invited', 'conference', 'seminar', 'webinar', 'poster', 'workshop', 'panel', 'other'] as const;

export const talkSchema = z.strictObject({
  title: text,
  event: text,
  date: flexDate,
  type: z.enum(TALK_TYPES).default('other'),
  location: text.optional(),
  project_ids: idList,
  links: z
    .strictObject({
      slides: httpUrl.optional(),
      video: httpUrl.optional(),
      event: httpUrl.optional(),
      abstract: httpUrl.optional(),
    })
    .default({}),
});

export const awardSchema = z.strictObject({
  title: text,
  organization: text,
  date: flexDate,
  description: text.optional(),
  project_ids: idList,
  url: httpUrl.optional(),
});

export const skillGroupSchema = z.strictObject({
  category: text,
  items: z.array(text).min(1, { message: 'List at least one skill' }),
  order: orderInt.optional(),
});
