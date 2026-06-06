import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { RangeSlider } from "./index.js";

function thumbs(wrapper: ReturnType<typeof mount>) {
  return Array.from(
    wrapper.element.querySelectorAll<HTMLElement>("[role='slider']")
  );
}

describe("RangeSlider", () => {
  // ── Rendu ─────────────────────────────────────────────────────────────────
  it("rend deux poignées role=slider", () => {
    const wrapper = mount(RangeSlider, { props: { modelValue: [20, 60] } });
    expect(thumbs(wrapper).length).toBe(2);
  });

  it("rend le label", () => {
    const wrapper = mount(RangeSlider, { props: { label: "Prix", modelValue: [10, 90] } });
    expect(wrapper.text()).toContain("Prix");
  });

  it("affiche les bornes min/max", () => {
    const wrapper = mount(RangeSlider, { props: { min: 0, max: 200, modelValue: [50, 150] } });
    expect(wrapper.text()).toContain("0");
    expect(wrapper.text()).toContain("200");
  });

  // ── Valeur contrôlée ──────────────────────────────────────────────────────
  it("modelValue contrôlée → aria-valuenow par poignée", () => {
    const wrapper = mount(RangeSlider, { props: { modelValue: [25, 75] } });
    const [low, high] = thumbs(wrapper);
    expect(low.getAttribute("aria-valuenow")).toBe("25");
    expect(high.getAttribute("aria-valuenow")).toBe("75");
  });

  it("aria-label par défaut par poignée", () => {
    const wrapper = mount(RangeSlider, { props: { modelValue: [10, 90] } });
    const [low, high] = thumbs(wrapper);
    expect(low.getAttribute("aria-label")).toBe("Valeur minimale");
    expect(high.getAttribute("aria-label")).toBe("Valeur maximale");
  });

  it("aria-label personnalisé par poignée", () => {
    const wrapper = mount(RangeSlider, {
      props: { modelValue: [10, 90], ariaLabelMin: "Plancher", ariaLabelMax: "Plafond" },
    });
    const [low, high] = thumbs(wrapper);
    expect(low.getAttribute("aria-label")).toBe("Plancher");
    expect(high.getAttribute("aria-label")).toBe("Plafond");
  });

  // ── v-model ───────────────────────────────────────────────────────────────
  it("émet update:modelValue avec [low, high] au clavier", async () => {
    const wrapper = mount(RangeSlider, { props: { modelValue: [20, 60], step: 5 } });
    const [low] = thumbs(wrapper);
    await low.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" }));
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([[25, 60]]);
  });

  it("émet change en plus de update:modelValue", async () => {
    const wrapper = mount(RangeSlider, { props: { modelValue: [20, 60], step: 5 } });
    const [low] = thumbs(wrapper);
    await low.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" }));
    expect(wrapper.emitted("change")?.[0]).toEqual([[25, 60]]);
  });

  // ── Non-croisement ────────────────────────────────────────────────────────
  it("la poignée basse ne dépasse pas la haute", async () => {
    const wrapper = mount(RangeSlider, { props: { modelValue: [55, 60], step: 10 } });
    const [low] = thumbs(wrapper);
    await low.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" }));
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([[60, 60]]);
  });

  it("la poignée haute ne passe pas sous la basse", async () => {
    const wrapper = mount(RangeSlider, { props: { modelValue: [40, 45], step: 10 } });
    const [, high] = thumbs(wrapper);
    await high.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft" }));
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([[40, 40]]);
  });

  it("normalise une modelValue inversée [80,20] sans croisement", () => {
    const wrapper = mount(RangeSlider, { props: { modelValue: [80, 20] } });
    const [low, high] = thumbs(wrapper);
    expect(Number(low.getAttribute("aria-valuenow"))).toBeLessThanOrEqual(
      Number(high.getAttribute("aria-valuenow"))
    );
  });

  // ── Clamp / step ──────────────────────────────────────────────────────────
  it("clamp dans [min, max]", async () => {
    const wrapper = mount(RangeSlider, { props: { min: 0, max: 100, modelValue: [0, 50] } });
    const [low] = thumbs(wrapper);
    await low.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft" }));
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([[0, 50]]);
  });

  it("arrondit au step", async () => {
    const wrapper = mount(RangeSlider, {
      props: { min: 0, max: 100, step: 10, modelValue: [20, 80] },
    });
    const [low] = thumbs(wrapper);
    await low.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" }));
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([[30, 80]]);
  });

  // ── Clavier par poignée ───────────────────────────────────────────────────
  it("Home met la poignée basse au min", async () => {
    const wrapper = mount(RangeSlider, { props: { min: 0, max: 100, modelValue: [40, 80] } });
    const [low] = thumbs(wrapper);
    await low.dispatchEvent(new KeyboardEvent("keydown", { key: "Home" }));
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([[0, 80]]);
  });

  it("End met la poignée haute au max", async () => {
    const wrapper = mount(RangeSlider, { props: { min: 0, max: 100, modelValue: [40, 80] } });
    const [, high] = thumbs(wrapper);
    await high.dispatchEvent(new KeyboardEvent("keydown", { key: "End" }));
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([[40, 100]]);
  });

  it("PageUp ajoute 10×step", async () => {
    const wrapper = mount(RangeSlider, {
      props: { min: 0, max: 100, step: 1, modelValue: [10, 50] },
    });
    const [, high] = thumbs(wrapper);
    await high.dispatchEvent(new KeyboardEvent("keydown", { key: "PageUp" }));
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([[10, 60]]);
  });

  it("PageDown retire 10×step", async () => {
    const wrapper = mount(RangeSlider, {
      props: { min: 0, max: 100, step: 1, modelValue: [10, 50] },
    });
    const [, high] = thumbs(wrapper);
    await high.dispatchEvent(new KeyboardEvent("keydown", { key: "PageDown" }));
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([[10, 40]]);
  });

  // ── Mode non-contrôlé ─────────────────────────────────────────────────────
  it("non-contrôlé : defaultValue puis met à jour interne", async () => {
    const wrapper = mount(RangeSlider, {
      props: { min: 0, max: 100, step: 5, defaultValue: [20, 60] },
    });
    const [low] = thumbs(wrapper);
    expect(low.getAttribute("aria-valuenow")).toBe("20");
    await low.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" }));
    expect(thumbs(wrapper)[0].getAttribute("aria-valuenow")).toBe("25");
  });

  // ── Disabled ──────────────────────────────────────────────────────────────
  it("disabled : tabindex -1 et clavier inactif", async () => {
    const wrapper = mount(RangeSlider, { props: { modelValue: [20, 60], disabled: true } });
    const [low] = thumbs(wrapper);
    expect(low.getAttribute("tabindex")).toBe("-1");
    expect(low.getAttribute("aria-disabled")).toBe("true");
    await low.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" }));
    expect(wrapper.emitted("update:modelValue")).toBeFalsy();
  });

  it("affiche la plage formatée dans l'output", () => {
    const wrapper = mount(RangeSlider, {
      props: { modelValue: [10, 90], valueFormatter: (v: number) => `${v}€` },
    });
    expect(wrapper.text()).toContain("10€ – 90€");
  });
});
