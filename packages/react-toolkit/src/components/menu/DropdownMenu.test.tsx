import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../../test/a11y';
import { DropdownMenu, type MenuItem } from './DropdownMenu';

function setup(extra: Partial<Parameters<typeof DropdownMenu>[0]> = {}) {
  const calls = { edit: vi.fn(), duplicate: vi.fn(), archive: vi.fn(), remove: vi.fn() };
  const items: MenuItem[] = [
    { label: 'Edit', onSelect: calls.edit },
    { label: 'Duplicate', onSelect: calls.duplicate },
    { label: 'Archive', onSelect: calls.archive, disabled: true },
    'separator',
    { label: 'Delete', onSelect: calls.remove, tone: 'danger' },
  ];
  render(
    <>
      <DropdownMenu label="Actions" items={items} {...extra} />
      <button type="button">After</button>
    </>,
  );
  return calls;
}
const trigger = () => screen.getByRole('button', { name: 'Actions' });

describe('DropdownMenu', () => {
  it('is a menu button that starts closed', () => {
    setup();
    expect(trigger()).toHaveAttribute('aria-haspopup', 'menu');
    expect(trigger()).toHaveAttribute('aria-expanded', 'false');
    expect(trigger()).not.toHaveAttribute('aria-controls');
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('opens on click, labelled by its button, with focus on the first item', async () => {
    setup();
    await userEvent.click(trigger());
    const menu = screen.getByRole('menu', { name: 'Actions' });
    expect(trigger()).toHaveAttribute('aria-expanded', 'true');
    expect(trigger()).toHaveAttribute('aria-controls', menu.id);
    expect(screen.getByRole('menuitem', { name: 'Edit' })).toHaveFocus();
    expect(screen.getAllByRole('menuitem')).toHaveLength(4);
    expect(screen.getByRole('separator')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Archive' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });

  it('opens from the keyboard: ArrowDown to the first item, ArrowUp to the last', async () => {
    setup();
    trigger().focus();
    await userEvent.keyboard('{ArrowUp}');
    expect(screen.getByRole('menuitem', { name: 'Delete' })).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    expect(trigger()).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: 'Edit' })).toHaveFocus();
  });

  it('moves with arrows (wrapping), Home and End, including disabled items', async () => {
    setup();
    await userEvent.click(trigger());
    const item = (name: string) => screen.getByRole('menuitem', { name });
    await userEvent.keyboard('{ArrowDown}');
    expect(item('Duplicate')).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    expect(item('Archive')).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    expect(item('Edit')).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}');
    expect(item('Delete')).toHaveFocus();
    await userEvent.keyboard('{Home}');
    expect(item('Edit')).toHaveFocus();
    await userEvent.keyboard('{End}');
    expect(item('Delete')).toHaveFocus();
  });

  it('finds items by typing their first letters', async () => {
    setup();
    await userEvent.click(trigger());
    await userEvent.keyboard('d');
    expect(screen.getByRole('menuitem', { name: 'Duplicate' })).toHaveFocus();
    await userEvent.keyboard('d');
    expect(screen.getByRole('menuitem', { name: 'Delete' })).toHaveFocus();
    await userEvent.keyboard('a');
    expect(screen.getByRole('menuitem', { name: 'Archive' })).toHaveFocus();
  });

  it('runs an item with Enter or a click, then closes and refocuses the button', async () => {
    const calls = setup();
    await userEvent.click(trigger());
    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(calls.duplicate).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('menu')).toBeNull();
    expect(trigger()).toHaveFocus();

    await userEvent.click(trigger());
    await userEvent.click(screen.getByRole('menuitem', { name: 'Delete' }));
    expect(calls.remove).toHaveBeenCalledTimes(1);
  });

  it('ignores disabled items', async () => {
    const calls = setup();
    await userEvent.click(trigger());
    await userEvent.click(screen.getByRole('menuitem', { name: 'Archive' }));
    expect(calls.archive).not.toHaveBeenCalled();
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('closes on Escape without letting it reach a surrounding dialog', async () => {
    const outer = vi.fn();
    document.addEventListener('keydown', outer);
    setup();
    await userEvent.click(trigger());
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).toBeNull();
    expect(trigger()).toHaveFocus();
    expect(outer).not.toHaveBeenCalled();
    document.removeEventListener('keydown', outer);
  });

  it('closes on Tab, and on a click outside', async () => {
    setup();
    await userEvent.click(trigger());
    await userEvent.tab();
    expect(screen.queryByRole('menu')).toBeNull();
    expect(screen.getByRole('button', { name: 'After' })).toHaveFocus();

    await userEvent.click(trigger());
    await userEvent.click(document.body);
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('toggles closed when its button is clicked again', async () => {
    setup();
    await userEvent.click(trigger());
    await userEvent.click(trigger());
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('renders links, icons, an icon-only button and a forwarded ref', async () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <DropdownMenu
        ref={ref}
        label={<svg data-testid="dots" />}
        iconOnly
        aria-label="More actions"
        variant="ghost"
        items={[{ label: 'Help', href: '/help', icon: <svg data-testid="icon" /> }]}
      />,
    );
    const button = screen.getByRole('button', { name: 'More actions' });
    expect(ref.current).toBe(button);
    expect(button.querySelector('.dawg-button__icon')).toBeNull(); // no arrow when icon-only
    await userEvent.click(button);
    const link = screen.getByRole('menuitem', { name: 'Help' });
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '/help');
    expect(screen.getByTestId('icon').parentElement).toHaveAttribute('aria-hidden', 'true');
  });

  it('positions the menu inside the window', async () => {
    setup({ align: 'end' });
    await userEvent.click(trigger());
    const menu = screen.getByRole('menu');
    await waitFor(() => expect(menu.style.top).toMatch(/px$/));
    expect(menu.dataset.side).toBe('bottom');
  });

  it('has no axe violations, open or closed', async () => {
    setup();
    expect(await axeViolations(document.body)).toEqual([]);
    await userEvent.click(trigger());
    expect(await axeViolations(document.body)).toEqual([]);
  });
});
