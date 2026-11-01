#!/usr/bin/env node
// Writes the "exports" and "typesVersions" maps in package.json from the component folders in src/components.
// Run after adding or renaming a component:  pnpm sync-exports
// A unit test (test/package-exports.test.ts) fails if package.json is out of date.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { componentEntries, expectedExports, expectedTypesVersions } from './exports-map.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const pkgPath = join(root, 'package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
const components = componentEntries(root);
pkg.typesVersions = expectedTypesVersions(components);
pkg.exports = expectedExports(components);
writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
console.log(`exports: ${Object.keys(pkg.exports).length} entries written to package.json`);
