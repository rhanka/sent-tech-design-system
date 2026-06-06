import { fireEvent, render, screen } from "@testing-library/svelte";
import { createRawSnippet } from "svelte";
import { describe, expect, it, vi } from "vitest";
import FilterBar from "./lib/FilterBar.svelte";
import FilterPill from "./lib/FilterPill.svelte";
import SelectionChip from "./lib/SelectionChip.svelte";

// ---------------------------------------------------------------------------
// FilterPill
// ---------------------------------------------------------------------------
describe("FilterPill", () => {
  // ── Rendu basique ─────────────────────────────────────────────────────────

  it("rend field, operator et value", () => {
    const { container } = render(FilterPill, {
      props: { field: "Pays", operator: "in", value: "France, Italie" }
    });
    expect(container.textContent).toContain("Pays");
    expect(container.textContent).toContain("in");
    expect(container.textContent).toContain("France, Italie");
  });

  it("rend sans operator quand non fourni", () => {
    const { container } = render(FilterPill, {
      props: { field: "Statut", value: "Actif" }
    });
    expect(container.textContent).not.toContain("=");
    expect(container.textContent).toContain("Statut");
    expect(container.textContent).toContain("Actif");
  });

  // ── Nouvelle structure DOM : role=group + 2 boutons frères ────────────────

  it("conteneur est un span role=group avec aria-label 'Filtre {field}'", () => {
    render(FilterPill, { props: { field: "Pays", value: "France" } });
    const group = screen.getByRole("group", { name: "Filtre Pays" });
    expect(group.tagName.toLowerCase()).toBe("span");
  });

  // Helper : le corps-bouton est l'unique bouton qui porte aria-pressed.
  function getBodyButton(container: HTMLElement) {
    return container.querySelector<HTMLButtonElement>("button[aria-pressed]")!;
  }

  it("corps bouton (onClick fourni) : role=button natif + aria-pressed", () => {
    const onClick = vi.fn();
    const { container } = render(FilterPill, { props: { field: "Pays", value: "France", onClick } });
    const body = getBodyButton(container);
    expect(body).toBeTruthy();
    expect(body.getAttribute("aria-pressed")).toBeTruthy();
  });

  it("aria-pressed=true quand active=true (défaut)", () => {
    const onClick = vi.fn();
    const { container } = render(FilterPill, { props: { field: "Pays", value: "France", onClick } });
    const body = getBodyButton(container);
    expect(body.getAttribute("aria-pressed")).toBe("true");
  });

  it("aria-pressed=false quand active=false", () => {
    const onClick = vi.fn();
    const { container } = render(FilterPill, {
      props: { field: "Pays", value: "France", active: false, onClick }
    });
    const body = getBodyButton(container);
    expect(body.getAttribute("aria-pressed")).toBe("false");
  });

  it("corps statique (sans onClick) : pas de role=button ni aria-pressed", () => {
    const { container } = render(FilterPill, {
      props: { field: "Pays", value: "France" }
    });
    // Le seul bouton natif doit être le ✕, pas le corps
    const buttons = container.querySelectorAll("button");
    // Corps statique : aucun bouton avec aria-pressed
    const bodyBtn = Array.from(buttons).find(
      (b) => b.getAttribute("aria-pressed") !== null
    );
    expect(bodyBtn).toBeUndefined();
  });

  it("✕ est un bouton FRÈRE du corps (pas imbriqué)", () => {
    const onClick = vi.fn();
    render(FilterPill, { props: { field: "Pays", value: "France", onClick } });
    const group = screen.getByRole("group", { name: "Filtre Pays" });
    const buttons = group.querySelectorAll(":scope > button");
    // Les deux boutons sont des enfants directs du groupe
    expect(buttons.length).toBe(2);
  });

  // ── Interactions corps-bouton ─────────────────────────────────────────────

  it("onClick déclenché au clic sur le corps-bouton", async () => {
    const onClick = vi.fn();
    const { container } = render(FilterPill, { props: { field: "Pays", value: "France", onClick } });
    const body = getBodyButton(container);
    await fireEvent.click(body);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("✕ déclenche onRemove SANS déclencher onClick", async () => {
    const onClick = vi.fn();
    const onRemove = vi.fn();
    render(FilterPill, { props: { field: "Pays", value: "France", onClick, onRemove } });
    const removeBtn = screen.getByRole("button", { name: "Retirer le filtre Pays" });
    await fireEvent.click(removeBtn);
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();
  });

  // ── Anti-double-fire : un seul appel onRemove même avec onkeydown simulé ──

  it("anti-double-fire : clic sur ✕ déclenche onRemove exactement 1 fois", async () => {
    const onRemove = vi.fn();
    render(FilterPill, { props: { field: "Pays", value: "France", onRemove } });
    const removeBtn = screen.getByRole("button", { name: "Retirer le filtre Pays" });
    await fireEvent.click(removeBtn);
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it("anti-double-fire SelectionChip : clic sur ✕ déclenche onClear exactement 1 fois", async () => {
    const onClear = vi.fn();
    render(SelectionChip, { props: { label: "Région", onClear } });
    const clearBtn = screen.getByRole("button", { name: "Effacer Région" });
    await fireEvent.click(clearBtn);
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  // ── Suppr/Backspace sur le corps-bouton ───────────────────────────────────

  it("Suppr → onRemove (quand removable, sur le corps-bouton)", async () => {
    const onRemove = vi.fn();
    const onClick = vi.fn();
    const { container } = render(FilterPill, { props: { field: "Pays", value: "France", onClick, onRemove } });
    const body = getBodyButton(container);
    await fireEvent.keyDown(body, { key: "Delete" });
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it("Backspace → onRemove (quand removable, sur le corps-bouton)", async () => {
    const onRemove = vi.fn();
    const onClick = vi.fn();
    const { container } = render(FilterPill, { props: { field: "Pays", value: "France", onClick, onRemove } });
    const body = getBodyButton(container);
    await fireEvent.keyDown(body, { key: "Backspace" });
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it("Suppr ne déclenche pas onRemove quand removable=false", async () => {
    const onRemove = vi.fn();
    const onClick = vi.fn();
    const { container } = render(FilterPill, {
      props: { field: "Pays", value: "France", onClick, onRemove, removable: false }
    });
    const body = getBodyButton(container);
    await fireEvent.keyDown(body, { key: "Delete" });
    expect(onRemove).not.toHaveBeenCalled();
  });

  // ── ✕ absent/présent ─────────────────────────────────────────────────────

  it("✕ absent quand removable=false", () => {
    render(FilterPill, { props: { field: "Pays", value: "France", removable: false } });
    expect(screen.queryByRole("button", { name: /Retirer/ })).toBeNull();
  });

  it("✕ présent avec aria-label 'Retirer le filtre {field}'", () => {
    render(FilterPill, { props: { field: "Statut", value: "Actif" } });
    expect(screen.getByRole("button", { name: "Retirer le filtre Statut" })).toBeTruthy();
  });

  // ── Disabled : retire du tab order, callbacks silencieux ─────────────────

  it("disabled : corps-bouton désactivé, onClick non appelé", async () => {
    const onClick = vi.fn();
    const { container } = render(FilterPill, {
      props: { field: "Pays", value: "France", disabled: true, onClick }
    });
    const bodyBtn = getBodyButton(container);
    expect(bodyBtn).toHaveProperty("disabled", true);
    await fireEvent.click(bodyBtn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("disabled : ✕ désactivé, onRemove non appelé", async () => {
    const onRemove = vi.fn();
    const onClick = vi.fn();
    render(FilterPill, {
      props: { field: "Pays", value: "France", disabled: true, onClick, onRemove }
    });
    const removeBtn = screen.getByRole("button", { name: "Retirer le filtre Pays" });
    expect(removeBtn).toHaveProperty("disabled", true);
    await fireEvent.click(removeBtn);
    expect(onRemove).not.toHaveBeenCalled();
  });

  // ── Classes CSS ───────────────────────────────────────────────────────────

  it("classe st-filterPill--active quand active=true (défaut)", () => {
    const { container } = render(FilterPill, { props: { field: "Pays", value: "France" } });
    const pill = container.querySelector(".st-filterPill");
    expect(pill?.className).toContain("st-filterPill--active");
  });

  it("classe st-filterPill--active absente quand active=false", () => {
    const { container } = render(FilterPill, {
      props: { field: "Pays", value: "France", active: false }
    });
    const pill = container.querySelector(".st-filterPill");
    expect(pill?.className).not.toContain("st-filterPill--active");
  });

  it("tone='error' actif : classe st-filterPill--error ET st-filterPill--active présentes", () => {
    const { container } = render(FilterPill, {
      props: { field: "Statut", value: "Erreur", tone: "error", active: true }
    });
    const pill = container.querySelector(".st-filterPill");
    expect(pill?.className).toContain("st-filterPill--error");
    expect(pill?.className).toContain("st-filterPill--active");
  });

  it("tone='error' inactif : classe --error sans --active", () => {
    const { container } = render(FilterPill, {
      props: { field: "Statut", value: "Erreur", tone: "error", active: false }
    });
    const pill = container.querySelector(".st-filterPill");
    expect(pill?.className).toContain("st-filterPill--error");
    expect(pill?.className).not.toContain("st-filterPill--active");
  });
});

// ---------------------------------------------------------------------------
// FilterBar
// ---------------------------------------------------------------------------
describe("FilterBar", () => {
  const pills = createRawSnippet(() => ({
    render: () => '<span data-testid="pill">Pays: France</span>'
  }));

  it("role=group avec aria-label", () => {
    render(FilterBar, { props: { label: "Filtres actifs", children: pills } });
    const group = screen.getByRole("group", { name: "Filtres actifs" });
    expect(group).toBeTruthy();
  });

  it("rend les children (pilules)", () => {
    render(FilterBar, { props: { label: "Filtres actifs", children: pills } });
    expect(screen.getByTestId("pill")).toBeTruthy();
  });

  it("bouton 'tout effacer' absent si onClearAll non fourni", () => {
    render(FilterBar, { props: { label: "Filtres actifs", children: pills } });
    expect(screen.queryByRole("button", { name: /effacer/i })).toBeNull();
  });

  it("bouton 'tout effacer' présent si onClearAll fourni", () => {
    render(FilterBar, {
      props: { label: "Filtres actifs", onClearAll: vi.fn(), children: pills }
    });
    expect(screen.getByRole("button", { name: "Tout effacer" })).toBeTruthy();
  });

  it("clic sur 'tout effacer' déclenche onClearAll", async () => {
    const onClearAll = vi.fn();
    render(FilterBar, {
      props: { label: "Filtres actifs", onClearAll, children: pills }
    });
    await fireEvent.click(screen.getByRole("button", { name: "Tout effacer" }));
    expect(onClearAll).toHaveBeenCalledTimes(1);
  });

  it("clearAllLabel personnalisé", () => {
    render(FilterBar, {
      props: {
        label: "Filtres actifs",
        onClearAll: vi.fn(),
        clearAllLabel: "Réinitialiser",
        children: pills
      }
    });
    expect(screen.getByRole("button", { name: "Réinitialiser" })).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// SelectionChip
// ---------------------------------------------------------------------------
describe("SelectionChip", () => {
  it("rend le label", () => {
    const { container } = render(SelectionChip, { props: { label: "Région" } });
    expect(container.textContent).toContain("Région");
  });

  it("count fini affiché entre parenthèses", () => {
    const { container } = render(SelectionChip, { props: { label: "Région", count: 3 } });
    expect(container.textContent).toContain("(3)");
  });

  it("count Infinity non affiché", () => {
    const { container } = render(SelectionChip, {
      props: { label: "Région", count: Infinity }
    });
    expect(container.textContent).not.toContain("(");
  });

  it("count NaN non affiché", () => {
    const { container } = render(SelectionChip, {
      props: { label: "Région", count: NaN }
    });
    expect(container.textContent).not.toContain("(");
  });

  it("count 0 affiché (0 est fini)", () => {
    const { container } = render(SelectionChip, { props: { label: "Région", count: 0 } });
    expect(container.textContent).toContain("(0)");
  });

  it("bouton ✕ absent si onClear non fourni", () => {
    render(SelectionChip, { props: { label: "Région" } });
    expect(screen.queryByRole("button", { name: /Effacer/ })).toBeNull();
  });

  it("bouton ✕ présent avec aria-label 'Effacer {label}'", () => {
    render(SelectionChip, { props: { label: "Région", onClear: vi.fn() } });
    expect(screen.getByRole("button", { name: "Effacer Région" })).toBeTruthy();
  });

  it("clic sur ✕ déclenche onClear", async () => {
    const onClear = vi.fn();
    render(SelectionChip, { props: { label: "Région", onClear } });
    await fireEvent.click(screen.getByRole("button", { name: "Effacer Région" }));
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it("disabled : bouton ✕ désactivé, onClear non appelé", async () => {
    const onClear = vi.fn();
    render(SelectionChip, { props: { label: "Région", onClear, disabled: true } });
    const clearBtn = screen.getByRole("button", { name: "Effacer Région" });
    expect(clearBtn).toHaveProperty("disabled", true);
    await fireEvent.click(clearBtn);
    expect(onClear).not.toHaveBeenCalled();
  });

  it("aria-disabled sur le chip quand disabled", () => {
    const { container } = render(SelectionChip, {
      props: { label: "Région", disabled: true }
    });
    const chip = container.querySelector(".st-selectionChip");
    expect(chip?.getAttribute("aria-disabled")).toBe("true");
  });
});
