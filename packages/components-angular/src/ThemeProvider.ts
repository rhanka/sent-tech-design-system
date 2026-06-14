import { Component, Input as NgInput } from "@angular/core";
import { type TenantTheme } from "@sentropic/design-system-themes";

export type ThemeProviderProps = {
  theme?: TenantTheme;
  namespace?: string;
};

@Component({
  selector: "st-theme-provider",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class ThemeProvider {
  static readonly stComponentName = "ThemeProvider";
  readonly componentName = "ThemeProvider";
  @NgInput() theme?: TenantTheme;
  @NgInput() namespace?: string;

  get hostClass(): string {
    return ["st-themeProvider", undefined].filter(Boolean).join(" ");
  }
}
