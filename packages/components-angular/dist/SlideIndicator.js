import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class SlideIndicator {
    static stComponentName = "SlideIndicator";
    componentName = "SlideIndicator";
    count;
    current;
    onChange;
    size;
    variant;
    label;
    classInput;
    change = new EventEmitter();
    get resolvedCurrent() {
        return this.current ?? 0;
    }
    get resolvedLabel() {
        return this.label ?? "Diapositive";
    }
    get items() {
        return Array.from({ length: Math.max(0, this.count) }, (_, i) => i);
    }
    get hostClass() {
        return classNames("st-slideIndicator", `st-slideIndicator--${this.size ?? "md"}`, `st-slideIndicator--${this.variant ?? "dots"}`, this.classInput);
    }
    select(index) {
        if (index < 0 || index >= this.count || index === this.resolvedCurrent)
            return;
        this.onChange?.(index);
        this.change.emit(index);
    }
    onKeyDown(event, index) {
        let target = index;
        switch (event.key) {
            case "ArrowRight":
            case "ArrowDown":
                target = Math.min(this.count - 1, index + 1);
                break;
            case "ArrowLeft":
            case "ArrowUp":
                target = Math.max(0, index - 1);
                break;
            case "Home":
                target = 0;
                break;
            case "End":
                target = this.count - 1;
                break;
            default:
                return;
        }
        event.preventDefault();
        // Déplacer le focus DOM vers le bouton cible (roving tabindex correct).
        const current = event.currentTarget;
        const group = current.parentElement;
        const targetEl = group?.children.item(target);
        if (targetEl)
            targetEl.focus();
        this.select(target);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: SlideIndicator, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: SlideIndicator, isStandalone: true, selector: "st-slide-indicator", inputs: { count: "count", current: "current", onChange: "onChange", size: "size", variant: "variant", label: "label", classInput: ["class", "classInput"] }, outputs: { change: "change" }, ngImport: i0, template: `
    <div
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      role="group"
      [attr.aria-label]="resolvedLabel"
    >
      @for (index of items; track index) {
        <button
          type="button"
          class="st-slideIndicator__dot"
          [class.st-slideIndicator__dot--current]="index === resolvedCurrent"
          [attr.aria-current]="index === resolvedCurrent ? 'true' : null"
          [attr.aria-label]="resolvedLabel + ' ' + (index + 1)"
          [attr.tabindex]="index === resolvedCurrent ? 0 : -1"
          (click)="select(index)"
          (keydown)="onKeyDown($event, index)"
        ></button>
      }
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: SlideIndicator, decorators: [{
            type: Component,
            args: [{
                    selector: "st-slide-indicator",
                    standalone: true,
                    template: `
    <div
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      role="group"
      [attr.aria-label]="resolvedLabel"
    >
      @for (index of items; track index) {
        <button
          type="button"
          class="st-slideIndicator__dot"
          [class.st-slideIndicator__dot--current]="index === resolvedCurrent"
          [attr.aria-current]="index === resolvedCurrent ? 'true' : null"
          [attr.aria-label]="resolvedLabel + ' ' + (index + 1)"
          [attr.tabindex]="index === resolvedCurrent ? 0 : -1"
          (click)="select(index)"
          (keydown)="onKeyDown($event, index)"
        ></button>
      }
    </div>
  `,
                }]
        }], propDecorators: { count: [{
                type: NgInput
            }], current: [{
                type: NgInput
            }], onChange: [{
                type: NgInput
            }], size: [{
                type: NgInput
            }], variant: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }], change: [{
                type: Output
            }] } });
//# sourceMappingURL=SlideIndicator.js.map