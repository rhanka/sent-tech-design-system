import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { fireEvent, render, screen } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";
import Checkbox from "./lib/Checkbox.svelte";
import CheckboxGroup from "./lib/CheckboxGroup.svelte";
import Radio from "./lib/Radio.svelte";
import RadioGroup from "./lib/RadioGroup.svelte";

const here = dirname(fileURLToPath(import.meta.url));
const radioSrc = readFileSync(join(here, "lib/Radio.svelte"), "utf8");
const radioGroupSrc = readFileSync(join(here, "lib/RadioGroup.svelte"), "utf8");
const checkboxSrc = readFileSync(join(here, "lib/Checkbox.svelte"), "utf8");
const checkboxGroupSrc = readFileSync(join(here, "lib/CheckboxGroup.svelte"), "utf8");
const devmtlCss = readFileSync(join(here, "../../theme-devmtl/css/devmtl.css"), "utf8");

function devmtlVars(): Set<string> {
  const vars = new Set<string>();
  for (const match of devmtlCss.matchAll(/(--st-[a-zA-Z0-9-]+)\s*:/g)) {
    vars.add(match[1]);
  }
  return vars;
}

function primaryVars(source: string): string[] {
  const vars = new Set<string>();
  for (const match of source.matchAll(/var\(\s*(--st-[a-zA-Z0-9-]+)/g)) {
    vars.add(match[1]);
  }
  return [...vars].sort();
}

describe("Radio — card variant, description and aria-describedby", () => {
  it("keeps default list rendering free of card classes and aria-describedby when unused", () => {
    const { container } = render(Radio, {
      props: { label: "Option A", name: "q1", value: "a" }
    });
    const label = container.querySelector("label.st-choice") as HTMLElement;
    const input = screen.getByRole("radio", { name: "Option A" });
    expect(label.classList.contains("st-choice--card")).toBe(false);
    expect(input.getAttribute("aria-describedby")).toBeNull();
    expect(input.getAttribute("aria-invalid")).toBeNull();
  });

  it("renders card variant with description, helperText and merged aria-describedby", () => {
    const { container } = render(Radio, {
      props: {
        label: "Startup produit",
        description: "Moins de 50 personnes",
        helperText: "Inclut les scale-ups",
        variant: "card",
        invalid: true,
        name: "org",
        value: "startup",
        "aria-describedby": "ext-note"
      }
    });
    const label = container.querySelector("label.st-choice") as HTMLElement;
    const input = screen.getByRole("radio");
    const desc = container.querySelector(".st-choice__description") as HTMLElement;
    const help = container.querySelector(".st-choice__help") as HTMLElement;

    expect(label.classList.contains("st-choice--card")).toBe(true);
    expect(desc?.textContent).toBe("Moins de 50 personnes");
    expect(help?.textContent).toBe("Inclut les scale-ups");
    expect(label.getAttribute("data-invalid")).toBe("true");

    const describedBy = input.getAttribute("aria-describedby") ?? "";
    expect(describedBy).toContain("ext-note");
    expect(describedBy).toContain(desc.id);
    expect(describedBy).toContain(help.id);
  });

  it("defines 48px touch target height and 1.25rem radio indicator for card variant", () => {
    expect(radioSrc).toContain(".st-choice--card");
    expect(radioSrc).toContain("min-height: 3rem");
    expect(radioSrc).toContain("1.25rem");
    expect(radioSrc).not.toContain("1lh");
  });
});

describe("RadioGroup — card density, columns, validation and aria-describedby", () => {
  it("renders card options with descriptions and forwards selection", async () => {
    const onchange = vi.fn();
    const { container } = render(RadioGroup, {
      props: {
        legend: "Type d'organisation",
        name: "org-type",
        variant: "card",
        columns: 2,
        value: "pme",
        onchange,
        options: [
          { label: "PME", value: "pme", description: "Entreprise établie" },
          { label: "Services", value: "services", description: "Conseil et intégration" }
        ]
      }
    });

    const fieldset = container.querySelector("fieldset") as HTMLFieldSetElement;
    expect(fieldset.classList.contains("st-radioGroup--card")).toBe(true);
    expect(fieldset.classList.contains("st-radioGroup--cols-2")).toBe(true);
    expect(container.querySelectorAll("label.st-choice--card").length).toBe(2);
    expect(screen.getByText("Entreprise établie")).toBeTruthy();
    expect(screen.getByText("Conseil et intégration")).toBeTruthy();

    await fireEvent.click(screen.getByRole("radio", { name: /Services/ }));
    expect(onchange).toHaveBeenCalledWith("services");
  });

  it("wires required, invalid, errorText and helperText via aria-describedby", () => {
    const { container } = render(RadioGroup, {
      props: {
        legend: "Type d'organisation",
        name: "org-req",
        variant: "card",
        required: true,
        invalid: true,
        helperText: "Une seule réponse",
        errorText: "Veuillez choisir une option.",
        options: [
          { label: "PME", value: "pme" },
          { label: "Startup", value: "startup" }
        ]
      }
    });

    const fieldset = container.querySelector("fieldset") as HTMLFieldSetElement;
    const alert = screen.getByRole("alert");
    const help = container.querySelector(".st-radioGroup__help") as HTMLElement;
    const radios = screen.getAllByRole("radio") as HTMLInputElement[];

    expect(alert.textContent).toBe("Veuillez choisir une option.");
    expect(fieldset.getAttribute("role")).toBe("radiogroup");
    expect(fieldset.getAttribute("aria-required")).toBe("true");
    expect(fieldset.getAttribute("aria-invalid")).toBe("true");
    expect(fieldset.getAttribute("aria-describedby")).toContain(help.id);
    expect(fieldset.getAttribute("aria-describedby")).toContain(alert.id);

    for (const radio of radios) {
      expect(radio.required).toBe(true);
      expect(radio.getAttribute("aria-describedby")).toContain(alert.id);
    }
  });

  it("self-updates selection when used uncontrolled without external state", async () => {
    const onchange = vi.fn();
    render(RadioGroup, {
      props: {
        legend: "Équipe",
        name: "team-uncontrolled",
        variant: "card",
        onchange,
        options: [
          { label: "Produit", value: "product" },
          { label: "Plateforme", value: "platform" }
        ]
      }
    });

    const product = screen.getByRole("radio", { name: "Produit" }) as HTMLInputElement;
    const platform = screen.getByRole("radio", { name: "Plateforme" }) as HTMLInputElement;
    expect(product.checked).toBe(false);
    expect(platform.checked).toBe(false);

    await fireEvent.click(platform);
    expect(platform.checked).toBe(true);
    expect(product.checked).toBe(false);
    expect(onchange).toHaveBeenCalledWith("platform");
  });
});

describe("Checkbox — card variant and helperText aria-describedby", () => {
  it("renders card variant with 48px touch target CSS and links helperText", () => {
    const { container } = render(Checkbox, {
      props: {
        label: "Revue de code assistée",
        helperText: "Utilisé chaque semaine",
        variant: "card",
        name: "practices",
        value: "review"
      }
    });
    const label = container.querySelector("label.st-choice") as HTMLElement;
    const input = screen.getByRole("checkbox");
    const help = container.querySelector(".st-choice__help") as HTMLElement;

    expect(label.classList.contains("st-choice--card")).toBe(true);
    expect(input.getAttribute("aria-describedby")).toBe(help.id);
    expect(checkboxSrc).toContain(".st-choice--card");
    expect(checkboxSrc).toContain("min-height: 3rem");
  });
});

describe("CheckboxGroup — card density, exclusiveValues, maxSelections and validation", () => {
  const baseOptions = [
    { label: "Linter", value: "linter", description: "Analyse statique" },
    { label: "Formateur", value: "formatter" },
    { label: "Tests unitaires", value: "unit-tests" },
    { label: "Aucun de ces outils", value: "none" }
  ];

  it("enforces exclusiveValues in both directions", async () => {
    const onchange = vi.fn();
    const { rerender } = render(CheckboxGroup, {
      props: {
        legend: "Outils utilisés",
        name: "tools",
        variant: "card",
        value: ["linter", "formatter"],
        exclusiveValues: ["none"],
        options: baseOptions,
        onchange
      }
    });

    // Checking an exclusive option clears all non-exclusive options.
    await fireEvent.click(screen.getByRole("checkbox", { name: /Aucun de ces outils/ }));
    expect(onchange).toHaveBeenLastCalledWith(["none"]);

    // Simulate controlled update with exclusive selected; checking a regular option clears exclusive.
    await rerender({
      legend: "Outils utilisés",
      name: "tools",
      variant: "card",
      value: ["none"],
      exclusiveValues: ["none"],
      options: baseOptions,
      onchange
    });
    await fireEvent.click(screen.getByRole("checkbox", { name: /Linter/ }));
    expect(onchange).toHaveBeenLastCalledWith(["linter"]);

    // Unchecking the exclusive option leaves empty selection.
    await rerender({
      legend: "Outils utilisés",
      name: "tools",
      variant: "card",
      value: ["none"],
      exclusiveValues: ["none"],
      options: baseOptions,
      onchange
    });
    await fireEvent.click(screen.getByRole("checkbox", { name: /Aucun de ces outils/ }));
    expect(onchange).toHaveBeenLastCalledWith([]);
  });

  it("enforces maxSelections by disabling additional non-exclusive options while keeping exclusive enabled", async () => {
    const onchange = vi.fn();
    const { container } = render(CheckboxGroup, {
      props: {
        legend: "Outils utilisés",
        name: "tools",
        variant: "card",
        columns: 2,
        value: ["linter", "formatter"],
        exclusiveValues: ["none"],
        maxSelections: 2,
        options: baseOptions,
        onchange
      }
    });

    const linter = screen.getByRole("checkbox", { name: /Linter/ }) as HTMLInputElement;
    const formatter = screen.getByRole("checkbox", { name: /Formateur/ }) as HTMLInputElement;
    const unitTests = screen.getByRole("checkbox", { name: /Tests unitaires/ }) as HTMLInputElement;
    const none = screen.getByRole("checkbox", { name: /Aucun de ces outils/ }) as HTMLInputElement;

    expect(linter.disabled).toBe(false);
    expect(formatter.disabled).toBe(false);
    expect(unitTests.disabled).toBe(true);
    expect(none.disabled).toBe(false);

    // Live region reports selection cap and is wired via aria-describedby.
    const limitStatus = container.querySelector(".st-checkboxGroup__limit") as HTMLElement;
    expect(limitStatus).toBeTruthy();
    expect(limitStatus.getAttribute("aria-live")).toBe("polite");
    expect(limitStatus.textContent).toContain("2 / 2");

    const fieldset = container.querySelector("fieldset") as HTMLFieldSetElement;
    expect(fieldset.getAttribute("aria-describedby")).toContain(limitStatus.id);
    expect(fieldset.classList.contains("st-checkboxGroup--cols-2")).toBe(true);

    // Clicking an exclusive option still works and replaces selection with ["none"].
    await fireEvent.click(none);
    expect(onchange).toHaveBeenLastCalledWith(["none"]);
  });

  it("wires required, invalid, errorText and helperText via aria-describedby", () => {
    const { container } = render(CheckboxGroup, {
      props: {
        legend: "Pratiques",
        name: "practices",
        variant: "card",
        required: true,
        errorText: "Sélectionnez au moins une option.",
        helperText: "Plusieurs choix possibles",
        options: baseOptions
      }
    });

    const fieldset = container.querySelector("fieldset") as HTMLFieldSetElement;
    const legend = container.querySelector("legend") as HTMLLegendElement;
    const alert = screen.getByRole("alert");
    const help = container.querySelector(".st-checkboxGroup__help") as HTMLElement;
    const boxes = screen.getAllByRole("checkbox") as HTMLInputElement[];

    expect(alert.textContent).toBe("Sélectionnez au moins une option.");
    expect(fieldset.getAttribute("data-required")).toBe("true");
    expect(legend.querySelector(".st-visually-hidden")?.textContent).toContain("required");
    expect(fieldset.getAttribute("data-invalid")).toBe("true");
    expect(fieldset.getAttribute("aria-describedby")).toContain(help.id);
    expect(fieldset.getAttribute("aria-describedby")).toContain(alert.id);

    for (const box of boxes) {
      expect(box.getAttribute("aria-invalid")).toBe("true");
      expect(box.getAttribute("aria-describedby")).toContain(alert.id);
    }
  });

  it("enforces exclusiveValues, maxSelections and live maxSelectionsMessage updates when uncontrolled", async () => {
    const { container } = render(CheckboxGroup, {
      props: {
        legend: "Outils",
        name: "tools-uncontrolled",
        variant: "card",
        exclusiveValues: ["none"],
        maxSelections: 2,
        maxSelectionsMessage: "Maximum 2 choix",
        options: baseOptions
      }
    });

    const linter = screen.getByRole("checkbox", { name: /Linter/ }) as HTMLInputElement;
    const formatter = screen.getByRole("checkbox", { name: /Formateur/ }) as HTMLInputElement;
    const unitTests = screen.getByRole("checkbox", { name: /Tests unitaires/ }) as HTMLInputElement;
    const none = screen.getByRole("checkbox", { name: /Aucun de ces outils/ }) as HTMLInputElement;
    const limitStatus = container.querySelector(".st-checkboxGroup__limit") as HTMLElement;

    expect(limitStatus.textContent).toContain("0 / 2");
    expect(limitStatus.textContent).toContain("Maximum 2 choix");

    await fireEvent.click(linter);
    expect(linter.checked).toBe(true);
    expect(limitStatus.textContent).toContain("1 / 2");

    await fireEvent.click(formatter);
    expect(formatter.checked).toBe(true);
    expect(unitTests.disabled).toBe(true);
    expect(limitStatus.textContent).toContain("2 / 2");

    await fireEvent.click(none);
    expect(none.checked).toBe(true);
    expect(linter.checked).toBe(false);
    expect(formatter.checked).toBe(false);
    expect(unitTests.disabled).toBe(false);
    expect(limitStatus.textContent).toContain("0 / 2");
  });
});

describe("Choice components — devmtl token hygiene and container queries", () => {
  it("uses only --st-* tokens present in devmtl.css (except documented optional legend override)", () => {
    const available = devmtlVars();
    for (const [name, src] of [
      ["Radio.svelte", radioSrc],
      ["RadioGroup.svelte", radioGroupSrc],
      ["Checkbox.svelte", checkboxSrc],
      ["CheckboxGroup.svelte", checkboxGroupSrc]
    ] as const) {
      const missing = primaryVars(src).filter(
        (v) => v !== "--st-component-selection-legendFontSize" && !available.has(v)
      );
      expect(missing, `phantom tokens in ${name}`).toEqual([]);
    }
  });

  it("uses @container queries for responsive multi-column card layouts (never forcing 2 cols below 520px)", () => {
    expect(radioGroupSrc).toContain("container-type: inline-size");
    expect(radioGroupSrc).toContain("@container");
    expect(checkboxGroupSrc).toContain("container-type: inline-size");
    expect(checkboxGroupSrc).toContain("@container");

    const radioContainerIdx = radioGroupSrc.indexOf("@container (min-width: 520px)");
    const radioHorizIdx = radioGroupSrc.indexOf(".st-radioGroup--card.st-radioGroup--horizontal");
    expect(radioHorizIdx).toBeGreaterThan(radioContainerIdx);

    const checkboxContainerIdx = checkboxGroupSrc.indexOf("@container (min-width: 520px)");
    const checkboxHorizIdx = checkboxGroupSrc.indexOf(".st-checkboxGroup--card.st-checkboxGroup--horizontal");
    expect(checkboxHorizIdx).toBeGreaterThan(checkboxContainerIdx);
  });
});
