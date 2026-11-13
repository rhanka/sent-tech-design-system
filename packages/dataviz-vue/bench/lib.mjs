import { createBench } from '../../../scripts/vue-conversion-bench/lib.mjs';
export const { bench, pkg, src, packageSrc, names, modulePath, buildFiles, require, compilers, compileSfc, installSourceLoader, wrapperSource, normalizeHtml } = createBench(import.meta.url, { sourceDir: 'lib', vaporDesignSystem: true });
