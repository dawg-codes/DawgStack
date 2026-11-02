import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../../test/a11y';
import { OneTimeCodeField } from './OneTimeCodeField';
import { PasswordField } from './PasswordField';
import { estimatePasswordStrength } from './password-strength';
import { SearchField } from './SearchField';

describe('SearchField', () => {
  it('is a labelled search box with a clear button that appears when there is text', async () => {
    const ref = createRef<HTMLInputElement>();
    const onValueChange = vi.fn();
    render(<SearchField ref={ref} label="Search users" onValueChange={onValueChange} />);
    const input = screen.getByRole('searchbox', { name: 'Search users' });
    expect(ref.current).toBe(input);
    expect(screen.queryByRole('button', { name: 'Clear search' })).toBeNull();

    await userEvent.type(input, 'ana');
    expect(onValueChange).toHaveBeenLastCalledWith('ana');
    await userEvent.click(screen.getByRole('button', { name: 'Clear search' }));
    expect(input).toHaveValue('');
    expect(onValueChange).toHaveBeenLastCalledWith('');
    expect(input).toHaveFocus();
    expect(screen.queryByRole('button', { name: 'Clear search' })).toBeNull();
  });

  it('clears on Escape, and lets Escape through when already empty', async () => {
    // E.g. a dialog around the field, which should only close once the field is empty.
    const outer = vi.fn((event: KeyboardEvent) => event.key === 'Escape');
    document.addEventListener('keydown', outer);
    render(<SearchField label="Search" defaultValue="report" />);
    const input = screen.getByRole('searchbox');
    input.focus();
    await userEvent.keyboard('{Escape}');
    expect(input).toHaveValue('');
    expect(outer).not.toHaveBeenCalled();
    await userEvent.keyboard('{Escape}');
    expect(outer).toHaveBeenCalledTimes(1);
    document.removeEventListener('keydown', outer);
  });

  it('works controlled and still calls a native onChange', async () => {
    const onChange = vi.fn();
    function Controlled() {
      const [q, setQ] = useState('');
      return <SearchField label="Search" value={q} onValueChange={setQ} onChange={onChange} />;
    }
    render(<Controlled />);
    await userEvent.type(screen.getByRole('searchbox'), 'ab');
    expect(screen.getByRole('searchbox')).toHaveValue('ab');
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it('uses a custom clear label and hides the button when disabled', () => {
    const { rerender } = render(
      <SearchField label="Buscar" defaultValue="x" clearLabel="Borrar" />,
    );
    expect(screen.getByRole('button', { name: 'Borrar' })).toHaveAttribute('type', 'button');
    rerender(<SearchField label="Buscar" defaultValue="x" clearLabel="Borrar" disabled />);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <search>
        <SearchField label="Search" hideLabel defaultValue="term" />
      </search>,
    );
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe('PasswordField', () => {
  it('hides the password and toggles it with a pressed-state button', async () => {
    const ref = createRef<HTMLInputElement>();
    render(<PasswordField ref={ref} label="Password" />);
    const input = screen.getByLabelText('Password', { selector: 'input' });
    expect(ref.current).toBe(input);
    expect(input).toHaveAttribute('type', 'password');
    expect(input).toHaveAttribute('autocomplete', 'current-password');

    const toggle = screen.getByRole('button', { name: 'Show password' });
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
    expect(toggle).toHaveAttribute('aria-controls', input.id);
    await userEvent.click(toggle);
    expect(input).toHaveAttribute('type', 'text');
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
    expect(toggle).toHaveFocus();
  });

  it('hides the password again when its form is submitted', async () => {
    render(
      <form onSubmit={(e) => e.preventDefault()}>
        <PasswordField label="Password" />
        <button type="submit">Sign in</button>
      </form>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Show password' }));
    const input = screen.getByLabelText('Password', { selector: 'input' });
    expect(input).toHaveAttribute('type', 'text');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(input).toHaveAttribute('type', 'password');
  });

  it('shows a strength meter, described to screen readers, while typing', async () => {
    render(
      <PasswordField
        label="New password"
        autoComplete="new-password"
        hint="At least 12 characters."
        strength={estimatePasswordStrength}
      />,
    );
    const input = screen.getByLabelText('New password', { selector: 'input' });
    expect(input).toHaveAttribute('autocomplete', 'new-password');
    const meter = document.querySelector('.dawg-password-strength')!;
    expect(meter).not.toHaveAttribute('data-score');

    await userEvent.type(input, 'correct horse battery staple');
    expect(meter).toHaveAttribute('data-score', '4');
    expect(meter.querySelectorAll('[data-filled]')).toHaveLength(4);
    expect(input).toHaveAccessibleDescription('Password strength: Strong At least 12 characters.');
    expect(screen.getByText('Strong').closest('p')).toHaveAttribute('aria-live', 'polite');
  });

  it('measures a controlled value too', () => {
    render(
      <PasswordField
        label="Password"
        value="abc"
        onChange={() => {}}
        strength={estimatePasswordStrength}
      />,
    );
    expect(document.querySelector('.dawg-password-strength')).toHaveAttribute('data-score', '0');
    expect(document.querySelectorAll('[data-filled]')).toHaveLength(1);
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <form>
        <PasswordField label="Password" error="Enter your password." />
        <PasswordField label="New" strength={estimatePasswordStrength} defaultValue="hunter22" />
      </form>,
    );
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe('estimatePasswordStrength', () => {
  it.each([
    ['', 0],
    ['abc', 0],
    ['aaaaaaaaaaaaaaaaaaaaaaaa', 0],
    ['password123', 1],
    ['Password1234!', 1],
    ['sunflower', 0],
    ['Tr0ub4dor&3', 2],
    ['Plum-river-sofa', 3],
    ['correct horse battery staple', 4],
  ])('rates %j as %i', (password, score) => {
    expect(estimatePasswordStrength(password).score).toBe(score);
  });

  it('uses the given labels, e.g. for translation', () => {
    const labels = ['Muy débil', 'Débil', 'Aceptable', 'Buena', 'Fuerte'] as const;
    expect(estimatePasswordStrength('correct horse battery staple', labels).label).toBe('Fuerte');
  });
});

describe('OneTimeCodeField', () => {
  it('is a single labelled input set up for codes', () => {
    const ref = createRef<HTMLInputElement>();
    render(<OneTimeCodeField ref={ref} label="Verification code" />);
    const input = screen.getByRole('textbox', { name: 'Verification code' });
    expect(ref.current).toBe(input);
    expect(input).toHaveAttribute('autocomplete', 'one-time-code');
    expect(input).toHaveAttribute('inputmode', 'numeric');
    expect(input).toHaveAttribute('pattern', '\\d{6}');
    expect(input).not.toHaveAttribute('maxlength');
  });

  it('keeps only digits, stops at the length and reports completion once', async () => {
    const onComplete = vi.fn();
    const onValueChange = vi.fn();
    render(
      <OneTimeCodeField
        label="Code"
        length={4}
        onComplete={onComplete}
        onValueChange={onValueChange}
      />,
    );
    const input = screen.getByRole('textbox');
    await userEvent.type(input, '1a2-3');
    expect(input).toHaveValue('123');
    expect(onComplete).not.toHaveBeenCalled();
    await userEvent.type(input, '45');
    expect(input).toHaveValue('1234');
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith('1234');
    expect(onValueChange).toHaveBeenLastCalledWith('1234');
  });

  it('cleans up a pasted code with separators', () => {
    const onComplete = vi.fn();
    render(<OneTimeCodeField label="Code" onComplete={onComplete} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '123 456' } });
    expect(screen.getByRole('textbox')).toHaveValue('123456');
    expect(onComplete).toHaveBeenCalledWith('123456');
  });

  it('can accept letters, upper-cased', async () => {
    render(<OneTimeCodeField label="Code" characters="alphanumeric" length={5} />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('inputmode', 'text');
    await userEvent.type(input, 'ab-12c9');
    expect(input).toHaveValue('AB12C');
  });

  it('sizes itself to the code length and has no axe violations', async () => {
    const { container } = render(
      <OneTimeCodeField label="Code" length={8} hint="Sent to your phone." error="Wrong code." />,
    );
    const wrapper = container.querySelector('.dawg-field')!;
    expect(wrapper).toHaveAttribute('data-code');
    expect((wrapper as HTMLElement).style.getPropertyValue('--_length')).toBe('8');
    expect(await axeViolations(container)).toEqual([]);
  });
});
