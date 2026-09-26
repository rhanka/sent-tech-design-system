// @vitest-environment jsdom
import "@angular/compiler";
import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from "@angular/platform-browser-dynamic/testing";
import { describe, expect, it } from "vitest";

import { Button } from "../dist/Button.js";
import { Checkbox } from "../dist/Checkbox.js";
import { Input } from "../dist/Input.js";
import { NumberInput } from "../dist/NumberInput.js";
import { Select } from "../dist/Select.js";
import { Textarea } from "../dist/Textarea.js";

TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());

function render<T>(host: new () => T): HTMLElement {
  const fixture = TestBed.createComponent(host);
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
}

// Convention de comptage : chaque `it` compte une entrée ajoutée ; présence =
// l'attribut est rendu avec la valeur fournie, absence = l'attribut n'est pas
// rendu quand l'entrée est omise. `aria-pressed="false"` doit être rendu
// explicitement, comme React.

class ButtonLabelHost {}
Component({ standalone: true, imports: [Button], template: `<st-button [aria-label]="'Fermer'">X</st-button>` })(ButtonLabelHost);

class ButtonBareHost {}
Component({ standalone: true, imports: [Button], template: `<st-button>X</st-button>` })(ButtonBareHost);

class ButtonPressedTrueHost {}
Component({ standalone: true, imports: [Button], template: `<st-button [aria-pressed]="true">X</st-button>` })(ButtonPressedTrueHost);

class ButtonPressedFalseHost {}
Component({ standalone: true, imports: [Button], template: `<st-button [aria-pressed]="false">X</st-button>` })(ButtonPressedFalseHost);

class InputLabelHost {}
Component({ standalone: true, imports: [Input], template: `<st-input label="Nom" [aria-label]="'Nom du calcul'"></st-input>` })(InputLabelHost);

class InputBareHost {}
Component({ standalone: true, imports: [Input], template: `<st-input label="Nom"></st-input>` })(InputBareHost);

class SelectLabelHost {}
Component({
  standalone: true,
  imports: [Select],
  template: `<st-select label="Type" [aria-label]="'Type'" [options]="[{ value: 'a', label: 'A' }]"></st-select>`,
})(SelectLabelHost);

class SelectBareHost {}
Component({
  standalone: true,
  imports: [Select],
  template: `<st-select label="Type" [options]="[{ value: 'a', label: 'A' }]"></st-select>`,
})(SelectBareHost);

class TextareaLabelHost {}
Component({ standalone: true, imports: [Textarea], template: `<st-textarea label="Formule" [aria-label]="'Formule'"></st-textarea>` })(TextareaLabelHost);

class TextareaBareHost {}
Component({ standalone: true, imports: [Textarea], template: `<st-textarea label="Formule"></st-textarea>` })(TextareaBareHost);

class NumberLabelHost {}
Component({ standalone: true, imports: [NumberInput], template: `<st-number-input label="Minimum" [aria-label]="'Minimum Revenue'"></st-number-input>` })(NumberLabelHost);

class NumberBareHost {}
Component({ standalone: true, imports: [NumberInput], template: `<st-number-input label="Minimum"></st-number-input>` })(NumberBareHost);

class CheckboxLabelHost {}
Component({ standalone: true, imports: [Checkbox], template: `<st-checkbox label="Actif" [aria-label]="'Inverser axe'"></st-checkbox>` })(CheckboxLabelHost);

class CheckboxBareHost {}
Component({ standalone: true, imports: [Checkbox], template: `<st-checkbox label="Actif"></st-checkbox>` })(CheckboxBareHost);

describe("AriaPassthrough (angular)", () => {
  it("Button renders aria-label when provided, omits it when omitted", () => {
    const withLabel = render(ButtonLabelHost).querySelector("button")!;
    expect(withLabel.getAttribute("aria-label")).toBe("Fermer");
    const bare = render(ButtonBareHost).querySelector("button")!;
    expect(bare.hasAttribute("aria-label")).toBe(false);
  });

  it("Button renders aria-pressed true/false explicitly, omits it when omitted", () => {
    const pressedTrue = render(ButtonPressedTrueHost).querySelector("button")!;
    expect(pressedTrue.getAttribute("aria-pressed")).toBe("true");
    const pressedFalse = render(ButtonPressedFalseHost).querySelector("button")!;
    expect(pressedFalse.getAttribute("aria-pressed")).toBe("false");
    const bare = render(ButtonBareHost).querySelector("button")!;
    expect(bare.hasAttribute("aria-pressed")).toBe(false);
  });

  it("Input renders aria-label on the inner input when provided, omits it when omitted", () => {
    const withLabel = render(InputLabelHost).querySelector("input")!;
    expect(withLabel.getAttribute("aria-label")).toBe("Nom du calcul");
    const bare = render(InputBareHost).querySelector("input")!;
    expect(bare.hasAttribute("aria-label")).toBe(false);
  });

  it("Select renders aria-label on the inner select when provided, omits it when omitted", () => {
    const withLabel = render(SelectLabelHost).querySelector("select")!;
    expect(withLabel.getAttribute("aria-label")).toBe("Type");
    const bare = render(SelectBareHost).querySelector("select")!;
    expect(bare.hasAttribute("aria-label")).toBe(false);
  });

  it("Textarea renders aria-label on the inner textarea when provided, omits it when omitted", () => {
    const withLabel = render(TextareaLabelHost).querySelector("textarea")!;
    expect(withLabel.getAttribute("aria-label")).toBe("Formule");
    const bare = render(TextareaBareHost).querySelector("textarea")!;
    expect(bare.hasAttribute("aria-label")).toBe(false);
  });

  it("NumberInput renders aria-label on the numeric input when provided, omits it when omitted", () => {
    const withLabel = render(NumberLabelHost).querySelector("input")!;
    expect(withLabel.getAttribute("aria-label")).toBe("Minimum Revenue");
    const bare = render(NumberBareHost).querySelector("input")!;
    expect(bare.hasAttribute("aria-label")).toBe(false);
  });

  it("Checkbox renders aria-label on the inner checkbox when provided, omits it when omitted", () => {
    const withLabel = render(CheckboxLabelHost).querySelector('input[type="checkbox"]')!;
    expect(withLabel.getAttribute("aria-label")).toBe("Inverser axe");
    const bare = render(CheckboxBareHost).querySelector('input[type="checkbox"]')!;
    expect(bare.hasAttribute("aria-label")).toBe(false);
  });
});
