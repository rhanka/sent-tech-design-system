import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { RangeSlider } from "./index.js";

afterEach(cleanup);

function thumbs(container: HTMLElement) {
  return container.querySelectorAll<HTMLElement>("[role='slider']");
}

describe("RangeSlider", () => {
  // ── Rendu ─────────────────────────────────────────────────────────────────
  it("rend deux poignées role=slider", () => {
    const { container } = render(<RangeSlider value={[20, 60]} />);
    expect(thumbs(container).length).toBe(2);
  });

  it("rend le label", () => {
    const { container } = render(<RangeSlider label="Prix" value={[10, 90]} />);
    expect(container.textContent).toContain("Prix");
  });

  it("affiche les bornes min/max", () => {
    const { container } = render(<RangeSlider min={0} max={200} value={[50, 150]} />);
    expect(container.textContent).toContain("0");
    expect(container.textContent).toContain("200");
  });

  // ── Valeur contrôlée ──────────────────────────────────────────────────────
  it("value contrôlée → aria-valuenow par poignée", () => {
    const { container } = render(<RangeSlider value={[25, 75]} />);
    const [low, high] = thumbs(container);
    expect(low.getAttribute("aria-valuenow")).toBe("25");
    expect(high.getAttribute("aria-valuenow")).toBe("75");
  });

  it("aria-label par défaut par poignée", () => {
    const { container } = render(<RangeSlider value={[10, 90]} />);
    const [low, high] = thumbs(container);
    expect(low.getAttribute("aria-label")).toBe("Valeur minimale");
    expect(high.getAttribute("aria-label")).toBe("Valeur maximale");
  });

  it("aria-label personnalisé par poignée", () => {
    const { container } = render(
      <RangeSlider value={[10, 90]} ariaLabelMin="Plancher" ariaLabelMax="Plafond" />
    );
    const [low, high] = thumbs(container);
    expect(low.getAttribute("aria-label")).toBe("Plancher");
    expect(high.getAttribute("aria-label")).toBe("Plafond");
  });

  // ── onChange ──────────────────────────────────────────────────────────────
  it("onChange appelé avec [low, high] au clavier", () => {
    const onChange = vi.fn();
    const { container } = render(<RangeSlider value={[20, 60]} step={5} onChange={onChange} />);
    const [low] = thumbs(container);
    fireEvent.keyDown(low, { key: "ArrowRight" });
    expect(onChange).toHaveBeenCalledWith([25, 60]);
  });

  // ── Non-croisement ────────────────────────────────────────────────────────
  it("la poignée basse ne dépasse pas la haute", () => {
    const onChange = vi.fn();
    const { container } = render(<RangeSlider value={[55, 60]} step={10} onChange={onChange} />);
    const [low] = thumbs(container);
    fireEvent.keyDown(low, { key: "ArrowRight" });
    expect(onChange).toHaveBeenCalledWith([60, 60]);
  });

  it("la poignée haute ne passe pas sous la basse", () => {
    const onChange = vi.fn();
    const { container } = render(<RangeSlider value={[40, 45]} step={10} onChange={onChange} />);
    const [, high] = thumbs(container);
    fireEvent.keyDown(high, { key: "ArrowLeft" });
    expect(onChange).toHaveBeenCalledWith([40, 40]);
  });

  it("normalise une value inversée [80,20] sans croisement", () => {
    const { container } = render(<RangeSlider value={[80, 20]} />);
    const [low, high] = thumbs(container);
    expect(Number(low.getAttribute("aria-valuenow"))).toBeLessThanOrEqual(
      Number(high.getAttribute("aria-valuenow"))
    );
  });

  // ── Clamp / step ──────────────────────────────────────────────────────────
  it("clamp dans [min, max]", () => {
    const onChange = vi.fn();
    const { container } = render(
      <RangeSlider min={0} max={100} value={[0, 50]} onChange={onChange} />
    );
    const [low] = thumbs(container);
    fireEvent.keyDown(low, { key: "ArrowLeft" });
    expect(onChange).toHaveBeenCalledWith([0, 50]);
  });

  it("arrondit au step", () => {
    const onChange = vi.fn();
    const { container } = render(
      <RangeSlider min={0} max={100} step={10} value={[20, 80]} onChange={onChange} />
    );
    const [low] = thumbs(container);
    fireEvent.keyDown(low, { key: "ArrowRight" });
    expect(onChange).toHaveBeenCalledWith([30, 80]);
  });

  // ── Clavier par poignée ───────────────────────────────────────────────────
  it("Home met la poignée basse au min", () => {
    const onChange = vi.fn();
    const { container } = render(
      <RangeSlider min={0} max={100} value={[40, 80]} onChange={onChange} />
    );
    const [low] = thumbs(container);
    fireEvent.keyDown(low, { key: "Home" });
    expect(onChange).toHaveBeenCalledWith([0, 80]);
  });

  it("End met la poignée haute au max", () => {
    const onChange = vi.fn();
    const { container } = render(
      <RangeSlider min={0} max={100} value={[40, 80]} onChange={onChange} />
    );
    const [, high] = thumbs(container);
    fireEvent.keyDown(high, { key: "End" });
    expect(onChange).toHaveBeenCalledWith([40, 100]);
  });

  it("PageUp ajoute 10×step", () => {
    const onChange = vi.fn();
    const { container } = render(
      <RangeSlider min={0} max={100} step={1} value={[10, 50]} onChange={onChange} />
    );
    const [, high] = thumbs(container);
    fireEvent.keyDown(high, { key: "PageUp" });
    expect(onChange).toHaveBeenCalledWith([10, 60]);
  });

  it("PageDown retire 10×step", () => {
    const onChange = vi.fn();
    const { container } = render(
      <RangeSlider min={0} max={100} step={1} value={[10, 50]} onChange={onChange} />
    );
    const [, high] = thumbs(container);
    fireEvent.keyDown(high, { key: "PageDown" });
    expect(onChange).toHaveBeenCalledWith([10, 40]);
  });

  // ── Mode non-contrôlé ─────────────────────────────────────────────────────
  it("non-contrôlé : defaultValue puis met à jour interne", () => {
    const { container } = render(
      <RangeSlider min={0} max={100} step={5} defaultValue={[20, 60]} />
    );
    const [low] = thumbs(container);
    expect(low.getAttribute("aria-valuenow")).toBe("20");
    fireEvent.keyDown(low, { key: "ArrowRight" });
    expect(thumbs(container)[0].getAttribute("aria-valuenow")).toBe("25");
  });

  // ── Disabled ──────────────────────────────────────────────────────────────
  it("disabled : tabindex -1 et clavier inactif", () => {
    const onChange = vi.fn();
    const { container } = render(
      <RangeSlider value={[20, 60]} disabled onChange={onChange} />
    );
    const [low] = thumbs(container);
    expect(low.getAttribute("tabindex")).toBe("-1");
    expect(low.getAttribute("aria-disabled")).toBe("true");
    fireEvent.keyDown(low, { key: "ArrowRight" });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("affiche la plage formatée dans l'output", () => {
    render(<RangeSlider value={[10, 90]} valueFormatter={(v) => `${v}€`} />);
    expect(screen.getByText("10€ – 90€")).toBeTruthy();
  });
});
