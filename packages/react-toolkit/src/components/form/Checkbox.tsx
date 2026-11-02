import { forwardRef, useEffect, useRef, type InputHTMLAttributes } from 'react';
import { cx } from '../../utils/cx';
import { useMergedRef } from '../../utils/use-merged-ref';
import { FieldMessages, RequiredMark, useFieldIds, type FieldProps } from './Field';

export interface CheckboxProps
  extends FieldProps, Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  /** Shows a dash for "some selected", e.g. a select-all box. Clicking still sets `checked`. */
  indeterminate?: boolean;
}

/** A native checkbox with its label, hint and error. The ref goes to the `<input>`. */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  {
    label,
    hint,
    error,
    hideLabel,
    indeterminate = false,
    className,
    style,
    id,
    'aria-describedby': describedBy,
    'aria-invalid': ariaInvalid,
    ...rest
  },
  forwardedRef,
) {
  const ids = useFieldIds({ id, hint, error, describedBy });
  const inner = useRef<HTMLInputElement>(null);
  const ref = useMergedRef(forwardedRef, inner);

  // `indeterminate` exists only as a DOM property, not an HTML attribute.
  useEffect(() => {
    if (inner.current) inner.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <div
      className={cx('dawg-check', className)}
      style={style}
      data-invalid={ids.invalid || undefined}
      data-disabled={rest.disabled || undefined}
    >
      <input
        {...rest}
        ref={ref}
        type="checkbox"
        id={ids.inputId}
        className="dawg-check__input"
        aria-describedby={ids.describedBy}
        aria-invalid={ids.invalid ? true : ariaInvalid}
      />
      <label
        htmlFor={ids.inputId}
        className={cx('dawg-check__label', hideLabel && 'dawg-visually-hidden')}
      >
        {label}
        {rest.required && <RequiredMark />}
      </label>
      <FieldMessages ids={ids} hint={hint} error={error} />
    </div>
  );
});
