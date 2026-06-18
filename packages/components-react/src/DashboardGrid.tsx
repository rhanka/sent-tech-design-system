import React from "react";
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

export type DashboardGridProps = Omit<React.HTMLAttributes<HTMLElement>, "className"> & {
  tiles: DashboardGridTile[];
  columns?: number;
  rowHeight?: number;
  gap?: number;
  editable?: boolean;
  label?: string;
  onLayout?: (tiles: DashboardGridTile[]) => void;
  className?: string;
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

export function DashboardGrid({
  tiles,
  columns = 12,
  rowHeight = 88,
  gap = 16,
  editable = false,
  label = "Dashboard grid",
  onLayout,
  className,
  style,
  ...rest
}: DashboardGridProps) {
  const colCount = safeColumns(columns);
  const inputKey = React.useMemo(() => JSON.stringify({ tiles, columns: colCount }), [tiles, colCount]);
  const [layout, setLayout] = React.useState(() => normalizeTiles(tiles, colCount));

  React.useEffect(() => {
    setLayout(normalizeTiles(tiles, colCount));
  }, [inputKey, tiles, colCount]);

  function commit(nextTiles: DashboardGridTile[]) {
    const normalized = normalizeTiles(nextTiles, colCount);
    setLayout(normalized);
    onLayout?.(normalized.map(cloneTile));
  }

  function changeTile(id: string, patch: Partial<DashboardGridTile>) {
    commit(layout.map((tile) => (tile.id === id ? { ...tile, ...patch } : tile)));
  }

  function moveTile(id: string, dx: number, dy: number) {
    const tile = layout.find((candidate) => candidate.id === id);
    if (!tile) return;
    changeTile(id, { x: tile.x + dx, y: tile.y + dy });
  }

  function resizeTile(id: string, dw: number, dh: number) {
    const tile = layout.find((candidate) => candidate.id === id);
    if (!tile) return;
    changeTile(id, { w: tile.w + dw, h: tile.h + dh });
  }

  const gridStyle = {
    ...style,
    "--st-dashboardGrid-columns": String(colCount),
    "--st-dashboardGrid-row-height": `${Math.max(32, Math.floor(rowHeight || 88))}px`,
    "--st-dashboardGrid-gap": `${Math.max(0, Math.floor(gap || 0))}px`,
  } as React.CSSProperties;

  return (
    <section {...rest} className={classNames("st-dashboardGrid", editable ? "st-dashboardGrid--editable" : undefined, className)} style={gridStyle} aria-label={label}>
      {layout.map((tile) => (
        <article
          key={tile.id}
          className="st-dashboardGrid__tile"
          style={{ gridColumn: `${tile.x + 1} / span ${tile.w}`, gridRow: `${tile.y + 1} / span ${tile.h}` }}
        >
          <div className="st-dashboardGrid__content">
            {tile.title ? <h3 className="st-dashboardGrid__title">{tile.title}</h3> : null}
            {tile.value ? <p className="st-dashboardGrid__value">{tile.value}</p> : null}
            {tile.description ? <p className="st-dashboardGrid__description">{tile.description}</p> : null}
          </div>

          {editable ? (
            <div className="st-dashboardGrid__controls" aria-label={`Layout controls for ${tile.title ?? tile.id}`}>
              <button type="button" onClick={() => moveTile(tile.id, 0, -1)} aria-label={`Move ${tile.title ?? tile.id} up`}>↑</button>
              <button type="button" onClick={() => moveTile(tile.id, -1, 0)} aria-label={`Move ${tile.title ?? tile.id} left`}>←</button>
              <button type="button" onClick={() => moveTile(tile.id, 1, 0)} aria-label={`Move ${tile.title ?? tile.id} right`}>→</button>
              <button type="button" onClick={() => moveTile(tile.id, 0, 1)} aria-label={`Move ${tile.title ?? tile.id} down`}>↓</button>
              <button type="button" onClick={() => resizeTile(tile.id, 1, 0)} aria-label={`Widen ${tile.title ?? tile.id}`}>W+</button>
              <button type="button" onClick={() => resizeTile(tile.id, -1, 0)} aria-label={`Narrow ${tile.title ?? tile.id}`}>W-</button>
              <button type="button" onClick={() => resizeTile(tile.id, 0, 1)} aria-label={`Taller ${tile.title ?? tile.id}`}>H+</button>
              <button type="button" onClick={() => resizeTile(tile.id, 0, -1)} aria-label={`Shorter ${tile.title ?? tile.id}`}>H-</button>
            </div>
          ) : null}
        </article>
      ))}
    </section>
  );
}
