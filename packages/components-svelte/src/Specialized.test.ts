import { fireEvent, render, screen, within } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";
import Rating from "./lib/Rating.svelte";
import TimePicker from "./lib/TimePicker.svelte";
import Calendar from "./lib/Calendar.svelte";
import SlideIndicator from "./lib/SlideIndicator.svelte";
import Autosave from "./lib/Autosave.svelte";

describe("Rating", () => {
  // --- mode entier (radiogroup) ---
  it("exposes a radiogroup with one radio per star (integer mode)", () => {
    const { container } = render(Rating, { props: { value: 0, max: 5 } });
    const group = container.querySelector('[role="radiogroup"]') as HTMLElement;
    expect(group).toBeTruthy();
    expect(group.querySelectorAll('[role="radio"]')).toHaveLength(5);
  });

  it("a11y invariant: only the selected star has aria-checked=true (integer mode)", () => {
    const { container } = render(Rating, { props: { value: 3, max: 5 } });
    const radios = Array.from(container.querySelectorAll('[role="radio"]'));
    const checked = radios.filter((r) => r.getAttribute("aria-checked") === "true");
    expect(checked).toHaveLength(1);
    expect(checked[0].getAttribute("aria-label")).toBe("3 / 5");
  });

  it("a11y invariant: no aria-checked=true when value is 0 (integer mode)", () => {
    const { container } = render(Rating, { props: { value: 0, max: 5 } });
    const radios = Array.from(container.querySelectorAll('[role="radio"]'));
    const checked = radios.filter((r) => r.getAttribute("aria-checked") === "true");
    expect(checked).toHaveLength(0);
  });

  it("emits the clicked value through onChange", async () => {
    const onChange = vi.fn();
    render(Rating, { props: { value: 0, max: 5, onChange } });
    const stars = screen.getAllByRole("radio");
    await fireEvent.click(stars[2]);
    expect(onChange).toHaveBeenLastCalledWith(3);
  });

  it("moves the value with arrow keys (integer mode)", async () => {
    const onChange = vi.fn();
    render(Rating, { props: { value: 2, max: 5, onChange } });
    const stars = screen.getAllByRole("radio");
    await fireEvent.keyDown(stars[1], { key: "ArrowRight" });
    expect(onChange).toHaveBeenLastCalledWith(3);
  });

  it("a11y invariant: ArrowRight déplace le focus DOM vers le radio cible (roving réel)", async () => {
    const onChange = vi.fn();
    const { container } = render(Rating, { props: { value: 2, max: 5, onChange } });
    const stars = Array.from(container.querySelectorAll<HTMLElement>('[role="radio"]'));
    // Focus initial sur l'étoile 2 (index 1).
    stars[1].focus();
    await fireEvent.keyDown(stars[1], { key: "ArrowRight" });
    // Le focus doit être sur l'étoile 3 (index 2).
    expect(document.activeElement).toBe(stars[2]);
  });

  it("a11y invariant: ArrowLeft déplace le focus DOM vers le radio cible", async () => {
    const onChange = vi.fn();
    const { container } = render(Rating, { props: { value: 3, max: 5, onChange } });
    const stars = Array.from(container.querySelectorAll<HTMLElement>('[role="radio"]'));
    stars[2].focus();
    await fireEvent.keyDown(stars[2], { key: "ArrowLeft" });
    expect(document.activeElement).toBe(stars[1]);
  });

  it("a11y invariant: Home déplace le focus sur la 1ère étoile (jamais 0)", async () => {
    const onChange = vi.fn();
    const { container } = render(Rating, { props: { value: 4, max: 5, onChange } });
    const stars = Array.from(container.querySelectorAll<HTMLElement>('[role="radio"]'));
    stars[3].focus();
    await fireEvent.keyDown(stars[3], { key: "Home" });
    // Home → étoile 1 (index 0), pas de valeur 0.
    expect(onChange).toHaveBeenLastCalledWith(1);
    expect(document.activeElement).toBe(stars[0]);
  });

  it("a11y invariant: End déplace le focus sur la dernière étoile", async () => {
    const onChange = vi.fn();
    const { container } = render(Rating, { props: { value: 2, max: 5, onChange } });
    const stars = Array.from(container.querySelectorAll<HTMLElement>('[role="radio"]'));
    stars[1].focus();
    await fireEvent.keyDown(stars[1], { key: "End" });
    expect(onChange).toHaveBeenLastCalledWith(5);
    expect(document.activeElement).toBe(stars[4]);
  });

  it("a11y invariant: ArrowLeft sur étoile 1 reste sur étoile 1 (pas de valeur 0)", async () => {
    const onChange = vi.fn();
    const { container } = render(Rating, { props: { value: 1, max: 5, onChange } });
    const stars = Array.from(container.querySelectorAll<HTMLElement>('[role="radio"]'));
    stars[0].focus();
    await fireEvent.keyDown(stars[0], { key: "ArrowLeft" });
    // On reste sur étoile 1 — clamp à 1, pas 0.
    expect(onChange).toHaveBeenLastCalledWith(1);
    expect(document.activeElement).toBe(stars[0]);
  });

  it("a11y invariant: slider expose tabindex=0 (focusable par le clavier)", () => {
    const { container } = render(Rating, { props: { value: 2, max: 5, allowHalf: true } });
    const slider = container.querySelector('[role="slider"]') as HTMLElement;
    expect(slider.getAttribute("tabindex")).toBe("0");
  });

  // --- mode demi-étoiles (slider) ---
  it("exposes a slider element in allowHalf mode", () => {
    const { container } = render(Rating, { props: { value: 2.5, max: 5, allowHalf: true } });
    const slider = container.querySelector('[role="slider"]') as HTMLElement;
    expect(slider).toBeTruthy();
    expect(slider.getAttribute("aria-valuenow")).toBe("2.5");
    expect(slider.getAttribute("aria-valuemin")).toBe("0");
    expect(slider.getAttribute("aria-valuemax")).toBe("5");
    expect(slider.getAttribute("aria-valuetext")).toBe("2.5 / 5");
  });

  it("a11y invariant: slider aria-valuenow reflects exact half value", () => {
    const { container } = render(Rating, { props: { value: 3.5, max: 5, allowHalf: true } });
    const slider = container.querySelector('[role="slider"]') as HTMLElement;
    expect(slider.getAttribute("aria-valuenow")).toBe("3.5");
    // Aucun radio/aria-checked ne doit être présent (pas de radiogroup en mode allowHalf)
    expect(container.querySelectorAll('[role="radio"]')).toHaveLength(0);
  });

  it("moves the slider value with arrow keys (allowHalf mode)", async () => {
    const onChange = vi.fn();
    const { container } = render(Rating, { props: { value: 2, max: 5, allowHalf: true, onChange } });
    const slider = container.querySelector('[role="slider"]') as HTMLElement;
    await fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(onChange).toHaveBeenLastCalledWith(2.5);
  });

  // --- readonly ---
  it("does not emit when readonly", async () => {
    const onChange = vi.fn();
    const { container } = render(Rating, { props: { value: 3, max: 5, readonly: true, onChange } });
    // Readonly : rendu en role=img, pas de boutons interactifs.
    const img = container.querySelector('[role="img"]') as HTMLElement;
    expect(img).toBeTruthy();
    await fireEvent.click(img);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("a11y invariant: readonly exposes value in aria-label, no interactive buttons", () => {
    const { container } = render(Rating, {
      props: { value: 4, max: 5, readonly: true, label: "Note" }
    });
    const img = container.querySelector('[role="img"]') as HTMLElement;
    expect(img.getAttribute("aria-label")).toBe("Note : 4 / 5");
    // Aucun bouton disabled dans l'arbre — ils ne seraient pas focusables
    expect(container.querySelectorAll("button[disabled]")).toHaveLength(0);
  });
});

describe("TimePicker", () => {
  it("generates time slots based on step", async () => {
    render(TimePicker, { props: { value: "", step: 30, label: "Heure" } });
    await fireEvent.click(screen.getByLabelText("Heure"));
    const options = screen.getAllByRole("option");
    // 24h * 2 slots/hour = 48 with a 30-minute step.
    expect(options).toHaveLength(48);
    expect(options[0].textContent?.trim()).toBe("00:00");
    expect(options[1].textContent?.trim()).toBe("00:30");
  });

  it("respects min and max bounds", async () => {
    render(TimePicker, { props: { value: "", step: 60, min: "09:00", max: "12:00", label: "H" } });
    await fireEvent.click(screen.getByLabelText("H"));
    const options = screen.getAllByRole("option");
    expect(options.map((o) => o.textContent?.trim())).toEqual([
      "09:00",
      "10:00",
      "11:00",
      "12:00"
    ]);
  });

  it("emits the selected slot as HH:mm", async () => {
    const onChange = vi.fn();
    render(TimePicker, { props: { value: "", step: 60, onChange, label: "Time" } });
    // Ouvrir la liste (onclick sur l'input).
    await fireEvent.click(screen.getByLabelText("Time"));
    // Sélection via click sur le bouton option.
    await fireEvent.click(screen.getByRole("option", { name: "08:00" }));
    expect(onChange).toHaveBeenCalledWith("08:00");
  });

  it("renders 12h format while still emitting 24h HH:mm", async () => {
    const onChange = vi.fn();
    render(TimePicker, {
      props: { value: "", step: 60, format: "12", onChange, label: "T" }
    });
    await fireEvent.click(screen.getByLabelText("T"));
    // 13:00 should display as 01:00 PM but emit "13:00".
    const pm = screen.getByRole("option", { name: "01:00 PM" });
    await fireEvent.click(pm);
    expect(onChange).toHaveBeenCalledWith("13:00");
  });
});

describe("Calendar", () => {
  it("renders the month grid with 42 day cells", () => {
    const { container } = render(Calendar, {
      props: { value: "2026-06-15", locale: "fr-FR" }
    });
    expect(container.querySelector('[role="grid"]')).toBeTruthy();
    expect(container.querySelectorAll('[role="gridcell"]')).toHaveLength(42);
  });

  it("emits the clicked day as YYYY-MM-DD", async () => {
    const onChange = vi.fn();
    render(Calendar, { props: { value: "2026-06-01", month: "2026-06", onChange, locale: "fr-FR" } });
    const label = new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(new Date(2026, 5, 15));
    await fireEvent.click(screen.getByRole("gridcell", { name: label }));
    expect(onChange).toHaveBeenCalledWith("2026-06-15");
  });

  it("disables days outside the min/max bounds", () => {
    render(Calendar, {
      props: { value: null, month: "2026-06", min: "2026-06-10", max: "2026-06-20", locale: "fr-FR" }
    });
    const labelFor = (day: number) =>
      new Intl.DateTimeFormat("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric"
      }).format(new Date(2026, 5, day));
    const before = screen.getByRole("gridcell", { name: labelFor(5) }) as HTMLButtonElement;
    const inside = screen.getByRole("gridcell", { name: labelFor(15) }) as HTMLButtonElement;
    expect(before.disabled).toBe(true);
    expect(inside.disabled).toBe(false);
  });

  it("emits a [start, end] tuple in range mode", async () => {
    const onChange = vi.fn();
    render(Calendar, {
      props: { value: [null, null], range: true, month: "2026-06", onChange, locale: "fr-FR" }
    });
    const labelFor = (day: number) =>
      new Intl.DateTimeFormat("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric"
      }).format(new Date(2026, 5, day));
    await fireEvent.click(screen.getByRole("gridcell", { name: labelFor(10) }));
    expect(onChange).toHaveBeenLastCalledWith(["2026-06-10", null]);
  });

  // --- Navigation clavier (pattern ARIA grid) ---

  it("a11y: un seul gridcell a tabindex=0 (roving tabindex)", () => {
    render(Calendar, { props: { value: "2026-06-15", month: "2026-06", locale: "fr-FR" } });
    const cells = screen.getAllByRole("gridcell") as HTMLButtonElement[];
    const tabbable = cells.filter((c) => c.tabIndex === 0);
    expect(tabbable).toHaveLength(1);
    expect(tabbable[0].getAttribute("data-date")).toBe("2026-06-15");
  });

  it("a11y: hiérarchie grid → row → gridcell (6 lignes de semaine)", () => {
    const { container } = render(Calendar, {
      props: { value: "2026-06-15", month: "2026-06", locale: "fr-FR" }
    });
    const rows = container.querySelectorAll('[role="row"]');
    // 1 ligne d'en-têtes + 6 lignes de semaines
    expect(rows).toHaveLength(7);
    const weekRows = Array.from(rows).slice(1);
    for (const row of weekRows) {
      expect(row.querySelectorAll('[role="gridcell"]')).toHaveLength(7);
    }
  });

  it("ArrowRight déplace le focus d'un jour vers la droite", async () => {
    const { container } = render(Calendar, {
      props: { value: "2026-06-15", month: "2026-06", locale: "fr-FR" }
    });
    const grid = container.querySelector('[role="grid"]') as HTMLElement;
    await fireEvent.keyDown(grid, { key: "ArrowRight" });
    const tabbable = (screen.getAllByRole("gridcell") as HTMLButtonElement[]).filter(
      (c) => c.tabIndex === 0
    );
    expect(tabbable).toHaveLength(1);
    expect(tabbable[0].getAttribute("data-date")).toBe("2026-06-16");
  });

  it("ArrowLeft déplace le focus d'un jour vers la gauche", async () => {
    const { container } = render(Calendar, {
      props: { value: "2026-06-15", month: "2026-06", locale: "fr-FR" }
    });
    const grid = container.querySelector('[role="grid"]') as HTMLElement;
    await fireEvent.keyDown(grid, { key: "ArrowLeft" });
    const tabbable = (screen.getAllByRole("gridcell") as HTMLButtonElement[]).filter(
      (c) => c.tabIndex === 0
    );
    expect(tabbable).toHaveLength(1);
    expect(tabbable[0].getAttribute("data-date")).toBe("2026-06-14");
  });

  it("ArrowDown déplace le focus d'une semaine vers le bas", async () => {
    const { container } = render(Calendar, {
      props: { value: "2026-06-15", month: "2026-06", locale: "fr-FR" }
    });
    const grid = container.querySelector('[role="grid"]') as HTMLElement;
    await fireEvent.keyDown(grid, { key: "ArrowDown" });
    const tabbable = (screen.getAllByRole("gridcell") as HTMLButtonElement[]).filter(
      (c) => c.tabIndex === 0
    );
    expect(tabbable).toHaveLength(1);
    expect(tabbable[0].getAttribute("data-date")).toBe("2026-06-22");
  });

  it("ArrowUp déplace le focus d'une semaine vers le haut", async () => {
    const { container } = render(Calendar, {
      props: { value: "2026-06-15", month: "2026-06", locale: "fr-FR" }
    });
    const grid = container.querySelector('[role="grid"]') as HTMLElement;
    await fireEvent.keyDown(grid, { key: "ArrowUp" });
    const tabbable = (screen.getAllByRole("gridcell") as HTMLButtonElement[]).filter(
      (c) => c.tabIndex === 0
    );
    expect(tabbable).toHaveLength(1);
    expect(tabbable[0].getAttribute("data-date")).toBe("2026-06-08");
  });

  it("ArrowRight en fin de mois bascule au mois suivant", async () => {
    const { container } = render(Calendar, {
      props: { value: "2026-06-30", month: "2026-06", locale: "fr-FR" }
    });
    const grid = container.querySelector('[role="grid"]') as HTMLElement;
    await fireEvent.keyDown(grid, { key: "ArrowRight" });
    const tabbable = (screen.getAllByRole("gridcell") as HTMLButtonElement[]).filter(
      (c) => c.tabIndex === 0
    );
    expect(tabbable).toHaveLength(1);
    expect(tabbable[0].getAttribute("data-date")).toBe("2026-07-01");
  });

  it("Enter sélectionne la date active", async () => {
    const onChange = vi.fn();
    const { container } = render(Calendar, {
      props: { value: "2026-06-15", month: "2026-06", onChange, locale: "fr-FR" }
    });
    const grid = container.querySelector('[role="grid"]') as HTMLElement;
    // Déplacer jusqu'au 20 juin (5 x ArrowRight) puis Enter
    for (let i = 0; i < 5; i++) {
      await fireEvent.keyDown(grid, { key: "ArrowRight" });
    }
    await fireEvent.keyDown(grid, { key: "Enter" });
    expect(onChange).toHaveBeenLastCalledWith("2026-06-20");
  });

  it("Espace sélectionne la date active", async () => {
    const onChange = vi.fn();
    const { container } = render(Calendar, {
      props: { value: "2026-06-10", month: "2026-06", onChange, locale: "fr-FR" }
    });
    const grid = container.querySelector('[role="grid"]') as HTMLElement;
    await fireEvent.keyDown(grid, { key: " " });
    expect(onChange).toHaveBeenLastCalledWith("2026-06-10");
  });

  it("PageUp bascule au mois précédent et repositionne le focus", async () => {
    const { container } = render(Calendar, {
      props: { value: "2026-06-15", month: "2026-06", locale: "fr-FR" }
    });
    const grid = container.querySelector('[role="grid"]') as HTMLElement;
    await fireEvent.keyDown(grid, { key: "PageUp" });
    const tabbable = (screen.getAllByRole("gridcell") as HTMLButtonElement[]).filter(
      (c) => c.tabIndex === 0
    );
    expect(tabbable).toHaveLength(1);
    // Le 15 mai 2026 existe → focus repositionné sur le même jour du mois précédent.
    expect(tabbable[0].getAttribute("data-date")).toBe("2026-05-15");
  });

  it("PageDown bascule au mois suivant et repositionne le focus", async () => {
    const { container } = render(Calendar, {
      props: { value: "2026-06-15", month: "2026-06", locale: "fr-FR" }
    });
    const grid = container.querySelector('[role="grid"]') as HTMLElement;
    await fireEvent.keyDown(grid, { key: "PageDown" });
    const tabbable = (screen.getAllByRole("gridcell") as HTMLButtonElement[]).filter(
      (c) => c.tabIndex === 0
    );
    expect(tabbable).toHaveLength(1);
    // Le 15 juillet 2026 existe → focus repositionné sur le même jour du mois suivant.
    expect(tabbable[0].getAttribute("data-date")).toBe("2026-07-15");
  });

  it("PageUp en janvier bascule à décembre de l'année précédente", async () => {
    const { container } = render(Calendar, {
      props: { value: "2026-01-15", month: "2026-01", locale: "fr-FR" }
    });
    const grid = container.querySelector('[role="grid"]') as HTMLElement;
    await fireEvent.keyDown(grid, { key: "PageUp" });
    const tabbable = (screen.getAllByRole("gridcell") as HTMLButtonElement[]).filter(
      (c) => c.tabIndex === 0
    );
    expect(tabbable).toHaveLength(1);
    expect(tabbable[0].getAttribute("data-date")).toBe("2025-12-15");
  });

  // --- Corrections a11y roving tabindex (bugs Codex) ---

  it("a11y: nav bouton ‹ → exactement 1 tabindex=0 dans le nouveau mois", async () => {
    const { container } = render(Calendar, {
      props: { value: "2026-06-15", month: "2026-06", locale: "fr-FR" }
    });
    const prevBtn = container.querySelector('[aria-label="Mois précédent"]') as HTMLElement;
    await fireEvent.click(prevBtn);
    const tabbable = (screen.getAllByRole("gridcell") as HTMLButtonElement[]).filter(
      (c) => c.tabIndex === 0
    );
    // Exactement une cellule focusable après changement de mois via bouton.
    expect(tabbable).toHaveLength(1);
    // Le focus est dans le mois de mai 2026 (mois affiché après nav).
    expect(tabbable[0].getAttribute("data-date")).toMatch(/^2026-05-/);
  });

  it("a11y: nav bouton › → exactement 1 tabindex=0 dans le nouveau mois", async () => {
    const { container } = render(Calendar, {
      props: { value: "2026-06-15", month: "2026-06", locale: "fr-FR" }
    });
    const nextBtn = container.querySelector('[aria-label="Mois suivant"]') as HTMLElement;
    await fireEvent.click(nextBtn);
    const tabbable = (screen.getAllByRole("gridcell") as HTMLButtonElement[]).filter(
      (c) => c.tabIndex === 0
    );
    expect(tabbable).toHaveLength(1);
    expect(tabbable[0].getAttribute("data-date")).toMatch(/^2026-07-/);
  });

  it("a11y: focusDate hors-bornes repositionné sur le 1er jour activable du mois", () => {
    // min = 2026-06-10 : les jours 1-9 sont disabled.
    // value = null → pas de sélection. focusDate initial doit être le 2026-06-10.
    render(Calendar, {
      props: { value: null, month: "2026-06", min: "2026-06-10", locale: "fr-FR" }
    });
    const tabbable = (screen.getAllByRole("gridcell") as HTMLButtonElement[]).filter(
      (c) => c.tabIndex === 0
    );
    expect(tabbable).toHaveLength(1);
    expect(tabbable[0].getAttribute("data-date")).toBe("2026-06-10");
  });

  it("a11y: focusDate clamped quand min rend tous les jours antérieurs disabled, valeur hors mois", () => {
    // value pointe sur 2026-05-15 (mois précédent), month forcé sur 2026-06,
    // min = 2026-06-20 → les 19 premiers jours du mois sont disabled.
    // focusDate doit atterrir sur le 2026-06-20.
    render(Calendar, {
      props: { value: "2026-05-15", month: "2026-06", min: "2026-06-20", locale: "fr-FR" }
    });
    const tabbable = (screen.getAllByRole("gridcell") as HTMLButtonElement[]).filter(
      (c) => c.tabIndex === 0
    );
    expect(tabbable).toHaveLength(1);
    expect(tabbable[0].getAttribute("data-date")).toBe("2026-06-20");
  });

  it("a11y: display:grid sur role=row (pas display:contents)", () => {
    const { container } = render(Calendar, {
      props: { value: "2026-06-15", month: "2026-06", locale: "fr-FR" }
    });
    const weekRows = Array.from(container.querySelectorAll(".st-calendar__week")) as HTMLElement[];
    expect(weekRows).toHaveLength(6);
    for (const row of weekRows) {
      // display:contents supprime le nœud de l'arbre a11y — on vérifie qu'il n'est pas utilisé.
      expect(getComputedStyle(row).display).not.toBe("contents");
    }
  });

  it("a11y invariant: mois entièrement hors-bornes → aucun bouton disabled ne reçoit tabindex=0", () => {
    // Juin 2026 affiché, mais min=2026-07-01 → tous les jours de juin sont avant la borne min,
    // donc tous disabled. Aucune cellule ne doit avoir tabindex=0.
    render(Calendar, {
      props: { value: null, month: "2026-06", min: "2026-07-01", locale: "fr-FR" }
    });
    const cells = screen.getAllByRole("gridcell") as HTMLButtonElement[];
    const tabbable = cells.filter((c) => c.tabIndex === 0);
    // Invariant : tabindex=0 ne peut être posé sur un bouton disabled.
    expect(tabbable.every((c) => !c.disabled)).toBe(true);
    // Tous les jours de juin sont disabled → aucune cellule tabbable.
    expect(tabbable).toHaveLength(0);
  });
});

