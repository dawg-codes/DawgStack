import { useEffect, useState } from 'react';
import { Button } from '@dawg-codes/react-toolkit';
import { signOut } from '../auth/api';
import { useSession } from '../auth/session';
import { AuthPage } from '../components/AuthPage';
import { navigate } from '../router';

/**
 * A placeholder for your app. Point afterSignInHref in app.config.ts at your real app, then
 * delete this screen.
 */
export function SignedIn() {
  const session = useSession();
  const { user } = session;
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!user) navigate('sign-in');
  }, [user]);
  if (!user) return null;

  async function leave() {
    setPending(true);
    await signOut();
    session.setUser(null);
    session.setNotice("You've been signed out.");
    navigate('sign-in');
  }

  return (
    <AuthPage
      title="You're signed in"
      description={
        <>
          Signed in as <strong>{user.email}</strong>.
        </>
      }
    >
      <div className="auth-form">
        <p className="auth-text">
          This is where your app starts. Set <code>afterSignInHref</code> in{' '}
          <code>src/app.config.ts</code> to send people there.
        </p>
        <Button fullWidth onClick={leave} loading={pending}>
          Sign out
        </Button>
      </div>
    </AuthPage>
  );
}
