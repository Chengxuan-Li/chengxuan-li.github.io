import { describe, expect, it } from 'vitest';
import { resolveExternalVideoUrl } from '../src/lib/content/video';

describe('resolveExternalVideoUrl', () => {
  it('turns public YouTube URLs into privacy-enhanced embeds', () => {
    expect(resolveExternalVideoUrl('https://youtu.be/abcdefghijk')).toEqual({
      kind: 'embed',
      provider: 'youtube',
      url: 'https://www.youtube-nocookie.com/embed/abcdefghijk',
    });
    expect(resolveExternalVideoUrl('https://www.youtube.com/watch?v=ABCDEFGHI_-')).toEqual({
      kind: 'embed',
      provider: 'youtube',
      url: 'https://www.youtube-nocookie.com/embed/ABCDEFGHI_-',
    });
  });

  it('turns public Vimeo URLs into player embeds', () => {
    expect(resolveExternalVideoUrl('https://vimeo.com/123456789')).toEqual({
      kind: 'embed',
      provider: 'vimeo',
      url: 'https://player.vimeo.com/video/123456789',
    });
  });

  it('keeps direct HTTPS MP4 URLs for native playback', () => {
    expect(resolveExternalVideoUrl('https://media.example.com/demo.mp4?version=2')).toEqual({
      kind: 'file',
      provider: 'direct',
      url: 'https://media.example.com/demo.mp4?version=2',
      mimeType: 'video/mp4',
    });
  });

  it.each([
    'http://media.example.com/demo.mp4',
    'https://example.com/watch/video',
    'https://youtube.example.com/watch?v=abcdefghijk',
    'https://www.youtube.com/watch?v=short',
    'not a url',
  ])('rejects unsupported or unsafe URL %s', (url) => {
    expect(resolveExternalVideoUrl(url)).toBeNull();
  });
});
