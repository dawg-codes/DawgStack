import { forwardRef, type InputHTMLAttributes } from 'react';
import { cx } from '../../utils/cx';
import { FieldMessages, useFieldIds, type FieldProps } from './Field';

export interface SwitchProps
  extends FieldProps, Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size' | 'role'> {
  /** Put the label before the switch (as in a settings list) or after it. Default `end`. */
  labelPlacement?: 'start' | 'end';
}

/**
 * An on/off switch for settings that apply straight away. It is a native checkbox with
 * `role="switch"`, so it works with forms, `checked`/`defaultChecked` and `onChange`.
 */
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  {
    label,
    hint,
    error,
    hideLabel,
    labelPlacement = 'end',
    className,
    style,
    id,
    'aria-describedby': describedBy,
    'aria-invalid': ariaInvalid,
    ...rest
  },
  ref,
) {
  const ids = useFieldIds({ id, hint, error, describedBy });
  return (
    <div
      className={cx('dawg-switch', className)}
      style={style}
      data-label-placement={labelPlacement}
      data-invalid={ids.invalid || undefined}
      data-disabled={rest.disabled || undefined}
    >
      <span className="dawg-switch__control">
        <input
          {...rest}
          ref={ref}
          type="checkbox"
          role="switch"
          id={ids.inputId}
          className="dawg-switch__input"
          aria-describedby={ids.describedBy}
          aria-invalid={ids.invalid ? true : ariaInvalid}
        />
        <span className="dawg-switch__track" aria-hidden="true">
          <span className="dawg-switch__thumb" />
        </span>
      </span>
      <label
        htmlFor={ids.inputId}
        className={cx('dawg-switch__label', hideLabel && 'dawg-visually-hidden')}
      >
        {label}
      </label>
      <FieldMessages ids={ids} hint={hint} error={error} />
    </div>
  );
});
