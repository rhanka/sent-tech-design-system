import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type SwitchProps = {
  label: unknown;
  helperText?: unknown;
  modelValue?: boolean;
  checked?: boolean;
  disabled?: boolean;
  name?: string;
  value?: string;
  class?: string;
};

@Component({
  selector: "st-switch",
  standalone: true,
  // Host transparent (parité React/Vue/Svelte qui n'ont pas d'élément hôte) :
  // sans cela l'élément <st-*> (display:inline par défaut) s'intercale dans le
  // layout (line-box autour du contenu, ou SVG width:100% qui collapse) et
  // désaligne le rendu. display:contents efface la boîte de l'hôte.
  styles: [":host { display: contents; }"],
  template: `
    <label [attr.data-st-component]="componentName" [class]="hostClass">
      <input
        class="st-switch__input"
        type="checkbox"
        role="switch"
        [checked]="checked ?? false"
        [attr.aria-checked]="(checked ?? false) ? 'true' : 'false'"
        [disabled]="disabled ?? false"
        [attr.name]="name ?? null"
        [attr.value]="value ?? null"
      />
      <span class="st-switch__track" aria-hidden="true">
        <span class="st-switch__thumb"></span>
      </span>
      <span class="st-switch__content">
        <span class="st-switch__label">{{ label }}</span>
        @if (helperText) {
          <span class="st-switch__help">{{ helperText }}</span>
        }
      </span>
    </label>
  `,
})
export class Switch {
  static readonly stComponentName = "Switch";
  readonly componentName = "Switch";
  @NgInput() label!: unknown;
  @NgInput() helperText?: unknown;
  @NgInput() modelValue?: boolean;
  @NgInput() checked?: boolean;
  @NgInput() disabled?: boolean;
  @NgInput() name?: string;
  @NgInput() value?: string;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-switch", this.classInput].filter(Boolean).join(" ");
  }
}
