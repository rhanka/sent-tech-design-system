import { defineConfig } from 'vitest/config';

// Run from the repository root:
//   npm run parity:dataviz-angular
// It reads the BUILT dist/ of dataviz-angular, dataviz-react, components-angular
// and components-react, so `npm run build` must have run first.
export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['tools/dataviz-angular-parity/*.test.ts'],
    setupFiles: ['./tools/dataviz-angular-parity/setup.ts'],
    testTimeout: 60000,
  },
});
