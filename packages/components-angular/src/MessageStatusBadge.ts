import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import type { ChatMessageStatus } from "./ChatMessage.js";

export type MessageStatusBadgeTone = "neutral" | "info" | "success" | "warning" | "error";

export type MessageStatusBadgeProps = {
  status: ChatMessageStatus;
  tone?: MessageStatusBadgeTone;
  labels?: Partial<Record<ChatMessageStatus, unknown>>;
  class?: string;
};

@Component({
  selector: "st-message-status-badge",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class MessageStatusBadge {
  static readonly stComponentName = "MessageStatusBadge";
  readonly componentName = "MessageStatusBadge";
  @NgInput() status!: ChatMessageStatus;
  @NgInput() tone?: MessageStatusBadgeTone;
  @NgInput() labels?: Partial<Record<ChatMessageStatus, unknown>>;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-messageStatusBadge", this.classInput].filter(Boolean).join(" ");
  }
}
