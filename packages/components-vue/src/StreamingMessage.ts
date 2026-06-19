import { defineComponent, h } from "vue";
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
  class?: string;
};

export const StreamingMessage = defineComponent({
  name: "StreamingMessage",
  props: {
    text: { type: [String, Object] as unknown as () => unknown, default: undefined },
    events: { type: Array as () => StreamingMessageEvent[], default: () => [] },
    mode: { type: String as () => StreamingMessageMode, default: "live" },
    placeholder: { type: [String, Object] as unknown as () => unknown, default: "Streaming en cours…" },
    class: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    return () => {
      const mode = props.mode ?? "live";
      const events = props.events ?? [];
      return h(
        "section",
        {
          ...attrs,
          class: classNames("st-streamingMessage", `st-streamingMessage--${mode}`, props.class),
        },
        [
          ((): ReturnType<typeof h> => {
            const isEmpty = props.text == null || props.text === "";
            return h(
              "p",
              { class: classNames("st-streamingMessage__text", isEmpty && "st-streamingMessage__text--muted") },
              (isEmpty ? props.placeholder : props.text) as string | undefined,
            );
          })(),
          ...(events.length > 0
            ? [
                h(
                  "ul",
                  { class: "st-streamingMessage__trailList" },
                  events.map((event) => h("li", { key: event.id }, event.label as string)),
                ),
              ]
            : []),
        ],
      );
    };
  },
});
