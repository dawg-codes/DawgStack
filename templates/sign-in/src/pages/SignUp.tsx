import { useRef, useState, type FormEvent } from 'react';
import { Button } from '@dawg-codes/react-toolkit';
import {
  FormAlert,
  PasswordField,
  TextField,
  estimatePasswordStrength,
  focusFirstInvalid,
} from '@dawg-codes/react-toolkit/form';
import { appConfig } from '../app.config';
import { signUp } from '../auth/api';
import { emailError, messageFor, newPasswordError } from '../auth/messages';
import { useSession } from '../auth/session';
import { AuthPage } from '../components/AuthPage';
import { href, navigate } from '../router';

interface Errors {
  name?: string;
  email?: string;
  password?: string;
}

export function SignUp() {
  const session = useSession();
  const [errors, setErrors] = useState<Errors>({});
  const [failure, setFailure] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const failureRef = useRef<HTMLDivElement>(null);
  const min = appConfig.passwordMinLength;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get('name') ?? '').trim();
    const email = String(data.get('email') ?? '').trim();
    const password = String(data.get('password') ?? '');

    const next: Errors = {
      name: name ? undefined : 'Enter your name',
      email: emailError(email),
      password: newPasswordError(password, min),
    };
    setErrors(next);
    setFailure(null);
    if (next.name || next.email || next.password) {
      focusFirstInvalid(form);
      return;
    }

    setPending(true);
    try {
      await signUp({ name, email, password });
      session.setSentTo({ email, reason: 'sign-up' });
      navigate('check-email');
    } catch (error) {
      setFailure(messageFor(error));
      requestAnimationFrame(() => failureRef.current?.focus());
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthPage
      title="Create an account"
      description={`Get started with ${appConfig.name}. It only takes a minute.`}
      footer={
        <>
          Already have an account? <a href={href('sign-in')}>Sign in</a>
        </>
      }
    >
      <form className="auth-form" onSubmit={submit} noValidate>
        {failure && <FormAlert ref={failureRef} title={failure} />}
        <TextField name="name" label="Full name" autoComplete="name" error={errors.name} required />
        <TextField
          name="email"
          type="email"
          label="Email"
          autoComplete="email"
          inputMode="email"
          spellCheck={false}
          hint="We'll send you a link to confirm it."
          error={errors.email}
          required
        />
        <PasswordField
          name="password"
          label="Password"
          autoComplete="new-password"
          strength={estimatePasswordStrength}
          hint={`Use at least ${min} characters. A few random words work well.`}
          error={errors.password}
          required
        />
        <p className="auth-small">
          By creating an account you agree to the{' '}
          <a href={appConfig.links.terms}>Terms of Service</a> and{' '}
          <a href={appConfig.links.privacy}>Privacy Policy</a>.
        </p>
        <Button type="submit" variant="primary" fullWidth loading={pending}>
          Create account
        </Button>
      </form>
    </AuthPage>
  );
}
