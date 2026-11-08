import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fireEvent, render } from "@testing-library/svelte";
import { ICON_NAMES } from "@sentropic/design-system-svelte";
import { compileTheme } from "@sentropic/design-system-themes";
import { compile, parse } from "svelte/compiler";
import type { ComponentProps } from "svelte";
import { describe, expect, it, vi } from "vitest";
import BlockCandidateList from "./BlockCandidateList.svelte";
import CommentModeStatus from "./CommentModeStatus.svelte";
import { makeBlocks, modeLabels, viewerThemes } from "./fixtures.js";
import type { BlockCandidateListEvents } from "./types.js";

// W-1.7 — BlockCandidateList witness (F-C1…F-C4), the list-focused staged-Esc
// half of the W-1.8 harness, F-R1, F-X1, and the W-1.9 source scan of the five
// AS-1 .svelte files (no natural-language literal outside the allowlist).

const SOURCE = readFileSync(resolve("src/lib/BlockCandidateList.svelte"), "utf8");
const COMPILED_CSS = compile(SOURCE, { css: "external", filename: "BlockCandidateList.svelte" }).css?.code ?? "";

function renderInTheme(props: ComponentProps<typeof BlockCandidateList>) {
  const themeRoot = document.createElement("div");
  themeRoot.setAttribute("data-st-theme", "sent-tech");
  document.body.appendChild(themeRoot);
  return { ...render(BlockCandidateList, { props, target: themeRoot }), themeRoot };
}

function listProps(labels = modeLabels(), overrides: Record<string, unknown> = {}) {
  return {
    open: true,
    candidates: makeBlocks(3),
    activeKey: null,
    selectedKey: null,
    headingLabel: labels.headingLabel,
    ...overrides
  };
}

function listEvents() {
  return {
    onPickBlock: vi.fn(),
    onActiveKeyChange: vi.fn(),
    onAnchor: vi.fn(),
    onClose: vi.fn()
  };
}

function rows(themeRoot: HTMLElement): HTMLElement[] {
  return [...themeRoot.querySelectorAll('[role="option"]')] as HTMLElement[];
}

