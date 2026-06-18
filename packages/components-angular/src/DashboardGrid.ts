import { NgFor, NgIf } from "@angular/common";
import { Component, EventEmitter, Input as NgInput, OnChanges, Output as NgOutput, SimpleChanges } from "@angular/core";

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

@Component({
  selector: "st-dashboard-grid",
  standalone: true,
  imports: [NgFor, NgIf],
  template: `
    <section [attr.data-st-component]="componentName" [class]="hostClass" [attr.style]="styleText" [attr.aria-label]="label || 'Dashboard grid'">
      <article *ngFor="let tile of layout" class="st-dashboardGrid__tile" [attr.style]="tileStyle(tile)">
        <div class="st-dashboardGrid__content">
          <h3 *ngIf="tile.title" class="st-dashboardGrid__title">{{ tile.title }}</h3>
          <p *ngIf="tile.value" class="st-dashboardGrid__value">{{ tile.value }}</p>
          <p *ngIf="tile.description" class="st-dashboardGrid__description">{{ tile.description }}</p>
        </div>

        <div *ngIf="editable" class="st-dashboardGrid__controls" [attr.aria-label]="'Layout controls for ' + tileLabel(tile)">
          <button type="button" (click)="moveTile(tile.id, 0, -1)" [attr.aria-label]="'Move ' + tileLabel(tile) + ' up'">↑</button>
          <button type="button" (click)="moveTile(tile.id, -1, 0)" [attr.aria-label]="'Move ' + tileLabel(tile) + ' left'">←</button>
          <button type="button" (click)="moveTile(tile.id, 1, 0)" [attr.aria-label]="'Move ' + tileLabel(tile) + ' right'">→</button>
          <button type="button" (click)="moveTile(tile.id, 0, 1)" [attr.aria-label]="'Move ' + tileLabel(tile) + ' down'">↓</button>
          <button type="button" (click)="resizeTile(tile.id, 1, 0)" [attr.aria-label]="'Widen ' + tileLabel(tile)">W+</button>
          <button type="button" (click)="resizeTile(tile.id, -1, 0)" [attr.aria-label]="'Narrow ' + tileLabel(tile)">W-</button>
          <button type="button" (click)="resizeTile(tile.id, 0, 1)" [attr.aria-label]="'Taller ' + tileLabel(tile)">H+</button>
          <button type="button" (click)="resizeTile(tile.id, 0, -1)" [attr.aria-label]="'Shorter ' + tileLabel(tile)">H-</button>
        </div>
      </article>
    </section>
  `,
})
export class DashboardGrid implements OnChanges {
  static readonly stComponentName = "DashboardGrid";
  readonly componentName = "DashboardGrid";
  @NgInput() tiles: DashboardGridTile[] = [];
  @NgInput() columns?: number;
  @NgInput() rowHeight?: number;
  @NgInput() gap?: number;
  @NgInput() editable?: boolean;
  @NgInput() label?: string;
  @NgInput() onLayout?: (tiles: DashboardGridTile[]) => void;
  @NgInput("class") classInput?: string;
  @NgOutput() layoutChange = new EventEmitter<DashboardGridTile[]>();

  private localTiles: DashboardGridTile[] = [];
  private hasLocalLayout = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["tiles"] && !changes["tiles"].firstChange) {
      this.hasLocalLayout = false;
      this.localTiles = [];
    }
  }

  get safeColumns(): number {
    return safeColumns(this.columns);
  }

  get layout(): DashboardGridTile[] {
    return normalizeTiles(this.hasLocalLayout ? this.localTiles : this.tiles ?? [], this.safeColumns);
  }

  get hostClass(): string {
    return classNames("st-dashboardGrid", this.editable ? "st-dashboardGrid--editable" : undefined, this.classInput);
  }

  get styleText(): string {
    const rowHeight = Math.max(32, Math.floor(this.rowHeight || 88));
    const gap = Math.max(0, Math.floor(this.gap ?? 16));
    return `--st-dashboardGrid-columns: ${this.safeColumns}; --st-dashboardGrid-row-height: ${rowHeight}px; --st-dashboardGrid-gap: ${gap}px;`;
  }

  tileStyle(tile: DashboardGridTile): string {
    return `grid-column: ${tile.x + 1} / span ${tile.w}; grid-row: ${tile.y + 1} / span ${tile.h};`;
  }

  tileLabel(tile: DashboardGridTile): string {
    return tile.title ?? tile.id;
  }

  private commit(nextTiles: DashboardGridTile[]): void {
    const normalized = normalizeTiles(nextTiles, this.safeColumns);
    this.localTiles = normalized;
    this.hasLocalLayout = true;
    const payload = normalized.map(cloneTile);
    this.onLayout?.(payload);
    this.layoutChange.emit(payload.map(cloneTile));
  }

  private changeTile(id: string, patch: Partial<DashboardGridTile>): void {
    this.commit(this.layout.map((tile) => (tile.id === id ? { ...tile, ...patch } : tile)));
  }

  moveTile(id: string, dx: number, dy: number): void {
    const tile = this.layout.find((candidate) => candidate.id === id);
    if (!tile) return;
    this.changeTile(id, { x: tile.x + dx, y: tile.y + dy });
  }

  resizeTile(id: string, dw: number, dh: number): void {
    const tile = this.layout.find((candidate) => candidate.id === id);
    if (!tile) return;
    this.changeTile(id, { w: tile.w + dw, h: tile.h + dh });
  }
}
