import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../../test/a11y';
import { useEffect } from 'react';
import {
  ToastProvider,
  useToast,
  type ToastApi,
  type ToastOptions,
  type ToastProviderProps,
} from './Toast';

const handle: { api?: ToastApi } = {};
function Capture() {
  const api = useToast();
  useEffect(() => {
    handle.api = api;
  }, [api]);
  return null;
}
function setup(props: Partial<ToastProviderProps> = {}) {
  return render(
    <ToastProvider {...props}>
      <Capture />
    </ToastProvider>,
  );
}
const show = (options: ToastOptions) => {
  let id = '';
  act(() => {
    id = handle.api!.toast(options);
  });
  return id;
};
const list = () => document.querySelector('.dawg-toast-list')!;

describe('ToastProvider and useToast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders an always-present, labelled, polite live region', () => {
    setup();
    expect(screen.getByRole('region', { name: 'Notifications' })).toBeInTheDocument();
    expect(list()).toHaveAttribute('aria-live', 'polite');
    expect(list().children).toHaveLength(0);
  });

  it('shows a toast with its title, description and tone', () => {
    setup();
    show({ title: 'Saved', description: 'Your changes are live.', tone: 'success' });
    const item = screen.getByText('Saved').closest('li')!;
    expect(item).toHaveAttribute('data-tone', 'success');
    expect(item).toHaveTextContent('Your changes are live.');
    expect(item.querySelector('.dawg-toast__icon svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('hides itself after the duration', () => {
    setup({ duration: 3000 });
    show({ title: 'Saved' });
    act(() => void vi.advanceTimersByTime(2999));
    expect(screen.getByText('Saved')).toBeInTheDocument();
    act(() => void vi.advanceTimersByTime(1));
    expect(screen.queryByText('Saved')).toBeNull();
  });

  it('can stay until closed, and closes with its button', () => {
    setup();
    show({ title: 'Upload failed', tone: 'danger', duration: Infinity });
    act(() => void vi.advanceTimersByTime(60_000));
    expect(screen.getByText('Upload failed')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(screen.queryByText('Upload failed')).toBeNull();
  });

  it('pauses while hovered or focused, keeping the time left', () => {
    setup({ duration: 5000 });
    show({ title: 'Saved' });
    const region = screen.getByRole('region');
    act(() => void vi.advanceTimersByTime(4000));
    fireEvent.pointerEnter(region);
    act(() => void vi.advanceTimersByTime(10_000));
    expect(screen.getByText('Saved')).toBeInTheDocument();
    fireEvent.pointerLeave(region);
    act(() => void vi.advanceTimersByTime(999));
    expect(screen.getByText('Saved')).toBeInTheDocument();
    act(() => void vi.advanceTimersByTime(1));
    expect(screen.queryByText('Saved')).toBeNull();

    show({ title: 'Again' });
    act(() => screen.getByRole('button', { name: 'Dismiss' }).focus());
    act(() => void vi.advanceTimersByTime(10_000));
    expect(screen.getByText('Again')).toBeInTheDocument();
  });

  it('pauses while the page is hidden', () => {
    setup({ duration: 1000 });
    show({ title: 'Saved' });
    const state = vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    act(() => void document.dispatchEvent(new Event('visibilitychange')));
    act(() => void vi.advanceTimersByTime(5000));
    expect(screen.getByText('Saved')).toBeInTheDocument();
    state.mockReturnValue('visible');
    act(() => void document.dispatchEvent(new Event('visibilitychange')));
    act(() => void vi.advanceTimersByTime(1000));
    expect(screen.queryByText('Saved')).toBeNull();
  });

  it('runs the action, then closes the toast', () => {
    const undo = vi.fn();
    setup();
    show({ title: 'Archived', action: { label: 'Undo', onClick: undo } });
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
    expect(undo).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Archived')).toBeNull();
  });

  it('moves focus to the next toast when one is closed from the keyboard', () => {
    setup();
    show({ title: 'One', duration: Infinity });
    show({ title: 'Two', duration: Infinity });
    const [first, second] = screen.getAllByRole('button', { name: 'Dismiss' });
    act(() => first!.focus());
    fireEvent.click(first!);
    expect(second).toHaveFocus();
  });

  it('replaces a toast with the same id and restarts its timer', () => {
    setup({ duration: 2000 });
    show({ id: 'upload', title: 'Uploading…' });
    act(() => void vi.advanceTimersByTime(1500));
    show({ id: 'upload', title: 'Uploaded' });
    expect(list().children).toHaveLength(1);
    expect(screen.getByText('Uploaded')).toBeInTheDocument();
    act(() => void vi.advanceTimersByTime(1500));
    expect(screen.getByText('Uploaded')).toBeInTheDocument();
  });

  it('keeps at most `limit` toasts, dropping the oldest, and dismisses all', () => {
    setup({ limit: 2 });
    show({ title: 'A' });
    show({ title: 'B' });
    show({ title: 'C' });
    expect([...list().children].map((li) => li.textContent)).toEqual(['B', 'C']);
    act(() => handle.api!.dismiss());
    expect(list().children).toHaveLength(0);
  });

  it('puts the newest toast nearest the screen edge', () => {
    setup({ position: 'top-center' });
    show({ title: 'Old' });
    show({ title: 'New' });
    expect(list().firstElementChild).toHaveTextContent('New');
    expect(screen.getByRole('region')).toHaveAttribute('data-position', 'top-center');
  });

  it('throws a clear error outside a provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Capture />)).toThrow('useToast must be used inside a <ToastProvider>.');
  });

  it('has no axe violations with toasts showing', async () => {
    vi.useRealTimers();
    const { container } = setup({ label: 'Alerts', closeLabel: 'Close' });
    show({ title: 'Saved', tone: 'success', action: { label: 'View', onClick: () => {} } });
    show({ title: 'Heads up', description: 'Maintenance tonight.', tone: 'warning' });
    expect(await axeViolations(container)).toEqual([]);
  });
});
