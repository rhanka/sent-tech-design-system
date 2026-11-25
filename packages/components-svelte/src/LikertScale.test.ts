import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { fireEvent, render, screen } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";
import LikertScale from "./lib/LikertScale.svelte";

const here = dirname(fileURLToPath(import.meta.url));
const devmtlCss = readFileSync(join(here, "../../theme-devmtl/css/devmtl.css"), "utf8");

function devmtlVars(): Set<string> {
  const vars = new Set<string>();
  for (const match of devmtlCss.matchAll(/(--st-[a-zA-Z0-9-]+)\s*:/g)) {
    vars.add(match[1]);
  }
  return vars;
}

const shortOptions = [
  { value: "1", label: "Jamais" },
  { value: "2", label: "Rarement" },
  { value: "3", label: "Parfois" },
  { value: "4", label: "Souvent" },
  { value: "5", label: "Toujours" }
];

const maturityOptions = [
  { value: "m1", label: "1 · Aucun usage structuré de l'IA dans l'équipe" },
  { value: "m2", label: "2 · Expérimentations individuelles sans cadre partagé" },
  { value: "m3", label: "3 · Pratiques documentées sur quelques équipes pilotes" },
  { value: "m4", label: "4 · Intégré au cycle de livraison avec garde-fous" },
  { value: "m5", label: "5 · Mesuré, audité et gouverné à l'échelle" }
];

describe("LikertScale — native semantics and selection", () => {
  it("renders a fieldset with legend, native radio inputs, and reports selection", async () => {
    const onchange = vi.fn();
    const { container } = render(LikertScale, {
      props: {
        name: "freq",
        legend: "Fréquence d'utilisation",
        options: shortOptions,
        minLabel: "Jamais",
        maxLabel: "Toujours",
        value: "2",
        onchange
      }
    });

    const fieldset = container.querySelector("fieldset") as HTMLFieldSetElement;
    const legend = container.querySelector("legend") as HTMLLegendElement;
    const radios = screen.getAllByRole("radio") as HTMLInputElement[];

    expect(fieldset).toBeTruthy();
    expect(legend.textContent).toBe("Fréquence d'utilisation");
    expect(radios.length).toBe(5);
    expect(radios.every((r) => r.name === "freq")).toBe(true);
    expect(radios[1].checked).toBe(true);

    await fireEvent.click(radios[3]);
    expect(onchange).toHaveBeenCalledWith("4");
  });

  it("supports 4 to 7 steps with custom stepBadge and descriptions", () => {
    const sevenStep = Array.from({ length: 7 }, (_, i) => ({
      value: `s${i + 1}`,
      label: `Niveau ${i + 1}`,
      stepBadge: `N${i + 1}`,
      description: `Détail ${i + 1}`
    }));

    const { container } = render(LikertScale, {
      props: {
        name: "seven",
        legend: "Échelle 7 points",
        options: sevenStep
      }
    });

    expect(screen.getAllByRole("radio").length).toBe(7);
    expect(container.querySelectorAll(".st-likert__badge")[0]?.textContent).toBe("N1");
    expect(screen.getByText("Détail 7")).toBeTruthy();
  });

  it("strips duplicate leading step numbers from labels and hides redundant bare numeric badges", () => {
    const { container: c1 } = render(LikertScale, {
      props: {
        name: "mat",
        legend: "Maturité",
        options: maturityOptions
      }
    });
    const badges = [...c1.querySelectorAll(".st-likert__badge")];
    const labels = [...c1.querySelectorAll(".st-likert__label")];
    expect(badges.map((el) => el.textContent)).toEqual(["1", "2", "3", "4", "5"]);
    expect(badges.every((el) => el.getAttribute("aria-hidden") === null)).toBe(true);
    expect(labels[0]?.textContent).toBe("Aucun usage structuré de l'IA dans l'équipe");
    expect(labels.every((el) => !/^\d+\s*·/.test(el.textContent ?? ""))).toBe(true);

    const bareNumeric = [
      { value: "1", label: "1" },
      { value: "2", label: "2" },
      { value: "3", label: "3" },
      { value: "4", label: "4" }
    ];
    const { container: c2 } = render(LikertScale, {
      props: {
        name: "bare",
        legend: "Note",
        options: bareNumeric
      }
    });
    expect(c2.querySelectorAll(".st-likert__badge").length).toBe(0);
    expect([...c2.querySelectorAll(".st-likert__label")].map((el) => el.textContent)).toEqual([
      "1",
      "2",
      "3",
      "4"
    ]);
  });

  it("exposes minLabel and maxLabel poles to screen readers and wires them via aria-describedby", () => {
    const { container } = render(LikertScale, {
      props: {
        name: "poles",
        legend: "Confiance",
        options: shortOptions,
        minLabel: "Faible",
        maxLabel: "Élevée"
      }
    });
    const fieldset = container.querySelector("fieldset") as HTMLFieldSetElement;
    const poles = container.querySelector(".st-likert__poles") as HTMLElement;
    const radios = screen.getAllByRole("radio") as HTMLInputElement[];

    expect(poles).toBeTruthy();
    expect(poles.id).toBeTruthy();
    expect(poles.getAttribute("aria-hidden")).toBeNull();
    expect(poles.textContent).toContain("Faible");
    expect(poles.textContent).toContain("Élevée");
    expect(fieldset.getAttribute("aria-describedby")).toContain(poles.id);
    expect(radios.every((r) => (r.getAttribute("aria-describedby") ?? "").includes(poles.id))).toBe(true);
  });
});

