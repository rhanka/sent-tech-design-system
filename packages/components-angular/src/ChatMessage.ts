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
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
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

  get hostClass(): string {
    return ["st-chatMessage", this.classInput].filter(Boolean).join(" ");
  }
}
