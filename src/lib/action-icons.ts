export type ActionIconName = 'pdf' | 'github' | 'linkedin' | 'email' | 'website' | 'printer' | 'quote' | 'presentation' | 'copy' | 'code' | 'data' | 'expand' | 'download' | 'image' | 'return' | 'close' | 'svg';

export const projectActionIcons = {
  code: 'code',
  demo: 'website',
  paper: 'pdf',
  docs: 'website',
  data: 'data',
  other: 'website',
} as const satisfies Record<string, ActionIconName>;

export function projectActionIcon(link: { kind: keyof typeof projectActionIcons; url: string }): ActionIconName {
  return new URL(link.url).hostname === 'github.com' ? 'github' : projectActionIcons[link.kind];
}
