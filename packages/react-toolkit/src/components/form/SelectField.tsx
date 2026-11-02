import { forwardRef, type SelectHTMLAttributes } from 'react';
import { FieldFrame, useFieldIds, type FieldProps, type FieldSize } from './Field';
import { ChevronDownIcon } from './icons';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectFieldProps
  extends FieldProps, Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size' | 'multiple'> {
  /** Choices, as objects or plain strings (used as both value and label). Or pass `<option>`s. */
  options?: readonly (SelectOption | string)[];
  /**
   * An empty first choice such as "Choose a country". When the field is `required` it can't be
   * picked again, so the browser's required check works.
   */
  placeholder?: string;
  /** Default `md`. */
  size?: FieldSize;
}

/** A labelled native `<select>`: the platform's own picker, keyboard and screen reader support. */
export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(function SelectField(
  {
    label,
    hint,
    error,
    hideLabel,
    size = 'md',
    options,
    placeholder,
    className,
    style,
    id,
    children,
    'aria-describedby': describedBy,
    'aria-invalid': ariaInvalid,
    ...rest
  },
  ref,
) {
  const ids = useFieldIds({ id, hint, error, describedBy });
  // Start on the placeholder unless the caller chose a value.
  const startEmpty = placeholder !== undefined && rest.value === undefined;
  return (
    <FieldFrame
      {...{ ids, label, hint, error, hideLabel, size, className, style }}
      required={rest.required}
      disabled={rest.disabled}
    >
      <div className="dawg-field__control">
        <select
          {...(startEmpty ? { defaultValue: '' } : null)}
          {...rest}
          ref={ref}
          id={ids.inputId}
          className="dawg-field__input"
          aria-describedby={ids.describedBy}
          aria-invalid={ids.invalid ? true : ariaInvalid}
        >
          {placeholder !== undefined && (
            <option value="" disabled={rest.required}>
              {placeholder}
            </option>
          )}
          {options?.map((option) => {
            const {
              value,
              label: text,
              disabled,
            } = typeof option === 'string'
              ? { value: option, label: option, disabled: false }
              : option;
            return (
              <option key={value} value={value} disabled={disabled}>
                {text}
              </option>
            );
          })}
          {children}
        </select>
        <span className="dawg-field__chevron" aria-hidden="true">
          <ChevronDownIcon />
        </span>
      </div>
    </FieldFrame>
  );
});
