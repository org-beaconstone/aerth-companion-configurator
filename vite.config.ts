import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  resolve: { dedupe: ['react', 'react-dom'] },
  optimizeDeps: {
    // ADS core icons publish CommonJS leaf entrypoints; make Vite's interop explicit.
    needsInterop: [
      'arrow-right',
      'arrow-left',
      'chevron-left',
      'chevron-right',
      'cross',
      'undo',
      'expand-horizontal',
      'link-external',
      'download',
      'link',
    ].map(name => `@atlaskit/icon/core/${name}`),
  },
  base: './',
  server: { port: 5174 },
  build: { outDir: 'dist', sourcemap: false },
});
