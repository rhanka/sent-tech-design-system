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
    <div class="st-chatThread" [class]="hostClass" role="log" aria-live="polite">
      <div class="st-chatThread__messages">
        <ng-content></ng-content>
      </div>
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
  @NgInput() label?: string;
  @NgInput() autoScroll?: boolean;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames("st-chatThread", this.classInput);
  }
}
