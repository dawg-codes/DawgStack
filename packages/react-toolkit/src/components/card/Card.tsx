import { forwardRef, type HTMLAttributes, type Ref } from 'react';
import { cx } from '../../utils/cx';

export type CardVariant = 'basic' | 'bordered' | 'elevated';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps extends HTMLAttributes<HTMLElement> {
  /** `basic`: surface colour only. `bordered` (default): adds a border. `elevated`: adds a shadow. */
  variant?: CardVariant;
  /** Inner spacing; `md` and `lg` grow slightly on wider screens. Default `md`. */
  padding?: CardPadding;
  /**
   * Hover and focus styles for a clickable card. Put one link (or button) inside with
   * `className={cardLinkClassName}`: its click area stretches over the whole card while the
   * card keeps its normal semantics.
   */
  interactive?: boolean;
  /** Element to render. Default `div`. */
  as?: 'div' | 'section' | 'article' | 'aside' | 'li';
}

/** Class for the one link or button that should make an `interactive` card clickable. */
export const cardLinkClassName = 'dawg-card__link';

/** A surface that groups related content. */
export const Card = forwardRef<HTMLElement, CardProps>(function Card(
  { variant = 'bordered', padding = 'md', interactive = false, as = 'div', className, ...rest },
  ref,
) {
  const Tag = as as 'div';
  return (
    <Tag
      {...rest}
      ref={ref as Ref<HTMLDivElement>}
      className={cx('dawg-card', className)}
      data-variant={variant}
      data-padding={padding}
      data-interactive={interactive || undefined}
    />
  );
});

export type CardHeaderProps = HTMLAttributes<HTMLDivElement>;

/** Top row of a card: title on one side, optional actions on the other. Wraps on narrow cards. */
export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(function CardHeader(
  { className, ...rest },
  ref,
) {
  return <div {...rest} ref={ref} className={cx('dawg-card__header', className)} />;
});

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  /** Heading level that fits your page outline. Default `h3`. */
  as?: 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p';
}

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(function CardTitle(
  { as = 'h3', className, ...rest },
  ref,
) {
  const Tag = as as 'h3';
  return <Tag {...rest} ref={ref} className={cx('dawg-card__title', className)} />;
});

export type CardDescriptionProps = HTMLAttributes<HTMLParagraphElement>;

export const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  function CardDescription({ className, ...rest }, ref) {
    return <p {...rest} ref={ref} className={cx('dawg-card__description', className)} />;
  },
);

export type CardFooterProps = HTMLAttributes<HTMLDivElement>;

/** Bottom row for actions; pushed to the bottom of the card and aligned to the end. */
export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(function CardFooter(
  { className, ...rest },
  ref,
) {
  return <div {...rest} ref={ref} className={cx('dawg-card__footer', className)} />;
});
