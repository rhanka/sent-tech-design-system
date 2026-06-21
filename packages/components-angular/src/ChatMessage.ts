import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type ChatMessageRole = "user" | "assistant" | "system" | "tool";

export type ChatMessageStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "idle"
  | "streaming"
  | "error"
  | "sent";

export type ChatMessageProps = {
  role?: ChatMessageRole;
  status?: ChatMessageStatus;
  content?: unknown;
  timestamp?: unknown;
  footer?: unknown;
  actions?: unknown;
  avatar?: unknown;
  class?: string;
};

@Component({
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
          <div class="st-chatMessage__content">
            @if (content) {
              {{ content }}
            }
          </div>
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
})
export class ChatMessage {
  static readonly stComponentName = "ChatMessage";
  readonly componentName = "ChatMessage";

  @NgInput() role?: ChatMessageRole;
  @NgInput() status?: ChatMessageStatus;
  @NgInput() content?: string;
  @NgInput() timestamp?: unknown;
  @NgInput() footer?: unknown;
  @NgInput() actions?: unknown;
  @NgInput() avatar?: unknown;
  @NgInput("class") classInput?: string;

  get normalizedStatus(): string | undefined {
    const status = this.status;
    if (status === "idle" || status === "streaming") return "processing";
    if (status === "error") return "failed";
    return status;
  }

  get hostClass(): string {
    const role = this.role ?? "assistant";
    return classNames(
      "st-chatMessage",
      `st-chatMessage--${role}`,
      this.normalizedStatus ? `st-chatMessage--${this.normalizedStatus}` : undefined,
      this.classInput,
    );
  }
}
