import { useEffect, useState } from 'react';
import { FormAlert } from '@dawg-codes/react-toolkit/form';
import { appConfig } from '../app.config';
import { requestPasswordReset, resendConfirmation } from '../auth/api';
import { useSession } from '../auth/session';
import { AuthPage } from '../components/AuthPage';
import { useCooldown } from '../components/useCooldown';
import { href, navigate } from '../router';

/**
 * After a sign-up or a password reset request. The reset wording is the same whether or not
 * the email has an account, so the page can't be used to find out who has one.
 */
export function CheckEmail() {
  const { sentTo } = useSession();
  const cooldown = useCooldown(30);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    if (!sentTo) navigate('sign-in');
  }, [sentTo]);
  if (!sentTo) return null;

  const reset = sentTo.reason === 'reset';

  async function sendAgain() {
    cooldown.start();
    setResent(false);
    await (reset ? requestPasswordReset(sentTo!.email) : resendConfirmation(sentTo!.email));
    setResent(true);
  }

  return (
    <AuthPage
      title="Check your email"
      description={
        reset ? (
          <>
            If there's an account for <strong>{sentTo.email}</strong>, we've sent it a link to reset
            your password.
          </>
        ) : (
          <>
            We've sent a link to <strong>{sentTo.email}</strong>. Open it to confirm your email and
            finish creating your account.
          </>
        )
      }
      footer={<a href={href('sign-in')}>Back to sign in</a>}
    >
      <div className="auth-form">
        {resent && <FormAlert tone="info" title="We've sent it again." />}
        <p className="auth-text">
          It can take a few minutes to arrive. If it doesn't, check your spam folder or{' '}
          <button
            type="button"
            className="link-button"
            onClick={sendAgain}
            disabled={cooldown.remaining > 0}
          >
            {cooldown.remaining > 0 ? `send it again in ${cooldown.remaining}s` : 'send it again'}
          </button>
          .
        </p>
        {appConfig.demo && reset && (
          <p className="demo-hint">
            <strong>Demo:</strong>{' '}
            <a href={href('reset-password', { token: 'demo' })}>open the reset link</a>.
          </p>
        )}
      </div>
    </AuthPage>
  );
}
