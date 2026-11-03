import { useRef, useState, type FormEvent } from 'react';
import { Button } from '@dawg-codes/react-toolkit';
import {
  Checkbox,
  FormAlert,
  PasswordField,
  TextField,
  focusFirstInvalid,
} from '@dawg-codes/react-toolkit/form';
import { appConfig } from '../app.config';
import { signIn } from '../auth/api';
import { emailError, messageFor } from '../auth/messages';
import { useSession } from '../auth/session';
import { AuthPage } from '../components/AuthPage';
import { href, navigate } from '../router';

export function SignIn() {
  const session = useSession();
  const { features } = appConfig;
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [failure, setFailure] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const failureRef = useRef<HTMLDivElement>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const email = String(data.get('email') ?? '').trim();
    const password = String(data.get('password') ?? '');

    const next = {
      email: emailError(email),
      password: password ? undefined : 'Enter your password',
    };
    setErrors(next);
    setFailure(null);
    if (next.email || next.password) {
      focusFirstInvalid(form);
      return;
    }

    setPending(true);
    try {
      const result = await signIn({ email, password, remember: data.get('remember') === 'on' });
      session.setNotice(null);
      if (result.status === 'code-required') {
        session.setPending({ challenge: result.challenge, email: result.email });
        navigate('verify');
      } else {
        session.setUser(result.user);
        window.location.hash = appConfig.afterSignInHref;
      }
    } catch (error) {
      setFailure(messageFor(error));
      // Move focus to the message, so keyboard and screen reader users hear it.
      requestAnimationFrame(() => failureRef.current?.focus());
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthPage
      title="Sign in"
      description={`Welcome back. Sign in to continue to ${appConfig.name}.`}
      footer={
        features.signUp && (
          <>
            New to {appConfig.name}? <a href={href('sign-up')}>Create an account</a>
          </>
        )
      }
    >
      <form className="auth-form" onSubmit={submit} noValidate>
        {session.notice && <FormAlert tone="success" title={session.notice} />}
        {failure && <FormAlert ref={failureRef} title={failure} />}
        <TextField
          name="email"
          type="email"
          label="Email"
          // "username" lets password managers pair the email with the saved password.
          autoComplete="username"
          inputMode="email"
          spellCheck={false}
          defaultValue={session.pending?.email}
          error={errors.email}
          required
        />
        <div className="field-with-link">
          <PasswordField
            name="password"
            label="Password"
            autoComplete="current-password"
            error={errors.password}
            required
          />
          {features.forgotPassword && (
            <a className="field-link" href={href('forgot-password')}>
              Forgot your password?
            </a>
          )}
        </div>
        {features.rememberMe && <Checkbox name="remember" label="Keep me signed in" />}
        <Button type="submit" variant="primary" fullWidth loading={pending}>
          Sign in
        </Button>
        {appConfig.demo && (
          <p className="demo-hint">
            <strong>Demo:</strong> use any email and a password of 8 or more characters. The
            password <code>wrong-password</code> shows the error message.
          </p>
        )}
      </form>
    </AuthPage>
  );
}
