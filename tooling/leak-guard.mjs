#!/usr/bin/env node
// Leak guard: fails if a file, file name, commit message or commit author contains a blocked word.
//
// DawgStack is public. Some words must never appear in it (names of private projects,
// organisations or business domains). The list of those words isn't kept in this repository
// either, not even as hashes, because the hash of a short word can be confirmed by guessing.
// The list comes from:
//   - the LEAK_GUARD_HASHES environment variable (a GitHub Actions secret in CI), or
//   - a local .leak-guard-hashes file, which git ignores.
// Each entry is the SHA-256 hex digest of one lowercase word. Entries are separated by line
// breaks, commas or spaces; lines starting with # are ignored.
//
// Every word in every tracked file, and in every commit message and author, is hashed and
// compared against the list; matches are reported masked. Words joined in camelCase or
// PascalCase are also checked one by one ("acmePortal" is checked as "acme" and "portal").
// Without a list the guard fails in CI, so protection can't silently switch off, and only
// warns on your own machine.
//
// To hash a word:  node -e "console.log(require('crypto').createHash('sha256').update('word').digest('hex'))"
// To allow a line on purpose (rare, needs review): add the text  leak-guard-allow  to that line.
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname } from 'node:path';

const LOCAL_LIST = '.leak-guard-hashes';

function loadBlockedHashes() {
  const fromEnv = process.env.LEAK_GUARD_HASHES ?? '';
  const text = fromEnv.trim()
    ? fromEnv
    : existsSync(LOCAL_LIST)
      ? readFileSync(LOCAL_LIST, 'utf8')
      : '';
  const entries = text
    .split(/\r?\n/)
    .filter((line) => !line.trim().startsWith('#'))
    .join(' ')
    .toLowerCase()
    .match(/\b[0-9a-f]{64}\b/g);
  return new Set(entries ?? []);
}

const BLOCKED_WORD_HASHES = loadBlockedHashes();
if (BLOCKED_WORD_HASHES.size === 0) {
  const help =
    'no blocked-word list found. Set the LEAK_GUARD_HASHES environment variable (in CI, a ' +
    `repository secret) or create a local ${LOCAL_LIST} file; see tooling/leak-guard.mjs.`;
  if (process.env.CI) {
    console.error(`Leak guard: ${help}`);
    process.exit(1);
  }
  console.warn(`Leak guard: warning: ${help} Only the built-in patterns are checked.`);
}

// Plain patterns that reveal nothing on their own.
const BLOCKED_PATTERNS = [{ name: 'staff-ID-like code', re: /\bEMP\d{3,}\b/ }];

const SELF = 'tooling/leak-guard.mjs';
const SKIP_FILES = new Set([SELF, 'pnpm-lock.yaml']);
const BINARY_EXT = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
  '.ico',
  '.woff',
  '.woff2',
  '.ttf',
  '.otf',
  '.pdf',
  '.zip',
  '.tgz',
]);
const MAX_BYTES = 2 * 1024 * 1024;

const hashCache = new Map();
const isBlocked = (word) => {
  let hit = hashCache.get(word);
  if (hit === undefined) {
    hit = BLOCKED_WORD_HASHES.has(createHash('sha256').update(word).digest('hex'));
    hashCache.set(word, hit);
  }
  return hit;
};
const mask = (word) => `${word[0]}${'*'.repeat(Math.max(1, word.length - 1))}`;

// "myAcmeApp" -> "my Acme App", "ACMEPortal" -> "ACME Portal".
const splitCamel = (line) =>
  line.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');
const wordsOf = (line) =>
  new Set([
    ...(line.toLowerCase().match(/[a-z0-9]+/g) ?? []),
    ...(splitCamel(line)
      .toLowerCase()
      .match(/[a-z0-9]+/g) ?? []),
  ]);

function scanText(text, onHit) {
  text.split(/\r?\n/).forEach((line, i) => {
    if (line.includes('leak-guard-allow')) return;
    for (const word of wordsOf(line)) {
      if (isBlocked(word)) onHit(i + 1, `blocked term "${mask(word)}"`);
    }
    for (const { name, re } of BLOCKED_PATTERNS) {
      if (re.test(line)) onHit(i + 1, name);
    }
  });
}

const files = execFileSync(
  'git',
  ['ls-files', '--cached', '--others', '--exclude-standard', '-z'],
  { encoding: 'utf8' },
)
  .split('\0')
  .filter(Boolean);

const problems = [];
for (const file of files) {
  if (SKIP_FILES.has(file)) continue;
  scanText(file, (_, what) => problems.push(`${file} (file name): ${what}`));
  if (BINARY_EXT.has(extname(file).toLowerCase())) continue;
  let stat;
  try {
    stat = statSync(file);
  } catch {
    continue; // deleted in the working tree
  }
  if (!stat.isFile() || stat.size > MAX_BYTES) continue;
  scanText(readFileSync(file, 'utf8'), (line, what) => problems.push(`${file}:${line}: ${what}`));
}

// Commit messages and author details are public too. CI fetches the full history, so every
// commit is checked there; locally, every commit you have is checked.
let commits = 0;
try {
  const log = execFileSync('git', ['log', '--format=%h%x01%an%n%ae%n%cn%n%ce%n%B%x00'], {
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
  });
  for (const entry of log.split('\0')) {
    const [sha, text] = entry.replace(/^\n/, '').split('\x01');
    if (!sha || text === undefined) continue;
    commits += 1;
    scanText(text, (_, what) => problems.push(`commit ${sha} (message or author): ${what}`));
  }
} catch {
  // Not a git checkout, or no commits yet: nothing to check.
}

if (problems.length) {
  console.error(
    `Leak guard: ${problems.length} problem(s) found. Remove these before committing:\n`,
  );
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}
console.log(`Leak guard: ${files.length} files and ${commits} commits checked, nothing blocked.`);
