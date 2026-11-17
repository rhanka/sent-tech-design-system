import type { HTMLAttributes } from "preact";
import { useEffect, useRef } from "preact/hooks";
import { ChatMessage } from "./ChatMessage.js";
import type { ChatMessageRole, ChatMessageStatus } from "./ChatMessage.js";
import { classNames } from "./classNames.js";
import type { ComponentChildren } from "./runtime.js";
import { useValue } from "./signals.js";
import type { MaybeSignal } from "./signals.js";

export type ChatThreadProps = Omit<HTMLAttributes<HTMLElement>, "className"> & {
  label?: string;
  autoScroll?: MaybeSignal<boolean>;
  messages?: MaybeSignal<Array<{ id: string; role?: ChatMessageRole; content: ComponentChildren; status?: ChatMessageStatus }>>;
  emptyLabel?: ComponentChildren;
  emptyState?: ComponentChildren;
  /** A signal is accepted in the Preact build; the React emission keeps `string`. */
  className?: MaybeSignal<string>;
};

export function ChatThread({
  label,
  autoScroll: autoScrollInput = true,
  messages: messagesInput,
  emptyLabel,
  emptyState,
  children,
  className,
  ...rest
}: ChatThreadProps) {
  const autoScroll = useValue(autoScrollInput);
  const messages = useValue(messagesInput);
  const sectionRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!autoScroll) return;
    const node = sectionRef.current;
    if (!node) return;
    const scrollToBottom = () => {
      node.scrollTop = node.scrollHeight;
    };
    scrollToBottom();
    const observer = new MutationObserver(scrollToBottom);
    observer.observe(node, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [autoScroll, messages, children]);
  const hasContent = Boolean(messages?.length) || Boolean(children);
  const empty = emptyState ?? emptyLabel;
  return (
    <section
      {...rest}
      ref={sectionRef}
      className={classNames("st-chatThread", className)}
      role="log"
      aria-label={label ?? (rest as Record<string, string | undefined>)["aria-label"] ?? "Chat thread"}
      aria-live="polite"
      aria-relevant="additions text"
    >
      <div className="st-chatThread__list">
        {messages?.length
          ? messages.map((message) => (
              <ChatMessage key={message.id} role={message.role} status={message.status} content={message.content} />
            ))
          : children}
      </div>
      {!hasContent && empty != null ? <div className="st-chatThread__empty">{empty}</div> : null}
    </section>
  );
}
