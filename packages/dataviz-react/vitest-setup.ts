import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Unmount and clear the DOM between tests (parity with the svelteTesting plugin's
// auto-cleanup) so repeated `render()` calls don't accumulate duplicate nodes.
afterEach(() => {
  cleanup();
});
