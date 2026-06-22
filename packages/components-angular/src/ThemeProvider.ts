import { Component, Input as NgInput } from "@angular/core";
import type { OnChanges, OnDestroy, OnInit } from "@angular/core";
import { compileTheme, sentTechTheme, type TenantTheme } from "@sentropic/design-system-themes";

export type ThemeProviderProps = {
  theme?: TenantTheme;
  namespace?: string;
};

@Component({
  selector: "st-theme-provider",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [attr.data-st-theme]="theme.id">
      <ng-content></ng-content>
    </div>
  `,
})
export class ThemeProvider implements OnInit, OnChanges, OnDestroy {
  static readonly stComponentName = "ThemeProvider";
  readonly componentName = "ThemeProvider";

  @NgInput() theme: TenantTheme = sentTechTheme;
  @NgInput() namespace = "st";

  /** Reference to the injected <style> element so it can be updated/removed. */
  private styleEl: HTMLStyleElement | null = null;

  ngOnInit(): void {
    this.applyTheme();
  }

  ngOnChanges(): void {
    this.applyTheme();
  }

  ngOnDestroy(): void {
    if (this.styleEl && this.styleEl.parentNode) {
      this.styleEl.parentNode.removeChild(this.styleEl);
    }
    this.styleEl = null;
  }

  /** Compile the theme tokens to CSS and inject them into a <style> element. */
  private applyTheme(): void {
    if (typeof document === "undefined") return;
    const theme = this.theme ?? sentTechTheme;
    const namespace = this.namespace ?? "st";
    const css = compileTheme(theme, {
      selector: `[data-st-theme="${theme.id}"]`,
      namespace,
    });

    if (!this.styleEl) {
      this.styleEl = document.createElement("style");
      document.head.appendChild(this.styleEl);
    }
    this.styleEl.setAttribute("data-st-theme-provider", theme.id);
    this.styleEl.textContent = css;
  }
}
