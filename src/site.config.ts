import { getText, type Locale, type LocalizedText } from './lib/i18n';

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
  label: LocalizedText;
  /** Root-relative path under public/ to an approved CV PDF. */
  href: string;
}

export interface SiteConfig {
  url: string;
  name: string;
  /** Spellings used to highlight the site owner in publication author lists. */
  nameVariants: string[];
  role: LocalizedText;
  fields: LocalizedText[];
  affiliation: LocalizedText;
  affiliationUrl: string | null;
  /** About two lines: the common technical thread across the work. */
  positioning: LocalizedText;
  /** One line for the CV "Research interests" section; null omits the section. */
  researchInterests: LocalizedText | null;
  /** One sentence describing the portfolio's technical scope (Projects page header). */
  projectsIntro: LocalizedText;
  /** Default meta description. */
  description: LocalizedText;
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
  role: { en: 'PhD Researcher', zh: '博士研究生' },
  fields: [{ en: 'AI', zh: '人工智能' }, { en: 'Software', zh: '软件' }, { en: 'Energy Systems', zh: '能源系统' }],
  affiliation: { en: 'Cornell University', zh: '康奈尔大学' },
  affiliationUrl: null,
  // Homepage summary supplied by the site owner; adapted from the one-sentence bio.
  positioning: {
    en: 'I develop physics-informed and hybrid machine-learning methods for energy simulation, power-system analysis, and grid infrastructure optimization under electrification.',
    zh: '我致力于开发物理信息与混合机器学习方法，用于能源仿真、电力系统分析以及电气化背景下的电网基础设施优化。',
  },
  researchInterests: {
    en: 'Machine learning and AI for engineering; inverse modeling, system identification, and surrogate learning; physics-informed and physics-supervised learning; time-series modeling and load-profile inference; urban building energy modeling and reduced-order simulation; smart-meter, AMI, and grid-data analytics; demand response and load flexibility; building electrification and heat-pump adoption; distributed energy resource integration; feeder- and distribution-system modeling; scientific computing, optimization, and scalable digital twins for energy systems.',
    zh: '面向工程的机器学习与人工智能；逆向建模、系统辨识与代理学习；物理信息与物理监督学习；时间序列建模与负荷曲线推断；城市建筑能源建模与降阶仿真；智能电表、AMI 与电网数据分析；需求响应与负荷灵活性；建筑电气化与热泵应用；分布式能源资源集成；馈线与配电系统建模；科学计算、优化及面向能源系统的可扩展数字孪生。',
  },
  projectsIntro: {
    en: 'Urban building energy modeling, load inference and model calibration, and the software that runs them at city scale.',
    zh: '城市建筑能源建模、负荷推断与模型校准，以及支撑其城市尺度运行的软件。',
  },
  description: {
    en: 'Chengxuan Li, PhD researcher at Cornell University building machine-learning, inverse-modeling, and simulation tools for urban energy systems. Projects, publications, CV, and news.',
    zh: '康奈尔大学博士研究生 Chengxuan Li，致力于为城市能源系统开发机器学习、逆向建模与仿真工具。',
  },
  profiles: {
    github: 'https://github.com/Chengxuan-Li',
    scholar: null,
    linkedin: 'https://www.linkedin.com/in/chengxl/',
    email: 'cl2749@cornell.edu',
  },
  cvPdfs: [
    { label: { en: 'Short CV', zh: '精简版简历' }, href: '/cv/Chengxuan_Li_CV_Short.pdf' },
    { label: { en: 'Long CV', zh: '完整版简历' }, href: '/cv/Chengxuan_Li_CV_Long.pdf' },
  ],
  ogImage: '/images/og/default.png',
};

/** "PhD Researcher · AI / Software / Energy Systems" */
export function roleLine(config: SiteConfig = siteConfig, locale: Locale = 'en'): string {
  return `${getText(config.role, locale)} · ${config.fields.map((field) => getText(field, locale)).join(' / ')}`;
}
