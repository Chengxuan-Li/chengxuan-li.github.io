import { describe, expect, it } from 'vitest';
import { readStoredTheme, resolveTheme, STORAGE_KEY, toggleLabel, toggleTheme } from '../src/lib/theme';

describe('readStoredTheme', () => {
  it('accepts only the two theme names', () => {
    expect(readStoredTheme('light')).toBe('light');
    expect(readStoredTheme('dark')).toBe('dark');
    expect(readStoredTheme('auto')).toBeNull();
    expect(readStoredTheme(null)).toBeNull();
    expect(readStoredTheme(undefined)).toBeNull();
    expect(readStoredTheme(42)).toBeNull();
  });
});

describe('resolveTheme', () => {
  it('follows the system preference when nothing is stored', () => {
    expect(resolveTheme(null, true)).toBe('dark');
    expect(resolveTheme(null, false)).toBe('light');
  });
  it('lets a stored choice win over the system preference', () => {
    expect(resolveTheme('light', true)).toBe('light');
    expect(resolveTheme('dark', false)).toBe('dark');
  });
});

describe('toggleTheme', () => {
  it('stores an override when the new theme differs from the system preference', () => {
    expect(toggleTheme('light', false)).toEqual({ theme: 'dark', store: 'dark' });
    expect(toggleTheme('dark', true)).toEqual({ theme: 'light', store: 'light' });
  });
  it('clears the override (back to automatic) when the new theme matches the system preference', () => {
    expect(toggleTheme('dark', false)).toEqual({ theme: 'light', store: null });
    expect(toggleTheme('light', true)).toEqual({ theme: 'dark', store: null });
  });
});

describe('labels and keys', () => {
  it('describes the action the button will take', () => {
    expect(toggleLabel('light')).toBe('Switch to dark theme');
    expect(toggleLabel('dark')).toBe('Switch to light theme');
  });
  it('uses a stable storage key', () => {
    expect(STORAGE_KEY).toBe('theme');
  });
});