describe("W-1.7 BlockCandidateList (F-C1 / F-C2 / F-C3 / F-C4)", () => {
  it("F-C1 open selects nothing: listbox + labelled heading + option rows; activeKey/selectedKey null → no active/selected row, no mount event", () => {
    const labels = modeLabels();
    const blocks = makeBlocks(3);
    const events = listEvents();
    const { themeRoot } = renderInTheme({ ...listProps(labels, { candidates: blocks }), ...events });

    const list = themeRoot.querySelector('[role="listbox"]') as HTMLElement;
    expect(list).toBeTruthy();
    expect(list.getAttribute("data-st-shell")).toBe("block-candidate-list");
    // aria-labelledby names the heading
    const headingId = list.getAttribute("aria-labelledby");
    expect(headingId).toBeTruthy();
    const heading = themeRoot.querySelector(`#${headingId}`) as HTMLElement;
    expect(heading).toBeTruthy();
    expect(heading.textContent).toBe(labels.headingLabel);

    const rs = rows(themeRoot);
    expect(rs.length).toBe(3);
    for (const row of rs) {
      expect(row.getAttribute("aria-selected")).toBe("false");
      expect(row.classList.contains("st-blockCandidateList__row--active")).toBe(false);
      expect(row.classList.contains("st-blockCandidateList__row--selected")).toBe(false);
      // roving tabIndex: nothing active → every row out of the Tab order
      expect(row.getAttribute("tabindex")).toBe("-1");
    }
    // no event fires on mount
    expect(events.onPickBlock).not.toHaveBeenCalled();
    expect(events.onActiveKeyChange).not.toHaveBeenCalled();
    expect(events.onAnchor).not.toHaveBeenCalled();
    expect(events.onClose).not.toHaveBeenCalled();
  });

  it("F-C2 keyboard: clamped arrows emit neighbour keys, null activeKey emits first (Down) / last (Up), Home/End emit first/last, Enter → onAnchor(activeKey), Esc → onClose only", async () => {
    const labels = modeLabels();
    const blocks = makeBlocks(3);
    const events = listEvents();
    const { themeRoot, rerender } = renderInTheme({
      ...listProps(labels, { candidates: blocks, activeKey: blocks[0].key }),
      ...events
    });
    const list = themeRoot.querySelector('[role="listbox"]') as HTMLElement;

    // ArrowDown from the first row emits the second key, captured
    expect(await fireEvent.keyDown(list, { key: "ArrowDown" })).toBe(false);
    expect(events.onActiveKeyChange).toHaveBeenLastCalledWith(blocks[1].key);
    // ArrowUp at the first row clamps (no wrap) to the first key
    await fireEvent.keyDown(list, { key: "ArrowUp" });
    expect(events.onActiveKeyChange).toHaveBeenLastCalledWith(blocks[0].key);
    // Home/End → first/last
    await fireEvent.keyDown(list, { key: "End" });
    expect(events.onActiveKeyChange).toHaveBeenLastCalledWith(blocks[2].key);
    await fireEvent.keyDown(list, { key: "Home" });
    expect(events.onActiveKeyChange).toHaveBeenLastCalledWith(blocks[0].key);

    // from activeKey null: Down → first, Up → last
    await rerender({ ...listProps(labels, { candidates: blocks, activeKey: null }), ...events });
    await fireEvent.keyDown(list, { key: "ArrowDown" });
    expect(events.onActiveKeyChange).toHaveBeenLastCalledWith(blocks[0].key);
    await fireEvent.keyDown(list, { key: "ArrowUp" });
    expect(events.onActiveKeyChange).toHaveBeenLastCalledWith(blocks[2].key);

    // Enter emits onAnchor with the active key
    await rerender({ ...listProps(labels, { candidates: blocks, activeKey: blocks[1].key }), ...events });
    expect(await fireEvent.keyDown(list, { key: "Enter" })).toBe(false);
    expect(events.onAnchor).toHaveBeenCalledTimes(1);
    expect(events.onAnchor).toHaveBeenLastCalledWith(blocks[1].key);

    // Esc emits onClose as its own stage — and nothing else
    const anchorCalls = events.onAnchor.mock.calls.length;
    const cycleCalls = events.onActiveKeyChange.mock.calls.length;
    expect(await fireEvent.keyDown(list, { key: "Escape" })).toBe(false);
    expect(events.onClose).toHaveBeenCalledTimes(1);
    expect(events.onAnchor.mock.calls.length).toBe(anchorCalls);
    expect(events.onActiveKeyChange.mock.calls.length).toBe(cycleCalls);

    // empty candidates: arrows/Home/End emit nothing
    await rerender({ ...listProps(labels, { candidates: [], activeKey: null }), ...events });
    const before = events.onActiveKeyChange.mock.calls.length;
    await fireEvent.keyDown(list, { key: "ArrowDown" });
    await fireEvent.keyDown(list, { key: "ArrowUp" });
    await fireEvent.keyDown(list, { key: "Home" });
    await fireEvent.keyDown(list, { key: "End" });
    expect(events.onActiveKeyChange.mock.calls.length).toBe(before);
  });

  it("F-C2 keydown on a row bubbles to the list root (focus is on the row)", async () => {
    const labels = modeLabels();
    const blocks = makeBlocks(3);
    const events = listEvents();
    const { themeRoot } = renderInTheme({
      ...listProps(labels, { candidates: blocks, activeKey: blocks[0].key }),
      ...events
    });
    const row = rows(themeRoot)[0];
    expect(await fireEvent.keyDown(row, { key: "ArrowDown" })).toBe(false);
    expect(events.onActiveKeyChange).toHaveBeenLastCalledWith(blocks[1].key);
  });

  it("F-C3 rows: label + kindLabel on every row; count text only when threadCount > 0", () => {
    const labels = modeLabels();
    const blocks = makeBlocks(3);
    blocks[0].threadCount = 0;
    blocks[1].threadCount = 2;
    blocks[2].threadCount = 5;
    const { themeRoot } = renderInTheme({ ...listProps(labels, { candidates: blocks }), ...listEvents() });

    const rs = rows(themeRoot);
    expect(rs.length).toBe(3);
    rs.forEach((row, i) => {
      expect(row.textContent).toContain(blocks[i].label);
      expect(row.textContent).toContain(blocks[i].kindLabel);
    });
    expect(rs[0].querySelector(".st-blockCandidateList__count")).toBeNull();
    expect(rs[1].querySelector(".st-blockCandidateList__count")?.textContent).toBe("2");
    expect(rs[2].querySelector(".st-blockCandidateList__count")?.textContent).toBe("5");
  });

  it("F-C4 pointer pick: row click emits onPickBlock(rowKey) exactly once and no onAnchor", async () => {
    const labels = modeLabels();
    const blocks = makeBlocks(3);
    const events = listEvents();
    const { themeRoot } = renderInTheme({
      ...listProps(labels, { candidates: blocks, selectedKey: null }),
      ...events
    });
    const row = rows(themeRoot)[1];
    await fireEvent.click(row);
    expect(events.onPickBlock).toHaveBeenCalledTimes(1);
    expect(events.onPickBlock).toHaveBeenCalledWith(blocks[1].key);
    expect(events.onAnchor).not.toHaveBeenCalled();
  });

  it("active vs selected rows are distinct attributes/cues: active row gets the active class + roving tabIndex 0; selected row gets aria-selected + selected class", () => {
    const labels = modeLabels();
    const blocks = makeBlocks(3);
    const { themeRoot } = renderInTheme({
      ...listProps(labels, { candidates: blocks, activeKey: blocks[0].key, selectedKey: blocks[1].key }),
      ...listEvents()
    });
    const rs = rows(themeRoot);
    expect(rs[0].classList.contains("st-blockCandidateList__row--active")).toBe(true);
    expect(rs[0].getAttribute("tabindex")).toBe("0");
    expect(rs[0].getAttribute("aria-selected")).toBe("false");
    expect(rs[1].classList.contains("st-blockCandidateList__row--selected")).toBe(true);
    expect(rs[1].getAttribute("aria-selected")).toBe("true");
    expect(rs[1].classList.contains("st-blockCandidateList__row--active")).toBe(false);
    expect(rs[1].getAttribute("tabindex")).toBe("-1");
    // compiled CSS: active and selected differ by background AND a non-colour
    // cue (inset bar / weight), never colour alone
    expect(COMPILED_CSS).toContain("st-blockCandidateList__row--active");
    expect(COMPILED_CSS).toContain("st-blockCandidateList__row--selected");
    const activeRule = COMPILED_CSS.slice(COMPILED_CSS.indexOf("st-blockCandidateList__row--active"));
    expect(activeRule).toMatch(/box-shadow:\s*inset/);
    const selectedRule = COMPILED_CSS.slice(COMPILED_CSS.indexOf("st-blockCandidateList__row--selected"));
    expect(selectedRule).toMatch(/font-weight/);
  });

  it("closed (open=false) renders nothing", () => {
    const { themeRoot } = renderInTheme({ ...listProps(modeLabels(), { open: false }), ...listEvents() });
    expect(themeRoot.querySelector('[role="listbox"]')).toBeNull();
    expect(themeRoot.childElementCount).toBe(0);
  });
});

