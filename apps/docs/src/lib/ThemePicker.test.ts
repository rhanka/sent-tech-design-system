// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { compile } from "svelte/compiler";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/svelte";
import ThemePicker from "./ThemePicker.svelte";
import { THEMES } from "./theme-catalog";

afterEach(cleanup);

describe("theme picker keyboard", () => {
  it("focuses search, filters labels, and selects an enterprise theme with arrows and Enter", async () => {
    const onselect = vi.fn();
    const view = render(ThemePicker, { open: true, themes: THEMES, activeThemeId: "sent-tech", locale: "fr", onselect });
    const input = view.getByRole("searchbox", { name: "Rechercher un thème" });
    await waitFor(() => expect(document.activeElement).toBe(input));
    // Longueur du catalogue, pas un nombre gravé : un nouveau paquet de thème
    // n'est pas une régression du sélecteur.
    expect(view.getAllByRole("menuitem")).toHaveLength(THEMES.length);
    await fireEvent.input(input, { target: { value: "DESJ" } });
    expect(view.getAllByRole("menuitem")).toHaveLength(1);
    await fireEvent.keyDown(input, { key: "ArrowDown" });
    const result = view.getByRole("menuitem", { name: /Desjardins/ });
    expect(document.activeElement).toBe(result);
    await fireEvent.keyDown(result, { key: "Enter" });
    expect(onselect).toHaveBeenCalledWith("desjardins");
    expect(view.queryByRole("dialog")).toBeNull();
  });

  it("handles empty results and restores focus on Escape", async () => {
    const trigger = document.createElement("button");
    document.body.append(trigger);
    trigger.focus();
    const view = render(ThemePicker, { open: true, themes: THEMES, activeThemeId: "sent-tech", locale: "fr", onselect: vi.fn() });
    const input = view.getByRole("searchbox");
    await waitFor(() => expect(document.activeElement).toBe(input));
    await fireEvent.input(input, { target: { value: "no-such-theme" } });
    expect(view.getByText("Aucun thème trouvé")).toBeTruthy();
    await fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(document.activeElement).toBe(input);
    await fireEvent.keyDown(input, { key: "Escape" });
    await waitFor(() => expect(document.activeElement).toBe(trigger));
    expect(view.queryByRole("dialog")).toBeNull();
    trigger.remove();
  });
});

/* ── Contrat de mise en page ─────────────────────────────────────────────────
   jsdom ne calcule aucune géométrie : ces tests figent les déclarations qui
   produisent la mise en page, pas la mise en page elle-même. Ils lisent le CSS
   tel que Svelte l'émet (sélecteurs scopés compris) et le comparent aux règles
   du Modal et du Menu du design system, compilées de la même façon.

   La géométrie se vérifie dans un vrai navigateur, sur le site construit
   (`npm run build -w apps/docs`, `apps/docs/build` servi en statique,
   Chromium piloté par playwright-core), aux deux ouvertures : bouton d'en-tête
   (34 thèmes) et Ctrl+Shift+X (127) :
   - 1440×900, 800×700, 1280×500 : un seul élément du dialogue a
     `scrollHeight > clientHeight`, `.theme-results` ; `.st-menu` y est large
     d'environ 525 px ; le dialogue mesure 232 px avec un résultat.
   - 1280×300, 1280×256, 320×256, 1280×250, 1280×220, 320×220, puis 1280×500,
     600 et 720 avec `html { font-size: 32px }` (texte à 200 %) :
     `.theme-results.clientHeight` reste au plancher (110 px, 222 px à 200 %)
     et, après ArrowDown, End puis Home depuis le champ, l'élément focalisé est
     entièrement visible : son rectangle, rogné par chaque ancêtre défilant et
     par le viewport, est intact. */

type CssRule = { selector: string; decls: Record<string, string> };

