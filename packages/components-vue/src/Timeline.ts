import { defineComponent, h } from "vue";
import type { PropType } from "vue";
import { classNames } from "./classNames.js";

export type TimelineTone = "neutral" | "info" | "success" | "warning" | "danger";

export type TimelineOrientation = "vertical" | "horizontal";

export type TimelineItem = {
  title: string;
  meta?: string;
  description?: string;
  tone?: TimelineTone;
};

export type TimelineProps = {
  items: TimelineItem[];
  orientation?: TimelineOrientation;
  class?: string;
};

/**
 * Timeline — liste d'événements datés reliés par une ligne de connexion (façon
 * Ant Design / MUI Timeline). Sémantique <ol>/<li>, pastilles aria-hidden, style
 * token-only. Distinct de TimelineChart (dataviz à échelle temporelle).
 */
export const Timeline = defineComponent({
  name: "Timeline",
  props: {
    items: { type: Array as PropType<TimelineItem[]>, required: true },
    orientation: { type: String as PropType<TimelineOrientation>, default: "vertical" },
    class: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    return () => {
      const orientation = props.orientation ?? "vertical";
      const items = Array.isArray(props.items) ? props.items : [];

      return h(
        "ol",
        {
          ...attrs,
          class: classNames("st-timeline", `st-timeline--${orientation}`, props.class),
        },
        items.map((item, i) =>
          h(
            "li",
            {
              key: i,
              class: classNames(
                "st-timeline__item",
                `st-timeline__item--${item.tone ?? "neutral"}`,
              ),
            },
            [
              h("span", { class: "st-timeline__rail", "aria-hidden": "true" }, [
                h("span", { class: "st-timeline__dot" }),
                h("span", { class: "st-timeline__line" }),
              ]),
              h("div", { class: "st-timeline__content" }, [
                item.meta ? h("span", { class: "st-timeline__meta" }, item.meta) : null,
                h("span", { class: "st-timeline__title" }, item.title),
                item.description
                  ? h("span", { class: "st-timeline__description" }, item.description)
                  : null,
              ]),
            ],
          ),
        ),
      );
    };
  },
});
