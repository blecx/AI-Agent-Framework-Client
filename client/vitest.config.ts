import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: path.resolve(__dirname, './src/test/setup.ts'),
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/e2e/**',
      '**/.{idea,git,cache,output,temp}/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/e2e/**',
        '**/*.config.*',
        '**/test/**',
        '**/scripts/**',
        '**/*.test.*',
        '**/*.spec.*',
      ],
      thresholds: {
        // Set at current baseline to prevent regression
        // Goal: Incrementally increase as tests are added
        // Target: 80% for all new files/features
        lines: 59,
        functions: 61,
        branches: 76,
        statements: 59,
      },
    },
  },
});
