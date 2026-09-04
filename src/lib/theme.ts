/**
 * Colour-theme logic shared by the header toggle. Pure functions so they can be unit-tested;
 * the DOM wiring lives in `SiteHeader.astro`, and a tiny inline copy of `resolveTheme` runs in
 * `BaseLayout.astro` before first paint.
 *
 * Rules: with nothing stored the site follows `prefers-color-scheme`. A click switches to the other
 * theme; the choice is stored only when it differs from the system preference, so choosing the theme
 * the system already uses returns the site to automatic mode.
 */
export type Theme = 'light' | 'dark';

export const STORAGE_KEY = 'theme';

export function readStoredTheme(raw: unknown): Theme | null {
  return raw === 'light' || raw === 'dark' ? raw : null;
}

export function resolveTheme(stored: Theme | null, systemDark: boolean): Theme {
  return stored ?? (systemDark ? 'dark' : 'light');
}

export function toggleTheme(current: Theme, systemDark: boolean): { theme: Theme; store: Theme | null } {
  const theme: Theme = current === 'dark' ? 'light' : 'dark';
  const systemTheme: Theme = systemDark ? 'dark' : 'light';
  return { theme, store: theme === systemTheme ? null : theme };
}

export function toggleLabel(current: Theme): string {
  return current === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';
}
