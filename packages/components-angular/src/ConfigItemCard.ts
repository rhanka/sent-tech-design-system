import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type ConfigItemSourceLevel = "code" | "admin" | "user";

export type ConfigItem = {
  id: string;
  name: string;
  key?: string;
  description?: string | null;
  /** Provenance : `code`/`admin` = système (verrouillé), `user` = personnalisé. */
  sourceLevel: ConfigItemSourceLevel;
  /** Identifiant du parent si l'item est une copie d'un défaut système. */
  parentId?: string | null;
  version?: number;
};

export type ConfigItemCardProps = {
  item: ConfigItem;
  hasCopy?: boolean;
  onCopy?: (id: string) => void;
  onEdit?: (id: string) => void;
  onReset?: (id: string) => void;
  onDelete?: (id: string) => void;
  disabled?: boolean;
  class?: string;
};

@Component({
  selector: "st-config-item-card",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class ConfigItemCard {
  static readonly stComponentName = "ConfigItemCard";
  readonly componentName = "ConfigItemCard";
  @NgInput() item!: ConfigItem;
  @NgInput() hasCopy?: boolean;
  @NgInput() onCopy?: (id: string) => void;
  @NgInput() onEdit?: (id: string) => void;
  @NgInput() onReset?: (id: string) => void;
  @NgInput() onDelete?: (id: string) => void;
  @NgInput() disabled?: boolean;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-configItemCard", this.classInput].filter(Boolean).join(" ");
  }
}
