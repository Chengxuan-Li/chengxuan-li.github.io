export function createFigureDialog(): HTMLDialogElement {
  const dialog = document.createElement('dialog');
  dialog.className = 'paper-figure-dialog';
  dialog.setAttribute('aria-label', 'Expanded figure');
  const toolbar = document.createElement('div');
  toolbar.className = 'figure-dialog-toolbar';
  const template = document.querySelector<HTMLTemplateElement>('[data-figure-close]')!;
  const close = template.content.firstElementChild!.cloneNode(true) as HTMLButtonElement;
  close.addEventListener('click', () => dialog.close());
  toolbar.append(close);
  dialog.append(toolbar);
  document.body.append(dialog);
  dialog.addEventListener('close', () => dialog.remove());
  return dialog;
}
