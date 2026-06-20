import { defineComponent, h, type PropType } from "vue";
import { classNames } from "./classNames.js";

export type KanbanBoardCard = {
  id: string;
  title: string;
  subtitle?: string;
  owner?: string;
  badgeLabel?: string;
  badgeTone?: string;
};

export type KanbanBoardColumn = { label: string; cards: KanbanBoardCard[] };

export type KanbanBoardProps = {
  columns: KanbanBoardColumn[];
  class?: string;
};

export const KanbanBoard = defineComponent({
  name: "KanbanBoard",
  props: {
    columns: { type: Array as PropType<KanbanBoardColumn[]>, required: true },
    class: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    return () =>
      h("div", { ...attrs, class: classNames("st-kb", props.class) }, [
        h(
          "div",
          { class: "st-kb__board" },
          (props.columns ?? []).map((col, ci) =>
            h("div", { key: ci, class: "st-kb__column" }, [
              h("div", { class: "st-kb__column-head" }, [
                h("span", { class: "st-kb__column-label" }, col.label),
                h("span", { class: "st-kb__column-count" }, String(col.cards.length)),
              ]),
              h(
                "div",
                { class: "st-kb__column-body" },
                col.cards.map((card) =>
                  h("div", { key: card.id, class: "st-kb__card" }, [
                    h("div", { class: "st-kb__card-header" }, [
                      h("span", { class: "st-kb__card-title" }, card.title),
                      card.badgeLabel
                        ? h(
                            "span",
                            {
                              class: classNames(
                                "st-badge",
                                card.badgeTone ? `st-badge--${card.badgeTone}` : undefined,
                              ),
                            },
                            card.badgeLabel,
                          )
                        : null,
                    ]),
                    card.subtitle ? h("p", { class: "st-kb__card-subtitle" }, card.subtitle) : null,
                    card.owner ? h("span", { class: "st-kb__card-owner" }, card.owner) : null,
                  ]),
                ),
              ),
            ]),
          ),
        ),
      ]);
  },
});
