import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class ChatThread {
    static stComponentName = "ChatThread";
    componentName = "ChatThread";
    messages;
    emptyLabel;
    label;
    autoScroll;
    classInput;
    get hostClass() {
        return classNames("st-chatThread", this.classInput);
    }
    msgClass(role) {
        const r = role ?? "assistant";
        return classNames("st-chatMessage", `st-chatMessage--${r}`);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: ChatThread, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: ChatThread, isStandalone: true, selector: "st-chat-thread", inputs: { messages: "messages", emptyLabel: "emptyLabel", label: "label", autoScroll: "autoScroll", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass" role="log" aria-live="polite" [attr.aria-label]="label || 'Chat'">
      <div class="st-chatThread__messages">
        @if (messages && messages.length > 0) {
          @for (msg of messages; track msg.id) {
            <article
              class="st-chatMessage"
              [class]="msgClass(msg.role)"
              [attr.data-role]="msg.role ?? 'assistant'"
              [attr.data-status]="msg.status ?? null"
            >
              <div class="st-chatMessage__body">
                <div class="st-chatMessage__content">{{ msg.content }}</div>
              </div>
            </article>
          }
        } @else if (messages !== undefined) {
          <div class="st-chatThread__empty">{{ emptyLabel ?? '' }}</div>
        } @else {
          <ng-content></ng-content>
        }
      </div>
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: ChatThread, decorators: [{
            type: Component,
            args: [{
                    selector: "st-chat-thread",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass" role="log" aria-live="polite" [attr.aria-label]="label || 'Chat'">
      <div class="st-chatThread__messages">
        @if (messages && messages.length > 0) {
          @for (msg of messages; track msg.id) {
            <article
              class="st-chatMessage"
              [class]="msgClass(msg.role)"
              [attr.data-role]="msg.role ?? 'assistant'"
              [attr.data-status]="msg.status ?? null"
            >
              <div class="st-chatMessage__body">
                <div class="st-chatMessage__content">{{ msg.content }}</div>
              </div>
            </article>
          }
        } @else if (messages !== undefined) {
          <div class="st-chatThread__empty">{{ emptyLabel ?? '' }}</div>
        } @else {
          <ng-content></ng-content>
        }
      </div>
    </div>
  `,
                }]
        }], propDecorators: { messages: [{
                type: NgInput
            }], emptyLabel: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], autoScroll: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=ChatThread.js.map