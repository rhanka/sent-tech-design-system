import { Component, Input as NgInput } from "@angular/core";

export type NavShellVariant = "rail" | "drawer";
export type NavShellSide = "left" | "right" | "bottom";

export type NavShellProps = {
  variant?: NavShellVariant;
  title?: string;
  subtitle?: string;
  label?: string;
  open?: boolean;
  side?: NavShellSide;
  class?: string;
};

@Component({
  selector: "st-nav-shell",
  standalone: true,
  template: `
    <aside [attr.data-st-component]="componentName" [attr.aria-label]="label || title" [class]="hostClass">
      <ng-content></ng-content>
    </aside>
  `,
})
export class NavShell {
  static readonly stComponentName = "NavShell";
  readonly componentName = "NavShell";
  @NgInput() variant: NavShellVariant = "rail";
  @NgInput() title?: string;
  @NgInput() subtitle?: string;
  @NgInput() label?: string;
  @NgInput() open?: boolean;
  @NgInput() side: NavShellSide = "left";
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-navShell", `st-navShell--${this.variant}`, this.classInput].filter(Boolean).join(" ");
  }
}
