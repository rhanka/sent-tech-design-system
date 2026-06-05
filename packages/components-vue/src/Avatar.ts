import { defineComponent, h } from "vue";
import { classNames } from "./classNames.js";
import { deriveInitials } from "./Header.js";

export type AvatarSize = "sm" | "md" | "lg" | "xl";
export type AvatarShape = "circle" | "square";
export type AvatarTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type AvatarProps = {
  /** Nom complet, utilisé pour dériver les initiales et l'étiquette a11y. */
  name: string;
  /** URL de la photo. Si absente, on rend un cercle d'initiales. */
  src?: string;
  /** Texte alternatif de l'image. Par défaut = `name`. */
  alt?: string;
  size?: AvatarSize;
  shape?: AvatarShape;
  /** Catégorie de couleur pour le fond des initiales. */
  tone?: AvatarTone;
  class?: string;
};

export const Avatar = defineComponent({
  name: "Avatar",
  props: {
    name: { type: String, required: true },
    src: { type: String, default: undefined },
    alt: { type: String, default: undefined },
    size: { type: String as () => AvatarSize, default: "md" },
    shape: { type: String as () => AvatarShape, default: "circle" },
    tone: { type: String as () => AvatarTone, default: "category1" },
    class: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    return () => {
      const initials = deriveInitials(props.name);
      const classes = classNames(
        "st-avatar",
        `st-avatar--${props.size}`,
        `st-avatar--${props.shape}`,
        props.src ? "st-avatar--image" : `st-avatar--${props.tone}`,
        props.class,
      );
      return h(
        "span",
        {
          ...attrs,
          class: classes,
          role: "img",
          "aria-label": props.alt ?? props.name,
        },
        [
          props.src
            ? h("img", {
                class: "st-avatar__image",
                src: props.src,
                alt: props.alt ?? props.name,
              })
            : h(
                "span",
                { class: "st-avatar__initials", "aria-hidden": "true" },
                initials,
              ),
        ],
      );
    };
  },
});
