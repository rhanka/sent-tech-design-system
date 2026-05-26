import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";
import type { AuditTarget } from "../types.js";

/**
 * Open a JSDOM window for the given audit target.
 */
export async function openDom(target: AuditTarget): Promise<JSDOM> {
  switch (target.kind) {
    case "html":
      return new JSDOM(target.value, { url: "https://design.local/" });
    case "file": {
      const html = readFileSync(target.value, "utf8");
      return new JSDOM(html, { url: `file://${target.value}` });
    }
    case "url": {
      const response = await fetch(target.value);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${target.value}: ${response.status} ${response.statusText}`);
      }
      const html = await response.text();
      return new JSDOM(html, { url: target.value });
    }
  }

  const exhaustive = target.kind;
  throw new Error(`Unsupported audit target kind: ${String(exhaustive)}`);
}
