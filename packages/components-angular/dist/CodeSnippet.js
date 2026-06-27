import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import { CopyButton } from "./CopyButton.js";
import * as i0 from "@angular/core";
export class CodeSnippet {
    static stComponentName = "CodeSnippet";
    componentName = "CodeSnippet";
    code;
    language;
    inline;
    copyable;
    copyLabel;
    copiedLabel;
    classInput;
    get resolvedCopyable() {
        return this.copyable !== false;
    }
    get inlineClass() {
        return classNames("st-codeSnippet--inline", this.classInput);
    }
    get blockClass() {
        return classNames("st-codeSnippet", this.classInput);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: CodeSnippet, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: CodeSnippet, isStandalone: true, selector: "st-code-snippet", inputs: { code: "code", language: "language", inline: "inline", copyable: "copyable", copyLabel: "copyLabel", copiedLabel: "copiedLabel", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    @if (inline) {
      <code
        [attr.data-st-component]="componentName"
        [class]="inlineClass"
        [attr.data-language]="language ?? null"
      >{{ code }}</code>
    } @else {
      <div [attr.data-st-component]="componentName" class="st-codeSnippet__wrapper">
        <pre [class]="blockClass" [attr.data-language]="language ?? null"><code class="st-codeSnippet__code">{{ code }}</code></pre>
        @if (resolvedCopyable) {
          <span class="st-codeSnippet__copy">
            <st-copy-button [value]="code" size="sm" [label]="copyLabel ?? 'Copy'" [copiedLabel]="copiedLabel ?? 'Copied'"></st-copy-button>
          </span>
        }
        <ng-content></ng-content>
      </div>
    }
  `, isInline: true, dependencies: [{ kind: "component", type: CopyButton, selector: "st-copy-button", inputs: ["text", "value", "label", "copiedLabel", "size", "class"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: CodeSnippet, decorators: [{
            type: Component,
            args: [{
                    selector: "st-code-snippet",
                    standalone: true,
                    imports: [CopyButton],
                    template: `
    @if (inline) {
      <code
        [attr.data-st-component]="componentName"
        [class]="inlineClass"
        [attr.data-language]="language ?? null"
      >{{ code }}</code>
    } @else {
      <div [attr.data-st-component]="componentName" class="st-codeSnippet__wrapper">
        <pre [class]="blockClass" [attr.data-language]="language ?? null"><code class="st-codeSnippet__code">{{ code }}</code></pre>
        @if (resolvedCopyable) {
          <span class="st-codeSnippet__copy">
            <st-copy-button [value]="code" size="sm" [label]="copyLabel ?? 'Copy'" [copiedLabel]="copiedLabel ?? 'Copied'"></st-copy-button>
          </span>
        }
        <ng-content></ng-content>
      </div>
    }
  `,
                }]
        }], propDecorators: { code: [{
                type: NgInput
            }], language: [{
                type: NgInput
            }], inline: [{
                type: NgInput
            }], copyable: [{
                type: NgInput
            }], copyLabel: [{
                type: NgInput
            }], copiedLabel: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=CodeSnippet.js.map