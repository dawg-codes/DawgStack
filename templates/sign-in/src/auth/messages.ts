import { AuthError, type AuthErrorCode } from './api';

/**
 * What people see when something goes wrong. Each message says what to do next, and none of
 * them reveal whether an email address has an account. Edit or translate them here.
 */
export const errorMessages: Record<AuthErrorCode, string> = {
  'invalid-credentials': 'The email or password is incorrect.',
  'invalid-code': "That code didn't work. Check it and try again, or send a new code.",
  'expired-link': 'This link has expired or has already been used. Ask for a new one.',
  'too-many-attempts': 'Too many attempts. Wait a few minutes, then try again.',
  network: "We couldn't reach the server. Check your connection and try again.",
};

/** The message for any error thrown by the api.ts functions. */
export function messageFor(error: unknown): string {
  return error instanceof AuthError ? errorMessages[error.code] : errorMessages.network;
}

/** Field checks before anything is sent. The server must check again. */
export function emailError(value: string): string | undefined {
  if (!value.trim()) return 'Enter your email address';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
    return 'Enter an email address like name@example.com';
  }
  return undefined;
}

export function newPasswordError(value: string, minLength: number): string | undefined {
  if (!value) return 'Enter a password';
  if ([...value].length < minLength) return `Use at least ${minLength} characters`;
  return undefined;
}
