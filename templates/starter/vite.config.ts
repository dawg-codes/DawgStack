import { getThemeScript } from '@dawg-codes/react-toolkit/theme';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    react(),
    {
      // Applies the saved light/dark/system choice before the first paint, so it never flashes.
      name: 'dawg-theme-script',
      transformIndexHtml: () => [
        { tag: 'script', children: getThemeScript(), injectTo: 'head-prepend' },
      ],
    },
  ],
});
