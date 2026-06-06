import { fireEvent, render, screen } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";
import RangeSlider from "./lib/RangeSlider.svelte";

function thumbs(container: HTMLElement) {
  return container.querySelectorAll<HTMLElement>("[role='slider']");
}

describe("RangeSlider", () => {
  // ── Rendu ─────────────────────────────────────────────────────────────────
  it("rend deux poignées role=slider", () => {
    const { container } = render(RangeSlider, {
      props: { value: [20, 60] as [number, number] },
    });
    expect(thumbs(container).length).toBe(2);
  });

  it("rend le label", () => {
    const { container } = render(RangeSlider, {
      props: { label: "Prix", value: [10, 90] as [number, number] },
    });
    expect(container.textContent).toContain("Prix");
  });

  it("affiche les bornes min/max", () => {
    const { container } = render(RangeSlider, {
      props: { min: 0, max: 200, value: [50, 150] as [number, number] },
    });
    expect(container.textContent).toContain("0");
    expect(container.textContent).toContain("200");
  });

  // ── Valeur contrôlée ──────────────────────────────────────────────────────
  it("value contrôlée → aria-valuenow par poignée", () => {
    const { container } = render(RangeSlider, {
      props: { value: [25, 75] as [number, number] },
    });
    const [low, high] = thumbs(container);
    expect(low.getAttribute("aria-valuenow")).toBe("25");
    expect(high.getAttribute("aria-valuenow")).toBe("75");
  });

  it("poignée basse aria-label par défaut", () => {
    const { container } = render(RangeSlider, {
      props: { value: [10, 90] as [number, number] },
    });
    const [low, high] = thumbs(container);
    expect(low.getAttribute("aria-label")).toBe("Valeur minimale");
    expect(high.getAttribute("aria-label")).toBe("Valeur maximale");
  });

  it("aria-label personnalisé par poignée", () => {
    const { container } = render(RangeSlider, {
      props: {
        value: [10, 90] as [number, number],
        ariaLabelMin: "Plancher",
        ariaLabelMax: "Plafond",
      },
    });
    const [low, high] = thumbs(container);
    expect(low.getAttribute("aria-label")).toBe("Plancher");
    expect(high.getAttribute("aria-label")).toBe("Plafond");
  });

  // ── onChange ──────────────────────────────────────────────────────────────
  it("onChange appelé avec [low, high] au clavier", async () => {
    const onChange = vi.fn();
    const { container } = render(RangeSlider, {
      props: { value: [20, 60] as [number, number], step: 5, onChange },
    });
    const [low] = thumbs(container);
    await fireEvent.keyDown(low, { key: "ArrowRight" });
    expect(onChange).toHaveBeenCalledWith([25, 60]);
  });

  // ── Non-croisement ────────────────────────────────────────────────────────
  it("la poignée basse ne dépasse pas la haute (clamp)", async () => {
    const onChange = vi.fn();
    const { container } = render(RangeSlider, {
      props: { value: [55, 60] as [number, number], step: 10, onChange },
    });
    const [low] = thumbs(container);
    // 55 + 10 = 65 > high(60) → rabattu à 60
    await fireEvent.keyDown(low, { key: "ArrowRight" });
    expect(onChange).toHaveBeenCalledWith([60, 60]);
  });

  it("la poignée haute ne passe pas sous la basse", async () => {
    const onChange = vi.fn();
    const { container } = render(RangeSlider, {
      props: { value: [40, 45] as [number, number], step: 10, onChange },
    });
    const [, high] = thumbs(container);
    // 45 - 10 = 35 < low(40) → rabattu à 40
    await fireEvent.keyDown(high, { key: "ArrowLeft" });
    expect(onChange).toHaveBeenCalledWith([40, 40]);
  });

  it("normalise une value inversée [80,20] sans croisement", () => {
    const { container } = render(RangeSlider, {
      props: { value: [80, 20] as [number, number] },
    });
    const [low, high] = thumbs(container);
    expect(Number(low.getAttribute("aria-valuenow"))).toBeLessThanOrEqual(
      Number(high.getAttribute("aria-valuenow"))
    );
  });

  // ── Clamp / step ──────────────────────────────────────────────────────────
  it("clamp dans [min, max]", async () => {
    const onChange = vi.fn();
    const { container } = render(RangeSlider, {
      props: { min: 0, max: 100, value: [0, 50] as [number, number], onChange },
    });
    const [low] = thumbs(container);
    await fireEvent.keyDown(low, { key: "Home" });
    expect(onChange).toHaveBeenCalledWith([0, 50]);
    await fireEvent.keyDown(low, { key: "ArrowLeft" });
    // déjà au min, reste 0
    expect(onChange).toHaveBeenLastCalledWith([0, 50]);
  });

  it("arrondit au step", async () => {
    const onChange = vi.fn();
    const { container } = render(RangeSlider, {
      props: { min: 0, max: 100, step: 10, value: [20, 80] as [number, number], onChange },
    });
    const [low] = thumbs(container);
    await fireEvent.keyDown(low, { key: "ArrowRight" });
    expect(onChange).toHaveBeenCalledWith([30, 80]);
  });

  // ── Clavier par poignée ───────────────────────────────────────────────────
  it("Home met la poignée basse au min", async () => {
    const onChange = vi.fn();
    const { container } = render(RangeSlider, {
      props: { min: 0, max: 100, value: [40, 80] as [number, number], onChange },
    });
    const [low] = thumbs(container);
    await fireEvent.keyDown(low, { key: "Home" });
    expect(onChange).toHaveBeenCalledWith([0, 80]);
  });

  it("End met la poignée haute au max", async () => {
    const onChange = vi.fn();
    const { container } = render(RangeSlider, {
      props: { min: 0, max: 100, value: [40, 80] as [number, number], onChange },
    });
    const [, high] = thumbs(container);
    await fireEvent.keyDown(high, { key: "End" });
    expect(onChange).toHaveBeenCalledWith([40, 100]);
  });

  it("PageUp ajoute 10×step à la poignée haute", async () => {
    const onChange = vi.fn();
    const { container } = render(RangeSlider, {
      props: { min: 0, max: 100, step: 1, value: [10, 50] as [number, number], onChange },
    });
    const [, high] = thumbs(container);
    await fireEvent.keyDown(high, { key: "PageUp" });
    expect(onChange).toHaveBeenCalledWith([10, 60]);
  });

  it("PageDown retire 10×step", async () => {
    const onChange = vi.fn();
    const { container } = render(RangeSlider, {
      props: { min: 0, max: 100, step: 1, value: [10, 50] as [number, number], onChange },
    });
    const [, high] = thumbs(container);
    await fireEvent.keyDown(high, { key: "PageDown" });
    expect(onChange).toHaveBeenCalledWith([10, 40]);
  });

  // ── Mode non-contrôlé ─────────────────────────────────────────────────────
  it("non-contrôlé : defaultValue puis met à jour interne", async () => {
    const { container } = render(RangeSlider, {
      props: { min: 0, max: 100, step: 5, defaultValue: [20, 60] as [number, number] },
    });
    const [low] = thumbs(container);
    expect(low.getAttribute("aria-valuenow")).toBe("20");
    await fireEvent.keyDown(low, { key: "ArrowRight" });
    expect(thumbs(container)[0].getAttribute("aria-valuenow")).toBe("25");
  });

  // ── Disabled ──────────────────────────────────────────────────────────────
  it("disabled : tabindex -1 et clavier inactif", async () => {
    const onChange = vi.fn();
    const { container } = render(RangeSlider, {
      props: { value: [20, 60] as [number, number], disabled: true, onChange },
    });
    const [low] = thumbs(container);
    expect(low.getAttribute("tabindex")).toBe("-1");
    expect(low.getAttribute("aria-disabled")).toBe("true");
    await fireEvent.keyDown(low, { key: "ArrowRight" });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("affiche la plage formatée dans l'output", () => {
    render(RangeSlider, {
      props: {
        value: [10, 90] as [number, number],
        valueFormatter: (v: number) => `${v}€`,
      },
    });
    const output = screen.getByText("10€ – 90€");
    expect(output).toBeTruthy();
  });
});
