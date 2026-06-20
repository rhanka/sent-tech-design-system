import { Component, Input as NgInput } from "@angular/core";

export type ObjectPageBreadcrumbItem = {
  label: string;
  href?: string;
};

export type ObjectPageKpi = {
  label: string;
  value: string | number;
  unit?: string;
};

export type ObjectPageField = {
  label: string;
  value: string | number;
};

export type ObjectPageColumn = {
  key: string;
  label: string;
};

export type ObjectPageRow = Record<string, unknown>;

export type ObjectPageProps = {
  entityTitle?: string;
  primaryAction?: string;
  secondaryAction?: string;
  kpis?: ObjectPageKpi[];
  fields?: ObjectPageField[];
  relatedColumns?: ObjectPageColumn[];
  relatedRows?: ObjectPageRow[];
  class?: string;
};

@Component({
  selector: "st-object-page",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class ObjectPage {
  static readonly stComponentName = "ObjectPage";
  readonly componentName = "ObjectPage";
  @NgInput() entityTitle = "";
  @NgInput() primaryAction?: string;
  @NgInput() secondaryAction?: string;
  @NgInput() kpis: ObjectPageKpi[] = [];
  @NgInput() fields: ObjectPageField[] = [];
  @NgInput() relatedColumns: ObjectPageColumn[] = [];
  @NgInput() relatedRows: ObjectPageRow[] = [];
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-op", this.classInput].filter(Boolean).join(" ");
  }
}
