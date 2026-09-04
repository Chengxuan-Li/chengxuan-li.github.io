import { describe, expect, it } from 'vitest';
import * as bioTabs from '../src/lib/bio-tabs';

describe('nextBioTabIndex', () => {
  it('moves through tabs and wraps at either end', () => {
    expect(bioTabs).toHaveProperty('nextBioTabIndex');
    expect(bioTabs.nextBioTabIndex(0, 'ArrowRight', 4)).toBe(1);
    expect(bioTabs.nextBioTabIndex(3, 'ArrowRight', 4)).toBe(0);
    expect(bioTabs.nextBioTabIndex(0, 'ArrowLeft', 4)).toBe(3);
  });

  it('supports Home and End without intercepting unrelated keys', () => {
    expect(bioTabs).toHaveProperty('nextBioTabIndex');
    expect(bioTabs.nextBioTabIndex(2, 'Home', 4)).toBe(0);
    expect(bioTabs.nextBioTabIndex(1, 'End', 4)).toBe(3);
    expect(bioTabs.nextBioTabIndex(2, 'Tab', 4)).toBeNull();
  });
});

describe('bioTabScrollDelta', () => {
  it('does not scroll a tab that is already fully visible', () => {
    expect(bioTabs.bioTabScrollDelta(0, 320, 80, 180)).toBe(0);
  });

  it('scrolls left when the active tab is clipped at the start', () => {
    expect(bioTabs.bioTabScrollDelta(20, 320, -10, 100)).toBe(-30);
  });

  it('scrolls right when the active tab is clipped at the end', () => {
    expect(bioTabs.bioTabScrollDelta(0, 320, 260, 360)).toBe(40);
  });
});
