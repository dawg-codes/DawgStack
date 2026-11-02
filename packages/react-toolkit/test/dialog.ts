// jsdom has no showModal() or close() on <dialog>. This stand-in toggles the `open` attribute,
// focuses the first focusable element like a browser does, and fires "close" as a task.
// Focus trapping, inertness and Escape handling are checked in a real browser instead.
const FOCUSABLE =
  '[autofocus], button:not(:disabled), input:not(:disabled), select, textarea, a[href], [tabindex]:not([tabindex="-1"])';

export function installDialog() {
  const proto = HTMLDialogElement.prototype;
  if (typeof proto.showModal === 'function') return;
  proto.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute('open', '');
    this.querySelector<HTMLElement>(FOCUSABLE)?.focus();
  };
  proto.show = function show(this: HTMLDialogElement) {
    this.setAttribute('open', '');
  };
  proto.close = function close(this: HTMLDialogElement) {
    if (!this.hasAttribute('open')) return;
    this.removeAttribute('open');
    setTimeout(() => this.dispatchEvent(new Event('close')));
  };
}

/** What a browser does when Escape is pressed in a modal dialog. */
export function pressEscapeIn(dialog: HTMLDialogElement) {
  const cancel = new Event('cancel', { cancelable: true });
  if (dialog.dispatchEvent(cancel)) dialog.close();
}
