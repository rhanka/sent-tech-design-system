import { Component, Input as NgInput } from "@angular/core";

export type ListReportPageNavItem = {
  label: string;
  href?: string;
  active?: boolean;
};

export type ListReportPageColumn = {
  key: string;
  label: string;
  sortable?: boolean;
};

export type ListReportPageRow = Record<string, unknown>;

export type ListReportPageAction = {
  label: string;
  action: string;
};

export type ListReportPageFilter = {
  key: string;
  label: string;
  value?: string;
};

export type ListReportPageProps = {
  appTitle?: string;
  pageTitle?: string;
  columns?: ListReportPageColumn[];
  rows?: ListReportPageRow[];
  navItems?: ListReportPageNavItem[];
  primaryAction?: string;
  secondaryAction?: string;
  searchPlaceholder?: string;
  rowActions?: ListReportPageAction[];
  class?: string;
};

@Component({
  selector: "st-list-report-page",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class ListReportPage {
  static readonly stComponentName = "ListReportPage";
  readonly componentName = "ListReportPage";
  @NgInput() appTitle?: string;
  @NgInput() pageTitle = "";
  @NgInput() columns: ListReportPageColumn[] = [];
  @NgInput() rows: ListReportPageRow[] = [];
  @NgInput() navItems: ListReportPageNavItem[] = [];
  @NgInput() primaryAction?: string;
  @NgInput() secondaryAction?: string;
  @NgInput() searchPlaceholder?: string;
  @NgInput() rowActions: ListReportPageAction[] = [];
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-lrp", this.classInput].filter(Boolean).join(" ");
  }
}
