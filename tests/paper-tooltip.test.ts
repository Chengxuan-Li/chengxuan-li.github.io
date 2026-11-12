import { afterEach, describe, expect, it, vi } from 'vitest';
import { createDelayedDismiss, getTooltipPosition } from '../src/lib/paper/tooltip';

describe('paper tooltip placement', () => {
  it('follows the pointer without covering it', () => {
    expect(getTooltipPosition(100, 120, 200, 80, 1000, 800)).toEqual({ left: 114, top: 134 });
  });
  it('flips beside the right and bottom edges', () => {
    expect(getTooltipPosition(980, 780, 200, 80, 1000, 800)).toEqual({ left: 766, top: 686 });
  });
  it('keeps oversized previews inside the leading viewport gutter', () => {
    expect(getTooltipPosition(10, 10, 500, 900, 390, 844)).toEqual({ left: 12, top: 12 });
  });
});

describe('reference preview dismissal', () => {
  afterEach(() => vi.useRealTimers());
  it('keeps the preview visible for 2.5 seconds after leaving it', () => {
    vi.useFakeTimers();
    const hide = vi.fn();
    const dismiss = createDelayedDismiss(hide);
    dismiss.schedule();
    vi.advanceTimersByTime(2499);
    expect(hide).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(hide).toHaveBeenCalledOnce();
  });
  it('cancels a pending dismissal when a preview is revisited', () => {
    vi.useFakeTimers();
    const hide = vi.fn();
    const dismiss = createDelayedDismiss(hide);
    dismiss.schedule();
    vi.advanceTimersByTime(1000);
    dismiss.cancel();
    vi.advanceTimersByTime(3000);
    expect(hide).not.toHaveBeenCalled();
    dismiss.schedule();
    dismiss.dismiss();
    expect(hide).toHaveBeenCalledOnce();
    vi.advanceTimersByTime(3000);
    expect(hide).toHaveBeenCalledOnce();
  });
});
