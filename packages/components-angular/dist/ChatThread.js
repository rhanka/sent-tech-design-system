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
        return classNames("st-chatMessage", `st-chatMessage--${role ?? "assistant"}`);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: ChatThread, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: ChatThread, isStandalone: true, selector: "st-chat-thread", inputs: { messages: "messages", emptyLabel: "emptyLabel", label: "label", autoScroll: "autoScroll", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <section
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      role="log"
      aria-live="polite"
      aria-relevant="additions text"
      [attr.aria-label]="label || 'Chat'"
    >
      <div class="st-chatThread__list">
        @if (messages && messages.length > 0) {
          @for (msg of messages; track msg.id) {
            <article
              [class]="msgClass(msg.role)"
              [attr.data-st-component]="'ChatMessage'"
              [attr.data-role]="msg.role ?? 'assistant'"
              [attr.data-status]="msg.status ?? null"
              [attr.data-align]="(msg.role ?? 'assistant') === 'user' ? 'end' : 'start'"
            >
              <div class="st-chatMessage__body">
                <div class="st-chatMessage__bubble">
                  <div class="st-chatMessage__content">{{ msg.content }}</div>
                </div>
              </div>
            </article>
          }
        }
      </div>
      @if (messages !== undefined && messages.length === 0 && emptyLabel) {
        <div class="st-chatThread__empty">{{ emptyLabel }}</div>
      }
    </section>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: ChatThread, decorators: [{
            type: Component,
            args: [{
                    selector: "st-chat-thread",
                    standalone: true,
                    template: `
    <section
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      role="log"
      aria-live="polite"
      aria-relevant="additions text"
      [attr.aria-label]="label || 'Chat'"
    >
      <div class="st-chatThread__list">
        @if (messages && messages.length > 0) {
          @for (msg of messages; track msg.id) {
            <article
              [class]="msgClass(msg.role)"
              [attr.data-st-component]="'ChatMessage'"
              [attr.data-role]="msg.role ?? 'assistant'"
              [attr.data-status]="msg.status ?? null"
              [attr.data-align]="(msg.role ?? 'assistant') === 'user' ? 'end' : 'start'"
            >
              <div class="st-chatMessage__body">
                <div class="st-chatMessage__bubble">
                  <div class="st-chatMessage__content">{{ msg.content }}</div>
                </div>
              </div>
            </article>
          }
        }
      </div>
      @if (messages !== undefined && messages.length === 0 && emptyLabel) {
        <div class="st-chatThread__empty">{{ emptyLabel }}</div>
      }
    </section>
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