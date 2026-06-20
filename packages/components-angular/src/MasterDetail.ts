import { Component, Input as NgInput } from "@angular/core";

export type MasterDetailNavItem = {
  label: string;
  href?: string;
  active?: boolean;
};

export type MasterDetailItem = {
  id: string;
  title: string;
  subtitle?: string;
};

export type MasterDetailField = {
  label: string;
  value: string | number;
};

export type MasterDetailProps = {
  listTitle?: string;
  detailTitle?: string;
  listItems?: MasterDetailItem[];
  detailFields?: MasterDetailField[];
  detailActions?: string[];
  class?: string;
};

@Component({
  selector: "st-master-detail",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class MasterDetail {
  static readonly stComponentName = "MasterDetail";
  readonly componentName = "MasterDetail";
  @NgInput() listTitle = "";
  @NgInput() detailTitle = "";
  @NgInput() listItems: MasterDetailItem[] = [];
  @NgInput() detailFields: MasterDetailField[] = [];
  @NgInput() detailActions: string[] = [];
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-md", this.classInput].filter(Boolean).join(" ");
  }
}
