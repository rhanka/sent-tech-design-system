import { createBench } from '../../../scripts/vue-conversion-bench/lib.mjs';
export const { bench, pkg, src, packageSrc, names, modulePath, buildFiles, require, compilers, compileSfc, installSourceLoader, wrapperSource, normalizeHtml } = createBench(import.meta.url, {
  names: ['Button', 'Badge', 'Alert', 'Input', 'Checkbox', 'Select', 'Tabs', 'Pagination', 'Tooltip', 'BarChart'],
});
