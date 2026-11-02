import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from 'react';

export type ToastTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';
export type ToastPosition =
  'top-start' | 'top-center' | 'top-end' | 'bottom-start' | 'bottom-center' | 'bottom-end';

export interface ToastOptions {
  title: ReactNode;
  description?: ReactNode;
  /** Default `neutral`. */
  tone?: ToastTone;
  /**
   * A button in the toast, e.g. Undo. Toasts disappear, so whatever it does must also be
   * possible somewhere else in your app.
   */
  action?: { label: string; onClick: () => void };
  /** Milliseconds before it hides itself, or `Infinity` to stay until closed. */
  duration?: number;
  /** Reuse an id to replace a toast that is still showing instead of adding another. */
  id?: string;
}

interface ToastEntry extends ToastOptions {
  id: string;
  /** Changes when a toast is replaced, so it restarts its timer and is announced again. */
  key: number;
}

export interface ToastApi {
  /** Shows a toast and returns its id. */
  toast: (options: ToastOptions) => string;
  /** Hides one toast, or all of them when no id is given. */
  dismiss: (id?: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

/** Shows toasts from anywhere inside a ToastProvider. */
export function useToast(): ToastApi {
  const api = useContext(ToastContext);
  if (!api) throw new Error('useToast must be used inside a <ToastProvider>.');
  return api;
}

export interface ToastProviderProps {
  children?: ReactNode;
  /** Where toasts appear. Default `bottom-end`. */
  position?: ToastPosition;
  /** Default time on screen in milliseconds. Default 5000. */
  duration?: number;
  /** How many toasts can show at once; older ones are removed first. Default 4. */
  limit?: number;
  /** Accessible name of the notifications area. Default `'Notifications'`. */
  label?: string;
  /** Accessible name of each toast's close button. Default `'Dismiss'`. */
  closeLabel?: string;
}

const svg = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  focusable: false,
};
const ICONS: Record<ToastTone, ReactNode> = {
  neutral: null,
  info: (
    <svg {...svg}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5.5M12 7.5v.01" />
    </svg>
  ),
  success: (
    <svg {...svg}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.5l2.5 2.5L16 9.5" />
    </svg>
  ),
  warning: (
    <svg {...svg}>
      <path d="M12 3.5 2.5 20h19L12 3.5Z" />
      <path d="M12 10v4.5M12 17.5v.01" />
    </svg>
  ),
  danger: (
    <svg {...svg}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v5.5M12 16.5v.01" />
    </svg>
  ),
};

let counter = 0;

/**
 * Holds the toasts and the area they appear in. Put it once near the root of your app (inside
 * ThemeProvider, if you use it), then call `useToast().toast(...)` anywhere below it.
 *
 * Toasts are announced politely by screen readers, pause while the pointer or keyboard focus
 * is on them or the page is hidden, and can always be closed with their close button.
 */
export function ToastProvider({
  children,
  position = 'bottom-end',
  duration = 5000,
  limit = 4,
  label = 'Notifications',
  closeLabel = 'Dismiss',
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(false);
  const region = useRef<HTMLElement>(null);

  const dismiss = useCallback((id?: string) => {
    setToasts((list) => (id === undefined ? [] : list.filter((t) => t.id !== id)));
  }, []);

  const toast = useCallback(
    (options: ToastOptions) => {
      counter += 1;
      const id = options.id ?? `dawg-toast-${counter}`;
      const key = counter;
      setToasts((list) => {
        const rest = list.filter((t) => t.id !== id);
        return [...rest, { ...options, id, key }].slice(-Math.max(1, limit));
      });
      // Re-check the pause state: the toast under the pointer or focus may have gone since.
      const node = region.current;
      if (node) {
        setHovered(node.matches(':hover'));
        setFocused(node.contains(document.activeElement));
      }
      return id;
    },
    [limit],
  );

  useEffect(() => {
    const update = () => setHidden(document.visibilityState === 'hidden');
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);

  const api = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);
  const paused = hovered || focused || hidden;
  // Newest nearest the edge of the screen the toasts come from.
  const ordered = position.startsWith('top') ? [...toasts].reverse() : toasts;

  return (
    <ToastContext.Provider value={api}>
      {children}
      <section
        ref={region}
        className="dawg-toast-region"
        data-position={position}
        aria-label={label}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onFocus={() => setFocused(true)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false);
        }}
      >
        {/* Always rendered (even when empty), so screen readers announce new toasts. */}
        <ol className="dawg-toast-list" aria-live="polite">
          {ordered.map((t) => (
            <ToastItem
              key={t.key}
              toast={t}
              duration={t.duration ?? duration}
              paused={paused}
              closeLabel={closeLabel}
              onDismiss={dismiss}
            />
          ))}
        </ol>
      </section>
    </ToastContext.Provider>
  );
}

function ToastItem({
  toast,
  duration,
  paused,
  closeLabel,
  onDismiss,
}: {
  toast: ToastEntry;
  duration: number;
  paused: boolean;
  closeLabel: string;
  onDismiss: (id: string) => void;
}) {
  const tone = toast.tone ?? 'neutral';
  const remaining = useRef(duration);

  // Closing a toast from the keyboard moves focus to a neighbouring toast, not to the page.
  const close = (event: MouseEvent<HTMLButtonElement>) => {
    const item = event.currentTarget.closest('li');
    const neighbour = item?.nextElementSibling ?? item?.previousElementSibling;
    if (item?.contains(document.activeElement)) {
      neighbour?.querySelector<HTMLElement>('.dawg-toast__close')?.focus();
    }
    onDismiss(toast.id);
  };

  // Count down only while not paused; a pause keeps the time that was left.
  useEffect(() => {
    if (paused || !Number.isFinite(duration)) return;
    const started = Date.now();
    const timer = setTimeout(() => onDismiss(toast.id), remaining.current);
    return () => {
      clearTimeout(timer);
      remaining.current -= Date.now() - started;
    };
  }, [paused, duration, onDismiss, toast.id]);

  return (
    <li className="dawg-toast" data-tone={tone}>
      {ICONS[tone] && <span className="dawg-toast__icon">{ICONS[tone]}</span>}
      <div className="dawg-toast__body">
        <p className="dawg-toast__title">{toast.title}</p>
        {toast.description && <p className="dawg-toast__description">{toast.description}</p>}
      </div>
      {toast.action && (
        <button
          type="button"
          className="dawg-toast__action"
          onClick={(event) => {
            toast.action!.onClick();
            close(event);
          }}
        >
          {toast.action.label}
        </button>
      )}
      <button
        type="button"
        className="dawg-toast__close"
        aria-label={closeLabel}
        title={closeLabel}
        onClick={close}
      >
        <svg {...svg}>
          <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />
        </svg>
      </button>
    </li>
  );
}
