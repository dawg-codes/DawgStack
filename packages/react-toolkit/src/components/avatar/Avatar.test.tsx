import { fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../../test/a11y';
import { Avatar, getInitials } from './Avatar';

describe('getInitials', () => {
  it.each([
    ['Ada Lovelace', 'AL'],
    ['Grace Brewster Murray Hopper', 'GH'],
    ['  linus   ', 'L'],
    ['émile zola', 'ÉZ'],
    ['李小龙', '李'],
    ['', ''],
    ['   ', ''],
  ])('%j → %j', (name, expected) => {
    expect(getInitials(name)).toBe(expected);
  });
});

describe('Avatar', () => {
  it('shows initials and is named for assistive technology', () => {
    render(<Avatar name="Ada Lovelace" />);
    const avatar = screen.getByRole('img', { name: 'Ada Lovelace' });
    expect(avatar).toHaveTextContent('AL');
    expect(avatar).toHaveAttribute('data-state', 'initials');
    expect(avatar).toHaveAttribute('data-size', 'md');
    expect(avatar).toHaveAttribute('data-shape', 'circle');
  });

  it('shows the image inside a single named element', () => {
    render(<Avatar src="/ada.png" name="Ada Lovelace" />);
    const avatar = screen.getByRole('img', { name: 'Ada Lovelace' });
    const img = avatar.querySelector('img')!;
    expect(img).toHaveAttribute('src', '/ada.png');
    expect(img).toHaveAttribute('alt', '');
    expect(avatar).toHaveAttribute('data-state', 'image');
  });

  it('falls back to initials when the image fails, and retries when src changes', () => {
    const onError = vi.fn();
    const { rerender } = render(
      <Avatar src="/broken.png" name="Ada Lovelace" imgProps={{ onError }} />,
    );
    fireEvent.error(screen.getByRole('img').querySelector('img')!);
    const avatar = screen.getByRole('img', { name: 'Ada Lovelace' });
    expect(avatar.querySelector('img')).toBeNull();
    expect(avatar).toHaveTextContent('AL');
    expect(onError).toHaveBeenCalledTimes(1);

    rerender(<Avatar src="/fixed.png" name="Ada Lovelace" imgProps={{ onError }} />);
    expect(screen.getByRole('img').querySelector('img')).toHaveAttribute('src', '/fixed.png');
  });

  it('shows a generic icon and stays hidden when there is no name', () => {
    const { container } = render(<Avatar />);
    const avatar = container.firstElementChild!;
    expect(avatar).toHaveAttribute('aria-hidden', 'true');
    expect(avatar).toHaveAttribute('data-state', 'fallback');
    expect(avatar.querySelector('svg')).not.toBeNull();
    expect(screen.queryByRole('img')).toBeNull();
  });

  it('uses a custom fallback when provided', () => {
    render(<Avatar alt="Team" fallback={<span data-testid="custom">★</span>} />);
    expect(screen.getByRole('img', { name: 'Team' })).toContainElement(
      screen.getByTestId('custom'),
    );
  });

  it('prefers alt over name for the accessible name, and alt="" makes it decorative', () => {
    const { rerender, container } = render(<Avatar name="Ada Lovelace" alt="Profile of Ada" />);
    expect(screen.getByRole('img', { name: 'Profile of Ada' })).toHaveTextContent('AL');
    rerender(<Avatar name="Ada Lovelace" alt="" />);
    expect(screen.queryByRole('img')).toBeNull();
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
    expect(container.firstElementChild).toHaveTextContent('AL');
  });

  it('forwards refs, size, shape and image attributes', () => {
    const ref = createRef<HTMLSpanElement>();
    render(
      <Avatar
        ref={ref}
        src="/a.png"
        name="A B"
        size="xl"
        shape="square"
        className="mine"
        imgProps={{ referrerPolicy: 'no-referrer', loading: 'lazy' }}
      />,
    );
    expect(ref.current).toHaveClass('dawg-avatar', 'mine');
    expect(ref.current).toHaveAttribute('data-size', 'xl');
    expect(ref.current).toHaveAttribute('data-shape', 'square');
    const img = ref.current!.querySelector('img')!;
    expect(img).toHaveAttribute('referrerpolicy', 'no-referrer');
    expect(img).toHaveAttribute('loading', 'lazy');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <div>
        <Avatar name="Ada Lovelace" />
        <Avatar src="/a.png" name="Grace Hopper" />
        <Avatar />
        <span>
          <Avatar name="Linus" alt="" /> Linus
        </span>
      </div>,
    );
    expect(await axeViolations(container)).toEqual([]);
  });
});
