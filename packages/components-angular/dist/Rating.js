import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class Rating {
    static stComponentName = "Rating";
    componentName = "Rating";
    value;
    max;
    onChange;
    readonly;
    allowHalf;
    size;
    name;
    label;
    classInput;
    change = new EventEmitter();
    get resolvedValue() {
        return this.value ?? 0;
    }
    get resolvedMax() {
        return this.max ?? 5;
    }
    get resolvedSize() {
        return this.size ?? "md";
    }
    get iconSize() {
        return this.resolvedSize === "sm" ? 16 : this.resolvedSize === "lg" ? 28 : 22;
    }
    get stars() {
        return Array.from({ length: this.resolvedMax }, (_, i) => i + 1);
    }
    get focusedStar() {
        return this.resolvedValue > 0 ? Math.ceil(this.resolvedValue) : 1;
    }
    get valueText() {
        return `${this.resolvedValue} / ${this.resolvedMax}`;
    }
    get hostClass() {
        return classNames("st-rating", `st-rating--${this.resolvedSize}`, this.readonly && "st-rating--readonly", this.classInput);
    }
    fill(star) {
        if (this.resolvedValue >= star)
            return "full";
        if (this.allowHalf && this.resolvedValue >= star - 0.5)
            return "half";
        return "empty";
    }
    commit(next) {
        if (this.readonly)
            return;
        const clamped = Math.max(0, Math.min(this.resolvedMax, next));
        this.value = clamped;
        this.change.emit(clamped);
        this.onChange?.(clamped);
    }
    onStarClick(event, star) {
        if (this.readonly)
            return;
        let next = star;
        if (this.allowHalf) {
            const target = event.currentTarget;
            const rect = target.getBoundingClientRect();
            const isLeftHalf = event.clientX - rect.left < rect.width / 2;
            next = isLeftHalf ? star - 0.5 : star;
        }
        if (next === this.resolvedValue) {
            this.commit(0);
            return;
        }
        this.commit(next);
    }
    onKeyDown(event) {
        if (this.readonly)
            return;
        const step = this.allowHalf ? 0.5 : 1;
        const max = this.resolvedMax;
        const value = this.resolvedValue;
        let handled = true;
        let next = null;
        switch (event.key) {
            case "ArrowRight":
            case "ArrowUp":
                next = Math.min(max, value + step);
                break;
            case "ArrowLeft":
            case "ArrowDown":
                next = this.allowHalf ? Math.max(0, value - step) : Math.max(1, value - step);
                break;
            case "Home":
                next = this.allowHalf ? 0 : 1;
                break;
            case "End":
                next = max;
                break;
            default:
                handled = false;
        }
        if (handled) {
            event.preventDefault();
            if (next !== null)
                this.commit(next);
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Rating, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: Rating, isStandalone: true, selector: "st-rating", inputs: { value: "value", max: "max", onChange: "onChange", readonly: "readonly", allowHalf: "allowHalf", size: "size", name: "name", label: "label", classInput: ["class", "classInput"] }, outputs: { change: "change" }, ngImport: i0, template: `
    @if (readonly) {
      <div
        [attr.data-st-component]="componentName"
        [class]="hostClass"
        role="img"
        [attr.aria-label]="label ? label + ' : ' + valueText : valueText"
      >
        @for (star of stars; track star) {
          <span
            class="st-rating__star"
            [class.st-rating__star--full]="fill(star) === 'full'"
            [class.st-rating__star--half]="fill(star) === 'half'"
            aria-hidden="true"
          >
            @if (fill(star) === 'half') {
              <svg [attr.width]="iconSize" [attr.height]="iconSize" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2v15.77z" fill="currentColor" />
                <path d="M12 2v15.77l6.18 3.25L17 14.14 22 9.27l-6.91-1.01L12 2z" />
              </svg>
            } @else {
              <svg [attr.width]="iconSize" [attr.height]="iconSize" viewBox="0 0 24 24" [attr.fill]="fill(star) === 'full' ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            }
          </span>
        }
      </div>
    } @else if (allowHalf) {
      <div
        [attr.data-st-component]="componentName"
        [class]="hostClass"
        role="slider"
        [attr.aria-label]="label"
        [attr.aria-valuemin]="0"
        [attr.aria-valuemax]="resolvedMax"
        [attr.aria-valuenow]="resolvedValue"
        [attr.aria-valuetext]="valueText"
        tabindex="0"
        (keydown)="onKeyDown($event)"
      >
        @for (star of stars; track star) {
          <span
            class="st-rating__star"
            [class.st-rating__star--full]="fill(star) === 'full'"
            [class.st-rating__star--half]="fill(star) === 'half'"
            aria-hidden="true"
            (click)="onStarClick($event, star)"
          >
            @if (fill(star) === 'half') {
              <svg [attr.width]="iconSize" [attr.height]="iconSize" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2v15.77z" fill="currentColor" />
                <path d="M12 2v15.77l6.18 3.25L17 14.14 22 9.27l-6.91-1.01L12 2z" />
              </svg>
            } @else {
              <svg [attr.width]="iconSize" [attr.height]="iconSize" viewBox="0 0 24 24" [attr.fill]="fill(star) === 'full' ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            }
          </span>
        }
      </div>
    } @else {
      <div
        [attr.data-st-component]="componentName"
        [class]="hostClass"
        role="radiogroup"
        [attr.aria-label]="label"
      >
        @for (star of stars; track star) {
          <button
            type="button"
            class="st-rating__star"
            [class.st-rating__star--full]="fill(star) === 'full'"
            role="radio"
            [attr.name]="name"
            [attr.aria-checked]="resolvedValue === star ? 'true' : 'false'"
            [attr.aria-label]="star + ' / ' + resolvedMax"
            [attr.tabindex]="star === focusedStar ? 0 : -1"
            (click)="onStarClick($event, star)"
            (keydown)="onKeyDown($event)"
          >
            <svg [attr.width]="iconSize" [attr.height]="iconSize" viewBox="0 0 24 24" [attr.fill]="fill(star) === 'full' ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </button>
        }
      </div>
    }
  `, isInline: true, styles: [":host { display: contents; }"] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Rating, decorators: [{
            type: Component,
            args: [{ selector: "st-rating", standalone: true, template: `
    @if (readonly) {
      <div
        [attr.data-st-component]="componentName"
        [class]="hostClass"
        role="img"
        [attr.aria-label]="label ? label + ' : ' + valueText : valueText"
      >
        @for (star of stars; track star) {
          <span
            class="st-rating__star"
            [class.st-rating__star--full]="fill(star) === 'full'"
            [class.st-rating__star--half]="fill(star) === 'half'"
            aria-hidden="true"
          >
            @if (fill(star) === 'half') {
              <svg [attr.width]="iconSize" [attr.height]="iconSize" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2v15.77z" fill="currentColor" />
                <path d="M12 2v15.77l6.18 3.25L17 14.14 22 9.27l-6.91-1.01L12 2z" />
              </svg>
            } @else {
              <svg [attr.width]="iconSize" [attr.height]="iconSize" viewBox="0 0 24 24" [attr.fill]="fill(star) === 'full' ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            }
          </span>
        }
      </div>
    } @else if (allowHalf) {
      <div
        [attr.data-st-component]="componentName"
        [class]="hostClass"
        role="slider"
        [attr.aria-label]="label"
        [attr.aria-valuemin]="0"
        [attr.aria-valuemax]="resolvedMax"
        [attr.aria-valuenow]="resolvedValue"
        [attr.aria-valuetext]="valueText"
        tabindex="0"
        (keydown)="onKeyDown($event)"
      >
        @for (star of stars; track star) {
          <span
            class="st-rating__star"
            [class.st-rating__star--full]="fill(star) === 'full'"
            [class.st-rating__star--half]="fill(star) === 'half'"
            aria-hidden="true"
            (click)="onStarClick($event, star)"
          >
            @if (fill(star) === 'half') {
              <svg [attr.width]="iconSize" [attr.height]="iconSize" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2v15.77z" fill="currentColor" />
                <path d="M12 2v15.77l6.18 3.25L17 14.14 22 9.27l-6.91-1.01L12 2z" />
              </svg>
            } @else {
              <svg [attr.width]="iconSize" [attr.height]="iconSize" viewBox="0 0 24 24" [attr.fill]="fill(star) === 'full' ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            }
          </span>
        }
      </div>
    } @else {
      <div
        [attr.data-st-component]="componentName"
        [class]="hostClass"
        role="radiogroup"
        [attr.aria-label]="label"
      >
        @for (star of stars; track star) {
          <button
            type="button"
            class="st-rating__star"
            [class.st-rating__star--full]="fill(star) === 'full'"
            role="radio"
            [attr.name]="name"
            [attr.aria-checked]="resolvedValue === star ? 'true' : 'false'"
            [attr.aria-label]="star + ' / ' + resolvedMax"
            [attr.tabindex]="star === focusedStar ? 0 : -1"
            (click)="onStarClick($event, star)"
            (keydown)="onKeyDown($event)"
          >
            <svg [attr.width]="iconSize" [attr.height]="iconSize" viewBox="0 0 24 24" [attr.fill]="fill(star) === 'full' ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </button>
        }
      </div>
    }
  `, styles: [":host { display: contents; }"] }]
        }], propDecorators: { value: [{
                type: NgInput
            }], max: [{
                type: NgInput
            }], onChange: [{
                type: NgInput
            }], readonly: [{
                type: NgInput
            }], allowHalf: [{
                type: NgInput
            }], size: [{
                type: NgInput
            }], name: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }], change: [{
                type: Output
            }] } });
//# sourceMappingURL=Rating.js.map