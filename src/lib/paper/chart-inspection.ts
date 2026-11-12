import { positionTooltip } from './tooltip';

export function attachChartInspection(canvas: HTMLElement, tooltip: HTMLElement, announce: (text: string) => void) {
  let active: SVGElement | undefined;
  const hide = () => {
    active?.classList.remove('is-active');
    active?.removeAttribute('aria-describedby');
    active = undefined;
    tooltip.hidden = true;
  };
  const arm = () => {
    canvas.querySelectorAll('[data-point] title').forEach(title => title.remove());
    canvas.querySelectorAll('.is-active').forEach(mark => mark.classList.remove('is-active'));
    canvas.querySelector('[data-point]')?.setAttribute('tabindex', '0');
  };
  const show = (mark: SVGElement, x: number, y: number) => {
    if (active !== mark) {
      hide();
      active = mark;
      mark.classList.add('is-active');
      tooltip.textContent = mark.getAttribute('data-info');
      mark.setAttribute('aria-describedby', tooltip.id);
      announce(tooltip.textContent ?? '');
    }
    tooltip.hidden = false;
    positionTooltip(tooltip, x, y);
  };
  const pointAt = (target: EventTarget | null) => target instanceof Element ? target.closest<SVGElement>('[data-point]') : null;
  const pointer = (event: PointerEvent | MouseEvent) => {
    const mark = pointAt(event.target);
    if (mark) show(mark, event.clientX, event.clientY);
    else hide();
  };
  canvas.addEventListener('pointerover', pointer);
  canvas.addEventListener('pointermove', pointer);
  canvas.addEventListener('click', pointer);
  canvas.addEventListener('pointerout', event => {
    if (active && !(event.relatedTarget instanceof Node && active.contains(event.relatedTarget))) hide();
  });
  canvas.addEventListener('pointerleave', hide);
  canvas.addEventListener('focusin', event => {
    const mark = pointAt(event.target);
    if (mark) { const rect = mark.getBoundingClientRect(); show(mark, rect.left + rect.width / 2, rect.bottom); }
  });
  canvas.addEventListener('focusout', hide);
  const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') hide(); };
  canvas.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
    const marks = Array.from(canvas.querySelectorAll<SVGElement>('[data-point]'));
    const current = marks.indexOf(event.target as SVGElement);
    if (current < 0) return;
    event.preventDefault();
    const delta = ['ArrowLeft', 'ArrowUp'].includes(event.key) ? -1 : 1;
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? marks.length - 1 : (current + delta + marks.length) % marks.length;
    marks[current].setAttribute('tabindex', '-1');
    marks[next].setAttribute('tabindex', '0');
    marks[next].focus();
  });
  window.addEventListener('scroll', hide, { capture: true, passive: true });
  window.addEventListener('resize', hide);
  document.addEventListener('keydown', escape);
  arm();
  return { hide, arm, destroy: () => {
    hide();
    window.removeEventListener('scroll', hide, true);
    window.removeEventListener('resize', hide);
    document.removeEventListener('keydown', escape);
  } };
}
