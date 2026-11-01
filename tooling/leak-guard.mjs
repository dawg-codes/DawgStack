#!/usr/bin/env node
// Leak guard: fails if a committed (or about-to-be-committed) file contains a blocked term.
//
// DawgStack is public. Some words must never appear in it (names of private projects,
// organisations or business domains). Listing those words here in plain text would itself
// leak them, so this file stores only SHA-256 hashes of lowercase words. Every word in every
// tracked file is hashed and compared against the list; matches are reported masked.
//
// To check a candidate word:  node -e "console.log(require('crypto').createHash('sha256').update('word').digest('hex'))"
// To allow a line on purpose (rare, needs review): add the text  leak-guard-allow  to that line.
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync, statSync } from 'node:fs';
import { extname } from 'node:path';

const BLOCKED_WORD_HASHES = new Set([
]);

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

function scanText(text, onHit) {
  text.split(/\r?\n/).forEach((line, i) => {
    if (line.includes('leak-guard-allow')) return;
    for (const word of line.toLowerCase().match(/[a-z0-9]+/g) ?? []) {
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

if (problems.length) {
  console.error(
    `Leak guard: ${problems.length} problem(s) found. Remove these before committing:\n`,
  );
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}
console.log(`Leak guard: ${files.length} files checked, nothing blocked.`);
