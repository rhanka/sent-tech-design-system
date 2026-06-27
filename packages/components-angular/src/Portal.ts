import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type PortalProps = {
  /**
   * Where to teleport the children. A CSS selector string or an actual
   * `HTMLElement`. Defaults to the document `<body>`.
   */
  target?: string | HTMLElement;
  /** When `true`, render inline in place (no teleportation). */
  disabled?: boolean;
  /** Optional class applied to the portal container element. */
  class?: string;
};

export function resolvePortalTarget(target: string | HTMLElement | undefined): HTMLElement | null {
  if (typeof document === "undefined") return null;
  if (target == null) return document.body;
  if (typeof target === "string") return document.querySelector<HTMLElement>(target) ?? document.body;
  return target;
}

@Component({
  selector: "st-portal",
  standalone: true,
  styles: [":host { display: contents; }"],
  template: `
    <div
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      [attr.data-st-portal]="disabled ? 'inline' : 'teleported'"
    >
      <ng-content></ng-content>
    </div>
  `,
})
export class Portal {
  static readonly stComponentName = "Portal";
  readonly componentName = "Portal";
  @NgInput() target?: string | HTMLElement;
  @NgInput() disabled?: boolean;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-portal", this.classInput].filter(Boolean).join(" ");
  }
}
