import { forwardRef, type CSSProperties } from 'react';
import { useControllableState } from '../../utils/use-controllable-state';
import { FieldFrame, useFieldIds } from './Field';
import { InputControl, type TextFieldProps } from './TextField';

export interface OneTimeCodeFieldProps extends Omit<
  TextFieldProps,
  'type' | 'value' | 'defaultValue' | 'size' | 'maxLength' | 'startIcon' | 'endAddon'
> {
  /** Number of characters in the code. Default 6. */
  length?: number;
  /** `digits` (default) shows a number keypad on phones; `alphanumeric` allows letters too. */
  characters?: 'digits' | 'alphanumeric';
  /** Current code (controlled). Use with `onValueChange`. */
  value?: string;
  /** Initial code (uncontrolled). */
  defaultValue?: string;
  /** Called with the cleaned-up code whenever it changes. */
  onValueChange?: (value: string) => void;
  /** Called once the code reaches `length` characters, e.g. to submit the form. */
  onComplete?: (code: string) => void;
}

/**
 * An input for verification codes sent by text message or email. It is a single input, so
 * pasting, browser autofill (`autoComplete="one-time-code"`) and screen readers all work.
 * Spaces, dashes and other characters that can't be part of the code are removed as users type.
 */
export const OneTimeCodeField = forwardRef<HTMLInputElement, OneTimeCodeFieldProps>(
  function OneTimeCodeField(
    {
      label,
      hint,
      error,
      hideLabel,
      length = 6,
      characters = 'digits',
      value,
      defaultValue,
      onValueChange,
      onComplete,
      onChange,
      className,
      style,
      id,
      'aria-describedby': describedBy,
      ...rest
    },
    ref,
  ) {
    const ids = useFieldIds({ id, hint, error, describedBy });
    const [code, setCode] = useControllableState(value, defaultValue ?? '', onValueChange);
    const digits = characters === 'digits';

    const clean = (raw: string) =>
      (digits ? raw.replace(/\D/g, '') : raw.replace(/[^a-z\d]/gi, '').toUpperCase()).slice(
        0,
        length,
      );

    return (
      <FieldFrame
        {...{ ids, label, hint, error, hideLabel, className }}
        style={{ '--_length': length, ...style } as CSSProperties}
        size="lg"
        required={rest.required}
        disabled={rest.disabled}
        data-code=""
      >
        <InputControl
          autoComplete="one-time-code"
          inputMode={digits ? 'numeric' : 'text'}
          pattern={digits ? `\\d{${length}}` : `[A-Za-z\\d]{${length}}`}
          autoCapitalize={digits ? 'off' : 'characters'}
          spellCheck={false}
          // No maxLength: a pasted "123-456" must keep all its digits until it is cleaned up.
          {...rest}
          ref={ref}
          ids={ids}
          type="text"
          value={code}
          onChange={(event) => {
            const next = clean(event.target.value);
            setCode(next);
            onChange?.(event);
            if (next.length === length && next !== code) onComplete?.(next);
          }}
        />
      </FieldFrame>
    );
  },
);
