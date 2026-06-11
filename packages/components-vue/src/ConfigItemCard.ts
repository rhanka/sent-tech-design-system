import { defineComponent, h, type PropType, type VNode } from "vue";
import { classNames } from "./classNames.js";

export type ConfigItemSourceLevel = "code" | "admin" | "user";

export type ConfigItem = {
  id: string;
  name: string;
  key?: string;
  description?: string | null;
  /** Provenance : `code`/`admin` = système (verrouillé), `user` = personnalisé. */
  sourceLevel: ConfigItemSourceLevel;
  /** Identifiant du parent si l'item est une copie d'un défaut système. */
  parentId?: string | null;
  version?: number;
};

export type ConfigItemCardProps = {
  item: ConfigItem;
  hasCopy?: boolean;
  onCopy?: (id: string) => void;
  onEdit?: (id: string) => void;
  onReset?: (id: string) => void;
  onDelete?: (id: string) => void;
  disabled?: boolean;
  class?: string;
};

function icon(path: string): VNode {
  return h(
    "svg",
    { width: "16", height: "16", viewBox: "0 0 16 16", "aria-hidden": "true", focusable: "false" },
    [
      h("path", {
        d: path,
        fill: "none",
        stroke: "currentColor",
        "stroke-width": "1.25",
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
      }),
    ],
  );
}

export const ConfigItemCard = defineComponent({
  name: "ConfigItemCard",
  props: {
    item: { type: Object as PropType<ConfigItem>, required: true },
    hasCopy: { type: Boolean, default: false },
    onCopy: { type: Function as PropType<(id: string) => void>, default: undefined },
    onEdit: { type: Function as PropType<(id: string) => void>, default: undefined },
    onReset: { type: Function as PropType<(id: string) => void>, default: undefined },
    onDelete: { type: Function as PropType<(id: string) => void>, default: undefined },
    disabled: { type: Boolean, default: false },
    class: { type: String, default: undefined },
  },
  setup(props, { attrs, slots }) {
    return () => {
      const item = props.item;
      const isSystem = item.sourceLevel === "code" || item.sourceLevel === "admin";
      const isCopied = item.sourceLevel === "user" && !!item.parentId;
      const isUserCreated = item.sourceLevel === "user" && !item.parentId;

      const showCopy = isSystem && !props.hasCopy && !!props.onCopy;
      const showEdit = (isCopied || isUserCreated) && !!props.onEdit;
      const showReset = isCopied && !!props.onReset;
      const showDelete = isUserCreated && !!props.onDelete;

      const headerChildren: VNode[] = [
        h("span", { class: "st-configItemCard__name" }, item.name),
      ];
      if (isSystem) {
        headerChildren.push(
          h("span", { class: "st-configItemCard__badge st-configItemCard__badge--system" }, [
            h(
              "svg",
              {
                class: "st-configItemCard__badgeIcon",
                width: "12",
                height: "12",
                viewBox: "0 0 14 14",
                "aria-hidden": "true",
                focusable: "false",
              },
              [
                h("path", {
                  d: "M4 6V4.5a3 3 0 0 1 6 0V6M3.5 6h7A1.5 1.5 0 0 1 12 7.5v3A1.5 1.5 0 0 1 10.5 12h-7A1.5 1.5 0 0 1 2 10.5v-3A1.5 1.5 0 0 1 3.5 6Z",
                  fill: "none",
                  stroke: "currentColor",
                  "stroke-width": "1.25",
                  "stroke-linecap": "round",
                  "stroke-linejoin": "round",
                }),
              ],
            ),
            "Système",
          ]),
        );
      } else if (isCopied) {
        headerChildren.push(
          h(
            "span",
            { class: "st-configItemCard__badge st-configItemCard__badge--custom" },
            "Personnalisé",
          ),
        );
      }

      const children: VNode[] = [
        h("div", { class: "st-configItemCard__header" }, headerChildren),
      ];

      if (item.key) {
        children.push(h("div", { class: "st-configItemCard__key" }, item.key));
      }
      if (item.description) {
        children.push(h("p", { class: "st-configItemCard__description" }, item.description));
      }

      if (showCopy || showEdit || showReset || showDelete) {
        const actions: VNode[] = [];
        if (showCopy) {
          actions.push(
            h(
              "button",
              {
                type: "button",
                class: "st-configItemCard__action",
                title: "Copier",
                "aria-label": "Copier",
                disabled: props.disabled,
                onClick: () => props.onCopy?.(item.id),
              },
              [
                icon(
                  "M5.5 5.5V3.75A1.25 1.25 0 0 1 6.75 2.5h5.5A1.25 1.25 0 0 1 13.5 3.75v5.5a1.25 1.25 0 0 1-1.25 1.25H10.5M3.75 5.5h5.5A1.25 1.25 0 0 1 10.5 6.75v5.5a1.25 1.25 0 0 1-1.25 1.25h-5.5A1.25 1.25 0 0 1 2.5 12.25v-5.5A1.25 1.25 0 0 1 3.75 5.5Z",
                ),
              ],
            ),
          );
        }
        if (showEdit) {
          actions.push(
            h(
              "button",
              {
                type: "button",
                class: "st-configItemCard__action",
                title: "Éditer",
                "aria-label": "Éditer",
                disabled: props.disabled,
                onClick: () => props.onEdit?.(item.id),
              },
              [icon("m10.5 2.5 3 3L6 13l-3.5.5L3 10l7.5-7.5Z")],
            ),
          );
        }
        if (showReset) {
          actions.push(
            h(
              "button",
              {
                type: "button",
                class: "st-configItemCard__action st-configItemCard__action--warning",
                title: "Réinitialiser",
                "aria-label": "Réinitialiser",
                disabled: props.disabled,
                onClick: () => props.onReset?.(item.id),
              },
              [icon("M3 8a5 5 0 1 1 1.5 3.5M3 8V5M3 8h3")],
            ),
          );
        }
        if (showDelete) {
          actions.push(
            h(
              "button",
              {
                type: "button",
                class: "st-configItemCard__action st-configItemCard__action--danger",
                title: "Supprimer",
                "aria-label": "Supprimer",
                disabled: props.disabled,
                onClick: () => props.onDelete?.(item.id),
              },
              [
                icon(
                  "M3 4.5h10M6 4.5V3.25A.75.75 0 0 1 6.75 2.5h2.5a.75.75 0 0 1 .75.75V4.5M4.25 4.5l.5 8A1 1 0 0 0 5.75 13.5h4.5a1 1 0 0 0 1-.99l.5-8",
                ),
              ],
            ),
          );
        }
        children.push(h("div", { class: "st-configItemCard__actions" }, actions));
      }

      const slotContent = slots.default?.();
      if (slotContent) {
        children.push(...slotContent);
      }

      return h(
        "article",
        {
          ...attrs,
          class: classNames("st-configItemCard", props.class),
          "data-testid": `config-item-card-${item.key ?? item.id}`,
        },
        children,
      );
    };
  },
});
