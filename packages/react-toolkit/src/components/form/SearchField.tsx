import { forwardRef, useRef, type KeyboardEvent } from 'react';
import { useControllableState } from '../../utils/use-controllable-state';
import { useMergedRef } from '../../utils/use-merged-ref';
import { FieldFrame, useFieldIds } from './Field';
import { ClearIcon, SearchIcon } from './icons';
import { InputControl, type TextFieldProps } from './TextField';

export interface SearchFieldProps extends Omit<
  TextFieldProps,
  'type' | 'value' | 'defaultValue' | 'startIcon' | 'endAddon'
> {
  /** Current text (controlled). Use with `onValueChange`. */
  value?: string;
  /** Initial text (uncontrolled). */
  defaultValue?: string;
  /** Called with the new text when the user types, clears the field or presses Escape. */
  onValueChange?: (value: string) => void;
  /** Accessible name of the clear button. Default `'Clear search'`. */
  clearLabel?: string;
}

/**
 * A search input with a clear button. Escape also clears it. Pass `hideLabel` when the
 * surrounding design makes the purpose obvious; the label is still read by screen readers.
 */
export const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(function SearchField(
  {
    label,
    hint,
    error,
    hideLabel,
    size = 'md',
    value,
    defaultValue,
    onValueChange,
    onChange,
    onKeyDown,
    clearLabel = 'Clear search',
    className,
    style,
    id,
    'aria-describedby': describedBy,
    ...rest
  },
  forwardedRef,
) {
  const ids = useFieldIds({ id, hint, error, describedBy });
  const [text, setText] = useControllableState(value, defaultValue ?? '', onValueChange);
  const inner = useRef<HTMLInputElement>(null);
  const ref = useMergedRef(forwardedRef, inner);

  const clear = () => {
    setText('');
    inner.current?.focus();
  };
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    // Clear on Escape, but let it reach a surrounding dialog when there is nothing to clear.
    if (event.key === 'Escape' && text !== '') {
      event.preventDefault();
      event.stopPropagation();
      setText('');
    }
  };

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
        type="search"
        value={text}
        onChange={(event) => {
          setText(event.target.value);
          onChange?.(event);
        }}
        onKeyDown={handleKeyDown}
        startIcon={<SearchIcon />}
        action={
          text !== '' &&
          !rest.disabled &&
          !rest.readOnly && (
            <button
              type="button"
              className="dawg-field__action"
              aria-label={clearLabel}
              title={clearLabel}
              onClick={clear}
            >
              <ClearIcon />
            </button>
          )
        }
      />
    </FieldFrame>
  );
});
