import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import { AspectRatio } from "./AspectRatio.js";
import * as i0 from "@angular/core";
export class Embed {
    static stComponentName = "Embed";
    componentName = "Embed";
    src;
    title;
    sandbox;
    aspectRatio;
    allow;
    loading;
    classInput;
    get hostClass() {
        return ["st-embed", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Embed, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: Embed, isStandalone: true, selector: "st-embed", inputs: { src: "src", title: "title", sandbox: "sandbox", aspectRatio: "aspectRatio", allow: "allow", loading: "loading", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Embed, decorators: [{
            type: Component,
            args: [{
                    selector: "st-embed",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
                }]
        }], propDecorators: { src: [{
                type: NgInput
            }], title: [{
                type: NgInput
            }], sandbox: [{
                type: NgInput
            }], aspectRatio: [{
                type: NgInput
            }], allow: [{
                type: NgInput
            }], loading: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=Embed.js.map