/// <reference types="vitest" />

import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  test: {
    projects: [
      {
        test: {
          name: 'jsdom',
          include: ['src/react-app/**/tests/jsdom/*.test.tsx'],
          environment: 'jsdom',
          setupFiles: ['./src/test/setup.ts'],
          css: true,
        },
        resolve: {
          alias: {
            '@': path.resolve(__dirname, './src/react-app'),
          },
        },
      },
      {
        test: {
          name: 'browser',
          include: ['src/react-app/**/tests/browser/*.test.tsx'],
          browser: {
            provider: 'playwright',
            enabled: true,
            instances: [{ browser: 'chromium' }],
          },
        },
        resolve: {
          alias: {
            '@': path.resolve(__dirname, './src/react-app'),
          },
        },
      },
    ],
  },
});
