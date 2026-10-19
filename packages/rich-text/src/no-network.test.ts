/**
 * RED 8 — module-graph scan half over the pure entry plus the runtime
 * no-network scenario through "./editor". Spec §11 RED 8, §5.9.
 * Environment: J plus a static source scan.
 *
 * Observable assertion: rendering with sentinel `messages` shows exactly the
 * sentinel strings (component half, RT-1); the module-graph scan here asserts
 * the pure-entry graph imports no HTTP client module, no host-side editing
 * module, no business dependency and no app alias; the runtime scenario arms
 * request interception and `fetch`/`XMLHttpRequest` sentinels from mount
 * through typing, paste and unmount and records zero calls. A global `fetch`
 * call needs no import, so the scan alone never satisfies the network half.
 * The static scan is scoped to the import graph reachable from
 * `src/index.ts` (a flat `src/` scan would now correctly fail on the
 * Tiptap-bound `editor*.ts` files); the runtime scenario imports the editor
 * entry dynamically inside that scenario only.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
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

// Tokens that must never appear in the pure-entry module graph: any HTTP
// client surface, any host-side editing or business dependency, any app
// alias. (The scan covers "."-reachable non-test sources only; the
// "./editor" entry and test payloads legitimately carry other strings.)
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

const SRC_DIR = dirname(fileURLToPath(import.meta.url));

function specifiersOf(file: string): string[] {
  const text = readFileSync(join(SRC_DIR, file), "utf8");
  return [...text.matchAll(/from\s+["']([^"']+)["']/g)].map(
    (match) => match[1] as string,
  );
}

/** Non-test sources reachable from `src/index.ts` through relative imports. */
function pureEntrySources(): { file: string; text: string }[] {
  const seen = new Set<string>(["index.ts"]);
  const queue = ["index.ts"];
  while (queue.length > 0) {
    const file = queue.pop() as string;
    for (const specifier of specifiersOf(file)) {
      if (!specifier.startsWith(".")) continue;
      const target = `${specifier.replace(/\.js$/, "")}.ts`.replace(
        /^\.\//,
        "",
      );
      if (!seen.has(target)) {
        seen.add(target);
        queue.push(target);
      }
    }
  }
  return [...seen].map((file) => ({
    file,
    text: readFileSync(join(SRC_DIR, file), "utf8"),
  }));
}

describe("module-graph scan (static, pure entry)", () => {
  for (const token of FORBIDDEN_SOURCE_TOKENS) {
    it(`no pure-entry source contains "${token}"`, () => {
      for (const { file, text } of pureEntrySources()) {
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
      const { createRichTextEditor } = await import("./editor.js");
      const changes: RichTextChangeEvent[] = [];
      let n = 0;
      const block: RichTextBlock = {
        paragraphId: "paragraph:1",
        kind: "paragraph",
        text: "Alpha",
      };
      const editor = createRichTextEditor({
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
