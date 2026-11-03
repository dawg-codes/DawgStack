import { useEffect, useRef } from 'react';
import { appConfig } from './app.config';
import { CheckEmail } from './pages/CheckEmail';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { SignedIn } from './pages/SignedIn';
import { SignIn } from './pages/SignIn';
import { SignUp } from './pages/SignUp';
import { VerifyCode } from './pages/VerifyCode';
import { useRoute, type Route } from './router';

/** Picks the screen for the current address. Screens turned off in app.config.ts show sign-in. */
export function App() {
  const { route, params } = useRoute();
  useFocusHeadingOnNavigation(route);
  const { features } = appConfig;

  switch (route) {
    case 'sign-up':
      return features.signUp ? <SignUp /> : <SignIn />;
    case 'forgot-password':
      return features.forgotPassword ? <ForgotPassword /> : <SignIn />;
    case 'reset-password':
      return features.forgotPassword ? <ResetPassword token={params.get('token')} /> : <SignIn />;
    case 'check-email':
      return <CheckEmail />;
    case 'verify':
      return features.twoStep ? <VerifyCode /> : <SignIn />;
    case 'signed-in':
      return <SignedIn />;
    default:
      return <SignIn />;
  }
}

/**
 * After moving to another screen, put keyboard and screen reader focus on its heading, so the
 * change is announced and Tab starts from the top of the new screen. (Not on the first load:
 * the browser handles that.)
 */
function useFocusHeadingOnNavigation(route: Route) {
  const shown = useRef(route);
  useEffect(() => {
    if (shown.current === route) return;
    shown.current = route;
    const heading = document.querySelector<HTMLElement>('main h1');
    if (!heading) return;
    heading.tabIndex = -1;
    heading.focus();
  }, [route]);
}
