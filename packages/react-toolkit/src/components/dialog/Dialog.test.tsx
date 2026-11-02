import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../../test/a11y';
import { pressEscapeIn } from '../../../test/dialog';
import { ConfirmDialog } from './ConfirmDialog';
import { Dialog } from './Dialog';

function Harness({ dismissible = true }: { dismissible?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Edit profile
      </button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Edit profile"
        description="Changes are saved to your account."
        dismissible={dismissible}
        footer={
          <button type="button" onClick={() => setOpen(false)}>
            Save
          </button>
        }
      >
        <label>
          Name <input />
        </label>
      </Dialog>
    </>
  );
}

const dialog = () => document.querySelector('dialog')!;

describe('Dialog', () => {
  it('stays closed and out of the accessibility tree until opened', () => {
    render(<Harness />);
    expect(dialog()).not.toHaveAttribute('open');
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('opens as a labelled, described modal and moves focus inside', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: 'Edit profile' }));
    const el = screen.getByRole('dialog', { name: 'Edit profile' });
    expect(el).toHaveAttribute('open');
    expect(el).toHaveAccessibleDescription('Changes are saved to your account.');
    expect(el.contains(document.activeElement)).toBe(true);
    expect(screen.getByRole('heading', { level: 2, name: 'Edit profile' })).toBeInTheDocument();
  });

  it('closes with the close button and returns focus to the opener', async () => {
    render(<Harness />);
    const opener = screen.getByRole('button', { name: 'Edit profile' });
    await userEvent.click(opener);
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(dialog()).not.toHaveAttribute('open');
    await waitFor(() => expect(opener).toHaveFocus());
  });

  it('closes on Escape when dismissible', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: 'Edit profile' }));
    act(() => pressEscapeIn(dialog()));
    expect(dialog()).not.toHaveAttribute('open');
  });

  it('ignores Escape and backdrop clicks, and hides the close button, when not dismissible', async () => {
    render(<Harness dismissible={false} />);
    await userEvent.click(screen.getByRole('button', { name: 'Edit profile' }));
    act(() => pressEscapeIn(dialog()));
    await userEvent.click(dialog());
    expect(dialog()).toHaveAttribute('open');
    expect(screen.queryByRole('button', { name: 'Close' })).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(dialog()).not.toHaveAttribute('open');
  });

  it('closes on a backdrop click, but not on clicks inside or drags that end outside', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: 'Edit profile' }));
    await userEvent.click(screen.getByRole('textbox'));
    expect(dialog()).toHaveAttribute('open');
    // Press inside the panel, release on the backdrop (e.g. selecting text).
    const user = userEvent.setup();
    await user.pointer([
      { keys: '[MouseLeft>]', target: screen.getByRole('textbox') },
      { keys: '[/MouseLeft]', target: dialog() },
    ]);
    expect(dialog()).toHaveAttribute('open');
    await userEvent.click(dialog());
    expect(dialog()).not.toHaveAttribute('open');
  });

  it('tells the parent when the browser closes it by itself', async () => {
    const onClose = vi.fn();
    render(<Dialog open onClose={onClose} title="T" />);
    act(() => dialog().close());
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });

  it('focuses initialFocus, supports sizes and forwards its ref', () => {
    function WithFocus() {
      const second = useRef<HTMLButtonElement>(null);
      return (
        <Dialog open onClose={() => {}} title="T" size="lg" initialFocus={second}>
          <button type="button">First</button>
          <button type="button" ref={second}>
            Second
          </button>
        </Dialog>
      );
    }
    render(<WithFocus />);
    expect(screen.getByRole('button', { name: 'Second' })).toHaveFocus();
    expect(dialog()).toHaveAttribute('data-size', 'lg');

    const ref = createRef<HTMLDialogElement>();
    render(<Dialog ref={ref} open={false} onClose={() => {}} title="Ref" />);
    expect(ref.current?.tagName).toBe('DIALOG');
  });

  it('restores focus when it is unmounted while open', async () => {
    function Toggle() {
      const [show, setShow] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setShow(true)}>
            Open
          </button>
          {show && (
            <Dialog open onClose={() => {}} title="T">
              <button type="button" onClick={() => setShow(false)}>
                Remove
              </button>
            </Dialog>
          )}
        </>
      );
    }
    render(<Toggle />);
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(document.querySelector('dialog')!.contains(document.activeElement)).toBe(true);
    await userEvent.click(screen.getByRole('button', { name: 'Remove' }));
    expect(document.querySelector('dialog')).toBeNull();
    expect(screen.getByRole('button', { name: 'Open' })).toHaveFocus();
  });

  it('has no axe violations when open', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: 'Edit profile' }));
    expect(await axeViolations(document.body)).toEqual([]);
  });
});

describe('ConfirmDialog', () => {
  it('is an alertdialog that focuses Cancel first for dangerous actions', () => {
    render(
      <ConfirmDialog
        open
        title="Delete project?"
        description="This can't be undone."
        confirmLabel="Delete project"
        tone="danger"
        onConfirm={() => {}}
        onCancel={() => {}}
      />,
    );
    expect(
      screen.getByRole('alertdialog', { name: 'Delete project?' }),
    ).toHaveAccessibleDescription("This can't be undone.");
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();
    expect(screen.getByRole('button', { name: 'Delete project' })).toHaveAttribute(
      'data-variant',
      'danger',
    );
    expect(screen.queryByRole('button', { name: 'Close' })).toBeNull();
  });

  it('focuses the confirm button first for ordinary actions', () => {
    render(<ConfirmDialog open title="Publish?" onConfirm={() => {}} onCancel={() => {}} />);
    expect(screen.getByRole('button', { name: 'Confirm' })).toHaveFocus();
  });

  it('calls onConfirm and onCancel, including on Escape', async () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(<ConfirmDialog open title="Publish?" onConfirm={onConfirm} onCancel={onCancel} />);
    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    act(() => pressEscapeIn(dialog()));
    expect(onCancel).toHaveBeenCalledTimes(2);
  });

  it('cannot be dismissed while loading', async () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(<ConfirmDialog open loading title="Saving" onConfirm={onConfirm} onCancel={onCancel} />);
    act(() => pressEscapeIn(dialog()));
    expect(onCancel).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    const confirm = screen.getByRole('button', { name: 'Confirm' });
    expect(confirm).toHaveAttribute('aria-busy', 'true');
    await userEvent.click(confirm);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('has no axe violations', async () => {
    render(
      <ConfirmDialog
        open
        title="Sign out?"
        tone="danger"
        onConfirm={() => {}}
        onCancel={() => {}}
      />,
    );
    expect(await axeViolations(document.body)).toEqual([]);
  });
});
