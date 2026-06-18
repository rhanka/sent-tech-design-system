import "@angular/compiler";
import { describe, expect, it } from "vitest";

import { Search } from "../dist/Search.js";

describe("Search (angular)", () => {
  it("renders the DS search classes and resolves value aliases", () => {
    const component = new Search();
    component.label = "Recherche";
    component.value = "initial";
    component.fluid = true;
    component.classInput = "drawer-search";
    component.name = "globalSearch";
    component.autocomplete = "off";
    component.required = true;
    component.readOnly = true;
    component.inputMode = "search";
    component.ariaLabel = "Search messages";
    component.ariaDescribedBy = "search-help";

    expect(component.currentValue).toBe("initial");
    expect(component.hostClass).toContain("st-search");
    expect(component.hostClass).toContain("st-search--md");
    expect(component.hostClass).toContain("st-search--fluid");
    expect(component.hostClass).toContain("drawer-search");
    expect(component.name).toBe("globalSearch");
    expect(component.autocomplete).toBe("off");
    expect(component.required).toBe(true);
    expect(component.readOnly).toBe(true);
    expect(component.inputMode).toBe("search");
    expect(component.ariaLabel).toBe("Search messages");
    expect(component.ariaDescribedBy).toBe("search-help");
  });

  it("emits Angular and inter-framework model updates, input, and clear events", () => {
    const component = new Search();
    const updates: string[] = [];
    const aliasUpdates: string[] = [];
    const inputEvents: Event[] = [];
    let clearCount = 0;
    component.modelValueChange.subscribe((value) => updates.push(value));
    component.updateModelValue.subscribe((value) => aliasUpdates.push(value));
    component.input.subscribe((event) => inputEvents.push(event));
    component.clear.subscribe(() => {
      clearCount += 1;
    });

    const event = { target: { value: "payment" } } as unknown as Event;
    component.handleInput(event);
    component.handleClear();

    expect(updates).toEqual(["payment", ""]);
    expect(aliasUpdates).toEqual(["payment", ""]);
    expect(inputEvents).toEqual([event]);
    expect(clearCount).toBe(1);
  });
});
