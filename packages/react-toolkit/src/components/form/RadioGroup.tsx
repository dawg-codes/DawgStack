import { forwardRef, useId, type FieldsetHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { useControllableState } from '../../utils/use-controllable-state';
import { FieldError, RequiredMark, useFieldIds, type FieldProps } from './Field';

export interface RadioOption {
  value: string;
  label: ReactNode;
  /** Extra text under this choice's label. */
  hint?: ReactNode;
  disabled?: boolean;
}

export interface RadioGroupProps
  extends
    FieldProps,
    Omit<FieldsetHTMLAttributes<HTMLFieldSetElement>, 'onChange' | 'defaultValue'> {
  options: readonly RadioOption[];
  /** Selected value (controlled). Use with `onValueChange`. */
  value?: string;
  /** Initially selected value (uncontrolled). */
  defaultValue?: string;
  /** Called with the newly selected value. */
  onValueChange?: (value: string) => void;
  /** Form field name. Defaults to a generated one, which keeps arrow keys within the group. */
  name?: string;
  required?: boolean;
  /** Default `vertical`. */
  orientation?: 'vertical' | 'horizontal';
  /** `card` puts each choice in a bordered, fully clickable box. Default `default`. */
  variant?: 'default' | 'card';
}

/**
 * A set of native radio buttons in a `<fieldset>`, with the label as its `<legend>`. Arrow keys,
 * form submission and screen readers work as they do for plain HTML radios.
 */
export const RadioGroup = forwardRef<HTMLFieldSetElement, RadioGroupProps>(function RadioGroup(
  {
    label,
    hint,
    error,
    hideLabel,
    options,
    value,
    defaultValue,
    onValueChange,
    name,
    required = false,
    orientation = 'vertical',
    variant = 'default',
    className,
    id,
    'aria-describedby': describedBy,
    ...rest
  },
  ref,
) {
  const ids = useFieldIds({ id, hint, error, describedBy });
  const generatedName = useId();
  const [selected, setSelected] = useControllableState(value, defaultValue ?? '', onValueChange);

  return (
    <fieldset
      {...rest}
      ref={ref}
      id={ids.inputId}
      // role="radiogroup" lets the group itself carry aria-invalid and aria-required.
      role="radiogroup"
      className={cx('dawg-radio-group', className)}
      data-orientation={orientation}
      data-variant={variant}
      data-invalid={ids.invalid || undefined}
      aria-describedby={ids.describedBy}
      aria-invalid={ids.invalid || undefined}
      aria-required={required || undefined}
    >
      <legend className={cx('dawg-field__label', hideLabel && 'dawg-visually-hidden')}>
        {label}
        {required && <RequiredMark />}
      </legend>
      {ids.hintId && (
        <p id={ids.hintId} className="dawg-field__hint">
          {hint}
        </p>
      )}
      <div className="dawg-radio-group__options">
        {options.map((option, index) => {
          const optionId = `${ids.inputId}-${index}`;
          const optionHintId = option.hint ? `${optionId}-hint` : undefined;
          return (
            <div
              key={option.value}
              className="dawg-check"
              data-variant={variant}
              data-disabled={option.disabled || rest.disabled || undefined}
            >
              <input
                type="radio"
                id={optionId}
                className="dawg-check__input"
                name={name ?? generatedName}
                value={option.value}
                checked={selected === option.value}
                onChange={() => setSelected(option.value)}
                disabled={option.disabled}
                required={required}
                aria-describedby={optionHintId}
              />
              <label htmlFor={optionId} className="dawg-check__label">
                {option.label}
              </label>
              {optionHintId && (
                <p id={optionHintId} className="dawg-field__hint">
                  {option.hint}
                </p>
              )}
            </div>
          );
        })}
      </div>
      {ids.errorId && <FieldError id={ids.errorId}>{error}</FieldError>}
    </fieldset>
  );
});
