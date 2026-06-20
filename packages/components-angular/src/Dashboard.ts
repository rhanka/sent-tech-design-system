import { Component, Input as NgInput } from "@angular/core";

export type DashboardNavItem = {
  label: string;
  href?: string;
  active?: boolean;
};

export type DashboardKpi = {
  label: string;
  value: string | number;
  unit?: string;
  trend?: number;
};

export type DashboardProps = {
  appTitle?: string;
  pageTitle?: string;
  navItems?: DashboardNavItem[];
  kpis?: DashboardKpi[];
  class?: string;
};

@Component({
  selector: "st-dashboard",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class Dashboard {
  static readonly stComponentName = "Dashboard";
  readonly componentName = "Dashboard";
  @NgInput() appTitle?: string;
  @NgInput() pageTitle = "";
  @NgInput() navItems: DashboardNavItem[] = [];
  @NgInput() kpis: DashboardKpi[] = [];
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-dash", this.classInput].filter(Boolean).join(" ");
  }
}
