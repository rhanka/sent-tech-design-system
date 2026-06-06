/**
 * Tests accessibilité clavier — TimePicker
 * Pattern ARIA : combobox (input readonly) + listbox (ul/option).
 * Référence : docs/audit/a11y.md (findings Bloquant 1 & 2).
 */
import { fireEvent, render, screen } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";
import TimePicker from "./lib/TimePicker.svelte";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function renderPicker(props: Record<string, unknown> = {}) {
  return render(TimePicker, {
    props: { value: "", step: 60, label: "Heure", ...props }
  });
}

function getInput() {
  return screen.getByRole("combobox") as HTMLInputElement;
}

function getListbox() {
  return screen.getByRole("listbox") as HTMLUListElement;
}

function queryListbox() {
  return screen.queryByRole("listbox");
}

// ---------------------------------------------------------------------------
// Ouverture au clavier (input combobox)
// ---------------------------------------------------------------------------

describe("TimePicker — ouverture clavier", () => {
  it("ArrowDown sur l'input ouvre la listbox", async () => {
    renderPicker();
    const input = getInput();
    expect(queryListbox()).toBeNull();
    await fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(queryListbox()).toBeTruthy();
  });

  it("Enter sur l'input ouvre la listbox", async () => {
    renderPicker();
    const input = getInput();
    expect(queryListbox()).toBeNull();
    await fireEvent.keyDown(input, { key: "Enter" });
    expect(queryListbox()).toBeTruthy();
  });

  it("Space sur l'input ouvre la listbox", async () => {
    renderPicker();
    const input = getInput();
    expect(queryListbox()).toBeNull();
    await fireEvent.keyDown(input, { key: " " });
    expect(queryListbox()).toBeTruthy();
  });

  it("aria-expanded passe à 'true' à l'ouverture", async () => {
    renderPicker();
    const input = getInput();
    expect(input.getAttribute("aria-expanded")).toBe("false");
    await fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(input.getAttribute("aria-expanded")).toBe("true");
  });

  it("l'input conserve aria-activedescendant pointant la première option", async () => {
    renderPicker();
    const input = getInput();
    await fireEvent.keyDown(input, { key: "ArrowDown" });
    const desc = input.getAttribute("aria-activedescendant");
    expect(desc).toBeTruthy();
    const activeEl = document.getElementById(desc!);
    expect(activeEl).toBeTruthy();
    expect(activeEl!.getAttribute("role")).toBe("option");
  });

  it("à l'ouverture, positionne l'actif sur la valeur déjà sélectionnée", async () => {
    renderPicker({ value: "08:00" });
    const input = getInput();
    await fireEvent.keyDown(input, { key: "ArrowDown" });
    const desc = input.getAttribute("aria-activedescendant");
    expect(desc).toBeTruthy();
    const activeEl = document.getElementById(desc!);
    expect(activeEl?.textContent?.trim()).toBe("08:00");
  });

  it("ne s'ouvre pas quand disabled", async () => {
    renderPicker({ disabled: true });
    const input = getInput();
    await fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(queryListbox()).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Navigation dans la listbox
// ---------------------------------------------------------------------------

describe("TimePicker — navigation listbox (flèches, Home, End)", () => {
  async function openAndGetInput() {
    renderPicker();
    const input = getInput();
    await fireEvent.keyDown(input, { key: "ArrowDown" });
    return input;
  }

  it("ArrowDown depuis l'input avec liste ouverte descend d'une option", async () => {
    const input = await openAndGetInput();
    const firstId = input.getAttribute("aria-activedescendant");
    await fireEvent.keyDown(input, { key: "ArrowDown" });
    const secondId = input.getAttribute("aria-activedescendant");
    expect(secondId).not.toBe(firstId);
    expect(document.getElementById(secondId!)?.textContent?.trim()).toBe("01:00");
  });

  it("ArrowDown sur la listbox descend d'une option", async () => {
    const input = await openAndGetInput();
    const list = getListbox();
    const idBefore = input.getAttribute("aria-activedescendant");
    await fireEvent.keyDown(list, { key: "ArrowDown" });
    const idAfter = input.getAttribute("aria-activedescendant");
    expect(idAfter).not.toBe(idBefore);
  });

  it("ArrowUp sur la listbox remonte d'une option (pas sous 0)", async () => {
    const input = await openAndGetInput();
    const list = getListbox();
    // ArrowDown 2 fois pour être à l'index 2 (02:00), puis ArrowUp pour revenir à 1.
    await fireEvent.keyDown(list, { key: "ArrowDown" });
    await fireEvent.keyDown(list, { key: "ArrowDown" });
    const idAt2 = input.getAttribute("aria-activedescendant");
    expect(document.getElementById(idAt2!)?.textContent?.trim()).toBe("02:00");
    await fireEvent.keyDown(list, { key: "ArrowUp" });
    const idAt1 = input.getAttribute("aria-activedescendant");
    expect(document.getElementById(idAt1!)?.textContent?.trim()).toBe("01:00");
  });

  it("ArrowUp à l'index 0 ne dépasse pas le premier élément", async () => {
    const input = await openAndGetInput();
    const list = getListbox();
    await fireEvent.keyDown(list, { key: "ArrowUp" });
    const id = input.getAttribute("aria-activedescendant");
    expect(document.getElementById(id!)?.textContent?.trim()).toBe("00:00");
  });

  it("Home se positionne sur la première option", async () => {
    const input = await openAndGetInput();
    const list = getListbox();
    // Descendre d'abord.
    await fireEvent.keyDown(list, { key: "ArrowDown" });
    await fireEvent.keyDown(list, { key: "ArrowDown" });
    await fireEvent.keyDown(list, { key: "Home" });
    const id = input.getAttribute("aria-activedescendant");
    expect(document.getElementById(id!)?.textContent?.trim()).toBe("00:00");
  });

  it("End se positionne sur la dernière option", async () => {
    const input = await openAndGetInput();
    const list = getListbox();
    await fireEvent.keyDown(list, { key: "End" });
    const id = input.getAttribute("aria-activedescendant");
    expect(document.getElementById(id!)?.textContent?.trim()).toBe("23:00");
  });
});

// ---------------------------------------------------------------------------
// Sélection et fermeture
// ---------------------------------------------------------------------------

describe("TimePicker — sélection clavier (Enter / Space / Escape)", () => {
  it("Enter sur la listbox sélectionne l'option active et appelle onChange", async () => {
    const onChange = vi.fn();
    renderPicker({ onChange });
    const input = getInput();
    await fireEvent.keyDown(input, { key: "ArrowDown" });
    const list = getListbox();
    // Descendre jusqu'à 03:00.
    for (let i = 0; i < 3; i++) await fireEvent.keyDown(list, { key: "ArrowDown" });
    await fireEvent.keyDown(list, { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith("03:00");
    expect(queryListbox()).toBeNull();
  });

  it("Space sur la listbox sélectionne l'option active", async () => {
    const onChange = vi.fn();
    renderPicker({ onChange });
    const input = getInput();
    await fireEvent.keyDown(input, { key: "ArrowDown" });
    const list = getListbox();
    await fireEvent.keyDown(list, { key: "ArrowDown" }); // 01:00
    await fireEvent.keyDown(list, { key: " " });
    expect(onChange).toHaveBeenCalledWith("01:00");
    expect(queryListbox()).toBeNull();
  });

  it("Enter sur l'input avec liste ouverte sélectionne l'option active", async () => {
    const onChange = vi.fn();
    renderPicker({ onChange });
    const input = getInput();
    await fireEvent.keyDown(input, { key: "ArrowDown" }); // ouvre → 00:00 actif
    await fireEvent.keyDown(input, { key: "Enter" }); // sélectionne 00:00
    expect(onChange).toHaveBeenCalledWith("00:00");
    expect(queryListbox()).toBeNull();
  });

  it("Escape sur la listbox ferme sans sélectionner", async () => {
    const onChange = vi.fn();
    renderPicker({ onChange });
    const input = getInput();
    await fireEvent.keyDown(input, { key: "ArrowDown" });
    const list = getListbox();
    await fireEvent.keyDown(list, { key: "Escape" });
    expect(queryListbox()).toBeNull();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("Escape sur l'input ferme la liste si ouverte", async () => {
    renderPicker();
    const input = getInput();
    await fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(queryListbox()).toBeTruthy();
    await fireEvent.keyDown(input, { key: "Escape" });
    expect(queryListbox()).toBeNull();
  });

  it("après Escape, aria-expanded revient à 'false'", async () => {
    renderPicker();
    const input = getInput();
    await fireEvent.keyDown(input, { key: "ArrowDown" });
    await fireEvent.keyDown(input, { key: "Escape" });
    expect(input.getAttribute("aria-expanded")).toBe("false");
  });

  it("après sélection, aria-activedescendant est absent/vide", async () => {
    const onChange = vi.fn();
    renderPicker({ onChange });
    const input = getInput();
    await fireEvent.keyDown(input, { key: "ArrowDown" });
    await fireEvent.keyDown(input, { key: "Enter" });
    // aria-activedescendant doit être absent ou vide une fois la liste fermée.
    const desc = input.getAttribute("aria-activedescendant");
    expect(!desc || desc === "").toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Attributs ARIA structurels
// ---------------------------------------------------------------------------

describe("TimePicker — attributs ARIA structurels", () => {
  it("l'input a role=combobox avec aria-haspopup=listbox", () => {
    renderPicker();
    const input = getInput();
    expect(input.getAttribute("role")).toBe("combobox");
    expect(input.getAttribute("aria-haspopup")).toBe("listbox");
  });

  it("aria-controls pointe l'id de la listbox", async () => {
    renderPicker();
    const input = getInput();
    await fireEvent.keyDown(input, { key: "ArrowDown" });
    const controlledId = input.getAttribute("aria-controls");
    expect(controlledId).toBeTruthy();
    expect(document.getElementById(controlledId!)).toBeTruthy();
  });

  it("les options ont role=option et tabindex=-1 (pas dans l'ordre de tab)", async () => {
    renderPicker();
    const input = getInput();
    await fireEvent.keyDown(input, { key: "ArrowDown" });
    const options = screen.getAllByRole("option");
    for (const opt of options) {
      expect(opt.getAttribute("tabindex")).toBe("-1");
    }
  });
});

// ---------------------------------------------------------------------------
// Régression Codex — Bug 1 : ArrowUp depuis valeur sélectionnée
// ---------------------------------------------------------------------------

describe("TimePicker — ArrowUp depuis valeur sélectionnée (régression Codex Bug 1)", () => {
  it("ArrowUp depuis l'input avec valeur sélectionnée recule dans la liste", async () => {
    // value = "02:00" → ouverture positionne l'actif sur l'index 2.
    // ArrowUp depuis l'input doit reculer à l'index 1 (01:00).
    renderPicker({ value: "02:00" });
    const input = getInput();
    // Ouvrir d'abord avec ArrowDown pour se positionner sur la valeur sélectionnée.
    await fireEvent.keyDown(input, { key: "ArrowDown" });
    // À l'ouverture, activeIndex doit pointer sur 02:00.
    let desc = input.getAttribute("aria-activedescendant");
    expect(document.getElementById(desc!)?.textContent?.trim()).toBe("02:00");
    // ArrowUp → doit reculer à 01:00.
    await fireEvent.keyDown(input, { key: "ArrowUp" });
    desc = input.getAttribute("aria-activedescendant");
    expect(document.getElementById(desc!)?.textContent?.trim()).toBe("01:00");
  });

  it("ArrowUp depuis l'input avec valeur sélectionnée peut atteindre 00:00", async () => {
    renderPicker({ value: "01:00" });
    const input = getInput();
    await fireEvent.keyDown(input, { key: "ArrowDown" }); // ouvre sur 01:00
    await fireEvent.keyDown(input, { key: "ArrowUp" }); // recule à 00:00
    const desc = input.getAttribute("aria-activedescendant");
    expect(document.getElementById(desc!)?.textContent?.trim()).toBe("00:00");
  });
});

// ---------------------------------------------------------------------------
// Régression Codex — Bug 2 : click sur une option (activation AT/touch/synthétique)
// ---------------------------------------------------------------------------

describe("TimePicker — click sur option (régression Codex Bug 2)", () => {
  it("click sur une option la sélectionne et appelle onChange", async () => {
    const onChange = vi.fn();
    renderPicker({ onChange });
    const input = getInput();
    // Ouvrir la liste.
    await fireEvent.keyDown(input, { key: "ArrowDown" });
    const options = screen.getAllByRole("option");
    // Cliquer sur la deuxième option (01:00).
    await fireEvent.click(options[1]);
    expect(onChange).toHaveBeenCalledWith("01:00");
    expect(queryListbox()).toBeNull();
  });

  it("click sur une option ferme la listbox", async () => {
    renderPicker();
    const input = getInput();
    await fireEvent.keyDown(input, { key: "ArrowDown" });
    const options = screen.getAllByRole("option");
    await fireEvent.click(options[0]);
    expect(queryListbox()).toBeNull();
  });
});
