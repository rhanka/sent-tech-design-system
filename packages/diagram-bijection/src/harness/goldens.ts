// Golden digests (§2.2): fixtures/goldens/<format>/<fixture id>.json, schema
// ds.bijection-goldens/1, written only by `dl-harness.mjs goldens --update`.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { GoldenStore } from "./types.js";

export interface GoldensFile {
  readonly schema: "ds.bijection-goldens/1";
  readonly format: string;
  readonly fixture: { readonly id: string; readonly sha256: string };
  readonly digests: Readonly<Record<string, string>>; // "<view>|<fold state id>" -> sha256
}

export function goldensFilePath(fixturesRoot: string, format: string, fixtureId: string): string {
  return join(fixturesRoot, "goldens", format, `${fixtureId}.json`);
}

export function readGoldensFile(path: string): GoldensFile {
  const parsed = JSON.parse(readFileSync(path, "utf8")) as GoldensFile;
  if (parsed.schema !== "ds.bijection-goldens/1") throw new Error(`goldens schema must be ds.bijection-goldens/1: ${path}`);
  return parsed;
}

/** A GoldenStore over the fixtures directory of the package. */
export function fixtureGoldenStore(fixturesRoot: string): GoldenStore {
  const cache = new Map<string, GoldensFile>();
  return {
    digest(format, fixtureId, fold) {
      const key = `${format}/${fixtureId}`;
      let file = cache.get(key);
      if (file === undefined) {
        try {
          file = readGoldensFile(goldensFilePath(fixturesRoot, format, fixtureId));
        } catch {
          return undefined;
        }
        cache.set(key, file);
      }
      return file.digests[`${fold.view}|${fold.id}`];
    },
  };
}
