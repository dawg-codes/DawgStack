import { useRef, useState, type FormEvent } from 'react';
import { Button } from '@dawg-codes/react-toolkit';
import {
  FormAlert,
  PasswordField,
  estimatePasswordStrength,
  focusFirstInvalid,
} from '@dawg-codes/react-toolkit/form';
import { appConfig } from '../app.config';
import { AuthError, resetPassword } from '../auth/api';
import { messageFor, newPasswordError } from '../auth/messages';
import { useSession } from '../auth/session';
import { AuthPage } from '../components/AuthPage';
import { href, navigate } from '../router';

/** Opened from the link in the reset email: #/reset-password?token=... */
export function ResetPassword({ token }: { token: string | null }) {
  const session = useSession();
  const [error, setError] = useState<string | undefined>();
  const [failure, setFailure] = useState<{ message: string; expired: boolean } | null>(null);
  const [pending, setPending] = useState(false);
  const failureRef = useRef<HTMLDivElement>(null);
  const min = appConfig.passwordMinLength;

  if (!token) {
    return (
      <AuthPage
        title="This link isn't complete"
        description="Copy the whole link from the email into your browser, or ask for a new one."
        footer={<a href={href('sign-in')}>Back to sign in</a>}
      >
        <a className="auth-button-link" href={href('forgot-password')}>
          Ask for a new link
        </a>
      </AuthPage>
    );
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const password = String(new FormData(form).get('password') ?? '');
    const problem = newPasswordError(password, min);
    setError(problem);
    setFailure(null);
    if (problem) {
      focusFirstInvalid(form);
      return;
    }
    setPending(true);
    try {
      await resetPassword({ token: token!, password });
      session.setNotice('Your password has been changed. Sign in with your new password.');
      navigate('sign-in');
    } catch (caught) {
      const expired = caught instanceof AuthError && caught.code === 'expired-link';
      setFailure({ message: messageFor(caught), expired });
      requestAnimationFrame(() => failureRef.current?.focus());
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthPage title="Choose a new password" footer={<a href={href('sign-in')}>Back to sign in</a>}>
      <form className="auth-form" onSubmit={submit} noValidate>
        {failure && (
          <FormAlert ref={failureRef} title={failure.message}>
            {failure.expired && <a href={href('forgot-password')}>Ask for a new link</a>}
          </FormAlert>
        )}
        {/* Lets password managers save the new password under the right account. */}
        <input type="hidden" name="username" autoComplete="username" />
        <PasswordField
          name="password"
          label="New password"
          autoComplete="new-password"
          strength={estimatePasswordStrength}
          hint={`Use at least ${min} characters. A few random words work well.`}
          error={error}
          required
        />
        <Button type="submit" variant="primary" fullWidth loading={pending}>
          Change password
        </Button>
      </form>
    </AuthPage>
  );
}
