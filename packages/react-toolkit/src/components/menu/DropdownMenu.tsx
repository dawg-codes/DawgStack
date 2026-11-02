import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { Button, type ButtonStyleOptions } from '../button/Button';
import { cx } from '../../utils/cx';
import { useBeforePaint } from '../../utils/use-before-paint';

export interface MenuAction {
  label: ReactNode;
  /** Called when the item is chosen. The menu closes and focus returns to its button first. */
  onSelect?: () => void;
  /** Makes the item a link. */
  href?: string;
  /** Decorative icon before the label (hidden from assistive technology). */
  icon?: ReactNode;
  /** `danger` for destructive actions such as Delete. */
  tone?: 'default' | 'danger';
  disabled?: boolean;
  /** Text used for type-to-select when `label` isn't plain text. */
  textValue?: string;
}

/** A menu entry, or `'separator'` for a dividing line between groups. */
export type MenuItem = MenuAction | 'separator';

export interface DropdownMenuProps extends ButtonStyleOptions {
  /** Content of the menu button. With `iconOnly`, also pass `aria-label`. */
  label: ReactNode;
  items: readonly MenuItem[];
  /** Line the menu up with the start (default) or end edge of the button. */
  align?: 'start' | 'end';
  /** Accessible name of the button, required when `label` is only an icon. */
  'aria-label'?: string;
  /** Show a down arrow after the label. Default true unless `iconOnly`. */
  showArrow?: boolean;
  disabled?: boolean;
  className?: string;
  /** Class for the menu panel. */
  menuClassName?: string;
}

const ChevronIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M6 9l6 6 6-6" />
  </svg>
);

const GAP = 4;
const EDGE = 8;

function itemText(item: MenuAction): string {
  if (item.textValue) return item.textValue;
  return typeof item.label === 'string' || typeof item.label === 'number' ? String(item.label) : '';
}

/**
 * A button that opens a list of actions (the ARIA menu button pattern). Arrow keys move
 * between items, Home and End jump, typing a letter finds an item, and Escape closes the menu
 * and returns focus to the button. The menu is positioned against the window, so it isn't cut
 * off by containers that hide overflow, such as scrolling tables.
 */
