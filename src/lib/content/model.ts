import type { ImageMetadata } from 'astro';
import type { z } from 'astro/zod';
import type {
  awardSchema,
  bioSchema,
  educationSchema,
  experienceSchema,
  newsSchema,
  projectBaseSchema,
  projectVideoBaseSchema,
  publicationSchema,
  skillGroupSchema,
  talkSchema,
} from './schemas';

/** The slice of an Astro collection entry the site relies on; Astro's `CollectionEntry` satisfies it structurally. */
export interface Entry<TData> {
  id: string;
  data: TData;
  body?: string;
  /** Source path relative to the project root, as reported by Astro's loaders. */
  filePath?: string;
}

export type ProjectVideoData = z.output<typeof projectVideoBaseSchema> & { poster?: ImageMetadata };
export type ProjectData = z.output<typeof projectBaseSchema> & { hero_image?: ImageMetadata; videos?: ProjectVideoData[] };
export type PublicationData = z.output<typeof publicationSchema>;
export type NewsData = z.output<typeof newsSchema>;
export type ExperienceData = z.output<typeof experienceSchema>;
export type EducationData = z.output<typeof educationSchema>;
export type TalkData = z.output<typeof talkSchema>;
export type AwardData = z.output<typeof awardSchema>;
export type SkillGroupData = z.output<typeof skillGroupSchema>;
export type BioData = z.output<typeof bioSchema>;

export type ProjectEntry = Entry<ProjectData>;
export type PublicationEntry = Entry<PublicationData>;
export type NewsEntry = Entry<NewsData>;
export type ExperienceEntry = Entry<ExperienceData>;
export type EducationEntry = Entry<EducationData>;
export type TalkEntry = Entry<TalkData>;
export type AwardEntry = Entry<AwardData>;
export type SkillGroupEntry = Entry<SkillGroupData>;
export type BioEntry = Entry<BioData>;

/** Everything the site knows, loaded once per build. */
export interface SiteContent {
  bios: BioEntry[];
  projects: ProjectEntry[];
  publications: PublicationEntry[];
  news: NewsEntry[];
  experiences: ExperienceEntry[];
  education: EducationEntry[];
  talks: TalkEntry[];
  awards: AwardEntry[];
  skills: SkillGroupEntry[];
}

export type CollectionName = keyof SiteContent;

export const COLLECTION_NAMES = [
  'bios',
  'projects',
  'publications',
  'news',
  'experiences',
  'education',
  'talks',
  'awards',
  'skills',
] as const satisfies readonly CollectionName[];
