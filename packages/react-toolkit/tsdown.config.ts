import { existsSync, readdirSync } from 'node:fs';
import { defineConfig } from 'tsdown';

// One entry per component folder, so every component can be imported on its own:
//   import { Button } from '@dawg-codes/react-toolkit/button';
const components = readdirSync('src/components', { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(`src/components/${d.name}/index.ts`))
  .map((d) => d.name)
  .sort();

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    ...Object.fromEntries(components.map((name) => [name, `src/components/${name}/index.ts`])),
  },
  format: ['esm', 'cjs'],
  platform: 'neutral',
  target: 'es2020',
  dts: true,
  clean: true,
  // React is a peer dependency. Fail the build if anything from node_modules gets bundled,
  // which would ship a second copy of React (or anything else) to consumers.
  deps: { onlyBundle: [] },
  // Components are interactive React code; mark every chunk for React Server Components setups.
  banner: { js: "'use client';" },
});