export const DropdownMenu = forwardRef<HTMLButtonElement, DropdownMenuProps>(function DropdownMenu(
  {
    label,
    items,
    align = 'start',
    variant,
    size,
    fullWidth,
    iconOnly,
    showArrow = !iconOnly,
    disabled,
    className,
    menuClassName,
    'aria-label': ariaLabel,
  },
  ref,
) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const buttonId = `${id}-button`;
  const menuId = `${id}-menu`;
  const wrapper = useRef<HTMLDivElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const focusOnOpen = useRef<'first' | 'last'>('first');
  const typed = useRef({ text: '', at: 0 });

  const button = () => wrapper.current?.querySelector<HTMLButtonElement>(`.dawg-menu__button`);
  // Disabled items stay reachable with the arrow keys, so users can find them.
  const menuItems = () => [
    ...(menu.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []),
  ];

  const close = useCallback((returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) button()?.focus();
  }, []);

  // Place the menu under the button (or above it when there's more room there), kept
  // inside the window, flipping start and end for right-to-left pages.
  const place = useCallback(() => {
    const trigger = button();
    const panel = menu.current;
    if (!trigger || !panel) return;
    const t = trigger.getBoundingClientRect();
    const width = panel.offsetWidth;
    const height = panel.offsetHeight;
    const rtl = getComputedStyle(trigger).direction === 'rtl';
    const fromRight = (align === 'end') !== rtl;
    let left = fromRight ? t.right - width : t.left;
    left = Math.max(EDGE, Math.min(left, window.innerWidth - width - EDGE));
    const below = window.innerHeight - t.bottom;
    const above = t.top;
    const up = below < height + GAP + EDGE && above > below;
    const top = up ? Math.max(EDGE, t.top - GAP - height) : t.bottom + GAP;
    const maxHeight = Math.max(120, (up ? above : below) - GAP - EDGE);
    // Set directly on the element: it runs on every scroll, and needs no re-render.
    Object.assign(panel.style, { top: `${top}px`, left: `${left}px`, maxHeight: `${maxHeight}px` });
    panel.dataset.side = up ? 'top' : 'bottom';
  }, [align]);

  useBeforePaint(() => {
    if (!open) return;
    place();
    const items = menuItems();
    items[focusOnOpen.current === 'last' ? items.length - 1 : 0]?.focus();
  }, [open, place]);

  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (!wrapper.current?.contains(event.target as Node)) close(false);
    };
    let frame = 0;
    const follow = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(place);
    };
    document.addEventListener('pointerdown', outside);
    window.addEventListener('resize', follow);
    window.addEventListener('scroll', follow, true);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('pointerdown', outside);
      window.removeEventListener('resize', follow);
      window.removeEventListener('scroll', follow, true);
    };
  }, [open, close, place]);

  const openWith = (focus: 'first' | 'last') => {
    focusOnOpen.current = focus;
    setOpen(true);
  };

  const onButtonKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      openWith(event.key === 'ArrowDown' ? 'first' : 'last');
    }
  };

  const onMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const list = menuItems();
    const index = list.indexOf(document.activeElement as HTMLElement);
    const move = (to: number) => {
      event.preventDefault();
      list[(to + list.length) % list.length]?.focus();
    };
    switch (event.key) {
      case 'ArrowDown':
        return move(index + 1);
      case 'ArrowUp':
        return move(index - 1);
      case 'Home':
        return move(0);
      case 'End':
        return move(list.length - 1);
      case 'Escape':
        event.preventDefault();
        event.stopPropagation(); // don't also close a dialog around the menu
        return close(true);
      case 'Tab':
        // Close and let Tab carry on from the button to the next control.
        return close(true);
      case ' ':
        // Space activates links too, like buttons.
        if (document.activeElement?.tagName === 'A') {
          event.preventDefault();
          (document.activeElement as HTMLElement).click();
        }
        return;
      default:
        if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
          const now = Date.now();
          const state = typed.current;
          state.text = (now - state.at > 600 ? '' : state.text) + event.key.toLowerCase();
          state.at = now;
          const texts = list.map((el) => (el.dataset.text ?? '').toLowerCase());
          // Pressing the same letter again moves on to the next item that starts with it.
          // If the typed letters match nothing, start again from the last one.
          const repeated = [...state.text].every((c) => c === state.text[0]);
          const searches = repeated ? [state.text[0]!] : [state.text, event.key.toLowerCase()];
          for (const search of searches) {
            const start = search.length === 1 ? index + 1 : index;
            for (let i = 0; i < list.length; i += 1) {
              const at = (start + i) % list.length;
              if (texts[at]!.startsWith(search)) {
                state.text = search;
                return move(at);
              }
            }
          }
        }
    }
  };

  const select = (item: MenuAction) => {
    if (item.disabled) return;
    close(true);
    item.onSelect?.();
  };

  return (
    <div ref={wrapper} className={cx('dawg-menu', className)} data-open={open || undefined}>
      <Button
        ref={ref}
        id={buttonId}
        className="dawg-menu__button"
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        iconOnly={iconOnly}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => (open ? close(false) : openWith('first'))}
        onKeyDown={onButtonKeyDown}
        endIcon={showArrow ? <ChevronIcon /> : undefined}
      >
        {label}
      </Button>
      {open && (
        <div
          ref={menu}
          id={menuId}
          role="menu"
          aria-labelledby={buttonId}
          className={cx('dawg-menu__list', menuClassName)}
          tabIndex={-1}
          onKeyDown={onMenuKeyDown}
        >
          {items.map((item, index) => {
            if (item === 'separator') {
              return <div key={index} role="separator" className="dawg-menu__separator" />;
            }
            const content = (
              <>
                {item.icon && (
                  <span className="dawg-menu__icon" aria-hidden="true">
                    {item.icon}
                  </span>
                )}
                <span className="dawg-menu__label">{item.label}</span>
              </>
            );
            const shared = {
              role: 'menuitem',
              tabIndex: -1,
              className: 'dawg-menu__item',
              'data-tone': item.tone === 'danger' ? 'danger' : undefined,
              'data-text': itemText(item),
              'aria-disabled': item.disabled || undefined,
            } as const;
            return item.href && !item.disabled ? (
              <a key={index} {...shared} href={item.href} onClick={() => select(item)}>
                {content}
              </a>
            ) : (
              <button key={index} {...shared} type="button" onClick={() => select(item)}>
                {content}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
});
