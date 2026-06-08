import { defineComponent, h } from "vue";
import { classNames } from "./classNames.js";

export type LinkProps = {
  href?: string;
  /** Style du lien ; API canonique (alignée sur le canon Svelte). */
  variant?: "inline" | "standalone" | "muted";
  /** @deprecated Raccourci pour variant="standalone". Utilisez `variant`. */
  standalone?: boolean;
  /** @deprecated Raccourci pour variant="muted". Utilisez `variant`. */
  muted?: boolean;
  disabled?: boolean;
  /** Lien externe : pose target="_blank" rel="noreferrer" (sauf target/rel explicites). */
  external?: boolean;
  class?: string;
};

export const Link = defineComponent({
  name: "Link",
  props: {
    href: { type: String, default: undefined },
    variant: { type: String as () => "inline" | "standalone" | "muted", default: "inline" },
    muted: { type: Boolean, default: false },
    standalone: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    external: { type: Boolean, default: false },
    class: { type: String, default: undefined },
  },
  setup(props, { slots, attrs }) {
    return () => {
      // `variant` est canonique ; les booléens standalone/muted sont des
      // raccourcis dépréciés (parité Svelte/React). `variant` explicite l'emporte.
      const effective =
        props.variant !== "inline"
          ? props.variant
          : props.standalone
            ? "standalone"
            : props.muted
              ? "muted"
              : "inline";
      const resolvedTarget =
        (attrs.target as string | undefined) ?? (props.external ? "_blank" : undefined);
      const resolvedRel =
        (attrs.rel as string | undefined) ?? (props.external ? "noreferrer" : undefined);
      // Retire onClick du spread : Vue fusionne sinon le handler attrs avec le
      // nôtre (tableau de listeners), ce qui rappellerait l'utilisateur même en
      // disabled. On le rappelle nous-mêmes, et seulement quand non-disabled.
      const { onClick: attrsOnClick, ...restAttrs } = attrs as Record<string, unknown>;
      return h(
        "a",
        {
          ...restAttrs,
          href: props.disabled ? undefined : props.href,
          target: resolvedTarget,
          rel: resolvedRel,
          class: classNames(
            "st-link",
            `st-link--${effective}`,
            props.disabled && "st-link--disabled",
            props.class,
          ),
          "aria-disabled": props.disabled || undefined,
          onClick: (event: MouseEvent) => {
            if (props.disabled) {
              event.preventDefault();
              return;
            }
            (attrsOnClick as ((event: MouseEvent) => void) | undefined)?.(event);
          },
        },
        slots.default?.(),
      );
    };
  },
});
