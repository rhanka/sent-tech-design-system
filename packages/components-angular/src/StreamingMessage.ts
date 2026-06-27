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
  placeholder?: unknown;
  streaming?: boolean;
  content?: string;
  class?: string;
};

@Component({
  selector: "st-streaming-message",
  standalone: true,
  template: `
    <section [attr.data-st-component]="componentName" [class]="hostClass">
      <p [class]="textClass">{{ displayText }}</p>
      @if (events?.length) {
        <ul class="st-streamingMessage__trailList">
          @for (event of events ?? []; track event.id) {
            <li>{{ event.label }}</li>
          }
        </ul>
      }
    </section>
  `,
})
export class StreamingMessage {
  static readonly stComponentName = "StreamingMessage";
  readonly componentName = "StreamingMessage";

  @NgInput() streaming = false;
  @NgInput() content?: string;
  @NgInput() text?: unknown;
  @NgInput() events?: StreamingMessageEvent[];
  @NgInput() mode: StreamingMessageMode = "live";
  @NgInput() placeholder: unknown = "Streaming en cours…";
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames(
      "st-streamingMessage",
      `st-streamingMessage--${this.mode}`,
      this.classInput,
    );
  }

  get resolvedText(): unknown {
    return this.content ?? this.text;
  }

  get isEmpty(): boolean {
    const value = this.resolvedText;
    return value == null || value === "";
  }

  get textClass(): string {
    return classNames(
      "st-streamingMessage__text",
      this.isEmpty && "st-streamingMessage__text--muted",
    );
  }

  get displayText(): unknown {
    return this.isEmpty ? this.placeholder : this.resolvedText;
  }
}
