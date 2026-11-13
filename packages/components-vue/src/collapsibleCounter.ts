// Module-level id counter for Collapsible (SSR-safe, deterministic per
// process). Kept in a shared helper so every instance draws from the same
// sequence, matching the original module counter.
let counter = 0;

export function nextCollapsibleUid(): string {
  return `st-collapsible-${++counter}`;
}
