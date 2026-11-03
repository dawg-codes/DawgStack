import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { User } from './api';

export interface SentEmail {
  email: string;
  reason: 'sign-up' | 'reset';
}

/**
 * What the screens share while someone signs in: the signed-in user, a sign-in waiting for its
 * code, and a message to show on the next screen (e.g. "Your password has been changed").
 * It lives in memory only; your server's session cookie is the real record of who's signed in.
 */
interface Session {
  user: User | null;
  pending: { challenge: string; email: string } | null;
  /** Where the last confirmation or reset email went. Kept here, not in the URL. */
  sentTo: SentEmail | null;
  notice: string | null;
  setUser: (user: User | null) => void;
  setPending: (pending: { challenge: string; email: string } | null) => void;
  setSentTo: (sentTo: SentEmail | null) => void;
  setNotice: (notice: string | null) => void;
}

const SessionContext = createContext<Session | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [pending, setPending] = useState<Session['pending']>(null);
  const [sentTo, setSentTo] = useState<SentEmail | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const value = useMemo(
    () => ({ user, pending, sentTo, notice, setUser, setPending, setSentTo, setNotice }),
    [user, pending, sentTo, notice],
  );
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const session = useContext(SessionContext);
  if (!session) throw new Error('useSession must be used inside <SessionProvider>.');
  return session;
}
