import { Component, Input as NgInput } from "@angular/core";

export type ContextPanelProps = {
  title?: string;
  subtitle?: string;
  label?: string;
  class?: string;
};

@Component({
  selector: "st-context-panel",
  standalone: true,
  template: `
    <aside [attr.data-st-component]="componentName" [attr.aria-label]="label || title || 'Context panel'" [class]="hostClass">
      <ng-content></ng-content>
    </aside>
  `,
})
export class ContextPanel {
  static readonly stComponentName = "ContextPanel";
  readonly componentName = "ContextPanel";
  @NgInput() title?: string;
  @NgInput() subtitle?: string;
  @NgInput() label?: string;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-contextPanel", this.classInput].filter(Boolean).join(" ");
  }
}
