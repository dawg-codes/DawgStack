import { forwardRef, useEffect, useRef, useState } from 'react';
import { useMergedRef } from '../../utils/use-merged-ref';
import { FieldFrame, joinIds, useFieldIds } from './Field';
import { EyeIcon, EyeOffIcon } from './icons';
import type { PasswordStrength } from './password-strength';
import { InputControl, type TextFieldProps } from './TextField';

export interface PasswordFieldProps extends Omit<
  TextFieldProps,
  'type' | 'startIcon' | 'endAddon'
> {
  /**
   * Accessible name of the show/hide button. It is a toggle button (`aria-pressed`), so the
   * name stays the same and screen readers announce whether it is on. Default `'Show password'`.
   */
  showLabel?: string;
  /**
   * Shows a strength meter while the user types, e.g. `strength={estimatePasswordStrength}`.
   * Return `null` to hide it. Use it on sign-up and change-password forms, not sign-in.
   */
  strength?: (password: string) => PasswordStrength | null | undefined;
  /** Read by screen readers before the strength label. Default `'Password strength:'`. */
  strengthPrefix?: string;
}

const SEGMENTS = [1, 2, 3, 4];

/**
 * A password input with a show/hide button and an optional strength meter. Defaults to
 * `autoComplete="current-password"`; use `"new-password"` on sign-up forms. The password is
 * hidden again when its form is submitted, so browsers offer to save it.
 */
export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  function PasswordField(
    {
      label,
      hint,
      error,
      hideLabel,
      size = 'md',
      showLabel = 'Show password',
      strength,
      strengthPrefix = 'Password strength:',
      autoComplete = 'current-password',
      onChange,
      className,
      style,
      id,
      'aria-describedby': describedBy,
      ...rest
    },
    forwardedRef,
  ) {
    const [visible, setVisible] = useState(false);
    const [typed, setTyped] = useState(String(rest.defaultValue ?? ''));
    const text = rest.value !== undefined ? String(rest.value) : typed;
    const inner = useRef<HTMLInputElement>(null);
    const ref = useMergedRef(forwardedRef, inner);

    const fieldIds = useFieldIds({ id, hint, error, describedBy });
    const strengthId = strength ? `${fieldIds.inputId}-strength` : undefined;
    const ids = {
      ...fieldIds,
      describedBy: joinIds(describedBy, strengthId, fieldIds.hintId, fieldIds.errorId),
    };
    const result = strength && text ? strength(text) : null;

    useEffect(() => {
      const form = inner.current?.form;
      if (!form) return;
      const hide = () => setVisible(false);
      form.addEventListener('submit', hide);
      return () => form.removeEventListener('submit', hide);
    }, []);

    const meter = strength && (
      <div className="dawg-password-strength" data-score={result?.score}>
        <div className="dawg-password-strength__bar" aria-hidden="true">
          {SEGMENTS.map((n) => (
            <span
              key={n}
              className="dawg-password-strength__segment"
              data-filled={(result && n <= Math.max(1, result.score)) || undefined}
            />
          ))}
        </div>
        {/* Always rendered, so screen readers notice when the text changes. */}
        <p id={strengthId} className="dawg-password-strength__text" aria-live="polite">
          {result && (
            <>
              <span className="dawg-visually-hidden">{strengthPrefix}</span> {result.label}
            </>
          )}
        </p>
      </div>
    );

    return (
      <FieldFrame
        {...{ ids, label, hint, error, hideLabel, size, className, style }}
        required={rest.required}
        disabled={rest.disabled}
        extra={meter}
      >
        <InputControl
          {...rest}
          ref={ref}
          ids={ids}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          autoCapitalize="none"
          spellCheck={false}
          onChange={(event) => {
            setTyped(event.target.value);
            onChange?.(event);
          }}
          action={
            <button
              type="button"
              className="dawg-field__action"
              aria-label={showLabel}
              title={showLabel}
              aria-pressed={visible}
              aria-controls={ids.inputId}
              disabled={rest.disabled}
              onClick={() => setVisible((v) => !v)}
            >
              {visible ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          }
        />
      </FieldFrame>
    );
  },
);
