/** Returns the tab selected by a standard horizontal-tab keyboard command. */
export function nextBioTabIndex(current: number, key: string, count: number): number | null {
  if (count < 1) return null;
  if (key === 'ArrowRight') return (current + 1) % count;
  if (key === 'ArrowLeft') return (current - 1 + count) % count;
  if (key === 'Home') return 0;
  if (key === 'End') return count - 1;
  return null;
}

/** Returns the horizontal distance needed to reveal a tab within its scroll container. */
export function bioTabScrollDelta(
  containerLeft: number,
  containerRight: number,
  tabLeft: number,
  tabRight: number,
): number {
  if (tabLeft < containerLeft) return tabLeft - containerLeft;
  if (tabRight > containerRight) return tabRight - containerRight;
  return 0;
}