describe("W-1.8 list-focused staged Esc (harness half in this file)", () => {
  it("Esc in the open list emits onClose only (its own stage); a later Esc in the status emits onExitRequest — list stage unwinds before the status stage", async () => {
    const labels = modeLabels();
    const blocks = makeBlocks(3);
    const themeRoot = document.createElement("div");
    themeRoot.setAttribute("data-st-theme", "sent-tech");
    document.body.appendChild(themeRoot);

    const listEventsObj = listEvents();
    render(BlockCandidateList, {
      target: themeRoot,
      props: { ...listProps(labels, { candidates: blocks, activeKey: blocks[0].key }), ...listEventsObj }
    });
    const statusEvents = { onExitRequest: vi.fn(), onCycleBlock: vi.fn(), onAnchor: vi.fn() };
    render(CommentModeStatus, {
      target: themeRoot,
      props: {
        visible: true,
        statusText: labels.statusText,
        announcementText: labels.announcementText,
        candidates: blocks,
        activeKey: blocks[0].key,
        ...statusEvents
      }
    });

    // Esc while focus is on a list row: the list stage closes only
    const row = rows(themeRoot)[0];
    row.focus();
    expect(await fireEvent.keyDown(row, { key: "Escape" })).toBe(false);
    expect(listEventsObj.onClose).toHaveBeenCalledTimes(1);
    expect(listEventsObj.onAnchor).not.toHaveBeenCalled();
    expect(listEventsObj.onActiveKeyChange).not.toHaveBeenCalled();
    expect(statusEvents.onExitRequest).not.toHaveBeenCalled();

    // a later Esc in the status is the next stage (Armed → Off)
    const statusRoot = themeRoot.querySelector('[data-st-shell="comment-mode-status"]') as HTMLElement;
    statusRoot.focus();
    expect(await fireEvent.keyDown(statusRoot, { key: "Escape" })).toBe(false);
    expect(statusEvents.onExitRequest).toHaveBeenCalledTimes(1);
  });
});

