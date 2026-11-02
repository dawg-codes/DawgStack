import { forwardRef, useId, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { AlertIcon } from './icons';

/** Props shared by every form control. */
export interface FieldProps {
  /** Visible label. Required, so every control has an accessible name. */
  label: ReactNode;
  /** Help text shown under the control and read by screen readers with it. */
  hint?: ReactNode;
  /**
   * Error message. Marks the control invalid (`aria-invalid`) and is read with it. Pass `true`
   * to mark it invalid without a message, e.g. when another message already explains.
   */
  error?: ReactNode;
  /** Hide the label visually; screen readers still announce it. */
  hideLabel?: boolean;
}

/** Height and text size of text-like controls. */
export type FieldSize = 'sm' | 'md' | 'lg';

const hasContent = (node: ReactNode) => node != null && typeof node !== 'boolean' && node !== '';

export function joinIds(...ids: (string | undefined)[]) {
  return ids.filter(Boolean).join(' ') || undefined;
}

/** Ids and ARIA wiring between a control, its hint and its error message. */
export function useFieldIds(props: {
  id?: string;
  hint?: ReactNode;
  error?: ReactNode;
  describedBy?: string;
}) {
  const generated = useId();
  const inputId = props.id ?? generated;
  const hintId = hasContent(props.hint) ? `${inputId}-hint` : undefined;
  const errorId = hasContent(props.error) ? `${inputId}-error` : undefined;
  return {
    inputId,
    hintId,
    errorId,
    invalid: props.error === true || errorId !== undefined,
    describedBy: joinIds(props.describedBy, hintId, errorId),
  };
}

export type FieldIds = ReturnType<typeof useFieldIds>;

export type FieldErrorProps = HTMLAttributes<HTMLParagraphElement>;

/**
 * An error message with an icon, so the error isn't shown by colour alone. The form controls
 * render it for you; use it directly next to your own controls, linked with `aria-describedby`.
 */
export const FieldError = forwardRef<HTMLParagraphElement, FieldErrorProps>(function FieldError(
  { className, children, ...rest },
  ref,
) {
  return (
    <p {...rest} ref={ref} className={cx('dawg-field__error', className)}>
      <AlertIcon />
      <span>{children}</span>
    </p>
  );
});

export function RequiredMark() {
  return (
    <span className="dawg-field__required" aria-hidden="true">
      *
    </span>
  );
}

export function FieldMessages({
  ids,
  hint,
  error,
}: {
  ids: FieldIds;
  hint?: ReactNode;
  error?: ReactNode;
}) {
  return (
    <>
      {ids.hintId && (
        <p id={ids.hintId} className="dawg-field__hint">
          {hint}
        </p>
      )}
      {ids.errorId && <FieldError id={ids.errorId}>{error}</FieldError>}
    </>
  );
}

/** The label, control, hint and error layout shared by the text-like controls. */
export function FieldFrame({
  ids,
  label,
  hint,
  error,
  hideLabel,
  required,
  disabled,
  size,
  className,
  style,
  extra,
  children,
  ...data
}: FieldProps & {
  ids: FieldIds;
  required?: boolean;
  disabled?: boolean;
  size?: FieldSize;
  className?: string;
  style?: CSSProperties;
  /** Shown between the control and the hint, e.g. a password strength meter. */
  extra?: ReactNode;
  children: ReactNode;
  [data: `data-${string}`]: string | boolean | undefined;
}) {
  return (
    <div
      {...data}
      className={cx('dawg-field', className)}
      style={style}
      data-size={size}
      data-invalid={ids.invalid || undefined}
      data-disabled={disabled || undefined}
    >
      <label
        htmlFor={ids.inputId}
        className={cx('dawg-field__label', hideLabel && 'dawg-visually-hidden')}
      >
        {label}
        {required && <RequiredMark />}
      </label>
      {children}
      {extra}
      <FieldMessages ids={ids} hint={hint} error={error} />
    </div>
  );
}
