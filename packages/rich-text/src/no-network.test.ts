/**
 * RED 8 — module-graph scan half plus the runtime no-network scenario.
 * Spec §11 RED 8, §5.9. Environment: J plus a static source scan.
 *
 * Observable assertion: rendering with sentinel `messages` shows exactly the
 * sentinel strings (component half, RT-1); the module-graph scan here asserts
 * the core graph imports no HTTP client module, no host-side editing module,
 * no business dependency and no app alias; the runtime scenario arms request
 * interception and `fetch`/`XMLHttpRequest` sentinels from mount through
 * typing, paste and unmount and records zero calls. A global `fetch` call
 * needs no import, so the scan alone never satisfies the network half.
 *
 * RED state (RT-0): the scan runs against the stub sources (it holds there);
 * the runtime scenario mounts the headless editor, which is a stub, so that
 * case fails with `RT-0 RED: headless editor not implemented` until phase B
 * lands. No case is skipped.
 */
import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { createHeadlessEditor } from "./editor.js";
import type {
  RichTextChangeEvent,
  RichTextBlock,
} from "./model.js";
import type { RichTextMessages } from "./messages.js";

const MESSAGES: RichTextMessages = {
  editorLabel: "Test editor",
  placeholder: "Test placeholder",
  preservedBlockLabel: "Preserved {kind} block",
  externalConflictLabel: "External change received",
};

// Tokens that must never appear in the core module graph: any HTTP client
// surface, any host-side editing or business dependency, any app alias.
// (The scan covers non-test sources only; test payloads legitimately carry
// hostile strings.)
const FORBIDDEN_SOURCE_TOKENS = [
  "fetch(",
  "XMLHttpRequest",
  "WebSocket",
  "http://",
  "https://",
  "@sentropic/focus",
  "apiPut",
  "$lib",
] as const;

function coreSources(): { file: string; text: string }[] {
  const dir = new URL("./", import.meta.url);
  return readdirSync(dir)
    .filter((file) => file.endsWith(".ts") && !file.endsWith(".test.ts"))
    .map((file) => ({
      file,
      text: readFileSync(new URL(file, dir), "utf8"),
    }));
}

describe("module-graph scan (static)", () => {
  for (const token of FORBIDDEN_SOURCE_TOKENS) {
    it(`no core source contains "${token}"`, () => {
      for (const { file, text } of coreSources()) {
        expect(
          text.includes(token),
          `${file} must not contain "${token}"`,
        ).toBe(false);
      }
    });
  }
});

describe("runtime network scenario (mount through unmount)", () => {
  it("records zero requests and zero fetch/XHR calls", async () => {
    const fetchCalls: unknown[][] = [];
    const previousFetch = (globalThis as Record<string, unknown>)["fetch"];
    (globalThis as Record<string, unknown>)["fetch"] = async (
      ...args: unknown[]
    ) => {
      fetchCalls.push(args);
      throw new Error("network blocked in test");
    };
    const xhrCalls: unknown[][] = [];
    const RealXHR = globalThis.XMLHttpRequest;
    class RecordingXHR extends RealXHR {
      override open(...args: unknown[]): void {
        xhrCalls.push(args);
        super.open(...(args as [string, string | URL]));
      }
    }
    globalThis.XMLHttpRequest = RecordingXHR as typeof XMLHttpRequest;
    try {
      const changes: RichTextChangeEvent[] = [];
      let n = 0;
      const block: RichTextBlock = {
        paragraphId: "paragraph:1",
        kind: "paragraph",
        text: "Alpha",
      };
      const editor = createHeadlessEditor({
        document: { format: "focus.markdown.p0@1", blocks: [block] },
        messages: MESSAGES,
        allocateId: () => `paragraph:net-${++n}`,
        onChange: (event) => {
          changes.push(event);
        },
      });
      editor.typeText("paragraph:1", " plus");
      editor.paste({ text: "pasted" });
      expect(changes.length).toBeGreaterThan(0);
      editor.destroy();
      expect(fetchCalls).toHaveLength(0);
      expect(xhrCalls).toHaveLength(0);
    } finally {
      (globalThis as Record<string, unknown>)["fetch"] = previousFetch;
      globalThis.XMLHttpRequest = RealXHR;
    }
  });
});
