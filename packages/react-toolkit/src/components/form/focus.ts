const FOCUSABLE =
  'input:not([type="hidden"]):not(:disabled), select:not(:disabled), textarea:not(:disabled)';

/**
 * Focuses a form control, or the first control inside an element such as a radio group
 * (preferring its checked radio), and scrolls its whole field into view. Returns whether
 * anything was focused.
 */
export function focusField(target: Element | null | undefined): boolean {
  if (!target) return false;
  const control =
    target instanceof HTMLElement && target.matches(FOCUSABLE)
      ? target
      : (target.querySelector<HTMLElement>(`input:checked:not(:disabled)`) ??
        target.querySelector<HTMLElement>(FOCUSABLE));
  if (!control) return false;
  control.focus({ preventScroll: true });
  // Scroll the field's wrapper, so its label is visible too (scrollIntoView is missing in jsdom).
  const field =
    control.closest('.dawg-field, .dawg-check, .dawg-switch, .dawg-radio-group') ?? control;
  field.scrollIntoView?.({ block: 'center' });
  return document.activeElement === control;
}

/**
 * Focuses the first invalid control (`aria-invalid="true"`) inside `container`. Call it in
 * your submit handler right after setting the error messages: it waits a frame, so React has
 * rendered them first. Fields given an `error` are marked invalid automatically.
 *
 * ```tsx
 * if (Object.keys(errors).length) focusFirstInvalid(event.currentTarget);
 * ```
 */
export function focusFirstInvalid(container: ParentNode | null | undefined): void {
  requestAnimationFrame(() => {
    focusField(container?.querySelector('[aria-invalid="true"]'));
  });
}
