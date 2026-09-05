import { describe, expect, it } from 'vitest';
import {
  getText,
  htmlLang,
  localizedPath,
  otherLocale,
  t,
  textLang,
  type LocalizedText,
} from '../src/lib/i18n';

describe('localized text', () => {
  const translated: LocalizedText = { en: 'Projects', zh: '项目' };
  const englishOnly: LocalizedText = { en: 'EnergyAtlas' };

  it('selects the requested translation and falls back field by field', () => {
    expect(getText(translated, 'en')).toBe('Projects');
    expect(getText(translated, 'zh')).toBe('项目');
    expect(getText(englishOnly, 'zh')).toBe('EnergyAtlas');
  });

  it('reports the language of the text actually displayed', () => {
    expect(textLang(translated, 'zh')).toBe('zh-CN');
    expect(textLang(englishOnly, 'zh')).toBe('en');
    expect(textLang(translated, 'en')).toBe('en');
  });
});

describe('locale routes', () => {
  it('adds and removes the Chinese prefix without losing query strings or fragments', () => {
    expect(localizedPath('/', 'zh')).toBe('/zh/');
    expect(localizedPath('/projects/alpha/?view=full#results', 'zh')).toBe('/zh/projects/alpha/?view=full#results');
    expect(localizedPath('/zh/projects/alpha/', 'en')).toBe('/projects/alpha/');
    expect(localizedPath('/zh/', 'en')).toBe('/');
    expect(localizedPath('/zh/news/', 'zh')).toBe('/zh/news/');
  });

  it('maps locale identifiers and translated interface copy', () => {
    expect(otherLocale('en')).toBe('zh');
    expect(otherLocale('zh')).toBe('en');
    expect(htmlLang('zh')).toBe('zh-CN');
    expect(t('en', 'nav.home')).toBe('Home');
    expect(t('zh', 'nav.home')).toBe('首页');
  });
});
