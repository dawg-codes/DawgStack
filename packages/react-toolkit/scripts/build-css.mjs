#!/usr/bin/env node
// Builds the package's CSS files into dist/:
//   dist/core.css          tokens, themes, keyframes and utilities (always needed)
//   dist/css/<name>.css    one file per component, for importing components individually
//   dist/styles.css        core.css plus every component, for importing everything at once
// The source files are plain CSS already wrapped in cascade layers, so they are copied as-is.
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const src = join(root, 'src');
const dist = join(root, 'dist');
const LAYER_ORDER = '@layer dawg.tokens, dawg.components, dawg.utilities;';

const core = readFileSync(join(src, 'styles', 'core.css'), 'utf8');
if (!core.includes(LAYER_ORDER)) throw new Error('core.css must declare the layer order first');

const components = readdirSync(join(src, 'components'), { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort()
  .filter((name) => existsSync(join(src, 'components', name, `${name}.css`)));

mkdirSync(join(dist, 'css'), { recursive: true });
writeFileSync(join(dist, 'core.css'), core);

const parts = [core];
for (const name of components) {
  const css = readFileSync(join(src, 'components', name, `${name}.css`), 'utf8');
  if (!css.includes('@layer dawg.components')) {
    throw new Error(`${name}.css must wrap its rules in @layer dawg.components`);
  }
  // Repeat the layer order so the file is correct even if imported before core.css.
  writeFileSync(join(dist, 'css', `${name}.css`), `${LAYER_ORDER}\n\n${css}`);
  parts.push(`/* ---------- ${name} ---------- */\n${css}`);
}
writeFileSync(join(dist, 'styles.css'), parts.join('\n'));

console.log(`CSS: core.css, styles.css and ${components.length} component file(s) written.`);
