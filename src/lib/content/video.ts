export type ExternalVideoSource =
  | { kind: 'embed'; provider: 'youtube' | 'vimeo'; url: string }
  | { kind: 'file'; provider: 'direct'; url: string; mimeType: 'video/mp4' };

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;
const VIMEO_ID = /^\d+$/;

function pathParts(url: URL): string[] {
  return url.pathname.split('/').filter(Boolean);
}

export function resolveExternalVideoUrl(input: string): ExternalVideoSource | null {
  let parsed: URL;
  try {
    parsed = new URL(input);
  } catch {
    return null;
  }
  if (parsed.protocol !== 'https:' || parsed.username || parsed.password) return null;

  const host = parsed.hostname.toLowerCase();
  const parts = pathParts(parsed);

  let youtubeId: string | null = null;
  if (host === 'youtu.be') youtubeId = parts[0] ?? null;
  else if (['youtube.com', 'www.youtube.com', 'm.youtube.com'].includes(host)) {
    if (parts[0] === 'watch') youtubeId = parsed.searchParams.get('v');
    else if (['embed', 'shorts'].includes(parts[0] ?? '')) youtubeId = parts[1] ?? null;
  } else if (host === 'www.youtube-nocookie.com' && parts[0] === 'embed') {
    youtubeId = parts[1] ?? null;
  }
  if (youtubeId && YOUTUBE_ID.test(youtubeId)) {
    return {
      kind: 'embed',
      provider: 'youtube',
      url: `https://www.youtube-nocookie.com/embed/${youtubeId}`,
    };
  }

  let vimeoId: string | null = null;
  if (['vimeo.com', 'www.vimeo.com'].includes(host)) vimeoId = parts.at(-1) ?? null;
  else if (host === 'player.vimeo.com' && parts[0] === 'video') vimeoId = parts[1] ?? null;
  if (vimeoId && VIMEO_ID.test(vimeoId)) {
    return { kind: 'embed', provider: 'vimeo', url: `https://player.vimeo.com/video/${vimeoId}` };
  }

  if (parsed.pathname.toLowerCase().endsWith('.mp4')) {
    return { kind: 'file', provider: 'direct', url: parsed.href, mimeType: 'video/mp4' };
  }

  return null;
}
