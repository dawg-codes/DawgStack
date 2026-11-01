// Shared by scripts/sync-exports.mjs and the package-exports unit test.
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

/** Component folder names that have an index.ts, sorted. */
export function componentEntries(root) {
  const dir = join(root, 'src', 'components');
  return readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(join(dir, d.name, 'index.ts')))
    .map((d) => d.name)
    .sort();
}

const entry = (name) => ({
  import: { types: `./dist/${name}.d.ts`, default: `./dist/${name}.js` },
  require: { types: `./dist/${name}.d.cts`, default: `./dist/${name}.cjs` },
});

/** The exports map the package should have for the given component entries. */
export function expectedExports(components) {
  return {
    '.': entry('index'),
    ...Object.fromEntries(components.map((name) => [`./${name}`, entry(name)])),
    './core.css': './dist/core.css',
    './styles.css': './dist/styles.css',
    './css/*.css': './dist/css/*.css',
    './package.json': './package.json',
  };
}

/**
 * Type paths for TypeScript's legacy `moduleResolution: "node"` (node10), which ignores
 * "exports". Without this, subpath imports like "@dawg-codes/react-toolkit/button" have no types
 * there. The root import uses the top-level "types" field instead.
 */
export function expectedTypesVersions(components) {
  return {
    '*': Object.fromEntries(components.map((name) => [name, [`./dist/${name}.d.cts`]])),
  };
}
