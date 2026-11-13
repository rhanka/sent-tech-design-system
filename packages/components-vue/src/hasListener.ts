/** Vue listeners can be merged arrays and can use the .once modifier. */
export type Listener<T extends unknown[] = []> = ((...args: T) => void) | ((...args: T) => void)[];
export function hasListener(value: unknown, once?: unknown): boolean {
  const callable = (candidate: unknown): boolean => typeof candidate === 'function'
    || (Array.isArray(candidate) && candidate.some(fn => typeof fn === 'function'));
  return callable(value) || callable(once);
}
