import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { render } from "@testing-library/svelte";
import { createRawSnippet } from "svelte";
import { describe, expect, it } from "vitest";
import Checkbox from "./Checkbox.svelte";

const dir = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(dir, "Checkbox.svelte"), "utf8");
const radioSource = readFileSync(join(dir, "Radio.svelte"), "utf8");

const snippet = (html: string) => createRawSnippet(() => ({ render: () => `<span>${html}</span>` }));

describe("Checkbox — vertical centring rules", () => {
  it("carries the label typography on the row so 1lh is one label line", () => {
    expect(source).toContain("font-size: var(--st-component-selection-choiceLabelFontSize, 0.9375rem);");
    expect(source).toContain("line-height: var(--st-component-selection-choiceLabelLineHeight, normal);");
  });

  it("offsets the 1rem box by half the difference between one label line and its height", () => {
    expect(source).toContain("font: inherit;");
    // Fallback first for engines without the lh unit, then the exact offset.
    expect(source).toContain("margin: 0.125rem 0 0;");
    expect(source).toContain("margin: calc((1lh - 1rem) / 2) 0 0;");
  });

  it("keeps the trailing slot one label line high so a Badge shares the box/label axis", () => {
    expect(source).toContain("height: 1lh;");
  });

  it("keeps helper text off the label line height", () => {
    expect(source).toContain(".st-choice__help");
    expect(source).toContain("line-height: normal;");
  });

  it("leaves Radio untouched (no lh-based centring there)", () => {
    expect(radioSource).not.toContain("1lh");
    expect(source).not.toContain("st-choice--radio");
  });
});

describe("Checkbox — centring row structure", () => {
  it("renders a label-only row with the checkbox row classes and no trailing slot", () => {
    const { container } = render(Checkbox, { props: { label: "Actif" } });
    const row = container.querySelector(".st-choice") as HTMLElement;
    expect(row).toBeTruthy();
    expect(row.classList.contains("st-choice--checkbox")).toBe(true);
    expect(row.classList.contains("st-choice--described")).toBe(false);
    expect(container.querySelector(".st-choice__input")).toBeTruthy();
    expect(container.querySelector(".st-choice__label")?.textContent).toBe("Actif");
    expect(container.querySelector(".st-choice__trailing")).toBeNull();
  });

  it("flags the row and keeps the box beside the first line when a description wraps below", () => {
    const { container } = render(Checkbox, {
      props: { label: "Hausse de prix", description: "Variation > 5% sur 30 jours" },
    });
    const row = container.querySelector(".st-choice") as HTMLElement;
    expect(row.classList.contains("st-choice--checkbox")).toBe(true);
    expect(row.classList.contains("st-choice--described")).toBe(true);
    expect(container.querySelector(".st-choice__input")).toBeTruthy();
    expect(container.querySelector(".st-choice__description")?.textContent).toBe(
      "Variation > 5% sur 30 jours",
    );
  });

  it("renders the trailing slot at the row end with label and description set", () => {
    const { container } = render(Checkbox, {
      props: {
        label: "Ventes recentes",
        description: "30 derniers jours",
        trailing: snippet("33"),
      },
    });
    const row = container.querySelector(".st-choice") as HTMLElement;
    expect(row.classList.contains("st-choice--checkbox")).toBe(true);
    const trailing = container.querySelector(".st-choice__trailing");
    expect(trailing).toBeTruthy();
    expect(trailing?.textContent).toContain("33");
  });
});