describe("SlideIndicator", () => {
  // Le composant utilise role="group" + boutons avec aria-current (pattern carrousel ARIA).
  // Aucun role="tab" / role="tablist" — un indicateur de pagination n'a pas de tabpanel.

  it("a11y invariant: container is role=group, not tablist", () => {
    const { container } = render(SlideIndicator, { props: { count: 4, current: 2, label: "Diapositive" } });
    const group = container.querySelector('[role="group"]') as HTMLElement;
    expect(group).toBeTruthy();
    expect(group.getAttribute("aria-label")).toBe("Diapositive");
    // Pas de tablist ni de tab
    expect(container.querySelector('[role="tablist"]')).toBeNull();
    expect(container.querySelector('[role="tab"]')).toBeNull();
  });

  it("a11y invariant: only the current slide has aria-current=true, others have none", () => {
    const { container } = render(SlideIndicator, { props: { count: 4, current: 2 } });
    const buttons = Array.from(container.querySelectorAll("button"));
    expect(buttons).toHaveLength(4);
    const currentOnes = buttons.filter((b) => b.getAttribute("aria-current") === "true");
    expect(currentOnes).toHaveLength(1);
    expect(currentOnes[0].getAttribute("aria-label")).toBe("Diapositive 3");
    // Les autres n'ont pas aria-current (ni aria-selected)
    const nonCurrent = buttons.filter((b) => b !== currentOnes[0]);
    nonCurrent.forEach((b) => {
      expect(b.getAttribute("aria-current")).toBeNull();
      expect(b.getAttribute("aria-selected")).toBeNull();
    });
  });

  it("a11y invariant: roving tabindex — current slide is tabindex=0, others -1", () => {
    const { container } = render(SlideIndicator, { props: { count: 4, current: 1 } });
    const buttons = Array.from(container.querySelectorAll("button"));
    expect(buttons[1].tabIndex).toBe(0);
    expect(buttons[0].tabIndex).toBe(-1);
    expect(buttons[2].tabIndex).toBe(-1);
  });

  it("emits the clicked index", async () => {
    const onChange = vi.fn();
    const { container } = render(SlideIndicator, { props: { count: 4, current: 0, onChange } });
    const buttons = container.querySelectorAll("button");
    await fireEvent.click(buttons[3]);
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it("moves through slides with arrow keys", async () => {
    const onChange = vi.fn();
    const { container } = render(SlideIndicator, { props: { count: 4, current: 1, onChange } });
    const buttons = container.querySelectorAll("button");
    await fireEvent.keyDown(buttons[1], { key: "ArrowRight" });
    expect(onChange).toHaveBeenLastCalledWith(2);
  });

  it("a11y invariant: ArrowRight déplace le focus DOM vers le bouton cible (roving réel)", async () => {
    const onChange = vi.fn();
    const { container } = render(SlideIndicator, { props: { count: 4, current: 1, onChange } });
    const buttons = Array.from(container.querySelectorAll<HTMLElement>("button"));
    buttons[1].focus();
    await fireEvent.keyDown(buttons[1], { key: "ArrowRight" });
    // Le focus doit être sur le bouton index 2, pas rester sur index 1.
    expect(document.activeElement).toBe(buttons[2]);
  });

  it("a11y invariant: ArrowLeft déplace le focus DOM vers le bouton précédent", async () => {
    const onChange = vi.fn();
    const { container } = render(SlideIndicator, { props: { count: 4, current: 2, onChange } });
    const buttons = Array.from(container.querySelectorAll<HTMLElement>("button"));
    buttons[2].focus();
    await fireEvent.keyDown(buttons[2], { key: "ArrowLeft" });
    expect(document.activeElement).toBe(buttons[1]);
  });

  it("a11y invariant: Home et End déplacent le focus aux extrémités", async () => {
    const onChange = vi.fn();
    const { container } = render(SlideIndicator, { props: { count: 4, current: 1, onChange } });
    const buttons = Array.from(container.querySelectorAll<HTMLElement>("button"));
    buttons[1].focus();
    await fireEvent.keyDown(buttons[1], { key: "End" });
    expect(document.activeElement).toBe(buttons[3]);
    buttons[3].focus();
    await fireEvent.keyDown(buttons[3], { key: "Home" });
    expect(document.activeElement).toBe(buttons[0]);
  });
});

describe("Autosave", () => {
  it("shows the saving label with role=status", () => {
    const { container } = render(Autosave, { props: { status: "saving", locale: "fr-FR" } });
    const root = container.querySelector(".st-autosave") as HTMLElement;
    expect(root.getAttribute("role")).toBe("status");
    expect(root.textContent).toContain("Enregistrement");
  });

  it("shows the saved label", () => {
    render(Autosave, { props: { status: "saved", locale: "fr-FR" } });
    expect(screen.getByText("Enregistré")).toBeTruthy();
  });

  it("uses role=alert and a retry button on error", async () => {
    const onRetry = vi.fn();
    render(Autosave, { props: { status: "error", onRetry, locale: "fr-FR" } });
    const alert = screen.getByRole("alert");
    expect(alert.textContent).toContain("Échec");
    const retry = within(alert).getByRole("button", { name: "Réessayer" });
    await fireEvent.click(retry);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("honours custom labels", () => {
    render(Autosave, { props: { status: "saving", labels: { saving: "Sauvegarde en cours" } } });
    expect(screen.getByText("Sauvegarde en cours")).toBeTruthy();
  });
});
