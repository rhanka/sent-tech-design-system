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
    locale;
    loadingLabel;
    classInput;
    get isFr() {
        return (this.locale ?? "fr-FR").toLowerCase().startsWith("fr");
    }
    get resolvedLoadingLabel() {
        if (this.loadingLabel != null)
            return this.loadingLabel;
        return this.isFr ? "Chargement…" : "Loading…";
    }
    get lineCount() {
        const lines = this.lines ?? 1;
        return this.paragraph ? Math.max(lines, 3) : lines;
    }
    get linesArray() {
        return Array.from({ length: Math.max(0, this.lineCount) }, (_, i) => i);
    }
    get lineClass() {
        return classNames("st-skeleton__line", this.heading && "st-skeleton__line--heading");
    }
    lineWidth(index, total) {
        if (this.width && index === 0)
            return this.width;
        if (this.paragraph && index === total - 1)
            return "60%";
        return undefined;
    }
    get hostClass() {
        return classNames("st-skeleton", this.classInput);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: SkeletonText, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: SkeletonText, isStandalone: true, selector: "st-skeleton-text", inputs: { lines: "lines", width: "width", heading: "heading", paragraph: "paragraph", locale: "locale", loadingLabel: "loadingLabel", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      role="status"
      [attr.aria-label]="resolvedLoadingLabel"
      aria-busy="true"
    >
      @for (i of linesArray; track $index) {
        <span [class]="lineClass" [style.width]="lineWidth($index, linesArray.length)"></span>
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
    <div
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      role="status"
      [attr.aria-label]="resolvedLoadingLabel"
      aria-busy="true"
    >
      @for (i of linesArray; track $index) {
        <span [class]="lineClass" [style.width]="lineWidth($index, linesArray.length)"></span>
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
            }], locale: [{
                type: NgInput
            }], loadingLabel: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=SkeletonText.js.map