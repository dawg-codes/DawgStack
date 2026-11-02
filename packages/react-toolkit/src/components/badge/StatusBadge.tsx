import { forwardRef, type ForwardedRef, type ReactElement, type ReactNode, type Ref } from 'react';
import { Badge, type BadgeProps, type BadgeTone } from './Badge';

/** How one status value is displayed. */
export interface StatusDefinition {
  label: ReactNode;
  /** Default `neutral`. */
  tone?: BadgeTone;
  icon?: ReactNode;
  dot?: boolean | 'pulse';
}

/** Every status value your data can have, mapped to how it is displayed. */
export type StatusMap<S extends string> = Record<S, StatusDefinition>;

export interface StatusBadgeProps<S extends string> extends Omit<
  BadgeProps,
  'tone' | 'icon' | 'dot' | 'children'
> {
  /** The current status value, e.g. from your API. */
  status: S;
  /** Display definitions for each status value. */
  statuses: StatusMap<S>;
  /**
   * Used when `status` is not in `statuses` (e.g. a new value from the server).
   * Default: a neutral badge showing the raw status text.
   */
  fallback?: StatusDefinition;
}

function resolve<S extends string>(
  status: S,
  statuses: StatusMap<S>,
  fallback?: StatusDefinition,
): StatusDefinition {
  // Own keys only, so values like "constructor" never resolve to Object.prototype members.
  if (Object.prototype.hasOwnProperty.call(statuses, status)) return statuses[status];
  return fallback ?? { label: String(status), tone: 'neutral' };
}

function StatusBadgeInner<S extends string>(
  { status, statuses, fallback, ...rest }: StatusBadgeProps<S>,
  ref: ForwardedRef<HTMLSpanElement>,
) {
  const def = resolve(status, statuses, fallback);
  return (
    <Badge
      {...rest}
      ref={ref}
      tone={def.tone ?? 'neutral'}
      icon={def.icon}
      dot={def.dot}
      data-status={status}
    >
      {def.label}
    </Badge>
  );
}

/** A Badge whose label and tone come from a status map you define. */
export const StatusBadge = forwardRef(StatusBadgeInner) as <S extends string>(
  props: StatusBadgeProps<S> & { ref?: Ref<HTMLSpanElement> },
) => ReactElement | null;

/**
 * Creates a reusable, typed status badge for one set of statuses:
 * `const OrderStatus = createStatusBadge({ paid: { label: 'Paid', tone: 'success' }, ... })`
 * then `<OrderStatus status="paid" />`.
 */
export function createStatusBadge<S extends string>(
  statuses: StatusMap<S>,
  options: { fallback?: StatusDefinition; displayName?: string } = {},
) {
  const Bound = forwardRef<HTMLSpanElement, Omit<StatusBadgeProps<S>, 'statuses' | 'fallback'>>(
    function BoundStatusBadge(props, ref) {
      return <StatusBadge {...props} ref={ref} statuses={statuses} fallback={options.fallback} />;
    },
  );
  Bound.displayName = options.displayName ?? 'StatusBadge';
  return Bound;
}
