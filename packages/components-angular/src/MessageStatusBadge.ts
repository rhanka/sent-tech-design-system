import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import type { ChatMessageStatus } from "./ChatMessage.js";

export type MessageStatusBadgeTone = "neutral" | "info" | "success" | "warning" | "error";

export type MessageStatusBadgeProps = {
  status: ChatMessageStatus;
  tone?: MessageStatusBadgeTone;
  labels?: Partial<Record<ChatMessageStatus, unknown>>;
  label?: string;
  class?: string;
};

@Component({
  selector: "st-message-status-badge",
  standalone: true,
  template: `
    <span class="st-messageStatusBadge" [class]="hostClass">{{ label }}</span>
  `,
})
export class MessageStatusBadge {
  static readonly stComponentName = "MessageStatusBadge";
  readonly componentName = "MessageStatusBadge";

  @NgInput() status!: ChatMessageStatus;
  @NgInput() tone?: MessageStatusBadgeTone;
  @NgInput() labels?: Partial<Record<ChatMessageStatus, unknown>>;
  @NgInput() label?: string;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames(
      "st-messageStatusBadge",
      this.status ? `st-messageStatusBadge--${this.status}` : undefined,
      this.classInput,
    );
  }
}
