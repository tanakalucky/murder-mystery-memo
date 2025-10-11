/// <reference types="vitest" />

import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
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
