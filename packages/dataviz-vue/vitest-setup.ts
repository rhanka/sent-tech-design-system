import { afterEach } from 'vitest';
import { enableAutoUnmount } from '@vue/test-utils';

// Unmount mounted wrappers after each test so store subscriptions are torn down
// (via onScopeDispose) and nothing leaks between tests.
enableAutoUnmount(afterEach);
