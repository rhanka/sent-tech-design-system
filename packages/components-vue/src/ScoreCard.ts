import { defineComponent, h, type PropType, type VNode } from "vue";
import { classNames } from "./classNames.js";

export type ScoreCardType = "value" | "complexity";
export type ScoreCardSize = "sm" | "md" | "lg";

export type ScoreCardProps = {
  title: string;
  score: number;
  stars: number;
  max?: number;
  type?: ScoreCardType;
  unit?: string;
  size?: ScoreCardSize;
  class?: string;
};

const STAR_PATH =
  "m7 1.5 1.7 3.45 3.8.55-2.75 2.68.65 3.79L7 10.18 3.6 11.96l.65-3.79L1.5 5.5l3.8-.55L7 1.5Z";
const CROSS_PATH = "M3.5 3.5l7 7M10.5 3.5l-7 7";

export const ScoreCard = defineComponent({
  name: "ScoreCard",
  props: {
    title: { type: String, required: true },
    score: { type: Number, required: true },
    stars: { type: Number, required: true },
    max: { type: Number, default: 5 },
    type: { type: String as PropType<ScoreCardType>, default: "value" },
    unit: { type: String, default: "points" },
    size: { type: String as PropType<ScoreCardSize>, default: "md" },
    class: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    return () => {
      const max = props.max ?? 5;
      const type = props.type ?? "value";
      const unit = props.unit ?? "points";
      const size = props.size ?? "md";
      const filled = Math.max(0, Math.min(max, Math.round(props.stars)));
      const ariaLabel = `${props.title}, ${props.score.toFixed(1)} ${unit}, ${filled} sur ${max}`;

      const symbols: VNode[] = Array.from({ length: max }, (_unused, i) => {
        const on = i < filled;
        const path =
          type === "value"
            ? h("path", {
                d: STAR_PATH,
                fill: on ? "currentColor" : "none",
                stroke: "currentColor",
                "stroke-width": "1",
                "stroke-linejoin": "round",
              })
            : h("path", {
                d: CROSS_PATH,
                fill: "none",
                stroke: "currentColor",
                "stroke-width": "1.75",
                "stroke-linecap": "round",
              });
        return h(
          "svg",
          {
            key: i,
            class: classNames(
              "st-scoreCard__symbol",
              on ? "st-scoreCard__symbol--on" : "st-scoreCard__symbol--off",
            ),
            width: "20",
            height: "20",
            viewBox: "0 0 14 14",
            focusable: "false",
          },
          [path],
        );
      });

      return h(
        "article",
        {
          ...attrs,
          class: classNames(
            "st-scoreCard",
            `st-scoreCard--${size}`,
            `st-scoreCard--${type}`,
            props.class,
          ),
          role: "group",
          "aria-label": ariaLabel,
        },
        [
          h("h3", { class: "st-scoreCard__title" }, props.title),
          h("div", { class: "st-scoreCard__row" }, [
            h("div", { class: "st-scoreCard__symbols", "aria-hidden": "true" }, symbols),
            h("span", { class: "st-scoreCard__score" }, `${props.score.toFixed(1)} ${unit}`),
          ]),
        ],
      );
    };
  },
});
