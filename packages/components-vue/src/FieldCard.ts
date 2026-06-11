import { defineComponent, h, type PropType, type VNode } from "vue";
import { classNames } from "./classNames.js";

export type FieldCardVariant = "plain" | "bordered" | "accent";
export type FieldCardTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type FieldCardProps = {
  label: string;
  variant?: FieldCardVariant;
  tone?: FieldCardTone;
  commentCount?: number;
  onOpenComments?: () => void;
  class?: string;
};

const COMMENT_PATH =
  "M2.5 4.25A1.25 1.25 0 0 1 3.75 3h8.5A1.25 1.25 0 0 1 13.5 4.25v5A1.25 1.25 0 0 1 12.25 10.5H6.5L3.5 13v-2.5h-.75A.25.25 0 0 1 2.5 10.25v-6Z";

function commentIcon(): VNode {
  return h(
    "svg",
    { width: "14", height: "14", viewBox: "0 0 16 16", "aria-hidden": "true", focusable: "false" },
    [
      h("path", {
        d: COMMENT_PATH,
        fill: "none",
        stroke: "currentColor",
        "stroke-width": "1.25",
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
      }),
    ],
  );
}

export const FieldCard = defineComponent({
  name: "FieldCard",
  props: {
    label: { type: String, required: true },
    variant: { type: String as PropType<FieldCardVariant>, default: "bordered" },
    tone: { type: String as PropType<FieldCardTone>, default: undefined },
    commentCount: { type: Number, default: 0 },
    onOpenComments: { type: Function as PropType<() => void>, default: undefined },
    class: { type: String, default: undefined },
  },
  setup(props, { attrs, slots }) {
    return () => {
      const variant = props.variant ?? "bordered";
      const showBadge = props.commentCount > 0 || !!props.onOpenComments;

      const headerChildren: VNode[] = [
        h("h3", { class: "st-fieldCard__label" }, props.label),
      ];

      if (showBadge) {
        if (props.onOpenComments) {
          const badgeChildren: VNode[] = [commentIcon()];
          if (props.commentCount > 0) {
            badgeChildren.push(
              h("span", { class: "st-fieldCard__commentCount" }, String(props.commentCount)),
            );
          }
          headerChildren.push(
            h(
              "button",
              {
                type: "button",
                class: "st-fieldCard__comments",
                "aria-label": `Commentaires (${props.commentCount})`,
                onClick: () => props.onOpenComments?.(),
              },
              badgeChildren,
            ),
          );
        } else {
          headerChildren.push(
            h(
              "span",
              { class: "st-fieldCard__comments st-fieldCard__comments--static" },
              [
                commentIcon(),
                h("span", { class: "st-fieldCard__commentCount" }, String(props.commentCount)),
              ],
            ),
          );
        }
      }

      return h(
        "section",
        {
          ...attrs,
          class: classNames(
            "st-fieldCard",
            `st-fieldCard--${variant}`,
            variant === "accent" && props.tone && `st-fieldCard--${props.tone}`,
            props.class,
          ),
        },
        [
          h("header", { class: "st-fieldCard__header" }, headerChildren),
          h("div", { class: "st-fieldCard__body" }, slots.default?.()),
        ],
      );
    };
  },
});
