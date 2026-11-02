// @vitest-environment node
// Guards against drift between component folders, the root index and package.json "exports".
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  componentEntries,
  expectedExports,
  expectedTypesVersions,
} from '../scripts/exports-map.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const pkg = JSON.parse(readFileSync(`${root}/package.json`, 'utf8')) as {
  exports: Record<string, unknown>;
  typesVersions: Record<string, unknown>;
  peerDependencies: Record<string, string>;
  dependencies?: Record<string, string>;
};
const components = componentEntries(root);

describe('package entry points', () => {
  it('has an exports entry for every component folder (run `pnpm sync-exports` if this fails)', () => {
    expect(pkg.exports).toEqual(expectedExports(components));
    expect(pkg.typesVersions).toEqual(expectedTypesVersions(components));
  });

  it('re-exports every component from the root index', () => {
    const index = readFileSync(`${root}/src/index.ts`, 'utf8');
    for (const name of components) {
      expect(index).toContain(`'./components/${name}'`);
    }
  });

  it('has React as its only peer dependency and no runtime dependencies', () => {
    expect(Object.keys(pkg.peerDependencies)).toEqual(['react']);
    expect(pkg.dependencies ?? {}).toEqual({});
  });
});
