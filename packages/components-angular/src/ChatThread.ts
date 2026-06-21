import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import type { ChatMessageRole, ChatMessageStatus } from "./ChatMessage.js";

export type ChatThreadProps = {
  messages?: Array<{
    id: string;
    role?: ChatMessageRole;
    content: unknown;
    status?: ChatMessageStatus;
  }>;
  emptyLabel?: unknown;
  label?: string;
  autoScroll?: boolean;
  class?: string;
};

@Component({
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
})
export class ChatThread {
  static readonly stComponentName = "ChatThread";
  readonly componentName = "ChatThread";

  @NgInput() messages?: Array<{
    id: string;
    role?: ChatMessageRole;
    content: unknown;
    status?: ChatMessageStatus;
  }>;
  @NgInput() emptyLabel?: unknown;
  @NgInput() label?: string;
  @NgInput() autoScroll?: boolean;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames("st-chatThread", this.classInput);
  }

  msgClass(role?: ChatMessageRole): string {
    return classNames("st-chatMessage", `st-chatMessage--${role ?? "assistant"}`);
  }
}
