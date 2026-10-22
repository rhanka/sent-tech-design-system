import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const style = readFileSync(resolve("src/styles.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

type State = { active: boolean; hovered: boolean; enabled: boolean };
type Rule = { selectors: string[]; body: string; index: number };

function paginationRules(): Rule[] {
  const out: Rule[] = [];
  const re = /([^{}@]+)\{([^{}]*)\}/g;
  let match: RegExpExecArray | null;
  let index = 0;
  while ((match = re.exec(style)) !== null) {
    const selector = match[1].trim();
    if (/st-pagination(?!Nav)/.test(selector)) {
      out.push({
        selectors: selector.split(",").map((s) => s.trim()),
        body: match[2],
        index: index++,
      });
    }
  }
  return out;
}

function specificity(selector: string): [number, number, number] {
  const ids = (selector.match(/#[A-Za-z0-9_-]+/g) ?? []).length;
  const classes = (selector.match(/\.[A-Za-z0-9_-]+/g) ?? []).length;
  const attrs = (selector.match(/\[[^\]]+\]/g) ?? []).length;
  const pseudos = (selector.match(/:(?!:)[A-Za-z-]+/g) ?? []).length;
  const types = (
    selector.replace(/::[A-Za-z-]+/g, " ").match(/(^|[\s>+~])([A-Za-z][A-Za-z0-9-]*)/g) ??
    []
  ).length;
  return [ids, classes + attrs + pseudos, types];
}

function compareSpec(a: [number, number, number], b: [number, number, number]): number {
  for (let i = 0; i < 3; i++) {
    if (a[i] !== b[i]) return a[i] - b[i];
  }
  return 0;
}

function matches(selector: string, state: State): boolean {
  if (selector.includes("--active") && !state.active) return false;
  if (selector.includes(":hover") && !state.hovered) return false;
  if (selector.includes(":not(:disabled)") && !state.enabled) return false;
  else if (!selector.includes(":not(") && selector.includes(":disabled") && state.enabled)
    return false;
  if (!selector.includes("button")) return false;
  return true;
}

function declaration(body: string, prop: "background" | "color"): string | null {
  const re = prop === "background" ? /(^|[;\s])background\s*:([^;]+);/ : /(^|[;\s])color\s*:([^;]+);/;
  const match = re.exec(body);
  return match ? match[2].trim() : null;
}

function winning(state: State, prop: "background" | "color") {
  let best: { spec: [number, number, number]; index: number; value: string; selector: string } | null =
    null;
  for (const rule of paginationRules()) {
    for (const selector of rule.selectors) {
      if (!matches(selector, state)) continue;
      const value = declaration(rule.body, prop);
      if (!value) continue;
      const spec = specificity(selector);
      if (
        !best ||
        compareSpec(spec, best.spec) > 0 ||
        (compareSpec(spec, best.spec) === 0 && rule.index > best.index)
      ) {
        best = { spec, index: rule.index, value, selector };
      }
    }
  }
  return best;
}

describe("Pagination — hovered current page keeps the active colours", () => {
  it("a hovered non-active page uses the shared hover background", () => {
    const winner = winning({ active: false, hovered: true, enabled: true }, "background");
    expect(winner, "no background rule matches a hovered enabled page").not.toBeNull();
    expect(winner!.value).toContain("--st-component-control-hoverBackground");
    expect(winner!.value).toContain("--st-component-pagination-hoverBackground");
  });

  it("a hovered active page resolves to the active background and text pair", () => {
    const bg = winning({ active: true, hovered: true, enabled: true }, "background");
    const fg = winning({ active: true, hovered: true, enabled: true }, "color");
    expect(bg, "no background rule matches a hovered active page").not.toBeNull();
    expect(fg, "no color rule matches a hovered active page").not.toBeNull();
    expect(bg!.selector).toContain("--active");
    expect(bg!.selector).toContain(":hover");
    expect(bg!.value).toContain("--st-component-pagination-activeBackground");
    expect(bg!.value).toContain("--st-semantic-action-primary");
    expect(fg!.value).toContain("--st-component-pagination-activeText");
    expect(fg!.value).toContain("--st-semantic-action-primaryText");
  });
});
