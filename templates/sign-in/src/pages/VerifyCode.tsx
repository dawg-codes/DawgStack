import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Button } from '@dawg-codes/react-toolkit';
import { FormAlert, OneTimeCodeField } from '@dawg-codes/react-toolkit/form';
import { appConfig } from '../app.config';
import { resendCode, verifyCode } from '../auth/api';
import { messageFor } from '../auth/messages';
import { useSession } from '../auth/session';
import { AuthPage } from '../components/AuthPage';
import { useCooldown } from '../components/useCooldown';
import { href, navigate } from '../router';

const CODE_LENGTH = 6;

/** Second step of sign-in: the code from an authenticator app, text message or email. */
export function VerifyCode() {
  const session = useSession();
  const { pending: attempt } = session;
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [pending, setPending] = useState(false);
  const [resent, setResent] = useState(false);
  const cooldown = useCooldown(30);
  const inputRef = useRef<HTMLInputElement>(null);

  // Arriving here without a password step first (e.g. a bookmark): start again.
  useEffect(() => {
    if (!attempt) navigate('sign-in');
  }, [attempt]);
  if (!attempt) return null;

  async function check(value: string) {
    if (value.length !== CODE_LENGTH) {
      setError(`Enter the ${CODE_LENGTH}-digit code`);
      inputRef.current?.focus();
      return;
    }
    setPending(true);
    setError(undefined);
    try {
      const user = await verifyCode({ challenge: attempt!.challenge, code: value });
      session.setPending(null);
      session.setUser(user);
      window.location.hash = appConfig.afterSignInHref;
    } catch (failure) {
      setError(messageFor(failure));
      setCode('');
      inputRef.current?.focus();
    } finally {
      setPending(false);
    }
  }

  async function sendAgain() {
    cooldown.start();
    setResent(false);
    await resendCode(attempt!.challenge);
    setResent(true);
  }

  return (
    <AuthPage
      title="Enter your code"
      description={`Enter the ${CODE_LENGTH}-digit code from your authenticator app to finish signing in as ${attempt.email}.`}
      footer={
        <a href={href('sign-in')} onClick={() => session.setPending(null)}>
          Sign in with a different account
        </a>
      }
    >
      <form
        className="auth-form"
        onSubmit={(event: FormEvent) => {
          event.preventDefault();
          void check(code);
        }}
        noValidate
      >
        {resent && <FormAlert tone="info" title="We've sent a new code." />}
        <OneTimeCodeField
          ref={inputRef}
          name="code"
          label="Code"
          length={CODE_LENGTH}
          value={code}
          onValueChange={setCode}
          onComplete={(value) => void check(value)}
          error={error}
          disabled={pending}
        />
        <Button type="submit" variant="primary" fullWidth loading={pending}>
          Continue
        </Button>
        <p className="auth-text">
          Didn't get a code?{' '}
          <button
            type="button"
            className="link-button"
            onClick={sendAgain}
            disabled={cooldown.remaining > 0}
          >
            {cooldown.remaining > 0
              ? `Send a new code in ${cooldown.remaining}s`
              : 'Send a new code'}
          </button>
        </p>
        {appConfig.demo && (
          <p className="demo-hint">
            <strong>Demo:</strong> the code is <code>123456</code>.
          </p>
        )}
      </form>
    </AuthPage>
  );
}
