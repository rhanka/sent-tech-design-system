import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class SkeletonText {
    static stComponentName = "SkeletonText";
    componentName = "SkeletonText";
    lines;
    width;
    heading;
    paragraph;
    classInput;
    get linesArray() {
        return Array.from({ length: Math.max(1, this.lines ?? 1) }, (_, i) => i);
    }
    get hostClass() {
        return classNames("st-skeleton", this.paragraph && "st-skeleton--paragraph", this.classInput);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: SkeletonText, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: SkeletonText, isStandalone: true, selector: "st-skeleton-text", inputs: { lines: "lines", width: "width", heading: "heading", paragraph: "paragraph", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      @if (heading) { <div class="st-skeleton__heading st-skeleton__line"></div> }
      @for (i of linesArray; track $index) {
        <div class="st-skeleton__line" [style.width]="width || (($index === linesArray.length - 1 && (lines ?? 1) > 1) ? '75%' : '100%')"></div>
      }
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: SkeletonText, decorators: [{
            type: Component,
            args: [{
                    selector: "st-skeleton-text",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      @if (heading) { <div class="st-skeleton__heading st-skeleton__line"></div> }
      @for (i of linesArray; track $index) {
        <div class="st-skeleton__line" [style.width]="width || (($index === linesArray.length - 1 && (lines ?? 1) > 1) ? '75%' : '100%')"></div>
      }
    </div>
  `,
                }]
        }], propDecorators: { lines: [{
                type: NgInput
            }], width: [{
                type: NgInput
            }], heading: [{
                type: NgInput
            }], paragraph: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=SkeletonText.js.map