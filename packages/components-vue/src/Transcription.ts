import { defineComponent, h } from "vue";
import { classNames } from "./classNames.js";

export type TranscriptionSegment = {
  speaker?: string;
  startTime?: string;
  endTime?: string;
  text: string;
};

export type TranscriptionProps = {
  title?: string;
  segments?: TranscriptionSegment[];
  text?: string;
  class?: string;
  open?: boolean;
  showTimestamps?: boolean;
};

export const Transcription = defineComponent({
  name: "Transcription",
  props: {
    title: { type: String, default: "Transcription" },
    segments: { type: Array as () => TranscriptionSegment[], default: undefined },
    text: { type: String, default: undefined },
    open: { type: Boolean, default: false },
    showTimestamps: { type: Boolean, default: true },
    class: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    const formatInterval = (segment: TranscriptionSegment) => {
      if (!props.showTimestamps || (!segment.startTime && !segment.endTime)) return "";
      if (!segment.startTime) return segment.endTime ? `- ${segment.endTime}` : "";
      if (!segment.endTime) return `${segment.startTime} -`;
      return `${segment.startTime} - ${segment.endTime}`;
    };

    return () => {
      const resolvedSegments = (props.segments ?? []).filter((segment) => Boolean(segment.text?.trim()));
      const hasSegments = resolvedSegments.length > 0;
      const hasText = Boolean(props.text && props.text.trim().length);

      let content;
      if (hasSegments) {
        content = h(
          "ol",
          { class: "st-transcription__list" },
          resolvedSegments.map((segment, index) => {
            const interval = formatInterval(segment);
            return h("li", { key: index, class: "st-transcription__item" }, [
              h("p", { class: "st-transcription__meta" }, [
                segment.speaker ? h("span", { class: "st-transcription__speaker" }, segment.speaker) : null,
                segment.speaker && interval ? h("span", { "aria-hidden": "true" }, " • ") : null,
                interval
                  ? h("time", null, [
                      h("span", { class: "st-transcription__sr-only" }, `Horodatage ${interval}`),
                      h("span", { "aria-hidden": "true" }, interval),
                    ])
                  : null,
              ]),
              h("p", { class: "st-transcription__text" }, segment.text),
            ]);
          }),
        );
      } else if (hasText) {
        content = h("p", { class: "st-transcription__text" }, props.text);
      } else {
        content = h("p", { class: "st-transcription__text" }, "Aucun contenu de transcription fourni.");
      }

      return h("details", { ...attrs, open: props.open, class: classNames("st-transcription", props.class) }, [
        h("summary", null, props.title),
        h("div", { class: "st-transcription__content" }, content),
      ]);
    };
  },
});
