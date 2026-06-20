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
    <article [class]="hostClass" [attr.data-role]="role ?? 'assistant'" [attr.data-status]="normalizedStatus">
      <div class="st-chatMessage__body">
        <div class="st-chatMessage__content">
          <ng-content></ng-content>
        </div>
      </div>
    </article>
  `,
})
export class ChatMessage {
  static readonly stComponentName = "ChatMessage";
  readonly componentName = "ChatMessage";

  @NgInput() role?: ChatMessageRole;
  @NgInput() status?: ChatMessageStatus;
  @NgInput() content?: unknown;
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
