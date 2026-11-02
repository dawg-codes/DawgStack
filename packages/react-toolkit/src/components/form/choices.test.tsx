import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../../test/a11y';
import { Checkbox } from './Checkbox';
import { RadioGroup, type RadioOption } from './RadioGroup';
import { Switch } from './Switch';

describe('Checkbox', () => {
  it('is a labelled native checkbox that toggles', async () => {
    const ref = createRef<HTMLInputElement>();
    const onChange = vi.fn();
    render(<Checkbox ref={ref} label="Remember me" name="remember" onChange={onChange} />);
    const box = screen.getByRole('checkbox', { name: 'Remember me' });
    expect(ref.current).toBe(box);
    await userEvent.click(screen.getByText('Remember me'));
    expect(box).toBeChecked();
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('wires hint and error, and shows a required mark', () => {
    render(
      <Checkbox
        label="I accept the terms"
        hint="You can read them first."
        error="Accept the terms to continue."
        required
      />,
    );
    const box = screen.getByRole('checkbox', { name: 'I accept the terms' });
    expect(box).toBeRequired();
    expect(box).toHaveAttribute('aria-invalid', 'true');
    expect(box).toHaveAccessibleDescription(
      'You can read them first. Accept the terms to continue.',
    );
  });

  it('sets the indeterminate DOM property', () => {
    const { rerender } = render(<Checkbox label="Select all" indeterminate />);
    const box = screen.getByRole<HTMLInputElement>('checkbox');
    expect(box.indeterminate).toBe(true);
    expect(box).toBePartiallyChecked();
    rerender(<Checkbox label="Select all" indeterminate={false} />);
    expect(box.indeterminate).toBe(false);
  });

  it('keeps the forwarded ref working alongside the internal one', () => {
    const calls: (HTMLInputElement | null)[] = [];
    const { unmount } = render(<Checkbox label="A" ref={(node) => void calls.push(node)} />);
    expect(calls[0]).toBeInstanceOf(HTMLInputElement);
    unmount();
    expect(calls.at(-1)).toBeNull();
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <>
        <Checkbox label="Email me updates" hint="About once a month." defaultChecked />
        <Checkbox label="Accept" error="Required." />
        <Checkbox label="Select row" hideLabel />
      </>,
    );
    expect(await axeViolations(container)).toEqual([]);
  });
});

const PLANS: RadioOption[] = [
  { value: 'free', label: 'Free' },
  { value: 'pro', label: 'Pro', hint: 'For teams.' },
  { value: 'old', label: 'Legacy', disabled: true },
];

describe('RadioGroup', () => {
  it('is a fieldset with a legend and native radios sharing a name', () => {
    const ref = createRef<HTMLFieldSetElement>();
    render(<RadioGroup ref={ref} label="Plan" options={PLANS} name="plan" />);
    const group = screen.getByRole('radiogroup', { name: 'Plan' });
    expect(ref.current).toBe(group);
    expect(group.tagName).toBe('FIELDSET');
    const radios = screen.getAllByRole<HTMLInputElement>('radio');
    expect(radios).toHaveLength(3);
    expect(radios.every((r) => r.name === 'plan')).toBe(true);
    expect(screen.getByRole('radio', { name: 'Legacy' })).toBeDisabled();
    expect(screen.getByRole('radio', { name: 'Pro' })).toHaveAccessibleDescription('For teams.');
  });

  it('generates a shared name when none is given', () => {
    render(<RadioGroup label="Plan" options={PLANS} />);
    const names = screen.getAllByRole<HTMLInputElement>('radio').map((r) => r.name);
    expect(names[0]).toBeTruthy();
    expect(new Set(names).size).toBe(1);
  });

  it('works uncontrolled with a default value', async () => {
    const onValueChange = vi.fn();
    render(
      <RadioGroup label="Plan" options={PLANS} defaultValue="free" onValueChange={onValueChange} />,
    );
    expect(screen.getByRole('radio', { name: 'Free' })).toBeChecked();
    await userEvent.click(screen.getByText('Pro'));
    expect(screen.getByRole('radio', { name: 'Pro' })).toBeChecked();
    expect(onValueChange).toHaveBeenCalledWith('pro');
  });

  it('works controlled', async () => {
    function Controlled() {
      const [plan, setPlan] = useState('pro');
      return (
        <>
          <RadioGroup label="Plan" options={PLANS} value={plan} onValueChange={setPlan} />
          <output>{plan}</output>
        </>
      );
    }
    render(<Controlled />);
    expect(screen.getByRole('radio', { name: 'Pro' })).toBeChecked();
    await userEvent.click(screen.getByRole('radio', { name: 'Free' }));
    expect(screen.getByRole('status')).toHaveTextContent('free');
    expect(screen.getByRole('radio', { name: 'Free' })).toBeChecked();
  });

  it('puts the error, hint and required state on the group', () => {
    render(
      <RadioGroup
        label="Plan"
        options={PLANS}
        hint="You can change it later."
        error="Choose a plan."
        required
      />,
    );
    const group = screen.getByRole('radiogroup');
    expect(group).toHaveAttribute('aria-invalid', 'true');
    expect(group).toHaveAttribute('aria-required', 'true');
    expect(group).toHaveAccessibleDescription('You can change it later. Choose a plan.');
    expect(screen.getAllByRole('radio').every((r) => (r as HTMLInputElement).required)).toBe(true);
  });

  it('disables every choice when the group is disabled', () => {
    render(<RadioGroup label="Plan" options={PLANS} disabled />);
    for (const radio of screen.getAllByRole('radio')) expect(radio).toBeDisabled();
  });

  it('supports the card variant and horizontal layout', () => {
    render(<RadioGroup label="Plan" options={PLANS} variant="card" orientation="horizontal" />);
    const group = screen.getByRole('radiogroup');
    expect(group).toHaveAttribute('data-variant', 'card');
    expect(group).toHaveAttribute('data-orientation', 'horizontal');
    expect(group.querySelectorAll('.dawg-check[data-variant="card"]')).toHaveLength(3);
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <>
        <RadioGroup label="Plan" options={PLANS} hint="Billed monthly." defaultValue="free" />
        <RadioGroup label="Size" options={PLANS} variant="card" error="Pick one." required />
      </>,
    );
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe('Switch', () => {
  it('is a native checkbox with the switch role', async () => {
    const ref = createRef<HTMLInputElement>();
    render(<Switch ref={ref} label="Wi-Fi" />);
    const toggle = screen.getByRole('switch', { name: 'Wi-Fi' });
    expect(ref.current).toBe(toggle);
    expect(toggle).toHaveAttribute('type', 'checkbox');
    expect(toggle).not.toBeChecked();
    await userEvent.click(toggle);
    expect(toggle).toBeChecked();
    await userEvent.click(screen.getByText('Wi-Fi'));
    expect(toggle).not.toBeChecked();
  });

  it('toggles with the space bar and supports controlled use', () => {
    function Controlled() {
      const [on, setOn] = useState(true);
      return <Switch label="Alerts" checked={on} onChange={(e) => setOn(e.target.checked)} />;
    }
    render(<Controlled />);
    const toggle = screen.getByRole('switch');
    expect(toggle).toBeChecked();
    fireEvent.click(toggle);
    expect(toggle).not.toBeChecked();
  });

  it('places the label and wires the hint', () => {
    render(<Switch label="Dark mode" hint="Applies straight away." labelPlacement="start" />);
    const toggle = screen.getByRole('switch');
    expect(toggle.closest('.dawg-switch')).toHaveAttribute('data-label-placement', 'start');
    expect(toggle).toHaveAccessibleDescription('Applies straight away.');
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <>
        <Switch label="Notifications" hint="On this device." defaultChecked />
        <Switch label="Beta features" disabled />
        <Switch label="Sync" hideLabel error="Sign in to sync." />
      </>,
    );
    expect(await axeViolations(container)).toEqual([]);
  });
});
