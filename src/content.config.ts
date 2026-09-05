import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { entryId, projectTranslationId } from './lib/content/entry-id';
import {
  awardSchema,
  bioSchema,
  educationSchema,
  experienceSchema,
  newsSchema,
  projectBaseSchema,
  projectVideoSchema,
  publicationSchema,
  skillGroupSchema,
  talkSchema,
} from './lib/content/schemas';

/** `npm run dev:fixtures` / `build:fixtures` point this at `fixtures/content` for layout checks. */
const CONTENT_ROOT = process.env.SITE_CONTENT_ROOT ?? 'src/content';

/** Files or folders starting with `_` (templates, drafts) are never loaded. */
const IGNORE = ['!**/_*', '!**/_*/**'];

const yaml = (dir: string) =>
  glob({ pattern: ['**/*.{yaml,yml}', ...IGNORE], base: `./${CONTENT_ROOT}/${dir}`, generateId: entryId });

const projects = defineCollection({
  loader: glob({
    pattern: ['**/index.md', '*.md', ...IGNORE],
    base: `./${CONTENT_ROOT}/projects`,
    generateId: entryId,
  }),
  schema: ({ image }) =>
    projectBaseSchema.extend({
      hero_image: image().optional(),
      videos: z.array(projectVideoSchema(image())).min(1).optional(),
    }),
});

const projectTranslations = defineCollection({
  loader: glob({
    pattern: ['**/index.zh.md', ...IGNORE],
    base: `./${CONTENT_ROOT}/projects`,
    generateId: projectTranslationId,
  }),
  schema: z.strictObject({}),
});

const bios = defineCollection({ loader: yaml('bios'), schema: bioSchema });
const publications = defineCollection({ loader: yaml('publications'), schema: publicationSchema });
const news = defineCollection({ loader: yaml('news'), schema: newsSchema });
const experiences = defineCollection({ loader: yaml('experiences'), schema: experienceSchema });
const education = defineCollection({ loader: yaml('education'), schema: educationSchema });
const talks = defineCollection({ loader: yaml('talks'), schema: talkSchema });
const awards = defineCollection({ loader: yaml('awards'), schema: awardSchema });
const skills = defineCollection({ loader: yaml('skills'), schema: skillGroupSchema });

export const collections = { bios, projects, projectTranslations, publications, news, experiences, education, talks, awards, skills };
