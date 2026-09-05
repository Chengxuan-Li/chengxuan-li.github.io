/**
 * Site-wide facts and switches. Every value here is public.
 * Fill a field only when the value is verified (see references/README.md); `null` omits it from the site.
 */
export interface ProfileLinks {
  github: string | null;
  scholar: string | null;
  linkedin: string | null;
  /** Plain address; rendered as a mailto: link. */
  email: string | null;
}

export interface CvPdfLink {
  label: string;
  /** Root-relative path under public/ to an approved CV PDF. */
  href: string;
}

export interface SiteConfig {
  url: string;
  name: string;
  /** Spellings used to highlight the site owner in publication author lists. */
  nameVariants: string[];
  role: string;
  fields: string[];
  affiliation: string;
  affiliationUrl: string | null;
  /** About two lines: the common technical thread across the work. */
  positioning: string;
  /** One line for the CV "Research interests" section; null omits the section. */
  researchInterests: string | null;
  /** One sentence describing the portfolio's technical scope (Projects page header). */
  projectsIntro: string;
  /** Default meta description. */
  description: string;
  profiles: ProfileLinks;
  /** Approved public CV versions; an empty list hides the PDF actions. */
  cvPdfs: CvPdfLink[];
  /** Root-relative path to the default social preview image. */
  ogImage: string;
}

export const siteConfig: SiteConfig = {
  url: 'https://chengxuan-li.github.io',
  name: 'Chengxuan Li',
  nameVariants: ['Chengxuan Li', 'Cheng Xuan Li', 'C. Li', 'Li, C.', 'Li C.', 'Li, Chengxuan'],
  role: 'PhD Researcher',
  fields: ['AI', 'Software', 'Energy Systems'],
  affiliation: 'Cornell University',
  affiliationUrl: null,
  // Homepage summary supplied by the site owner; adapted from the one-sentence bio.
  positioning:
    'I develop physics-informed and hybrid machine-learning methods for energy simulation, power-system analysis, and grid infrastructure optimization under electrification.',
  researchInterests:
    'Machine learning and AI for engineering; inverse modeling, system identification, and surrogate learning; physics-informed and physics-supervised learning; time-series modeling and load-profile inference; urban building energy modeling and reduced-order simulation; smart-meter, AMI, and grid-data analytics; demand response and load flexibility; building electrification and heat-pump adoption; distributed energy resource integration; feeder- and distribution-system modeling; scientific computing, optimization, and scalable digital twins for energy systems.',
  projectsIntro:
    'Urban building energy modeling, load inference and model calibration, and the software that runs them at city scale.',
  description:
    'Chengxuan Li, PhD researcher at Cornell University building machine-learning, inverse-modeling, and simulation tools for urban energy systems. Projects, publications, CV, and news.',
  profiles: {
    github: 'https://github.com/Chengxuan-Li',
    scholar: null,
    linkedin: 'https://www.linkedin.com/in/chengxl/',
    email: 'cl2749@cornell.edu',
  },
  cvPdfs: [
    { label: 'Short CV', href: '/cv/Chengxuan_Li_CV_Short.pdf' },
    { label: 'Long CV', href: '/cv/Chengxuan_Li_CV_Long.pdf' },
  ],
  ogImage: '/images/og/default.png',
};

/** "PhD Researcher · AI / Software / Energy Systems" */
export function roleLine(config: SiteConfig = siteConfig): string {
  return `${config.role} · ${config.fields.join(' / ')}`;
}