describe("W-1.7 F-X1 + F-R1 on BlockCandidateList", () => {
  it("F-X1 label swap: heading sentinel swap changes the heading, zero residual", async () => {
    const labels = modeLabels();
    const swapped = modeLabels({ headingLabel: "SWAPPED-HEADING-LABEL" });
    const { themeRoot, rerender } = renderInTheme({ ...listProps(labels), ...listEvents() });
    expect(themeRoot.innerHTML).toContain(labels.headingLabel);
    await rerender({ ...listProps(swapped), ...listEvents() });
    expect(themeRoot.innerHTML).not.toContain(labels.headingLabel);
    expect(themeRoot.innerHTML).toContain(swapped.headingLabel);
  });

  it("F-R1 reduced motion: the compiled component zeroes durations under the media query", () => {
    const media = COMPILED_CSS.slice(COMPILED_CSS.indexOf("@media (prefers-reduced-motion: reduce)"));
    expect(media).toContain("@media (prefers-reduced-motion: reduce)");
    expect(media).toContain("transition-duration: 0s");
    expect(media).toContain("animation-duration: 0s");
  });
});

describe("W-1.9 source scan of the five AS-1 .svelte files", () => {
  const SVELTE_FILES = [
    "CommentModeToggle.svelte",
    "CommentModeStatus.svelte",
    "BlockHighlightOverlay.svelte",
    "LassoLayer.svelte",
    "BlockCandidateList.svelte"
  ];
  // allowlist: class names / token names (st-*, --st-*), kebab-case
  // identifiers (data-st-shell values, role values, aria-live, event key
  // names in kebab form), relative + allowlisted package specifiers, and the
  // ARIA keyboard key names (camelCase) plus numeric attribute values.
  const KEYWORDS = new Set([
    "-1",
    "ArrowDown",
    "ArrowUp",
    "ArrowLeft",
    "ArrowRight",
    "Enter",
    "Escape",
    "Home",
    "End",
    "PageUp",
    "PageDown",
    "Tab"
  ]);
  const KEBAB_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
  // style-directive values: an expression with an optional unit suffix
  // (style:left="{rect.x}px")
  const STYLE_VALUE_RE = /^\{[^{}]*\}[a-z%]*$/;

  function stringLiterals(source: string): string[] {
    // strip comments and the <style> block first (CSS is scanned separately
    // below); only real quoted literals in markup/script remain
    const markup = source
      .replace(/<style[^>]*>[\s\S]*?<\/style>/, "")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/(^|[^:])\/\/[^\n]*/g, "$1");
    const out: string[] = [];
    const re = /"([^"\\\n]|\\.)*"|'([^'\\\n]|\\.)*'|`([^`\\]|\\.)*`/g;
    for (const m of markup.matchAll(re)) {
      const raw = m[0];
      out.push(raw.slice(1, -1));
    }
    return out;
  }

  // --- template scan (spec §5.5 W-1.9: "no natural-language string literal in
  // src/lib/*.svelte") -------------------------------------------------------
  // The quoted-literal scan above cannot see unquoted template text nodes
  // (<span>Select a block</span>) or single-word attribute strings
  // (aria-label="close"). The template half therefore parses each component
  // with svelte/compiler and walks the template AST (ast.html only — script
  // and style are covered by the literal/colour scans):
  //   - every Text node must be whitespace-only;
  //   - every static attribute value must be in the explicit allowlist below
  //     (class names, data-st-shell values, role values, aria-live, tabindex,
  //     type, icon names from the DS catalogue);
  //   - user-facing attributes (aria-label, title, placeholder, …) must bind
  //     to an expression ({...}), never carry a string literal.
  const USER_FACING_ATTRIBUTES = new Set([
    "aria-label",
    "aria-roledescription",
    "aria-valuetext",
    "title",
    "placeholder",
    "alt",
    "label",
    "tooltip"
  ]);
  const ICON_NAME_SET = new Set<string>(ICON_NAMES as string[]);
  const STATIC_ATTRIBUTE_ALLOWLIST: Record<string, (value: string) => boolean> = {
    class: (value) =>
      value.split(/\s+/).filter(Boolean).every((token) => /^st-[a-zA-Z0-9_-]*$/.test(token)),
    "data-st-shell": (value) => KEBAB_RE.test(value),
    role: (value) => /^[a-z]+(-[a-z]+)*$/.test(value), // role values (spec allowlist)
    "aria-live": (value) => value === "polite",
    "aria-hidden": (value) => value === "true" || value === "false",
    tabindex: (value) => value === "-1",
    type: (value) => value === "button",
    icon: (value) => ICON_NAME_SET.has(value)
  };

  function templateViolations(file: string, source: string): string[] {
    const violations: string[] = [];
    let ast: ReturnType<typeof parse>;
    try {
      ast = parse(source, { filename: file });
    } catch (error) {
      return [`${file}: svelte parse error: ${String(error)}`];
    }
    const visit = (node: unknown): void => {
      if (node === null || typeof node !== "object") return;
      if (Array.isArray(node)) {
        node.forEach(visit);
        return;
      }
      const n = node as Record<string, unknown>;
      if (typeof n.type !== "string") return;
      if (n.type === "Text") {
        const data = String(n.data ?? "");
        if (data.trim() !== "") {
          violations.push(`${file}: template text node is not whitespace-only: ${JSON.stringify(data.trim().slice(0, 80))}`);
        }
        return;
      }
      if (n.type === "Attribute") {
        const name = String(n.name);
        const value = n.value;
        if (value === true) return; // boolean attribute
        if (Array.isArray(value)) {
          const parts = value as Record<string, unknown>[];
          const isStatic = parts.every((part) => part.type === "Text");
          // svelte 5.x emits MustacheTag for {expr}; accept ExpressionTag too
          const isExpression = (part: Record<string, unknown>) =>
            part.type === "MustacheTag" || part.type === "ExpressionTag";
          const hasExpression = parts.some(isExpression);
          const staticText = parts
            .filter((part) => part.type === "Text")
            .map((part) => String(part.data ?? ""))
            .join("");
          if (isStatic) {
            if (USER_FACING_ATTRIBUTES.has(name)) {
              violations.push(`${file}: user-facing attribute "${name}" must bind to an expression, got static ${JSON.stringify(staticText)}`);
            } else {
              const allow = STATIC_ATTRIBUTE_ALLOWLIST[name];
              if (!allow || !allow(staticText)) {
                violations.push(`${file}: static attribute ${name}=${JSON.stringify(staticText)} is not in the allowlist`);
              }
            }
          } else if (hasExpression) {
            // mixed static fragment + expression (e.g. class="st-x st-x--{m}"):
            // the static fragment must still be allowlisted
            if (staticText.trim() !== "") {
              const allow = STATIC_ATTRIBUTE_ALLOWLIST[name];
              if (!allow || !allow(staticText)) {
                violations.push(`${file}: static fragment of ${name}=${JSON.stringify(staticText)} is not in the allowlist`);
              }
            }
          }
          // recurse into the expression parts only (never into Text value
          // parts — those are attribute text, not template text)
          for (const part of parts) {
            if (isExpression(part)) visit(part);
          }
          return;
        }
      }
      if (n.type === "StyleDirective" || n.type === "EventHandler" || n.type === "Binding" || n.type === "SpreadAttribute") {
        // directive values must be expressions, never static text
        const value = n.value;
        if (Array.isArray(value) && value.every((part) => (part as Record<string, unknown>).type === "Text")) {
          violations.push(`${file}: ${n.type} "${String(n.name)}" carries a static value`);
        }
        return;
      }
      for (const key of Object.keys(n)) {
        if (key === "loc" || key === "start" || key === "end") continue;
        visit(n[key]);
      }
    };
    visit(ast.html);
    return violations;
  }

  it("every quoted literal in the five components is a class/token name, a kebab identifier, an allowlisted specifier, or a keyword", () => {
    for (const file of SVELTE_FILES) {
      const source = readFileSync(resolve("src/lib", file), "utf8");
      expect(source.length, file).toBeGreaterThan(0);
      for (const raw of stringLiterals(source)) {
        const literal = raw.trim();
        const ok =
          literal === "" ||
          literal.startsWith("st-") ||
          literal.startsWith("--st-") ||
          literal.startsWith("./") ||
          literal.startsWith("@sentropic/") ||
          literal === "svelte" ||
          KEBAB_RE.test(literal) ||
          STYLE_VALUE_RE.test(literal) ||
          (literal.startsWith("[") && literal.endsWith("]")) || // CSS attribute selector
          KEYWORDS.has(literal);
        expect(ok, `${file}: unexpected natural-language literal "${raw}"`).toBe(true);
      }
    }
  });

  it("template scan: every text node in the five components is whitespace-only and every static attribute value is allowlisted", () => {
    for (const file of SVELTE_FILES) {
      const source = readFileSync(resolve("src/lib", file), "utf8");
      expect(templateViolations(file, source), file).toEqual([]);
    }
  });

  it("no CSS content: rule carries quoted text in any component style block", () => {
    for (const file of SVELTE_FILES) {
      const source = readFileSync(resolve("src/lib", file), "utf8");
      const style = source.match(/<style[^>]*>([\s\S]*?)<\/style>/)?.[1] ?? "";
      const withoutComments = style.replace(/\/\*[\s\S]*?\*\//g, "");
      expect(withoutComments.includes("content:"), `${file}: content rule with quoted text`).toBe(false);
    }
  });

  // Planted-failure cases for the template half (in-memory synthetic sources,
  // never written to src/): each proves the scan fails on the shape it must
  // catch. The one-time real injection into a component file is recorded in
  // SPIKES.md (AS-1 review reconciliation).
  it("planted failure: a natural-language template text node fails the scan", () => {
    const source = [
      '<script lang="ts">let n = $state(0);</script>',
      '<div class="st-plant">{n}</div>',
      "<span>Select a block</span>"
    ].join("\n");
    const violations = templateViolations("zz-plant.svelte", source);
    expect(violations.some((v) => v.includes("text node is not whitespace-only") && v.includes("Select a block"))).toBe(true);
  });

  it("planted failure: a single-word user-facing attribute string fails the scan", () => {
    const source = [
      '<script lang="ts">let n = $state(0);</script>',
      '<button type="button" class="st-plant" aria-label="close">{n}</button>'
    ].join("\n");
    const violations = templateViolations("zz-plant2.svelte", source);
    expect(violations.some((v) => v.includes('user-facing attribute "aria-label"') && v.includes("close"))).toBe(true);
  });

  it("planted failure: a static non-allowlisted attribute value fails the scan", () => {
    const source = [
      '<script lang="ts">let n = $state(0);</script>',
      '<div class="st-plant" data-st-shell="plant" data-note="hello there">{n}</div>'
    ].join("\n");
    const violations = templateViolations("zz-plant3.svelte", source);
    expect(violations.some((v) => v.includes("data-note") && v.includes("not in the allowlist"))).toBe(true);
  });
});

