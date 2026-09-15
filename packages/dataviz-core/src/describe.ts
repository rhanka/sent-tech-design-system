/**
 * Locale-neutral labels for core BI state.
 *
 * These helpers produce stable text for adapter-owned presentation such as
 * FilterPill values. They intentionally avoid framework and design-system
 * imports so React, Svelte and Vue share exactly the same wording.
 */

import type { Dimension } from './model.js';
import type { FilterSpec } from './store.js';

export function describeFilterSpec(spec: FilterSpec, _dimension?: Dimension): string {
  switch (spec.kind) {
    case 'include':
      return spec.values.join(', ');
    case 'exclude':
      return `≠ ${spec.values.join(', ')}`;
    case 'range': {
      const { min, max } = spec;
      if (min !== undefined && max !== undefined) return `${min} – ${max}`;
      if (min !== undefined) return `≥ ${min}`;
      if (max !== undefined) return `≤ ${max}`;
      return 'tous';
    }
  }
}
