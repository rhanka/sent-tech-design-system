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
    <form [class]="hostClass" (submit)="onSubmit($event)">
      <div class="st-chatComposer__body">
        <div class="st-chatComposer__inputShell">
          <textarea
            class="st-chatComposer__textarea st-chatComposer__input"
            [value]="currentValue"
            [placeholder]="placeholder ?? ''"
            [disabled]="disabled"
            [attr.maxlength]="maxLength ?? null"
            (input)="onInput($event)"
            (keydown.enter)="onEnter($event)"
          ></textarea>
        </div>
      </div>
      <div class="st-chatComposer__toolbar">
        <div class="st-chatComposer__actions st-chatComposer__actions--left">
          <ng-content></ng-content>
        </div>
        <div class="st-chatComposer__actions st-chatComposer__actions--right">
          <button
            type="submit"
            class="st-button st-button--primary st-button--md"
            [disabled]="!currentValue.trim() || disabled"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"></path>
              <path d="m21.854 2.147-10.94 10.939"></path>
            </svg>{{ submitLabel ?? 'Send' }}</button>
        </div>
      </div>
    </form>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: ChatComposer, decorators: [{
            type: Component,
            args: [{
                    selector: "st-chat-composer",
                    standalone: true,
                    template: `
    <form [class]="hostClass" (submit)="onSubmit($event)">
      <div class="st-chatComposer__body">
        <div class="st-chatComposer__inputShell">
          <textarea
            class="st-chatComposer__textarea st-chatComposer__input"
            [value]="currentValue"
            [placeholder]="placeholder ?? ''"
            [disabled]="disabled"
            [attr.maxlength]="maxLength ?? null"
            (input)="onInput($event)"
            (keydown.enter)="onEnter($event)"
          ></textarea>
        </div>
      </div>
      <div class="st-chatComposer__toolbar">
        <div class="st-chatComposer__actions st-chatComposer__actions--left">
          <ng-content></ng-content>
        </div>
        <div class="st-chatComposer__actions st-chatComposer__actions--right">
          <button
            type="submit"
            class="st-button st-button--primary st-button--md"
            [disabled]="!currentValue.trim() || disabled"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"></path>
              <path d="m21.854 2.147-10.94 10.939"></path>
            </svg>{{ submitLabel ?? 'Send' }}</button>
        </div>
      </div>
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