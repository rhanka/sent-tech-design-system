import type { HTMLAttributes } from "preact";
import { classNames } from "./classNames.js";
import type { ComponentChildren } from "./runtime.js";
import type { MaybeSignal } from "./signals.js";

export type ChatMessageRole = "user" | "assistant" | "system" | "tool";
export type ChatMessageStatus = "pending" | "processing" | "completed" | "failed" | "idle" | "streaming" | "error" | "sent";

export type ChatMessageProps = Omit<HTMLAttributes<HTMLElement>, "content" | "role" | "className"> & {
  role?: ChatMessageRole;
  status?: ChatMessageStatus;
  content?: ComponentChildren;
  timestamp?: ComponentChildren;
  footer?: ComponentChildren;
  actions?: ComponentChildren;
  avatar?: ComponentChildren;
  /** A signal is accepted in the Preact build; the React emission keeps `string`. */
  className?: MaybeSignal<string>;
};

export function ChatMessage({
  role = "assistant",
  status = "completed",
  content,
  timestamp,
  footer,
  actions,
  avatar,
  children,
  className,
  ...rest
}: ChatMessageProps) {
  const normalizedStatus = status === "idle" || status === "streaming" ? "processing" : status === "error" ? "failed" : status;
  const isStreaming = normalizedStatus === "processing";
  const alignment = role === "user" ? "end" : "start";
  return (
    <article
      {...rest}
      className={classNames("st-chatMessage", `st-chatMessage--${role}`, normalizedStatus && `st-chatMessage--${normalizedStatus}`, className)}
      data-role={role}
      data-status={normalizedStatus}
      data-align={alignment}
      aria-live={isStreaming ? "polite" : undefined}
    >
      {avatar ? (
        <div className="st-chatMessage__avatar" aria-hidden="true">
          {avatar}
        </div>
      ) : null}
      <div className="st-chatMessage__body">
        <div className="st-chatMessage__bubble">
          <div className="st-chatMessage__content">{children ?? content}</div>
          {isStreaming ? <span className="st-chatMessage__pulse" aria-hidden="true" /> : null}
        </div>
        {footer || timestamp ? (
          <div className="st-chatMessage__footer">
            {footer ?? <span className="st-chatMessage__timestamp">{timestamp}</span>}
          </div>
        ) : null}
        {actions ? <div className="st-chatMessage__actions">{actions}</div> : null}
      </div>
    </article>
  );
}
