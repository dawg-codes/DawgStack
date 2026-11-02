import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState, type FormEvent } from 'react';
import { describe, expect, it } from 'vitest';
import { axeViolations } from '../../../test/a11y';
import { focusFirstInvalid } from './focus';
import { FormAlert } from './FormAlert';
import { RadioGroup } from './RadioGroup';
import { TextField } from './TextField';

describe('FormAlert', () => {
  it('announces errors at once and can receive focus', () => {
    const ref = createRef<HTMLDivElement>();
    render(<FormAlert ref={ref} title="There is a problem" />);
    const alert = screen.getByRole('alert');
    expect(ref.current).toBe(alert);
    expect(alert).toHaveAttribute('data-tone', 'danger');
    expect(alert).toHaveAttribute('tabindex', '-1');
    expect(alert).toHaveTextContent('There is a problem');
  });

  it.each([
    ['warning', 'alert'],
    ['info', 'status'],
    ['success', 'status'],
  ] as const)('uses role=%s for the %s tone', (tone, role) => {
    render(<FormAlert tone={tone} title="Note" />);
    expect(screen.getByRole(role)).toHaveAttribute('data-tone', tone);
  });

  it('links each problem to its field and focuses it on click', async () => {
    render(
      <>
        <FormAlert
          title="There is a problem"
          items={[
            { message: 'Enter your email', fieldId: 'email' },
            { message: 'Choose a plan', fieldId: 'plan' },
            { message: 'Something else went wrong' },
          ]}
        />
        <TextField id="email" label="Email" error="Enter your email" />
        <RadioGroup
          id="plan"
          label="Plan"
          options={[
            { value: 'a', label: 'A' },
            { value: 'b', label: 'B' },
          ]}
          defaultValue="b"
        />
      </>,
    );
    const link = screen.getByRole('link', { name: 'Enter your email' });
    expect(link).toHaveAttribute('href', '#email');
    await userEvent.click(link);
    expect(screen.getByRole('textbox', { name: 'Email' })).toHaveFocus();

    // A group is not focusable itself: its checked radio gets focus.
    await userEvent.click(screen.getByRole('link', { name: 'Choose a plan' }));
    expect(screen.getByRole('radio', { name: 'B' })).toHaveFocus();

    expect(screen.getByText('Something else went wrong').tagName).toBe('LI');
  });

  it('renders extra content and has no axe violations', async () => {
    const { container } = render(
      <>
        <FormAlert title="Check your answers" items={[{ message: 'Name', fieldId: 'n' }]}>
          <p>Fix these to continue.</p>
        </FormAlert>
        <FormAlert tone="success" title="Saved" />
        <TextField id="n" label="Name" />
      </>,
    );
    expect(screen.getByText('Fix these to continue.')).toBeInTheDocument();
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe('focusFirstInvalid', () => {
  it('focuses the first invalid field after the errors have rendered', async () => {
    function SignUp() {
      const [errors, setErrors] = useState<Record<string, string>>({});
      const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setErrors({ email: 'Enter your email.', password: 'Enter a password.' });
        focusFirstInvalid(event.currentTarget);
      };
      return (
        <form onSubmit={submit} noValidate>
          <TextField label="Name" />
          <TextField label="Email" error={errors.email} />
          <TextField label="Password" error={errors.password} />
          <button type="submit">Create account</button>
        </form>
      );
    }
    render(<SignUp />);
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }));
    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Email' })).toHaveFocus());
  });

  it('does nothing when no field is invalid', async () => {
    render(<TextField label="Name" />);
    const before = document.activeElement;
    focusFirstInvalid(document.body);
    await new Promise((resolve) => requestAnimationFrame(resolve));
    expect(document.activeElement).toBe(before);
  });
});
