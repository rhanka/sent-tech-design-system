import { createLayoutCache, type LayoutCacheConfig } from "../../src/index.js";
import type { SceneDocument, SceneView, SceneLayoutCache } from "../../src/presentation/diagramSceneModel.js";
import type { LayoutOptions, LayoutResult } from "../../src/index.js";

const config: LayoutCacheConfig = { maxEntries: 32, maxBytes: 16 * 1024 * 1024 };
const cache: SceneLayoutCache = createLayoutCache(config);
// A host can supply a structural cache using only the public canvas boundary.
const structural: SceneLayoutCache = {
  layout: (_document: SceneDocument, _options: LayoutOptions, _source?: SceneView): LayoutResult => { throw new Error("type fixture"); },
  layoutFolded: (_document: SceneDocument, _source: SceneView, _options: LayoutOptions): LayoutResult => { throw new Error("type fixture"); },
  has: () => false, clear() {}, dispose() {}, stats: cache.stats,
};
void structural;
