import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { FilterBar, FilterPill, SelectionChip } from "./index.js";

afterEach(cleanup);

// ---------------------------------------------------------------------------
// FilterPill
// ---------------------------------------------------------------------------
describe("FilterPill", () => {
  // ── Rendu basique ──────────────────────────────────────────────────────────

  it("rend field, operator et value", () => {
    const { container } = render(
      <FilterPill field="Pays" operator="in" value="France, Italie" />
    );
    expect(container.textContent).toContain("Pays");
    expect(container.textContent).toContain("in");
    expect(container.textContent).toContain("France, Italie");
  });

  it("rend sans operator quand non fourni", () => {
    const { container } = render(<FilterPill field="Statut" value="Actif" />);
    expect(container.textContent).not.toContain("=");
    expect(container.textContent).toContain("Statut");
    expect(container.textContent).toContain("Actif");
  });

  // ── Structure DOM : role=group + 2 boutons frères ─────────────────────────

  it("conteneur est un span role=group avec aria-label 'Filtre {field}'", () => {
    render(<FilterPill field="Pays" value="France" />);
    const group = screen.getByRole("group", { name: "Filtre Pays" });
    expect(group.tagName.toLowerCase()).toBe("span");
  });

  function getBodyButton(container: HTMLElement) {
    return container.querySelector<HTMLButtonElement>("button[aria-pressed]")!;
  }

  it("corps bouton (onClick fourni) : role=button natif + aria-pressed", () => {
    const onClick = vi.fn();
    const { container } = render(
      <FilterPill field="Pays" value="France" onClick={onClick} />
    );
    const body = getBodyButton(container);
    expect(body).toBeTruthy();
    expect(body.getAttribute("aria-pressed")).toBeTruthy();
  });

  it("aria-pressed=true quand active=true (défaut)", () => {
    const onClick = vi.fn();
    const { container } = render(
      <FilterPill field="Pays" value="France" onClick={onClick} />
    );
    const body = getBodyButton(container);
    expect(body.getAttribute("aria-pressed")).toBe("true");
  });

  it("aria-pressed=false quand active=false", () => {
    const onClick = vi.fn();
    const { container } = render(
      <FilterPill field="Pays" value="France" active={false} onClick={onClick} />
    );
    const body = getBodyButton(container);
    expect(body.getAttribute("aria-pressed")).toBe("false");
  });

  it("corps statique (sans onClick) : pas de role=button ni aria-pressed", () => {
    const { container } = render(<FilterPill field="Pays" value="France" />);
    const buttons = container.querySelectorAll("button");
    const bodyBtn = Array.from(buttons).find(
      (b) => b.getAttribute("aria-pressed") !== null
    );
    expect(bodyBtn).toBeUndefined();
  });

  it("✕ est un bouton FRÈRE du corps (pas imbriqué)", () => {
    const onClick = vi.fn();
    render(<FilterPill field="Pays" value="France" onClick={onClick} />);
    const group = screen.getByRole("group", { name: "Filtre Pays" });
    const buttons = group.querySelectorAll(":scope > button");
    expect(buttons.length).toBe(2);
  });

  // ── Interactions corps-bouton ──────────────────────────────────────────────

  it("onClick déclenché au clic sur le corps-bouton", async () => {
    const onClick = vi.fn();
    const { container } = render(
      <FilterPill field="Pays" value="France" onClick={onClick} />
    );
    const body = getBodyButton(container);
    await fireEvent.click(body);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("✕ déclenche onRemove SANS déclencher onClick", async () => {
    const onClick = vi.fn();
    const onRemove = vi.fn();
    render(
      <FilterPill field="Pays" value="France" onClick={onClick} onRemove={onRemove} />
    );
    const removeBtn = screen.getByRole("button", { name: "Retirer le filtre Pays" });
    await fireEvent.click(removeBtn);
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();
  });

  // ── Anti-double-fire ───────────────────────────────────────────────────────

  it("anti-double-fire : clic sur ✕ déclenche onRemove exactement 1 fois", async () => {
    const onRemove = vi.fn();
    render(<FilterPill field="Pays" value="France" onRemove={onRemove} />);
    const removeBtn = screen.getByRole("button", { name: "Retirer le filtre Pays" });
    await fireEvent.click(removeBtn);
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it("anti-double-fire SelectionChip : clic sur ✕ déclenche onClear exactement 1 fois", async () => {
    const onClear = vi.fn();
    render(<SelectionChip label="Région" onClear={onClear} />);
    const clearBtn = screen.getByRole("button", { name: "Effacer Région" });
    await fireEvent.click(clearBtn);
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  // ── Suppr/Backspace sur le corps-bouton ────────────────────────────────────

  it("Suppr → onRemove (quand removable, sur le corps-bouton)", async () => {
    const onRemove = vi.fn();
    const onClick = vi.fn();
    const { container } = render(
      <FilterPill field="Pays" value="France" onClick={onClick} onRemove={onRemove} />
    );
    const body = getBodyButton(container);
    await fireEvent.keyDown(body, { key: "Delete" });
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it("Backspace → onRemove (quand removable, sur le corps-bouton)", async () => {
    const onRemove = vi.fn();
    const onClick = vi.fn();
    const { container } = render(
      <FilterPill field="Pays" value="France" onClick={onClick} onRemove={onRemove} />
    );
    const body = getBodyButton(container);
    await fireEvent.keyDown(body, { key: "Backspace" });
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it("Suppr ne déclenche pas onRemove quand removable=false", async () => {
    const onRemove = vi.fn();
    const onClick = vi.fn();
    const { container } = render(
      <FilterPill field="Pays" value="France" onClick={onClick} onRemove={onRemove} removable={false} />
    );
    const body = getBodyButton(container);
    await fireEvent.keyDown(body, { key: "Delete" });
    expect(onRemove).not.toHaveBeenCalled();
  });

  // ── ✕ absent/présent ──────────────────────────────────────────────────────

  it("✕ absent quand removable=false", () => {
    render(<FilterPill field="Pays" value="France" removable={false} />);
    expect(screen.queryByRole("button", { name: /Retirer/ })).toBeNull();
  });

  it("✕ présent avec aria-label 'Retirer le filtre {field}'", () => {
    render(<FilterPill field="Statut" value="Actif" />);
    expect(screen.getByRole("button", { name: "Retirer le filtre Statut" })).toBeTruthy();
  });

  // ── Disabled : retire du tab order, callbacks silencieux ──────────────────

  it("disabled : corps-bouton désactivé, onClick non appelé", async () => {
    const onClick = vi.fn();
    const { container } = render(
      <FilterPill field="Pays" value="France" disabled={true} onClick={onClick} />
    );
    const bodyBtn = getBodyButton(container);
    expect(bodyBtn).toHaveProperty("disabled", true);
    await fireEvent.click(bodyBtn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("disabled : ✕ désactivé, onRemove non appelé", async () => {
    const onRemove = vi.fn();
    const onClick = vi.fn();
    render(
      <FilterPill field="Pays" value="France" disabled={true} onClick={onClick} onRemove={onRemove} />
    );
    const removeBtn = screen.getByRole("button", { name: "Retirer le filtre Pays" });
    expect(removeBtn).toHaveProperty("disabled", true);
    await fireEvent.click(removeBtn);
    expect(onRemove).not.toHaveBeenCalled();
  });

  // ── Classes CSS ────────────────────────────────────────────────────────────

  it("classe st-filterPill--active quand active=true (défaut)", () => {
    const { container } = render(<FilterPill field="Pays" value="France" />);
    const pill = container.querySelector(".st-filterPill");
    expect(pill?.className).toContain("st-filterPill--active");
  });

  it("classe st-filterPill--active absente quand active=false", () => {
    const { container } = render(<FilterPill field="Pays" value="France" active={false} />);
    const pill = container.querySelector(".st-filterPill");
    expect(pill?.className).not.toContain("st-filterPill--active");
  });

  it("tone='error' actif : classe st-filterPill--error ET st-filterPill--active présentes", () => {
    const { container } = render(
      <FilterPill field="Statut" value="Erreur" tone="error" active={true} />
    );
    const pill = container.querySelector(".st-filterPill");
    expect(pill?.className).toContain("st-filterPill--error");
    expect(pill?.className).toContain("st-filterPill--active");
  });

  it("tone='error' inactif : classe --error sans --active", () => {
    const { container } = render(
      <FilterPill field="Statut" value="Erreur" tone="error" active={false} />
    );
    const pill = container.querySelector(".st-filterPill");
    expect(pill?.className).toContain("st-filterPill--error");
    expect(pill?.className).not.toContain("st-filterPill--active");
  });
});

// ---------------------------------------------------------------------------
// FilterBar
// ---------------------------------------------------------------------------
describe("FilterBar", () => {
  it("role=group avec aria-label", () => {
    render(<FilterBar label="Filtres actifs"><span data-testid="pill">Pays: France</span></FilterBar>);
    const group = screen.getByRole("group", { name: "Filtres actifs" });
    expect(group).toBeTruthy();
  });

  it("rend les children (pilules)", () => {
    render(<FilterBar label="Filtres actifs"><span data-testid="pill">Pays: France</span></FilterBar>);
    expect(screen.getByTestId("pill")).toBeTruthy();
  });

  it("bouton 'tout effacer' absent si onClearAll non fourni", () => {
    render(<FilterBar label="Filtres actifs"><span>pill</span></FilterBar>);
    expect(screen.queryByRole("button", { name: /effacer/i })).toBeNull();
  });

  it("bouton 'tout effacer' présent si onClearAll fourni", () => {
    render(
      <FilterBar label="Filtres actifs" onClearAll={vi.fn()}>
        <span>pill</span>
      </FilterBar>
    );
    expect(screen.getByRole("button", { name: "Tout effacer" })).toBeTruthy();
  });

  it("clic sur 'tout effacer' déclenche onClearAll", async () => {
    const onClearAll = vi.fn();
    render(
      <FilterBar label="Filtres actifs" onClearAll={onClearAll}>
        <span>pill</span>
      </FilterBar>
    );
    await fireEvent.click(screen.getByRole("button", { name: "Tout effacer" }));
    expect(onClearAll).toHaveBeenCalledTimes(1);
  });

  it("clearAllLabel personnalisé", () => {
    render(
      <FilterBar label="Filtres actifs" onClearAll={vi.fn()} clearAllLabel="Réinitialiser">
        <span>pill</span>
      </FilterBar>
    );
    expect(screen.getByRole("button", { name: "Réinitialiser" })).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// SelectionChip
// ---------------------------------------------------------------------------
describe("SelectionChip", () => {
  it("rend le label", () => {
    const { container } = render(<SelectionChip label="Région" />);
    expect(container.textContent).toContain("Région");
  });

  it("count fini affiché entre parenthèses", () => {
    const { container } = render(<SelectionChip label="Région" count={3} />);
    expect(container.textContent).toContain("(3)");
  });

  it("count Infinity non affiché", () => {
    const { container } = render(<SelectionChip label="Région" count={Infinity} />);
    expect(container.textContent).not.toContain("(");
  });

  it("count NaN non affiché", () => {
    const { container } = render(<SelectionChip label="Région" count={NaN} />);
    expect(container.textContent).not.toContain("(");
  });

  it("count 0 affiché (0 est fini)", () => {
    const { container } = render(<SelectionChip label="Région" count={0} />);
    expect(container.textContent).toContain("(0)");
  });

  it("bouton ✕ absent si onClear non fourni", () => {
    render(<SelectionChip label="Région" />);
    expect(screen.queryByRole("button", { name: /Effacer/ })).toBeNull();
  });

  it("bouton ✕ présent avec aria-label 'Effacer {label}'", () => {
    render(<SelectionChip label="Région" onClear={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Effacer Région" })).toBeTruthy();
  });

  it("clic sur ✕ déclenche onClear", async () => {
    const onClear = vi.fn();
    render(<SelectionChip label="Région" onClear={onClear} />);
    await fireEvent.click(screen.getByRole("button", { name: "Effacer Région" }));
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it("disabled : bouton ✕ désactivé, onClear non appelé", async () => {
    const onClear = vi.fn();
    render(<SelectionChip label="Région" onClear={onClear} disabled={true} />);
    const clearBtn = screen.getByRole("button", { name: "Effacer Région" });
    expect(clearBtn).toHaveProperty("disabled", true);
    await fireEvent.click(clearBtn);
    expect(onClear).not.toHaveBeenCalled();
  });

  it("aria-disabled sur le chip quand disabled", () => {
    const { container } = render(<SelectionChip label="Région" disabled={true} />);
    const chip = container.querySelector(".st-selectionChip");
    expect(chip?.getAttribute("aria-disabled")).toBe("true");
  });
});
