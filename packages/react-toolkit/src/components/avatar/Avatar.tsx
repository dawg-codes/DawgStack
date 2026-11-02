import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type ImgHTMLAttributes,
  type ReactNode,
} from 'react';
import { cx } from '../../utils/cx';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type AvatarShape = 'circle' | 'square';

export interface AvatarProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** Image URL. If it fails to load, the avatar falls back to initials, then to an icon. */
  src?: string;
  /** Person or entity name: used for the initials and as the accessible name. */
  name?: string;
  /**
   * Accessible name, if different from `name`. Pass `alt=""` to make the avatar decorative
   * (hidden from assistive technology), e.g. when the name is printed right next to it.
   */
  alt?: string;
  /** Default `md`. */
  size?: AvatarSize;
  /** Default `circle`. */
  shape?: AvatarShape;
  /** Content shown when there is no image and no name. Default: a generic person icon. */
  fallback?: ReactNode;
  /** Extra attributes for the <img>, e.g. `referrerPolicy` or `loading`. */
  imgProps?: Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'>;
}

/** Up to two initials: first letter of the first and last words, e.g. "Ada Lovelace" → "AL". */
export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const first = words[0];
  if (!first) return '';
  const last = words.length > 1 ? words[words.length - 1] : undefined;
  // Array.from splits by code point, so letters outside the basic plane stay intact.
  const initial = (word: string | undefined) => (word ? (Array.from(word)[0] ?? '') : '');
  return (initial(first) + initial(last)).toLocaleUpperCase();
}

function PersonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <circle cx="12" cy="8.5" r="4.5" />
      <path d="M3.5 21c0-4.4 3.8-7.5 8.5-7.5s8.5 3.1 8.5 7.5z" />
    </svg>
  );
}

/** A picture, initials or icon that represents a person or entity. */
export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  { src, name, alt, size = 'md', shape = 'circle', fallback, imgProps, className, ...rest },
  ref,
) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const showImage = Boolean(src) && failedSrc !== src;

  // An image that failed before React attached its handlers (e.g. server-rendered HTML)
  // never fires onError here; detect that case once mounted.
  useEffect(() => {
    const img = imgRef.current;
    if (src && img && img.complete && img.naturalWidth === 0) setFailedSrc(src);
  }, [src]);

  const label = alt ?? name;
  const initials = name ? getInitials(name) : '';
  const a11y = label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true as const };

  let content: ReactNode;
  if (showImage) {
    content = (
      <img
        {...imgProps}
        ref={imgRef}
        className="dawg-avatar__image"
        src={src}
        alt=""
        onError={(event) => {
          setFailedSrc(src ?? null);
          imgProps?.onError?.(event);
        }}
      />
    );
  } else if (initials) {
    content = (
      <span className="dawg-avatar__initials" aria-hidden="true">
        {initials}
      </span>
    );
  } else {
    content = (
      <span className="dawg-avatar__fallback" aria-hidden="true">
        {fallback ?? <PersonIcon />}
      </span>
    );
  }

  return (
    <span
      {...a11y}
      {...rest}
      ref={ref}
      className={cx('dawg-avatar', className)}
      data-size={size}
      data-shape={shape}
      data-state={showImage ? 'image' : initials ? 'initials' : 'fallback'}
    >
      {content}
    </span>
  );
});
