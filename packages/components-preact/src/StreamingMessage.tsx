import type { HTMLAttributes } from "preact";
import { classNames } from "./classNames.js";
import type { ChatMessageStatus } from "./ChatMessage.js";
import type { ComponentChildren } from "./runtime.js";

export type StreamingMessageEvent = {
  id: string;
  label: ComponentChildren;
  text?: ComponentChildren;
  status?: ChatMessageStatus;
};
export type StreamingMessageMode = "live" | "passive";
export type StreamingMessageProps = HTMLAttributes<HTMLElement> & {
  text?: ComponentChildren;
  events?: StreamingMessageEvent[];
  mode?: StreamingMessageMode;
  placeholder?: ComponentChildren;
};

export function StreamingMessage({
  text: messageText,
  events = [],
  mode = "live",
  placeholder = "Streaming en cours…",
  className,
  ...rest
}: StreamingMessageProps) {
  const isEmpty = messageText == null || messageText === "";
  return (
    <section {...rest} className={classNames("st-streamingMessage", `st-streamingMessage--${mode}`, className)}>
      <p className={classNames("st-streamingMessage__text", isEmpty && "st-streamingMessage__text--muted")}>
        {isEmpty ? placeholder : messageText}
      </p>
      {events.length > 0 ? (
        <ul className="st-streamingMessage__trailList">
          {events.map((event) => (
            <li key={event.id}>{event.label}</li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
