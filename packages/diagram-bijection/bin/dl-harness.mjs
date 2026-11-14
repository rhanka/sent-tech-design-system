#!/usr/bin/env node
// Thin launcher over dist/: the implementation lives in src/ and is built by
// `npm run build -w @sentropic/diagram-bijection`.
import { existsSync } from "node:fs";

const entry = new URL("../dist/src/harness/cli.js", import.meta.url);
if (!existsSync(entry)) {
  console.error("dl-harness: dist/ is not built; run `npm run build -w @sentropic/diagram-bijection` first.");
  process.exit(1);
}
const mod = await import(entry);
process.exit(await mod.main(process.argv));
