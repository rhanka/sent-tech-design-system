import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class ConfigItemCard {
    static stComponentName = "ConfigItemCard";
    componentName = "ConfigItemCard";
    item;
    hasCopy;
    onCopy;
    onEdit;
    onReset;
    onDelete;
    disabled;
    classInput;
    get hostClass() {
        return classNames("st-configItemCard", this.disabled && "st-configItemCard--disabled", this.classInput);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: ConfigItemCard, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: ConfigItemCard, isStandalone: true, selector: "st-config-item-card", inputs: { item: "item", hasCopy: "hasCopy", onCopy: "onCopy", onEdit: "onEdit", onReset: "onReset", onDelete: "onDelete", disabled: "disabled", classInput: ["class", "classInput"] }, ngImport: i0, template: `
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
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: ConfigItemCard, decorators: [{
            type: Component,
            args: [{
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
                }]
        }], propDecorators: { item: [{
                type: NgInput
            }], hasCopy: [{
                type: NgInput
            }], onCopy: [{
                type: NgInput
            }], onEdit: [{
                type: NgInput
            }], onReset: [{
                type: NgInput
            }], onDelete: [{
                type: NgInput
            }], disabled: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=ConfigItemCard.js.map