import type { HTMLAttributes } from "preact";
import { classNames } from "./classNames.js";
import type { ComponentChildren } from "./runtime.js";
import type { ChatMessageStatus } from "./ChatMessage.js";
import type { MaybeSignal } from "./signals.js";

export type MessageStatusBadgeProps = Omit<HTMLAttributes<HTMLSpanElement>, "className"> & {
  status: ChatMessageStatus;
  tone?: "neutral" | "info" | "success" | "warning" | "error";
  labels?: Partial<Record<ChatMessageStatus, ComponentChildren>>;
  /** A signal is accepted in the Preact build; the React emission keeps `string`. */
  className?: MaybeSignal<string>;
};

export function MessageStatusBadge({ status, tone, labels, className, ...rest }: MessageStatusBadgeProps) {
  const normalized = status === "sent" ? "completed" : status === "streaming" ? "processing" : status === "error" ? "failed" : status;
  const resolvedTone = tone ?? (normalized === "completed" ? "success" : normalized === "failed" ? "error" : normalized === "processing" ? "info" : "neutral");
  const label = labels?.[status] ?? labels?.[normalized] ?? normalized.charAt(0).toUpperCase() + normalized.slice(1);
  return (
    <span {...rest} className={classNames("st-messageStatusBadge", `st-badge st-badge--${resolvedTone}`, className)}>
      <span className="st-messageStatusBadge__dot" aria-hidden="true" />
      {label}
    </span>
  );
}
