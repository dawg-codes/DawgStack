import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  type DialogHTMLAttributes,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  type RefObject,
  type SyntheticEvent,
} from 'react';
import { cx } from '../../utils/cx';
import { useBeforePaint } from '../../utils/use-before-paint';
import { useMergedRef } from '../../utils/use-merged-ref';

export type DialogSize = 'sm' | 'md' | 'lg';

export interface DialogProps extends Omit<
  DialogHTMLAttributes<HTMLDialogElement>,
  'title' | 'onClose' | 'role' | 'open'
> {
  /** Whether the dialog is shown. */
  open: boolean;
  /**
   * Called when the user asks to close it: the close button, Escape, or a click on the
   * backdrop. Set `open` to false in response.
   */
  onClose: () => void;
  /** Heading, also used as the dialog's accessible name. */
  title: ReactNode;
  /** Short text under the title, read by screen readers when the dialog opens. */
  description?: ReactNode;
  /** Actions at the bottom, e.g. Cancel and Save buttons. */
  footer?: ReactNode;
  /** Maximum width. Default `md`. */
  size?: DialogSize;
  /**
   * When false, Escape and backdrop clicks don't close the dialog and the close button is
   * hidden, e.g. while saving. Default true.
   */
  dismissible?: boolean;
  /** Accessible name of the close button. Default `'Close'`. */
  closeLabel?: string;
  /** Hide the × button in the corner (Escape and the backdrop still close the dialog). */
  hideCloseButton?: boolean;
  /**
   * Element to focus when the dialog opens. By default the browser focuses the first
   * focusable element inside it.
   */
  initialFocus?: RefObject<HTMLElement | null>;
  /** `alertdialog` for urgent questions that need an answer, such as confirmations. */
  role?: 'dialog' | 'alertdialog';
}

const CloseIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />
  </svg>
);

/**
 * A modal dialog built on the native `<dialog>` element: the browser keeps focus inside it,
 * makes the rest of the page inert, and shows it above everything else. Focus returns to
 * where it was when the dialog closes.
 */
export const Dialog = forwardRef<HTMLDialogElement, DialogProps>(function Dialog(
  {
    open,
    onClose,
    title,
    description,
    footer,
    size = 'md',
    dismissible = true,
    closeLabel = 'Close',
    hideCloseButton = false,
    initialFocus,
    role = 'dialog',
    className,
    children,
    onCancel,
    onClick,
    onPointerDown,
    ...rest
  },
  forwardedRef,
) {
  const inner = useRef<HTMLDialogElement>(null);
  const ref = useMergedRef(forwardedRef, inner);
  const id = useId();
  const titleId = `${id}-title`;
  const descriptionId = description ? `${id}-description` : undefined;
  const returnFocus = useRef<Element | null>(null);
  const pressedBackdrop = useRef(false);
  // The latest props, for the native event listener below.
  const latest = useRef({ open, onClose });
  useBeforePaint(() => {
    latest.current = { open, onClose };
  });

  useEffect(() => {
    const dialog = inner.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      returnFocus.current = document.activeElement;
      dialog.showModal();
      initialFocus?.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open, initialFocus]);

  useEffect(() => {
    const dialog = inner.current;
    if (!dialog) return;
    // Put focus back where it was. Also covers the browser closing the dialog by itself
    // (for example a second Escape press): tell the parent so its state stays in step.
    const handleClose = () => {
      const target = returnFocus.current;
      if (target instanceof HTMLElement && target.isConnected) target.focus();
      returnFocus.current = null;
      if (latest.current.open) latest.current.onClose();
    };
    dialog.addEventListener('close', handleClose);
    return () => {
      dialog.removeEventListener('close', handleClose);
      if (dialog.open) {
        // Unmounted while open: close it and restore focus.
        dialog.close();
        const target = returnFocus.current;
        if (target instanceof HTMLElement && target.isConnected) target.focus();
      }
    };
  }, []);

  // Escape fires "cancel". Keep the dialog open and let the parent decide.
  const handleCancel = (event: SyntheticEvent<HTMLDialogElement>) => {
    onCancel?.(event);
    event.preventDefault();
    if (dismissible) onClose();
  };

  // A click on the <dialog> element itself (not its panel) is a click on the backdrop. Only
  // count it when the press also started there, so dragging out of a text field doesn't close.
  const handlePointerDown = (event: PointerEvent<HTMLDialogElement>) => {
    onPointerDown?.(event);
    pressedBackdrop.current = event.target === event.currentTarget;
  };
  const handleClick = (event: MouseEvent<HTMLDialogElement>) => {
    onClick?.(event);
    if (dismissible && pressedBackdrop.current && event.target === event.currentTarget) {
      onClose();
    }
    pressedBackdrop.current = false;
  };

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/click-events-have-key-events -- backdrop clicks only; the keyboard closes it with Escape (the native cancel event)
    <dialog
      {...rest}
      ref={ref}
      role={role === 'alertdialog' ? 'alertdialog' : undefined}
      className={cx('dawg-dialog', className)}
      data-size={size}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onCancel={handleCancel}
      onPointerDown={handlePointerDown}
      onClick={handleClick}
    >
      <div className="dawg-dialog__panel">
        <div className="dawg-dialog__header">
          <h2 id={titleId} className="dawg-dialog__title">
            {title}
          </h2>
          {dismissible && !hideCloseButton && (
            <button
              type="button"
              className="dawg-dialog__close"
              aria-label={closeLabel}
              title={closeLabel}
              onClick={onClose}
            >
              <CloseIcon />
            </button>
          )}
        </div>
        {description && (
          <p id={descriptionId} className="dawg-dialog__description">
            {description}
          </p>
        )}
        {children != null && <div className="dawg-dialog__body">{children}</div>}
        {footer && <div className="dawg-dialog__footer">{footer}</div>}
      </div>
    </dialog>
  );
});
