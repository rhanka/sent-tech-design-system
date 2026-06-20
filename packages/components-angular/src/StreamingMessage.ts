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
  streaming?: boolean;
  content?: string;
  class?: string;
};

@Component({
  selector: "st-streaming-message",
  standalone: true,
  template: `
    <div class="st-streamingMessage" [class]="hostClass">
      <div class="st-streamingMessage__content">
        <ng-content></ng-content>
      </div>
      @if (streaming) {
        <span class="st-streamingMessage__cursor" aria-hidden="true"></span>
      }
    </div>
  `,
})
export class StreamingMessage {
  static readonly stComponentName = "StreamingMessage";
  readonly componentName = "StreamingMessage";

  @NgInput() streaming = false;
  @NgInput() content?: string;
  @NgInput() text?: unknown;
  @NgInput() events?: StreamingMessageEvent[];
  @NgInput() mode?: StreamingMessageMode;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames(
      "st-streamingMessage",
      this.streaming ? "st-streamingMessage--streaming" : undefined,
      this.classInput,
    );
  }
}
