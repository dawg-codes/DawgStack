import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../../test/a11y';
import { FieldError } from './Field';
import { SelectField } from './SelectField';
import { TextArea } from './TextArea';
import { TextField } from './TextField';

describe('TextField', () => {
  it('labels the input and passes attributes and the ref to it', () => {
    const ref = createRef<HTMLInputElement>();
    render(<TextField ref={ref} label="Email" type="email" name="email" autoComplete="email" />);
    const input = screen.getByRole('textbox', { name: 'Email' });
    expect(ref.current).toBe(input);
    expect(input).toHaveAttribute('type', 'email');
    expect(input).toHaveAttribute('name', 'email');
    expect(input).toHaveAttribute('autocomplete', 'email');
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(input).not.toHaveAttribute('aria-describedby');
  });

  it('puts className and style on the wrapper, not the input', () => {
    render(<TextField label="Name" className="mine" style={{ maxWidth: 200 }} />);
    const input = screen.getByRole('textbox');
    const wrapper = input.closest('.dawg-field');
    expect(wrapper).toHaveClass('mine');
    expect(wrapper).toHaveStyle({ maxWidth: '200px' });
    expect(input).toHaveClass('dawg-field__input');
    expect(input).not.toHaveClass('mine');
  });

  it('links the hint and error to the input and marks it invalid', () => {
    render(
      <TextField
        label="Username"
        hint="Letters and numbers only."
        error="This name is taken."
        aria-describedby="extra"
      />,
    );
    const input = screen.getByRole('textbox', { name: 'Username' });
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Letters and numbers only. This name is taken.');
    expect(input.getAttribute('aria-describedby')).toMatch(/^extra /);
    expect(screen.getByText('This name is taken.').closest('p')).toHaveClass('dawg-field__error');
  });

  it('can be marked invalid without a message', () => {
    render(<TextField label="Code" error />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).not.toHaveAttribute('aria-describedby');
  });

  it('uses the given id, so a label elsewhere or a summary link can point to it', () => {
    render(<TextField id="email" label="Email" hint="Work address" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('id', 'email');
    expect(input).toHaveAttribute('aria-describedby', 'email-hint');
  });

  it('shows a decorative required mark and keeps native required', () => {
    render(<TextField label="Name" required />);
    const input = screen.getByRole('textbox', { name: 'Name' });
    expect(input).toBeRequired();
    expect(screen.getByText('*')).toHaveAttribute('aria-hidden', 'true');
  });

  it('can hide the label visually and still name the input', () => {
    render(<TextField label="Quantity" hideLabel />);
    expect(screen.getByText('Quantity')).toHaveClass('dawg-visually-hidden');
    expect(screen.getByRole('textbox', { name: 'Quantity' })).toBeInTheDocument();
  });

  it('supports sizes, a start icon and end content', () => {
    render(
      <TextField label="Weight" size="sm" startIcon={<svg data-testid="icon" />} endAddon="kg" />,
    );
    const wrapper = screen.getByRole('textbox').closest('.dawg-field');
    expect(wrapper).toHaveAttribute('data-size', 'sm');
    expect(screen.getByTestId('icon').parentElement).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText('kg')).toHaveClass('dawg-field__addon');
  });

  it('marks the wrapper disabled', () => {
    render(<TextField label="Name" disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
    expect(screen.getByRole('textbox').closest('.dawg-field')).toHaveAttribute('data-disabled');
  });

  it('works controlled and uncontrolled', async () => {
    const onChange = vi.fn();
    render(<TextField label="Name" defaultValue="Al" onChange={onChange} />);
    await userEvent.type(screen.getByRole('textbox'), 'ex');
    expect(screen.getByRole('textbox')).toHaveValue('Alex');
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it('has no axe violations, with and without an error', async () => {
    const { container } = render(
      <form>
        <TextField label="Email" type="email" hint="We never share it." required />
        <TextField label="Name" error="Enter your name." />
      </form>,
    );
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe('TextArea', () => {
  it('labels the textarea, wires the hint and defaults to 3 rows', () => {
    const ref = createRef<HTMLTextAreaElement>();
    render(<TextArea ref={ref} label="Message" hint="Up to 500 characters." maxLength={500} />);
    const textarea = screen.getByRole('textbox', { name: 'Message' });
    expect(ref.current).toBe(textarea);
    expect(textarea.tagName).toBe('TEXTAREA');
    expect(textarea).toHaveAttribute('rows', '3');
    expect(textarea).toHaveAttribute('maxlength', '500');
    expect(textarea).toHaveAccessibleDescription('Up to 500 characters.');
  });

  it('can grow with its content', () => {
    render(<TextArea label="Notes" autoGrow rows={2} error="Too long." />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('data-auto-grow');
    expect(textarea.style.getPropertyValue('--_rows')).toBe('2');
    expect(textarea).toHaveAttribute('aria-invalid', 'true');
  });

  it('has no axe violations', async () => {
    const { container } = render(<TextArea label="Message" hint="Optional" error="Required." />);
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe('SelectField', () => {
  const countries = [
    { value: 'nz', label: 'New Zealand' },
    { value: 'jp', label: 'Japan' },
    { value: 'xx', label: 'Unavailable', disabled: true },
  ];

  it('renders a labelled native select with options', async () => {
    const ref = createRef<HTMLSelectElement>();
    render(<SelectField ref={ref} label="Country" options={countries} />);
    const select = screen.getByRole('combobox', { name: 'Country' });
    expect(ref.current).toBe(select);
    expect(screen.getAllByRole('option')).toHaveLength(3);
    expect(screen.getByRole('option', { name: 'Unavailable' })).toBeDisabled();
    await userEvent.selectOptions(select, 'jp');
    expect(select).toHaveValue('jp');
  });

  it('accepts plain strings and <option> children', () => {
    render(
      <SelectField label="Size" options={['S', 'M']}>
        <option value="L">Large</option>
      </SelectField>,
    );
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['S', 'M', 'Large']);
    expect(screen.getByRole('option', { name: 'S' })).toHaveValue('S');
  });

  it('starts on the placeholder, which cannot be picked again when required', () => {
    render(<SelectField label="Country" options={countries} placeholder="Choose…" required />);
    const select = screen.getByRole('combobox');
    expect(select).toHaveValue('');
    expect(screen.getByRole('option', { name: 'Choose…' })).toBeDisabled();
    expect(select).toBeInvalid();
  });

  it('keeps a chosen default value over the placeholder', () => {
    render(<SelectField label="Country" options={countries} placeholder="Any" defaultValue="jp" />);
    expect(screen.getByRole('combobox')).toHaveValue('jp');
    expect(screen.getByRole('option', { name: 'Any' })).toBeEnabled();
  });

  it('wires the hint and error and has no axe violations', async () => {
    const { container } = render(
      <SelectField
        label="Country"
        options={countries}
        hint="Where you live."
        error="Choose one."
      />,
    );
    const select = screen.getByRole('combobox');
    expect(select).toHaveAccessibleDescription('Where you live. Choose one.');
    expect(select).toHaveAttribute('aria-invalid', 'true');
    expect(container.querySelector('.dawg-field__chevron')).toHaveAttribute('aria-hidden', 'true');
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe('FieldError', () => {
  it('renders a message with a hidden icon for custom controls', () => {
    render(<FieldError id="e1">Pick a date.</FieldError>);
    const error = screen.getByText('Pick a date.').closest('p')!;
    expect(error).toHaveAttribute('id', 'e1');
    expect(error.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });
});
