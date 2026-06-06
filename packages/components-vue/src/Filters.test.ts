import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { h } from "vue";
import { FilterBar, FilterPill, SelectionChip } from "./index.js";

// ---------------------------------------------------------------------------
// FilterPill
// ---------------------------------------------------------------------------
describe("FilterPill", () => {
  // ── Rendu basique ──────────────────────────────────────────────────────────

  it("rend field, operator et value", () => {
    const wrapper = mount(FilterPill, {
      props: { field: "Pays", operator: "in", value: "France, Italie" },
    });
    expect(wrapper.text()).toContain("Pays");
    expect(wrapper.text()).toContain("in");
    expect(wrapper.text()).toContain("France, Italie");
  });

  it("rend sans operator quand non fourni", () => {
    const wrapper = mount(FilterPill, {
      props: { field: "Statut", value: "Actif" },
    });
    expect(wrapper.text()).not.toContain("=");
    expect(wrapper.text()).toContain("Statut");
    expect(wrapper.text()).toContain("Actif");
  });

  // ── Structure DOM : role=group + 2 boutons frères ─────────────────────────

  it("conteneur est un span role=group avec aria-label 'Filtre {field}'", () => {
    const wrapper = mount(FilterPill, {
      props: { field: "Pays", value: "France" },
    });
    const el = wrapper.element as HTMLElement;
    expect(el.tagName.toLowerCase()).toBe("span");
    expect(el.getAttribute("role")).toBe("group");
    expect(el.getAttribute("aria-label")).toBe("Filtre Pays");
  });

  function getBodyButton(wrapper: ReturnType<typeof mount>) {
    return wrapper.element.querySelector<HTMLButtonElement>("button[aria-pressed]");
  }

  it("corps bouton (onClick fourni) : role=button natif + aria-pressed", () => {
    const onClick = vi.fn();
    const wrapper = mount(FilterPill, {
      props: { field: "Pays", value: "France", onClick },
    });
    const body = getBodyButton(wrapper);
    expect(body).toBeTruthy();
    expect(body!.getAttribute("aria-pressed")).toBeTruthy();
  });

  it("aria-pressed=true quand active=true (défaut)", () => {
    const onClick = vi.fn();
    const wrapper = mount(FilterPill, {
      props: { field: "Pays", value: "France", onClick },
    });
    const body = getBodyButton(wrapper);
    expect(body!.getAttribute("aria-pressed")).toBe("true");
  });

  it("aria-pressed=false quand active=false", () => {
    const onClick = vi.fn();
    const wrapper = mount(FilterPill, {
      props: { field: "Pays", value: "France", active: false, onClick },
    });
    const body = getBodyButton(wrapper);
    expect(body!.getAttribute("aria-pressed")).toBe("false");
  });

  it("corps statique (sans onClick) : pas de role=button ni aria-pressed", () => {
    const wrapper = mount(FilterPill, {
      props: { field: "Pays", value: "France" },
    });
    const buttons = wrapper.element.querySelectorAll("button");
    const bodyBtn = Array.from(buttons).find(
      (b) => b.getAttribute("aria-pressed") !== null
    );
    expect(bodyBtn).toBeUndefined();
  });

  it("✕ est un bouton FRÈRE du corps (pas imbriqué)", () => {
    const onClick = vi.fn();
    const wrapper = mount(FilterPill, {
      props: { field: "Pays", value: "France", onClick },
    });
    const group = wrapper.element as HTMLElement;
    const buttons = group.querySelectorAll(":scope > button");
    expect(buttons.length).toBe(2);
  });

  // ── Interactions corps-bouton ──────────────────────────────────────────────

  it("onClick déclenché au clic sur le corps-bouton", async () => {
    const onClick = vi.fn();
    const wrapper = mount(FilterPill, {
      props: { field: "Pays", value: "France", onClick },
    });
    const body = getBodyButton(wrapper)!;
    await body.click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("✕ déclenche onRemove SANS déclencher onClick", async () => {
    const onClick = vi.fn();
    const onRemove = vi.fn();
    const wrapper = mount(FilterPill, {
      props: { field: "Pays", value: "France", onClick, onRemove },
    });
    const removeBtn = wrapper.element.querySelector<HTMLButtonElement>(
      `button[aria-label="Retirer le filtre Pays"]`
    )!;
    await removeBtn.click();
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();
  });

  // ── Anti-double-fire ───────────────────────────────────────────────────────

  it("anti-double-fire : clic sur ✕ déclenche onRemove exactement 1 fois", async () => {
    const onRemove = vi.fn();
    const wrapper = mount(FilterPill, {
      props: { field: "Pays", value: "France", onRemove },
    });
    const removeBtn = wrapper.element.querySelector<HTMLButtonElement>(
      `button[aria-label="Retirer le filtre Pays"]`
    )!;
    await removeBtn.click();
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it("anti-double-fire SelectionChip : clic sur ✕ déclenche onClear exactement 1 fois", async () => {
    const onClear = vi.fn();
    const wrapper = mount(SelectionChip, {
      props: { label: "Région", onClear },
    });
    const clearBtn = wrapper.element.querySelector<HTMLButtonElement>(
      `button[aria-label="Effacer Région"]`
    )!;
    await clearBtn.click();
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  // ── Suppr/Backspace sur le corps-bouton ────────────────────────────────────

  it("Suppr → onRemove (quand removable, sur le corps-bouton)", async () => {
    const onRemove = vi.fn();
    const onClick = vi.fn();
    const wrapper = mount(FilterPill, {
      props: { field: "Pays", value: "France", onClick, onRemove },
    });
    const body = getBodyButton(wrapper)!;
    await wrapper.find("button[aria-pressed]").trigger("keydown", { key: "Delete" });
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it("Backspace → onRemove (quand removable, sur le corps-bouton)", async () => {
    const onRemove = vi.fn();
    const onClick = vi.fn();
    const wrapper = mount(FilterPill, {
      props: { field: "Pays", value: "France", onClick, onRemove },
    });
    await wrapper.find("button[aria-pressed]").trigger("keydown", { key: "Backspace" });
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it("Suppr ne déclenche pas onRemove quand removable=false", async () => {
    const onRemove = vi.fn();
    const onClick = vi.fn();
    const wrapper = mount(FilterPill, {
      props: { field: "Pays", value: "France", onClick, onRemove, removable: false },
    });
    await wrapper.find("button[aria-pressed]").trigger("keydown", { key: "Delete" });
    expect(onRemove).not.toHaveBeenCalled();
  });

  // ── ✕ absent/présent ──────────────────────────────────────────────────────

  it("✕ absent quand removable=false", () => {
    const wrapper = mount(FilterPill, {
      props: { field: "Pays", value: "France", removable: false },
    });
    const removeBtn = wrapper.element.querySelector(
      `button[aria-label="Retirer le filtre Pays"]`
    );
    expect(removeBtn).toBeNull();
  });

  it("✕ présent avec aria-label 'Retirer le filtre {field}'", () => {
    const wrapper = mount(FilterPill, {
      props: { field: "Statut", value: "Actif" },
    });
    const removeBtn = wrapper.element.querySelector(
      `button[aria-label="Retirer le filtre Statut"]`
    );
    expect(removeBtn).toBeTruthy();
  });

  // ── Disabled : retire du tab order, callbacks silencieux ──────────────────

  it("disabled : corps-bouton désactivé, onClick non appelé", async () => {
    const onClick = vi.fn();
    const wrapper = mount(FilterPill, {
      props: { field: "Pays", value: "France", disabled: true, onClick },
    });
    const bodyBtn = getBodyButton(wrapper)!;
    expect(bodyBtn.disabled).toBe(true);
    await bodyBtn.click();
    expect(onClick).not.toHaveBeenCalled();
  });

  it("disabled : ✕ désactivé, onRemove non appelé", async () => {
    const onRemove = vi.fn();
    const onClick = vi.fn();
    const wrapper = mount(FilterPill, {
      props: { field: "Pays", value: "France", disabled: true, onClick, onRemove },
    });
    const removeBtn = wrapper.element.querySelector<HTMLButtonElement>(
      `button[aria-label="Retirer le filtre Pays"]`
    )!;
    expect(removeBtn.disabled).toBe(true);
    await removeBtn.click();
    expect(onRemove).not.toHaveBeenCalled();
  });

  // ── Classes CSS ────────────────────────────────────────────────────────────

  it("classe st-filterPill--active quand active=true (défaut)", () => {
    const wrapper = mount(FilterPill, {
      props: { field: "Pays", value: "France" },
    });
    // wrapper.element EST le span.st-filterPill (racine du composant)
    expect(wrapper.classes()).toContain("st-filterPill--active");
  });

  it("classe st-filterPill--active absente quand active=false", () => {
    const wrapper = mount(FilterPill, {
      props: { field: "Pays", value: "France", active: false },
    });
    expect(wrapper.classes()).not.toContain("st-filterPill--active");
  });

  it("tone='error' actif : classe st-filterPill--error ET st-filterPill--active présentes", () => {
    const wrapper = mount(FilterPill, {
      props: { field: "Statut", value: "Erreur", tone: "error", active: true },
    });
    expect(wrapper.classes()).toContain("st-filterPill--error");
    expect(wrapper.classes()).toContain("st-filterPill--active");
  });

  it("tone='error' inactif : classe --error sans --active", () => {
    const wrapper = mount(FilterPill, {
      props: { field: "Statut", value: "Erreur", tone: "error", active: false },
    });
    expect(wrapper.classes()).toContain("st-filterPill--error");
    expect(wrapper.classes()).not.toContain("st-filterPill--active");
  });
});

// ---------------------------------------------------------------------------
// FilterBar
// ---------------------------------------------------------------------------
describe("FilterBar", () => {
  it("role=group avec aria-label", () => {
    const wrapper = mount(FilterBar, {
      props: { label: "Filtres actifs" },
      slots: { default: '<span data-testid="pill">Pays: France</span>' },
    });
    const el = wrapper.element as HTMLElement;
    expect(el.getAttribute("role")).toBe("group");
    expect(el.getAttribute("aria-label")).toBe("Filtres actifs");
  });

  it("rend les children (pilules)", () => {
    const wrapper = mount(FilterBar, {
      props: { label: "Filtres actifs" },
      slots: { default: '<span data-testid="pill">Pays: France</span>' },
    });
    expect(wrapper.find('[data-testid="pill"]').exists()).toBe(true);
  });

  it("bouton 'tout effacer' absent si onClearAll non fourni", () => {
    const wrapper = mount(FilterBar, {
      props: { label: "Filtres actifs" },
      slots: { default: "<span>pill</span>" },
    });
    const buttons = wrapper.element.querySelectorAll("button");
    expect(buttons.length).toBe(0);
  });

  it("bouton 'tout effacer' présent si onClearAll fourni", () => {
    const wrapper = mount(FilterBar, {
      props: { label: "Filtres actifs", onClearAll: vi.fn() },
      slots: { default: "<span>pill</span>" },
    });
    const btn = wrapper.element.querySelector("button.st-filterBar__clearAll");
    expect(btn).toBeTruthy();
    expect(btn!.textContent).toBe("Tout effacer");
  });

  it("clic sur 'tout effacer' déclenche onClearAll", async () => {
    const onClearAll = vi.fn();
    const wrapper = mount(FilterBar, {
      props: { label: "Filtres actifs", onClearAll },
      slots: { default: "<span>pill</span>" },
    });
    await wrapper.find("button.st-filterBar__clearAll").trigger("click");
    expect(onClearAll).toHaveBeenCalledTimes(1);
  });

  it("clearAllLabel personnalisé", () => {
    const wrapper = mount(FilterBar, {
      props: { label: "Filtres actifs", onClearAll: vi.fn(), clearAllLabel: "Réinitialiser" },
      slots: { default: "<span>pill</span>" },
    });
    const btn = wrapper.element.querySelector("button.st-filterBar__clearAll");
    expect(btn!.textContent).toBe("Réinitialiser");
  });
});

// ---------------------------------------------------------------------------
// SelectionChip
// ---------------------------------------------------------------------------
describe("SelectionChip", () => {
  it("rend le label", () => {
    const wrapper = mount(SelectionChip, { props: { label: "Région" } });
    expect(wrapper.text()).toContain("Région");
  });

  it("count fini affiché entre parenthèses", () => {
    const wrapper = mount(SelectionChip, { props: { label: "Région", count: 3 } });
    expect(wrapper.text()).toContain("(3)");
  });

  it("count Infinity non affiché", () => {
    const wrapper = mount(SelectionChip, { props: { label: "Région", count: Infinity } });
    expect(wrapper.text()).not.toContain("(");
  });

  it("count NaN non affiché", () => {
    const wrapper = mount(SelectionChip, { props: { label: "Région", count: NaN } });
    expect(wrapper.text()).not.toContain("(");
  });

  it("count 0 affiché (0 est fini)", () => {
    const wrapper = mount(SelectionChip, { props: { label: "Région", count: 0 } });
    expect(wrapper.text()).toContain("(0)");
  });

  it("bouton ✕ absent si onClear non fourni", () => {
    const wrapper = mount(SelectionChip, { props: { label: "Région" } });
    expect(wrapper.element.querySelector("button")).toBeNull();
  });

  it("bouton ✕ présent avec aria-label 'Effacer {label}'", () => {
    const wrapper = mount(SelectionChip, { props: { label: "Région", onClear: vi.fn() } });
    const btn = wrapper.element.querySelector<HTMLButtonElement>(
      `button[aria-label="Effacer Région"]`
    );
    expect(btn).toBeTruthy();
  });

  it("clic sur ✕ déclenche onClear", async () => {
    const onClear = vi.fn();
    const wrapper = mount(SelectionChip, { props: { label: "Région", onClear } });
    await wrapper.find(`button[aria-label="Effacer Région"]`).trigger("click");
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it("disabled : bouton ✕ désactivé, onClear non appelé", async () => {
    const onClear = vi.fn();
    const wrapper = mount(SelectionChip, {
      props: { label: "Région", onClear, disabled: true },
    });
    const clearBtn = wrapper.element.querySelector<HTMLButtonElement>(
      `button[aria-label="Effacer Région"]`
    )!;
    expect(clearBtn.disabled).toBe(true);
    await clearBtn.click();
    expect(onClear).not.toHaveBeenCalled();
  });

  it("aria-disabled sur le chip quand disabled", () => {
    const wrapper = mount(SelectionChip, {
      props: { label: "Région", disabled: true },
    });
    // wrapper.element EST le span.st-selectionChip (racine du composant)
    expect(wrapper.attributes("aria-disabled")).toBe("true");
  });
});
