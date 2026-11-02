import { forwardRef, useRef, type ReactNode } from 'react';
import { Button } from '../button/Button';
import { Dialog, type DialogProps } from './Dialog';

export interface ConfirmDialogProps extends Omit<
  DialogProps,
  'onClose' | 'footer' | 'role' | 'dismissible' | 'initialFocus' | 'hideCloseButton'
> {
  /** Called when the user confirms. */
  onConfirm: () => void;
  /** Called when the user cancels: the Cancel button, Escape or the backdrop. */
  onCancel: () => void;
  /** Text of the confirm button; say what it does, e.g. "Delete project". Default `'Confirm'`. */
  confirmLabel?: ReactNode;
  /** Default `'Cancel'`. */
  cancelLabel?: ReactNode;
  /** `danger` for destructive actions: a red button, and Cancel gets focus first. */
  tone?: 'primary' | 'danger';
  /** Shows a spinner on the confirm button and stops the dialog being dismissed. */
  loading?: boolean;
}

/**
 * Asks the user to confirm an action, as an `alertdialog`. For destructive actions
 * (`tone="danger"`) focus starts on Cancel, so an accidental Enter doesn't delete anything.
 */
export const ConfirmDialog = forwardRef<HTMLDialogElement, ConfirmDialogProps>(
  function ConfirmDialog(
    {
      onConfirm,
      onCancel,
      confirmLabel = 'Confirm',
      cancelLabel = 'Cancel',
      tone = 'primary',
      loading = false,
      size = 'sm',
      ...rest
    },
    ref,
  ) {
    const cancelRef = useRef<HTMLButtonElement>(null);
    const confirmRef = useRef<HTMLButtonElement>(null);
    return (
      <Dialog
        {...rest}
        ref={ref}
        size={size}
        role="alertdialog"
        onClose={onCancel}
        dismissible={!loading}
        hideCloseButton
        initialFocus={tone === 'danger' ? cancelRef : confirmRef}
        footer={
          <>
            <Button ref={cancelRef} onClick={onCancel} disabled={loading}>
              {cancelLabel}
            </Button>
            <Button
              ref={confirmRef}
              variant={tone === 'danger' ? 'danger' : 'primary'}
              loading={loading}
              onClick={onConfirm}
            >
              {confirmLabel}
            </Button>
          </>
        }
      />
    );
  },
);