function compiledRules(path: string): CssRule[] {
  const { css } = compile(readFileSync(path, "utf8"), { filename: path, css: "external", generate: "client" });
  const code = (css?.code ?? "").replace(/\/\*[\s\S]*?\*\//g, "");
  return [...code.matchAll(/([^{}]+)\{([^{}]*)\}/g)].flatMap(([, selectors, body]) => {
    const decls = Object.fromEntries(
      body.split(";").map((d) => d.trim()).filter(Boolean)
        .map((d) => [d.slice(0, d.indexOf(":")).trim(), d.slice(d.indexOf(":") + 1).trim()])
    );
    return selectors.split(",").map((selector) => ({ selector: selector.trim(), decls }));
  });
}

/** Spécificité (a, b, c) d'un sélecteur sans :is/:where/:not, le cas de ces feuilles. */
function specificity(selector: string): [number, number, number] {
  const a = (selector.match(/#[\w-]+/g) ?? []).length;
  const b = (selector.match(/\.[\w-]+|\[[^\]]*\]|(?<!:):(?!:)[\w-]+/g) ?? []).length;
  const c = (selector.match(/(?:^|[\s>+~])[a-z][\w-]*/gi) ?? []).length + (selector.match(/::[\w-]+/g) ?? []).length;
  return [a, b, c];
}

const outranks = (x: number[], y: number[]) => x[0] !== y[0] ? x[0] > y[0] : x[1] !== y[1] ? x[1] > y[1] : x[2] > y[2];

const picker = compiledRules(resolve(__dirname, "ThemePicker.svelte"));
const dsComponents = resolve(__dirname, "../../../../packages/components-svelte/src/lib");
const designSystem = [...compiledRules(resolve(dsComponents, "Modal.svelte")), ...compiledRules(resolve(dsComponents, "Menu.svelte"))];

function pickerRule(pattern: RegExp): CssRule {
  const found = picker.filter((rule) => pattern.test(rule.selector));
  expect(found, `une seule règle pour ${pattern}`).toHaveLength(1);
  return found[0];
}

describe("theme picker layout contract", () => {
  it("overrides design-system elements with a higher specificity, so stylesheet order cannot decide", () => {
    // Toute règle dont la cible (dernier composé) est un élément du design system.
    const overrides = picker.filter((rule) => /\.st-[\w-]+/.test(rule.selector.split(/[\s>+~]+/).pop() ?? ""));
    expect(overrides.length).toBeGreaterThanOrEqual(4);
    for (const rule of overrides) {
      const target = (rule.selector.split(/[\s>+~]+/).pop() ?? "").match(/\.st-[\w-]+/)?.[0];
      const base = designSystem.filter((ds) => new RegExp(`^\\${target}\\.svelte-[\\w-]+$`).test(ds.selector));
      expect(base, `règle de base du design system pour ${target}`).not.toHaveLength(0);
      for (const ds of base) {
        expect(outranks(specificity(rule.selector), specificity(ds.selector)),
          `${rule.selector} ${specificity(rule.selector)} doit dépasser ${ds.selector} ${specificity(ds.selector)}`).toBe(true);
      }
    }
  });

  it("keeps one scroll region at usual heights and a fallback when height runs out", () => {
    const shell = pickerRule(/^\.st-modal\.theme-picker-modal(\.theme-picker-modal)+$/);
    expect(shell.decls.display).toBe("flex");
    // Ascenseur de secours : jamais `hidden`/`clip`, sinon la liste s'écrase à 1 px.
    expect(shell.decls["overflow-y"]).toBe("auto");
    expect(shell.decls.overflow).toBeUndefined();
    // Le corps et la colonne se rétrécissent : c'est la liste qui absorbe la hauteur.
    expect(pickerRule(/\.theme-picker-modal > \.st-modal__body$/).decls["min-height"]).toBe("0");
    expect(pickerRule(/^\.theme-picker\.svelte-[\w-]+$/).decls["min-height"]).toBe("0");
    const results = pickerRule(/^\.theme-results\.svelte-[\w-]+$/);
    expect(results.decls["overflow-y"]).toBe("auto");
    // Plancher en rem (il suit la taille du texte), d'au moins 2,5 lignes.
    const floor = results.decls["min-height"]?.match(/^(\d+(?:\.\d+)?)rem$/);
    expect(floor, `plancher de .theme-results : ${results.decls["min-height"]}`).not.toBeNull();
    expect(Number(floor?.[1])).toBeGreaterThanOrEqual(6);
    // Le Menu ne garde pas son propre ascenseur.
    const menu = pickerRule(/^\.theme-results\.svelte-[\w-]+ \.st-menu$/);
    expect(menu.decls["max-height"]).toBe("none");
    expect(menu.decls.overflow).toBe("visible");
    // Une liste courte ne garde pas le plancher : le dialogue se rétracte.
    const short = pickerRule(/^\.theme-results--short\.svelte-[\w-]+$/);
    expect(short.decls["min-height"]).toBe("0");
    expect(short.decls.flex).toBe("0 0 auto");
  });

  it("writes the counter and the empty state in primary text", () => {
    for (const pattern of [/^\.theme-picker__count\.svelte-[\w-]+$/, /^\.theme-picker__empty\.svelte-[\w-]+$/]) {
      expect(pickerRule(pattern).decls.color).toBe("var(--st-semantic-text-primary)");
    }
  });

  it("drops the list floor only when the results are shorter than it", async () => {
    const view = render(ThemePicker, { open: true, themes: THEMES, activeThemeId: "sent-tech", locale: "fr", onselect: vi.fn() });
    const input = view.getByRole("searchbox");
    const results = () => document.querySelector(".theme-results");
    expect(results()?.classList.contains("theme-results--short")).toBe(false);
    await fireEvent.input(input, { target: { value: "DESJ" } });
    expect(results()?.classList.contains("theme-results--short")).toBe(true);
    await fireEvent.input(input, { target: { value: "no-such-theme" } });
    expect(results()?.classList.contains("theme-results--short")).toBe(true);
  });
});
