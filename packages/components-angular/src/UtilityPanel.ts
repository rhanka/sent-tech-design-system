import { Component, Input as NgInput } from "@angular/core";

export type UtilityPanelMode = "reserve" | "overlay" | "floating";
export type UtilityPanelSide = "left" | "right" | "bottom";

export type UtilityPanelProps = {
  mode?: UtilityPanelMode;
  side?: UtilityPanelSide;
  title?: string;
  label?: string;
  collapsed?: boolean;
  class?: string;
};

@Component({
  selector: "st-utility-panel",
  standalone: true,
  template: `
    <aside [attr.data-st-component]="componentName" [attr.aria-label]="label || title || 'Utility panel'" [attr.data-mode]="mode" [attr.data-side]="side" [class]="hostClass">
      <ng-content></ng-content>
    </aside>
  `,
})
export class UtilityPanel {
  static readonly stComponentName = "UtilityPanel";
  readonly componentName = "UtilityPanel";
  @NgInput() mode: UtilityPanelMode = "reserve";
  @NgInput() side: UtilityPanelSide = "right";
  @NgInput() title?: string;
  @NgInput() label?: string;
  @NgInput() collapsed?: boolean;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-utilityPanel", `st-utilityPanel--${this.mode}`, `st-utilityPanel--${this.side}`, this.collapsed ? "st-utilityPanel--collapsed" : undefined, this.classInput].filter(Boolean).join(" ");
  }
}
