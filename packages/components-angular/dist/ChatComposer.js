import { Component, EventEmitter, Input as NgInput, Output } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class ChatComposer {
    static stComponentName = "ChatComposer";
    componentName = "ChatComposer";
    value;
    modelValue;
    placeholder;
    disabled = false;
    maxLength;
    label;
    submitLabel;
    classInput;
    submit = new EventEmitter();
    modelValueChange = new EventEmitter();
    get currentValue() {
        return this.modelValue ?? this.value ?? "";
    }
    get hostClass() {
        return classNames("st-chatComposer", this.classInput);
    }
    onInput(e) {
        const v = e.target.value;
        this.modelValueChange.emit(v);
    }
    onEnter(e) {
        const ke = e;
        if (!ke.shiftKey) {
            e.preventDefault();
            this.onSubmit(e);
        }
    }
    onSubmit(e) {
        e.preventDefault();
        const v = this.currentValue.trim();
        if (v)
            this.submit.emit(v);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: ChatComposer, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: ChatComposer, isStandalone: true, selector: "st-chat-composer", inputs: { value: "value", modelValue: "modelValue", placeholder: "placeholder", disabled: "disabled", maxLength: "maxLength", label: "label", submitLabel: "submitLabel", classInput: ["class", "classInput"] }, outputs: { submit: "submit", modelValueChange: "modelValueChange" }, ngImport: i0, template: `
    <form class="st-chatComposer" [class]="hostClass" (submit)="onSubmit($event)">
      <textarea
        class="st-chatComposer__input"
        [value]="currentValue"
        [placeholder]="placeholder ?? ''"
        [disabled]="disabled"
        [attr.maxlength]="maxLength ?? null"
        (input)="onInput($event)"
        (keydown.enter)="onEnter($event)"
      ></textarea>
      <button type="submit" class="st-chatComposer__send" [disabled]="!currentValue.trim() || disabled">↑</button>
    </form>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: ChatComposer, decorators: [{
            type: Component,
            args: [{
                    selector: "st-chat-composer",
                    standalone: true,
                    template: `
    <form class="st-chatComposer" [class]="hostClass" (submit)="onSubmit($event)">
      <textarea
        class="st-chatComposer__input"
        [value]="currentValue"
        [placeholder]="placeholder ?? ''"
        [disabled]="disabled"
        [attr.maxlength]="maxLength ?? null"
        (input)="onInput($event)"
        (keydown.enter)="onEnter($event)"
      ></textarea>
      <button type="submit" class="st-chatComposer__send" [disabled]="!currentValue.trim() || disabled">↑</button>
    </form>
  `,
                }]
        }], propDecorators: { value: [{
                type: NgInput
            }], modelValue: [{
                type: NgInput
            }], placeholder: [{
                type: NgInput
            }], disabled: [{
                type: NgInput
            }], maxLength: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], submitLabel: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }], submit: [{
                type: Output
            }], modelValueChange: [{
                type: Output
            }] } });
//# sourceMappingURL=ChatComposer.js.map