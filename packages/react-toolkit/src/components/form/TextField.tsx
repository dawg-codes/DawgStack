import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { FieldFrame, useFieldIds, type FieldIds, type FieldProps, type FieldSize } from './Field';

export interface TextFieldProps
  extends FieldProps, Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Default `md`. On touch screens `sm` grows to `md` and `md` to the touch-target height. */
  size?: FieldSize;
  /** Decorative icon at the start of the control (hidden from assistive technology). */
  startIcon?: ReactNode;
  /** Content at the end of the control, such as a unit (`kg`) or a small button. */
  endAddon?: ReactNode;
}

/** The bordered box around an input, with optional icon and end content. */
export const InputControl = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & {
    ids: FieldIds;
    startIcon?: ReactNode;
    endAddon?: ReactNode;
    action?: ReactNode;
  }
>(function InputControl(
  { ids, startIcon, endAddon, action, 'aria-invalid': ariaInvalid, ...rest },
  ref,
) {
  return (
    <div className="dawg-field__control">
      {startIcon && (
        <span className="dawg-field__icon" aria-hidden="true">
          {startIcon}
        </span>
      )}
      <input
        {...rest}
        ref={ref}
        id={ids.inputId}
        className="dawg-field__input"
        aria-describedby={ids.describedBy}
        aria-invalid={ids.invalid ? true : ariaInvalid}
      />
      {endAddon && <span className="dawg-field__addon">{endAddon}</span>}
      {action}
    </div>
  );
});

/**
 * A labelled text input with optional hint and error message. All input attributes and the
 * ref go to the `<input>`; `className` and `style` go to the wrapper.
 */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  {
    label,
    hint,
    error,
    hideLabel,
    size = 'md',
    startIcon,
    endAddon,
    className,
    style,
    id,
    type = 'text',
    'aria-describedby': describedBy,
    ...rest
  },
  ref,
) {
  const ids = useFieldIds({ id, hint, error, describedBy });
  return (
    <FieldFrame
      {...{ ids, label, hint, error, hideLabel, size, className, style }}
      required={rest.required}
      disabled={rest.disabled}
    >
      <InputControl
        {...rest}
        ref={ref}
        ids={ids}
        type={type}
        startIcon={startIcon}
        endAddon={endAddon}
      />
    </FieldFrame>
  );
});
