/**
 * Every call to your backend lives in this file. Replace each function body with a real
 * request; the screens only use these functions, the types below and AuthError codes.
 *
 * Demo rules (until you connect a backend):
 *   - any email with a password of 8 or more characters signs in,
 *     except the password "wrong-password", which shows the error message
 *   - with two-step sign-in on, the code is 123456
 *   - a reset link is #/reset-password?token=demo
 *
 * Good practice for the real thing (most of it happens on your server):
 *   - Keep the session in an HttpOnly, Secure, SameSite cookie, not in localStorage.
 *   - Protect these endpoints with rate limits and CSRF protection.
 *   - Never say whether an email has an account: the screens already show the same message
 *     either way, so return the same response either way too.
 *   - Check new passwords against lists of breached passwords.
 */

import { appConfig } from '../app.config';

export interface User {
  name: string;
  email: string;
}

export type SignInResult =
  | { status: 'signed-in'; user: User }
  /** The password was right; ask for the code. `challenge` identifies this sign-in attempt. */
  | { status: 'code-required'; challenge: string; email: string };

export type AuthErrorCode =
  'invalid-credentials' | 'invalid-code' | 'expired-link' | 'too-many-attempts' | 'network';

/** A failure the screens know how to explain. See messages.ts for the wording. */
export class AuthError extends Error {
  constructor(readonly code: AuthErrorCode) {
    super(code);
    this.name = 'AuthError';
  }
}

const DEMO_CODE = '123456';
const DEMO_RESET_TOKEN = 'demo';
const demoChallenges = new Map<string, User>();

export async function signIn(input: {
  email: string;
  password: string;
  remember: boolean;
}): Promise<SignInResult> {
  await delay(700);
  // Real version, for example:
  //   const response = await fetch('/api/session', { method: 'POST', credentials: 'include',
  //     headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) });
  //   if (response.status === 401) throw new AuthError('invalid-credentials');
  //   if (response.status === 429) throw new AuthError('too-many-attempts');
  //   if (!response.ok) throw new AuthError('network');
  //   return (await response.json()) as SignInResult;
  if (input.password.length < 8 || input.password === 'wrong-password') {
    throw new AuthError('invalid-credentials');
  }
  const user = { name: nameFromEmail(input.email), email: input.email };
  // Your server decides whether a code is needed; the demo follows app.config.ts.
  if (!appConfig.features.twoStep) return { status: 'signed-in', user };
  const challenge = `demo-${Date.now()}`;
  demoChallenges.set(challenge, user);
  return { status: 'code-required', challenge, email: user.email };
}

/** Checks the 6-digit code for a sign-in that needs one. */
export async function verifyCode(input: { challenge: string; code: string }): Promise<User> {
  await delay(600);
  const user = demoChallenges.get(input.challenge);
  if (!user) throw new AuthError('expired-link');
  if (input.code !== DEMO_CODE) throw new AuthError('invalid-code');
  demoChallenges.delete(input.challenge);
  return user;
}

/** Sends a new code for the same sign-in attempt. */
export async function resendCode(_challenge: string): Promise<void> {
  await delay(500);
}

/**
 * Creates the account and sends a confirmation email. Resolve the same way whether or not
 * the email already has an account, and email the existing owner instead.
 */
export async function signUp(_input: { name: string; email: string; password: string }) {
  await delay(800);
}

/** Sends the confirmation email again. Always resolves the same way. */
export async function resendConfirmation(_email: string): Promise<void> {
  await delay(500);
}

/** Emails a reset link if the address has an account. Always resolves the same way. */
export async function requestPasswordReset(_email: string): Promise<void> {
  await delay(700);
}

/** Sets a new password using the token from the reset link. */
export async function resetPassword(input: { token: string; password: string }): Promise<void> {
  await delay(700);
  if (input.token !== DEMO_RESET_TOKEN) throw new AuthError('expired-link');
}

export async function signOut(): Promise<void> {
  await delay(300);
}

function nameFromEmail(email: string) {
  const local = email.split('@')[0] ?? '';
  return local.charAt(0).toUpperCase() + local.slice(1);
}

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}
