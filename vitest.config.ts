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
          globals: true,
          name: 'happy-dom',
          include: ['src/react-app/**/tests/ui/*.test.tsx'],
          environment: 'happy-dom',
          setupFiles: ['./src/test/setup.ts'],
        },
        resolve: {
          alias: {
            '@': path.resolve(__dirname, './src/react-app'),
          },
        },
      },
      {
        test: {
          globals: true,
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
