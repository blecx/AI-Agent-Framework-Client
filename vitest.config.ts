import { defineConfig, configDefaults } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    // NOTE: Setting `test.exclude` overrides Vitest defaults.
    // Keep defaults (incl. node_modules) and add our Playwright E2E folder.
    exclude: [...configDefaults.exclude, 'client/e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'json-summary'],
      exclude: [
        ...(configDefaults.coverage?.exclude ?? []),
        'src/test/',
        'client/e2e/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData.ts',
      ],
      // Coverage thresholds: Set at current baseline to prevent regression
      // Goal: Incrementally increase as new tests are added
      // Target: 80% for all new files
      thresholds: {
        lines: 59,
        functions: 61,
        branches: 76,
        statements: 59,
      },
    },
  },
});
