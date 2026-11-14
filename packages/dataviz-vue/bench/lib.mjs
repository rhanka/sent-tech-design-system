import { reviewCorrections } from './review-corrections.mjs';
import { createBench } from '../../../scripts/vue-conversion-bench/lib.mjs';
export const { bench, pkg, src, packageSrc, names, modulePath, buildFiles, require, compilers, compileSfc, installSourceLoader, wrapperSource, normalizeHtml, mountedHtml } = createBench(import.meta.url, { reviewCorrections, sourceDir: 'lib', vaporDesignSystem: true, legacyModules: { WebFrame: 'ObjectLayers', DataImage: 'ObjectLayers', ObjectLayerPanel: 'ObjectLayers' } });
export { reviewCorrections };
