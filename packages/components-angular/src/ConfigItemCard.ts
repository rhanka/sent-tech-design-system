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
      <div class="st-configItemCard__header">
        <span class="st-configItemCard__name">{{ item?.name }}</span>
        @if (item?.key) { <code class="st-configItemCard__key">{{ item.key }}</code> }
      </div>
      @if (item?.description) {
        <p class="st-configItemCard__description">{{ item.description }}</p>
      }
      <div class="st-configItemCard__actions">
        @if (hasCopy && !disabled) {
          <button type="button" class="st-configItemCard__action" (click)="onCopy && onCopy(item.id)">Copier</button>
        }
        @if (onEdit && !disabled) {
          <button type="button" class="st-configItemCard__action" (click)="onEdit(item.id)">Modifier</button>
        }
        @if (onReset && !disabled) {
          <button type="button" class="st-configItemCard__action st-configItemCard__action--danger" (click)="onReset(item.id)">Réinitialiser</button>
        }
        @if (onDelete && !disabled) {
          <button type="button" class="st-configItemCard__action st-configItemCard__action--danger" (click)="onDelete(item.id)">Supprimer</button>
        }
      </div>
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
    return classNames(
      "st-configItemCard",
      this.disabled && "st-configItemCard--disabled",
      this.classInput,
    );
  }
}
