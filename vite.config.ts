import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import path from 'node:path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [preact()],
  root: 'src/renderer',
  base: './',
  server: {
    port: 5173
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src/renderer'),
      '@assets': path.resolve(__dirname, 'src/renderer/assets'),
    }
  },
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
  }
})
