import { useRef, useState, type FormEvent } from 'react';
import { Button } from '@dawg-codes/react-toolkit';
import { FormAlert, TextField, focusFirstInvalid } from '@dawg-codes/react-toolkit/form';
import { requestPasswordReset } from '../auth/api';
import { emailError, messageFor } from '../auth/messages';
import { useSession } from '../auth/session';
import { AuthPage } from '../components/AuthPage';
import { href, navigate } from '../router';

export function ForgotPassword() {
  const session = useSession();
  const [error, setError] = useState<string | undefined>();
  const [failure, setFailure] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const failureRef = useRef<HTMLDivElement>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const email = String(new FormData(form).get('email') ?? '').trim();
    const problem = emailError(email);
    setError(problem);
    setFailure(null);
    if (problem) {
      focusFirstInvalid(form);
      return;
    }
    setPending(true);
    try {
      await requestPasswordReset(email);
      session.setSentTo({ email, reason: 'reset' });
      navigate('check-email');
    } catch (failure) {
      setFailure(messageFor(failure));
      requestAnimationFrame(() => failureRef.current?.focus());
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthPage
      title="Reset your password"
      description="Enter the email you use to sign in, and we'll send you a link to choose a new password."
      footer={<a href={href('sign-in')}>Back to sign in</a>}
    >
      <form className="auth-form" onSubmit={submit} noValidate>
        {failure && <FormAlert ref={failureRef} title={failure} />}
        <TextField
          name="email"
          type="email"
          label="Email"
          autoComplete="username"
          inputMode="email"
          spellCheck={false}
          defaultValue={session.pending?.email}
          error={error}
          required
        />
        <Button type="submit" variant="primary" fullWidth loading={pending}>
          Send reset link
        </Button>
      </form>
    </AuthPage>
  );
}