describe("LikertScale — responsive layout auto heuristic", () => {
  it("enables horizontal strip on wide containers for <= 5 short labels in layout='auto'", () => {
    const { container } = render(LikertScale, {
      props: {
        name: "auto-short",
        legend: "Fréquence",
        options: shortOptions
      }
    });
    const fieldset = container.querySelector("fieldset") as HTMLElement;
    expect(fieldset.classList.contains("st-likert--horizontal-capable")).toBe(true);
  });

  it("stays stacked for sentence-length maturity labels in layout='auto'", () => {
    const { container } = render(LikertScale, {
      props: {
        name: "auto-long",
        legend: "Maturité IA",
        options: maturityOptions
      }
    });
    const fieldset = container.querySelector("fieldset") as HTMLElement;
    expect(fieldset.classList.contains("st-likert--stacked")).toBe(true);
    expect(fieldset.classList.contains("st-likert--horizontal-capable")).toBe(false);
  });

  it("stays stacked for short labels carrying descriptions in layout='auto'", () => {
    const describedShort = shortOptions.map((o) => ({ ...o, description: "Précision contextuelle" }));
    const { container } = render(LikertScale, {
      props: {
        name: "auto-desc",
        legend: "Fréquence détaillée",
        options: describedShort
      }
    });
    const fieldset = container.querySelector("fieldset") as HTMLElement;
    expect(fieldset.classList.contains("st-likert--stacked")).toBe(true);
    expect(fieldset.classList.contains("st-likert--horizontal-capable")).toBe(false);
  });

  it("stays stacked for 6+ options in layout='auto' and respects explicit layout overrides", () => {
    const sixShort = [...shortOptions, { value: "6", label: "N/A" }];
    const { container: cAuto } = render(LikertScale, {
      props: { name: "six-auto", legend: "Six", options: sixShort }
    });
    expect(cAuto.querySelector("fieldset")?.classList.contains("st-likert--stacked")).toBe(true);

    const { container: cStacked } = render(LikertScale, {
      props: { name: "force-stacked", legend: "Stacked", options: shortOptions, layout: "stacked" }
    });
    expect(cStacked.querySelector("fieldset")?.classList.contains("st-likert--stacked")).toBe(true);

    const { container: cHoriz } = render(LikertScale, {
      props: { name: "force-horiz", legend: "Horiz", options: maturityOptions, layout: "horizontal" }
    });
    expect(
      cHoriz.querySelector("fieldset")?.classList.contains("st-likert--horizontal-capable")
    ).toBe(true);
  });
});

describe("LikertScale — validation, accessibility and styling contract", () => {
  it("wires required, invalid, helperText and errorText via aria-describedby", () => {
    const { container } = render(LikertScale, {
      props: {
        name: "req-scale",
        legend: "Autonomie",
        options: shortOptions,
        required: true,
        helperText: "Choisissez le niveau le plus proche.",
        errorText: "Réponse requise."
      }
    });

    const fieldset = container.querySelector("fieldset") as HTMLFieldSetElement;
    const alert = screen.getByRole("alert");
    const help = container.querySelector(".st-likert__help") as HTMLElement;
    const radios = screen.getAllByRole("radio") as HTMLInputElement[];

    expect(alert.textContent).toBe("Réponse requise.");
    expect(fieldset.getAttribute("role")).toBe("radiogroup");
    expect(fieldset.getAttribute("aria-required")).toBe("true");
    expect(fieldset.getAttribute("aria-invalid")).toBe("true");
    expect(fieldset.getAttribute("aria-describedby")).toContain(help.id);
    expect(fieldset.getAttribute("aria-describedby")).toContain(alert.id);
    expect(radios.every((r) => r.required && (r.getAttribute("aria-describedby") ?? "").includes(alert.id))).toBe(true);
  });

  it("enforces 48px touch targets, container queries, zero inline style attrs, and devmtl tokens", () => {
    const src = readFileSync(join(here, "lib/LikertScale.svelte"), "utf8");
    expect(src).toContain("min-height: 3rem");
    expect(src).toContain("container-type: inline-size");
    expect(src).toContain("@container");
    expect(src).toContain("--st-component-control-hoverBackground");
    expect(src).not.toMatch(/\sstyle=/);

    const available = devmtlVars();
    const used = [...src.matchAll(/var\(\s*(--st-[a-zA-Z0-9-]+)/g)].map((m) => m[1]);
    const missing = [...new Set(used)].filter(
      (v) => v !== "--st-component-selection-legendFontSize" && !available.has(v)
    );
    expect(missing, "phantom tokens in LikertScale.svelte").toEqual([]);
  });
});
