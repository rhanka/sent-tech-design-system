import { render, screen } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import KpiCard from "./lib/KpiCard.svelte";

describe("KpiCard", () => {
  it("renders label and a formatted number value", () => {
    const { container } = render(KpiCard, {
      props: { value: 1234567, label: "Utilisateurs actifs", locale: "en-US" }
    });

    const root = container.querySelector(".st-kpiCard");
    expect(root).toBeTruthy();
    expect(root?.getAttribute("role")).toBe("group");
    expect(screen.getByText("Utilisateurs actifs")).toBeTruthy();
    expect(screen.getByText("1,234,567")).toBeTruthy();
  });

  it("formats currency and percent values via Intl.NumberFormat", () => {
    const { container: c1 } = render(KpiCard, {
      props: { value: 1500, label: "Revenu", format: "currency", currency: "USD", locale: "en-US" }
    });
    expect(c1.querySelector(".st-kpiCard__number")?.textContent).toBe("$1,500.00");

    const { container: c2 } = render(KpiCard, {
      props: { value: 0.426, label: "Taux", format: "percent", locale: "en-US" }
    });
    expect(c2.querySelector(".st-kpiCard__number")?.textContent).toBe("42.6%");
  });

  it("passes string values through untouched and renders the unit", () => {
    const { container } = render(KpiCard, {
      props: { value: "N/A", label: "Latence", unit: "ms" }
    });
    expect(container.querySelector(".st-kpiCard__number")?.textContent).toBe("N/A");
    expect(screen.getByText("ms")).toBeTruthy();
  });

  it("derives an upward trend from a positive delta with success colour", () => {
    const { container } = render(KpiCard, {
      props: { value: 100, label: "Ventes", delta: 0.12, locale: "en-US" }
    });
    const delta = container.querySelector(".st-kpiCard__delta");
    expect(delta?.className).toContain("st-kpiCard__delta--up");
    expect(delta?.textContent).toContain("+12%");
    // Arrow path present
    expect(container.querySelector(".st-kpiCard__arrow path")).toBeTruthy();
  });

  it("derives a downward trend from a negative delta and respects absolute format", () => {
    const { container } = render(KpiCard, {
      props: { value: 100, label: "Erreurs", delta: -34, deltaFormat: "absolute", locale: "en-US" }
    });
    const delta = container.querySelector(".st-kpiCard__delta");
    expect(delta?.className).toContain("st-kpiCard__delta--down");
    expect(delta?.textContent).toContain("-34");
  });

  it("lets an explicit trend override the delta sign", () => {
    const { container } = render(KpiCard, {
      props: { value: 100, label: "Inversé", delta: 5, trend: "down", locale: "en-US" }
    });
    expect(container.querySelector(".st-kpiCard__delta")?.className).toContain(
      "st-kpiCard__delta--down"
    );
  });

  it("renders an optional sparkline reusing the Sparkline primitive", () => {
    const { container } = render(KpiCard, {
      props: { value: 100, label: "Tendance", delta: 0.1, sparkline: [1, 3, 2, 5, 4] }
    });
    const spark = container.querySelector(".st-kpiCard__sparkline");
    expect(spark).toBeTruthy();
    expect(spark?.className).toContain("st-sparkline--success");
    expect(container.querySelector(".st-sparkline__line")).toBeTruthy();
  });

  it("applies size and categorical tone modifier classes", () => {
    const { container } = render(KpiCard, {
      props: { value: 100, label: "Stylé", size: "lg", tone: "category3" }
    });
    const root = container.querySelector(".st-kpiCard");
    expect(root?.className).toContain("st-kpiCard--lg");
    expect(root?.className).toContain("st-kpiCard--category3");
    expect(root?.className).toContain("st-kpiCard--toned");
  });

  it("exposes a descriptive aria-label aggregating label, value and delta", () => {
    render(KpiCard, {
      props: { value: 250, label: "Commandes", delta: 0.08, locale: "en-US" }
    });
    const group = screen.getByRole("group");
    const aria = group.getAttribute("aria-label") ?? "";
    expect(aria).toContain("Commandes");
    expect(aria).toContain("250");
    expect(aria).toContain("+8%");
    expect(aria).toContain("en hausse");
  });
});
