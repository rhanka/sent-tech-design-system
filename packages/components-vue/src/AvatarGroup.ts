import { defineComponent, h } from "vue";
import type { CSSProperties } from "vue";
import { classNames } from "./classNames.js";
import type { AvatarSize } from "./Avatar.js";

export type AvatarGroupProps = {
  /** Nombre maximum d'avatars visibles. Au-delà, un jeton « +N » est affiché. */
  max?: number;
  /** Taille appliquée au jeton de débordement (doit refléter les Avatar). */
  size?: AvatarSize;
  /** Nombre total réel d'éléments (sert à calculer le « +N » si > max). */
  total?: number;
  class?: string;
};

export const AvatarGroup = defineComponent({
  name: "AvatarGroup",
  props: {
    max: { type: Number, default: undefined },
    size: { type: String as () => AvatarSize, default: "md" },
    total: { type: Number, default: undefined },
    class: { type: String, default: undefined },
  },
  setup(props, { slots, attrs }) {
    return () => {
      const overflow =
        props.max != null && props.total != null && props.total > props.max
          ? props.total - props.max
          : 0;
      const classes = classNames(
        "st-avatarGroup",
        `st-avatarGroup--${props.size}`,
        props.class,
      );
      const style: CSSProperties = {
        ...(attrs.style as CSSProperties | undefined),
        ["--st-avatar-group-max" as string]: props.max ?? "",
      };
      return h(
        "div",
        {
          ...attrs,
          class: classes,
          style,
        },
        [
          slots.default?.(),
          overflow > 0
            ? h(
                "span",
                {
                  class: "st-avatarGroup__overflow",
                  "aria-label": `+${overflow}`,
                },
                `+${overflow}`,
              )
            : null,
        ],
      );
    };
  },
});
