import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import { ChatMessage } from "./ChatMessage.js";

import type { ChatMessageRole, ChatMessageStatus } from "./ChatMessage.js";

export type ChatThreadProps = {
  messages?: Array<{
    id: string;
    role?: ChatMessageRole;
    content: unknown;
    status?: ChatMessageStatus;
  }>;
  emptyLabel?: unknown;
  class?: string;
};

@Component({
  selector: "st-chat-thread",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
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
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-chatThread", this.classInput].filter(Boolean).join(" ");
  }
}
