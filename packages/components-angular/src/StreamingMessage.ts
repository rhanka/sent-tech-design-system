import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import type { ChatMessageStatus } from "./ChatMessage.js";

export type StreamingMessageEvent = {
  id: string;
  label: unknown;
  text?: unknown;
  status?: ChatMessageStatus;
};

export type StreamingMessageMode = "live" | "passive";

export type StreamingMessageProps = {
  text?: unknown;
  events?: StreamingMessageEvent[];
  mode?: StreamingMessageMode;
  class?: string;
};

@Component({
  selector: "st-streaming-message",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class StreamingMessage {
  static readonly stComponentName = "StreamingMessage";
  readonly componentName = "StreamingMessage";
  @NgInput() text?: unknown;
  @NgInput() events?: StreamingMessageEvent[];
  @NgInput() mode?: StreamingMessageMode;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-streamingMessage", this.classInput].filter(Boolean).join(" ");
  }
}
