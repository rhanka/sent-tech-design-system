import { defineComponent, h, ref, watch } from "vue";
import { classNames } from "./classNames.js";

export type DashboardGridTile = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  title?: string;
  description?: string;
  value?: string;
};

export type DashboardGridProps = {
  tiles: DashboardGridTile[];
  columns?: number;
  rowHeight?: number;
  gap?: number;
  editable?: boolean;
  label?: string;
  onLayout?: (tiles: DashboardGridTile[]) => void;
  class?: string;
};

function safeColumns(value: number | undefined): number {
  return Math.max(1, Math.floor(value || 12));
}

function cloneTile(tile: DashboardGridTile): DashboardGridTile {
  return { ...tile };
}

function normalizeTile(tile: DashboardGridTile, columns: number): DashboardGridTile {
  const w = Math.max(1, Math.min(columns, Math.floor(tile.w || 1)));
  const x = Math.max(0, Math.min(columns - w, Math.floor(tile.x || 0)));
  return {
    ...tile,
    id: String(tile.id),
    x,
    y: Math.max(0, Math.floor(tile.y || 0)),
    w,
    h: Math.max(1, Math.floor(tile.h || 1)),
  };
}

function normalizeTiles(tiles: DashboardGridTile[], columns: number): DashboardGridTile[] {
  return tiles.map((tile) => normalizeTile(cloneTile(tile), columns));
}

export const DashboardGrid = defineComponent({
  name: "DashboardGrid",
  props: {
    tiles: { type: Array as () => DashboardGridTile[], required: true },
    columns: { type: Number, default: 12 },
    rowHeight: { type: Number, default: 88 },
    gap: { type: Number, default: 16 },
    editable: { type: Boolean, default: false },
    label: { type: String, default: "Dashboard grid" },
    onLayout: { type: Function as unknown as () => ((tiles: DashboardGridTile[]) => void) | undefined, default: undefined },
    class: { type: String, default: undefined },
  },
  emits: {
    layout: (_tiles: DashboardGridTile[]) => true,
  },
  setup(props, { attrs, emit }) {
    const layout = ref<DashboardGridTile[]>(normalizeTiles(props.tiles ?? [], safeColumns(props.columns)));

    watch(
      () => JSON.stringify({ tiles: props.tiles, columns: safeColumns(props.columns) }),
      () => {
        layout.value = normalizeTiles(props.tiles ?? [], safeColumns(props.columns));
      },
    );

    function commit(nextTiles: DashboardGridTile[]) {
      const normalized = normalizeTiles(nextTiles, safeColumns(props.columns));
      layout.value = normalized;
      props.onLayout?.(normalized.map(cloneTile));
      emit("layout", normalized.map(cloneTile));
    }

    function changeTile(id: string, patch: Partial<DashboardGridTile>) {
      commit(layout.value.map((tile) => (tile.id === id ? { ...tile, ...patch } : tile)));
    }

    function moveTile(id: string, dx: number, dy: number) {
      const tile = layout.value.find((candidate) => candidate.id === id);
      if (!tile) return;
      changeTile(id, { x: tile.x + dx, y: tile.y + dy });
    }

    function resizeTile(id: string, dw: number, dh: number) {
      const tile = layout.value.find((candidate) => candidate.id === id);
      if (!tile) return;
      changeTile(id, { w: tile.w + dw, h: tile.h + dh });
    }

    return () => {
      const colCount = safeColumns(props.columns);
      const style = {
        "--st-dashboardGrid-columns": String(colCount),
        "--st-dashboardGrid-row-height": `${Math.max(32, Math.floor(props.rowHeight || 88))}px`,
        "--st-dashboardGrid-gap": `${Math.max(0, Math.floor(props.gap || 0))}px`,
      };

      return h(
        "section",
        {
          ...attrs,
          class: classNames("st-dashboardGrid", props.editable ? "st-dashboardGrid--editable" : undefined, props.class),
          style,
          "aria-label": props.label ?? "Dashboard grid",
        },
        layout.value.map((tile) =>
          h(
            "article",
            {
              key: tile.id,
              class: "st-dashboardGrid__tile",
              style: `grid-column: ${tile.x + 1} / span ${tile.w}; grid-row: ${tile.y + 1} / span ${tile.h};`,
            },
            [
              h("div", { class: "st-dashboardGrid__content" }, [
                tile.title ? h("h3", { class: "st-dashboardGrid__title" }, tile.title) : null,
                tile.value ? h("p", { class: "st-dashboardGrid__value" }, tile.value) : null,
                tile.description ? h("p", { class: "st-dashboardGrid__description" }, tile.description) : null,
              ]),
              props.editable
                ? h("div", { class: "st-dashboardGrid__controls", "aria-label": `Layout controls for ${tile.title ?? tile.id}` }, [
                    h("button", { type: "button", onClick: () => moveTile(tile.id, 0, -1), "aria-label": `Move ${tile.title ?? tile.id} up` }, "↑"),
                    h("button", { type: "button", onClick: () => moveTile(tile.id, -1, 0), "aria-label": `Move ${tile.title ?? tile.id} left` }, "←"),
                    h("button", { type: "button", onClick: () => moveTile(tile.id, 1, 0), "aria-label": `Move ${tile.title ?? tile.id} right` }, "→"),
                    h("button", { type: "button", onClick: () => moveTile(tile.id, 0, 1), "aria-label": `Move ${tile.title ?? tile.id} down` }, "↓"),
                    h("button", { type: "button", onClick: () => resizeTile(tile.id, 1, 0), "aria-label": `Widen ${tile.title ?? tile.id}` }, "W+"),
                    h("button", { type: "button", onClick: () => resizeTile(tile.id, -1, 0), "aria-label": `Narrow ${tile.title ?? tile.id}` }, "W-"),
                    h("button", { type: "button", onClick: () => resizeTile(tile.id, 0, 1), "aria-label": `Taller ${tile.title ?? tile.id}` }, "H+"),
                    h("button", { type: "button", onClick: () => resizeTile(tile.id, 0, -1), "aria-label": `Shorter ${tile.title ?? tile.id}` }, "H-"),
                  ])
                : null,
            ],
          ),
        ),
      );
    };
  },
});
