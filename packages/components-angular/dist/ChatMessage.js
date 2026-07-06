import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class ChatMessage {
    static stComponentName = "ChatMessage";
    componentName = "ChatMessage";
    role;
    status;
    content;
    timestamp;
    footer;
    actions;
    avatar;
    classInput;
    get normalizedStatus() {
        const status = this.status;
        if (status === "idle" || status === "streaming")
            return "processing";
        if (status === "error")
            return "failed";
        return status;
    }
    get hostClass() {
        const role = this.role ?? "assistant";
        return classNames("st-chatMessage", `st-chatMessage--${role}`, this.normalizedStatus ? `st-chatMessage--${this.normalizedStatus}` : undefined, this.classInput);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: ChatMessage, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: ChatMessage, isStandalone: true, selector: "st-chat-message", inputs: { role: "role", status: "status", content: "content", timestamp: "timestamp", footer: "footer", actions: "actions", avatar: "avatar", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <article
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      [attr.data-role]="role ?? 'assistant'"
      [attr.data-status]="normalizedStatus ?? null"
      [attr.data-align]="(role ?? 'assistant') === 'user' ? 'end' : 'start'"
      [attr.aria-live]="normalizedStatus === 'processing' ? 'polite' : null"
    >
      <div class="st-chatMessage__body">
        <div class="st-chatMessage__bubble">
          <div class="st-chatMessage__content"><ng-content>{{ content }}</ng-content></div>
          @if (normalizedStatus === 'processing') {
            <span class="st-chatMessage__pulse" aria-hidden="true"></span>
          }
        </div>
        @if (timestamp) {
          <div class="st-chatMessage__footer">
            <span class="st-chatMessage__timestamp">{{ timestamp }}</span>
          </div>
        }
      </div>
    </article>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: ChatMessage, decorators: [{
            type: Component,
            args: [{
                    selector: "st-chat-message",
                    standalone: true,
                    template: `
    <article
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      [attr.data-role]="role ?? 'assistant'"
      [attr.data-status]="normalizedStatus ?? null"
      [attr.data-align]="(role ?? 'assistant') === 'user' ? 'end' : 'start'"
      [attr.aria-live]="normalizedStatus === 'processing' ? 'polite' : null"
    >
      <div class="st-chatMessage__body">
        <div class="st-chatMessage__bubble">
          <div class="st-chatMessage__content"><ng-content>{{ content }}</ng-content></div>
          @if (normalizedStatus === 'processing') {
            <span class="st-chatMessage__pulse" aria-hidden="true"></span>
          }
        </div>
        @if (timestamp) {
          <div class="st-chatMessage__footer">
            <span class="st-chatMessage__timestamp">{{ timestamp }}</span>
          </div>
        }
      </div>
    </article>
  `,
                }]
        }], propDecorators: { role: [{
                type: NgInput
            }], status: [{
                type: NgInput
            }], content: [{
                type: NgInput
            }], timestamp: [{
                type: NgInput
            }], footer: [{
                type: NgInput
            }], actions: [{
                type: NgInput
            }], avatar: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=ChatMessage.js.map