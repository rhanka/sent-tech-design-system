/**
 * RED 8 — forbidden-import scan over both module graphs plus the runtime
 * no-network scenario through "./editor". Spec §11 RED 8, §5.9.
 * Environment: J plus a static source scan.
 *
 * Observable assertion: rendering with sentinel `messages` shows exactly the
 * sentinel strings (component half, RT-1); the forbidden-import scan asserts
 * that neither module graph — the transitive graph reachable from `"."`
 * (`src/index.ts`) nor the transitive graph reachable from `"./editor"`
 * (`src/editor.ts` and its `editor-*.ts` helpers) — imports an HTTP client
 * module, `@sentropic/focus`, a Track type, an `apiPut`-shaped dependency
 * or a `$lib` specifier (Focus, HTTP, app and network imports), so a
 * forbidden import inside `editor-*.ts` fails RT-0; the runtime scenario
 * arms request interception and `fetch`/`XMLHttpRequest` sentinels from
 * mount through typing, paste and unmount and records zero calls. A global
 * `fetch` call needs no import, so the scan alone never satisfies the
 * network half. The "no Tiptap/ProseMirror" assertion is the separate RED-P
 * check and stays in `packaging.test.ts` on `"."` only: `"./editor"`
 * legitimately loads Tiptap/ProseMirror and is never failed for doing so.
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

// Tokens that must never appear in either module graph: any HTTP client
// surface, any host-side editing or business dependency, any Track type, any
// app alias. (The scan covers non-test sources reachable from each entry
// only; test payloads legitimately carry other strings. Tiptap/ProseMirror
// specifiers are not forbidden here — see `packaging.test.ts` RED-P.)
const FORBIDDEN_SOURCE_TOKENS = [
  "fetch(",
  "XMLHttpRequest",
  "WebSocket",
  "http://",
  "https://",
  "@sentropic/focus",
  "@sentropic/track",
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

/** Non-test sources reachable from one entry file through relative imports. */
function entrySources(entry: string): { file: string; text: string }[] {
  const seen = new Set<string>([entry]);
  const queue = [entry];
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

/** Both scanned graphs: `"."` (`src/index.ts`) and `"./editor"`
    (`src/editor.ts` including its `editor-*.ts` helpers). */
const SCANNED_GRAPHS = [
  { entry: "index.ts", label: '"." graph (src/index.ts)' },
  { entry: "editor.ts", label: '"./editor" graph (src/editor.ts)' },
] as const;

describe("forbidden-import scan (static, both graphs)", () => {
  for (const { entry, label } of SCANNED_GRAPHS) {
    for (const token of FORBIDDEN_SOURCE_TOKENS) {
      it(`${label} contains no "${token}"`, () => {
        const sources = entrySources(entry);
        expect(sources.length).toBeGreaterThan(0);
        for (const { file, text } of sources) {
          expect(
            text.includes(token),
            `${file} (${label}) must not contain "${token}"`,
          ).toBe(false);
        }
      });
    }
  }

  it('the "./editor" graph actually covers the editor helpers', () => {
    const files = entrySources("editor.ts").map(({ file }) => file);
    expect(files).toContain("editor-conversion.ts");
    expect(files).toContain("editor-identity.ts");
    expect(files).toContain("editor-paste.ts");
    expect(files).toContain("editor-extensions.ts");
  });
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
