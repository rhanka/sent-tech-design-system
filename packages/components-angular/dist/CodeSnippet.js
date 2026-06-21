import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class CodeSnippet {
    static stComponentName = "CodeSnippet";
    componentName = "CodeSnippet";
    code;
    inline;
    classInput;
    get hostClass() {
        return classNames("st-codeSnippet", this.inline && "st-codeSnippet--inline", this.classInput);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: CodeSnippet, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: CodeSnippet, isStandalone: true, selector: "st-code-snippet", inputs: { code: "code", inline: "inline", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    @if (inline) {
      <code [attr.data-st-component]="componentName" [class]="hostClass">{{ code }}</code>
    } @else {
      <div [attr.data-st-component]="componentName" [class]="hostClass">
        <pre class="st-codeSnippet__pre"><code class="st-codeSnippet__code">{{ code }}</code></pre>
        <ng-content></ng-content>
      </div>
    }
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: CodeSnippet, decorators: [{
            type: Component,
            args: [{
                    selector: "st-code-snippet",
                    standalone: true,
                    template: `
    @if (inline) {
      <code [attr.data-st-component]="componentName" [class]="hostClass">{{ code }}</code>
    } @else {
      <div [attr.data-st-component]="componentName" [class]="hostClass">
        <pre class="st-codeSnippet__pre"><code class="st-codeSnippet__code">{{ code }}</code></pre>
        <ng-content></ng-content>
      </div>
    }
  `,
                }]
        }], propDecorators: { code: [{
                type: NgInput
            }], inline: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=CodeSnippet.js.map