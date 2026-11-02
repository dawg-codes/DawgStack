export type PasswordScore = 0 | 1 | 2 | 3 | 4;

export interface PasswordStrength {
  /** 0 (very weak) to 4 (strong). */
  score: PasswordScore;
  /** Short description shown next to the meter, e.g. "Weak". */
  label: string;
}

const DEFAULT_LABELS = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong'] as const;

// A few of the most common passwords and their stems. Anything built on one scores 1 at most.
const COMMON = [
  'password',
  'passw0rd',
  'qwerty',
  'qwertyuiop',
  'asdfgh',
  'letmein',
  'welcome',
  'iloveyou',
  'abc123',
  '123456',
  '111111',
  'monkey',
  'dragon',
  'sunshine',
  'football',
  'baseball',
  'princess',
  'superman',
  'trustno1',
];

const SEQUENCES = ['abcdefghijklmnopqrstuvwxyz', '01234567890', 'qwertyuiopasdfghjklzxcvbnm'];

function hasRun(password: string) {
  const lower = password.toLowerCase();
  if (/(.)\1\1/.test(lower)) return true; // "aaa", "111"
  for (const seq of SEQUENCES) {
    for (let i = 0; i + 4 <= seq.length; i += 1) {
      const run = seq.slice(i, i + 4);
      if (lower.includes(run) || lower.includes([...run].reverse().join(''))) return true;
    }
  }
  return false;
}

/**
 * A rough, offline estimate of password strength for a strength meter. Length counts most;
 * mixing letter case, digits and symbols helps; common passwords, repeats and sequences
 * ("1234", "abcd", "qwer") count against it.
 *
 * It is a hint for users, not a security check: enforce your real rules on the server, and
 * consider checking new passwords against lists of breached passwords there.
 */
export function estimatePasswordStrength(
  password: string,
  labels: readonly [string, string, string, string, string] = DEFAULT_LABELS,
): PasswordStrength {
  const length = [...password].length;
  const kinds = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z\d]/].filter((re) => re.test(password)).length;

  let score: number;
  if (length < 8) score = 0;
  else if (length < 12) score = 1;
  else if (length < 16) score = 2;
  else if (length < 20) score = 3;
  else score = 4;

  if (kinds >= 3 && length >= 8) score += 1;
  if (kinds === 1 && length < 20) score -= 1;

  const lower = password.toLowerCase().replace(/[^a-z0-9]/g, '');
  const common = COMMON.some((word) => lower.includes(word));
  if (common || hasRun(password)) score = Math.min(score, length >= 16 ? 2 : 1);
  if (new Set(password).size <= 3) score = 0; // "aaaaaaaa", "abababab"

  const clamped = Math.max(0, Math.min(4, score)) as PasswordScore;
  return { score: clamped, label: labels[clamped] };
}
