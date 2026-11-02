import { forwardRef, type CSSProperties, type TextareaHTMLAttributes } from 'react';
import { FieldFrame, useFieldIds, type FieldProps } from './Field';

export interface TextAreaProps extends FieldProps, TextareaHTMLAttributes<HTMLTextAreaElement> {
  /**
   * Grow with the text instead of scrolling, starting at `rows` lines. Uses CSS
   * `field-sizing`; browsers without it keep a fixed height that users can resize.
   */
  autoGrow?: boolean;
}

/** A labelled multi-line text input. The ref and textarea attributes go to the `<textarea>`. */
export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  {
    label,
    hint,
    error,
    hideLabel,
    autoGrow = false,
    rows = 3,
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
    <FieldFrame
      {...{ ids, label, hint, error, hideLabel, className, style }}
      required={rest.required}
      disabled={rest.disabled}
    >
      <div className="dawg-field__control" data-multiline="">
        <textarea
          {...rest}
          ref={ref}
          id={ids.inputId}
          rows={rows}
          className="dawg-field__input"
          data-auto-grow={autoGrow || undefined}
          style={{ '--_rows': rows } as CSSProperties}
          aria-describedby={ids.describedBy}
          aria-invalid={ids.invalid ? true : ariaInvalid}
        />
      </div>
    </FieldFrame>
  );
});
