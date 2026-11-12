export function getTooltipPosition(x: number, y: number, width: number, height: number, viewportWidth: number, viewportHeight: number) {
  const gap = 14;
  const gutter = 12;
  const left = x + gap + width <= viewportWidth - gutter ? x + gap : x - width - gap;
  const top = y + gap + height <= viewportHeight - gutter ? y + gap : y - height - gap;
  return {
    left: Math.max(gutter, Math.min(left, viewportWidth - width - gutter)),
    top: Math.max(gutter, Math.min(top, viewportHeight - height - gutter)),
  };
}

export function positionTooltip(tooltip: HTMLElement, x: number, y: number): void {
  const { left, top } = getTooltipPosition(x, y, tooltip.offsetWidth, tooltip.offsetHeight, window.innerWidth, window.innerHeight);
  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;
}

export function createDelayedDismiss(hide: () => void, delay = 2500) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const cancel = () => { clearTimeout(timer); timer = undefined; };
  const dismiss = () => { cancel(); hide(); };
  return { cancel, dismiss, schedule: () => { cancel(); timer = setTimeout(dismiss, delay); } };
}