describe("§5.4 fixture matrix — light and dark viewer themes", () => {
  it("the list renders in every viewer theme with the compiled theme variables scoped to the theme root", () => {
    const labels = modeLabels();
    for (const theme of Object.values(viewerThemes)) {
      const themeRoot = document.createElement("div");
      themeRoot.setAttribute("data-st-theme", theme.id);
      const style = document.createElement("style");
      style.textContent = compileTheme(theme);
      themeRoot.appendChild(style);
      document.body.appendChild(themeRoot);
      expect(style.textContent, theme.id).toContain("--st-semantic-surface-raised");

      const mounted = render(BlockCandidateList, {
        target: themeRoot,
        props: { ...listProps(labels), ...listEvents() }
      });
      const root = themeRoot.querySelector('[data-st-shell="block-candidate-list"]');
      expect(root, `theme ${theme.id}`).not.toBeNull();
      // the root element itself carries the listbox role
      expect(root?.getAttribute("role"), `theme ${theme.id}`).toBe("listbox");
      expect(root?.querySelectorAll('[role="option"]').length, `theme ${theme.id}`).toBe(3);

      mounted.unmount();
      expect(themeRoot.querySelector('[data-st-shell="block-candidate-list"]')).toBeNull();
      themeRoot.remove();
    }
  });
});
