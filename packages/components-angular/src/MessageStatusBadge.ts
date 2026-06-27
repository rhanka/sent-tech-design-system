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
    <span [class]="hostClass">
      <span class="st-messageStatusBadge__dot" aria-hidden="true"></span>{{ resolvedLabel }}</span>
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

  private get normalizedStatus(): ChatMessageStatus {
    const status = this.status;
    if ((status as string) === "sent") return "completed" as ChatMessageStatus;
    if ((status as string) === "streaming") return "processing" as ChatMessageStatus;
    if ((status as string) === "error") return "failed" as ChatMessageStatus;
    return status;
  }

  get resolvedTone(): MessageStatusBadgeTone {
    if (this.tone) return this.tone;
    const normalized = this.normalizedStatus as string;
    if (normalized === "completed") return "success";
    if (normalized === "failed") return "error";
    if (normalized === "processing") return "info";
    return "neutral";
  }

  get resolvedLabel(): unknown {
    if (this.label != null) return this.label;
    const fromLabels = this.labels?.[this.status] ?? this.labels?.[this.normalizedStatus];
    if (fromLabels != null) return fromLabels;
    const normalized = this.normalizedStatus as string;
    return normalized ? normalized.charAt(0).toUpperCase() + normalized.slice(1) : normalized;
  }

  get hostClass(): string {
    return classNames(
      "st-messageStatusBadge",
      `st-badge st-badge--${this.resolvedTone}`,
      this.classInput,
    );
  }
}
