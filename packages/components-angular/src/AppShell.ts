import { Component, Input as NgInput } from "@angular/core";

export type AppShellVariant = "site" | "workspace";
export type AppShellUtilityMode = "reserve" | "overlay" | "floating";
export type AppShellUtilitySide = "left" | "right" | "bottom";

export type AppShellProps = {
  variant?: AppShellVariant;
  mainId?: string;
  navigationLabel?: string;
  contextLabel?: string;
  utilityLabel?: string;
  utilityMode?: AppShellUtilityMode;
  utilitySide?: AppShellUtilitySide;
  class?: string;
};

@Component({
  selector: "st-app-shell",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [attr.data-st-app-shell-variant]="variant" [attr.data-utility-mode]="utilityMode" [attr.data-utility-side]="utilitySide" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class AppShell {
  static readonly stComponentName = "AppShell";
  readonly componentName = "AppShell";
  @NgInput() variant: AppShellVariant = "workspace";
  @NgInput() mainId = "main";
  @NgInput() navigationLabel = "Workspace navigation";
  @NgInput() contextLabel = "Context panel";
  @NgInput() utilityLabel = "Utility panel";
  @NgInput() utilityMode: AppShellUtilityMode = "reserve";
  @NgInput() utilitySide: AppShellUtilitySide = "right";
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-appShell", `st-appShell--${this.variant}`, this.classInput].filter(Boolean).join(" ");
  }
}
