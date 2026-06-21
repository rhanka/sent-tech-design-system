import { NgFor, NgIf } from "@angular/common";
import { Component, EventEmitter, Input as NgInput, Output as NgOutput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
function safeColumns(value) {
    return Math.max(1, Math.floor(value || 12));
}
function cloneTile(tile) {
    return { ...tile };
}
function normalizeTile(tile, columns) {
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
function normalizeTiles(tiles, columns) {
    return tiles.map((tile) => normalizeTile(cloneTile(tile), columns));
}
export class DashboardGrid {
    static stComponentName = "DashboardGrid";
    componentName = "DashboardGrid";
    tiles = [];
    columns;
    rowHeight;
    gap;
    editable;
    label;
    onLayout;
    classInput;
    layoutChange = new EventEmitter();
    localTiles = [];
    hasLocalLayout = false;
    ngOnChanges(changes) {
        if (changes["tiles"] && !changes["tiles"].firstChange) {
            this.hasLocalLayout = false;
            this.localTiles = [];
        }
    }
    get safeColumns() {
        return safeColumns(this.columns);
    }
    get layout() {
        return normalizeTiles(this.hasLocalLayout ? this.localTiles : this.tiles ?? [], this.safeColumns);
    }
    get hostClass() {
        return classNames("st-dashboardGrid", this.editable ? "st-dashboardGrid--editable" : undefined, this.classInput);
    }
    get styleText() {
        const rowHeight = Math.max(32, Math.floor(this.rowHeight || 88));
        const gap = Math.max(0, Math.floor(this.gap ?? 16));
        return `--st-dashboardGrid-columns: ${this.safeColumns}; --st-dashboardGrid-row-height: ${rowHeight}px; --st-dashboardGrid-gap: ${gap}px;`;
    }
    tileStyle(tile) {
        return `grid-column: ${tile.x + 1} / span ${tile.w}; grid-row: ${tile.y + 1} / span ${tile.h};`;
    }
    tileLabel(tile) {
        return tile.title ?? tile.id;
    }
    commit(nextTiles) {
        const normalized = normalizeTiles(nextTiles, this.safeColumns);
        this.localTiles = normalized;
        this.hasLocalLayout = true;
        const payload = normalized.map(cloneTile);
        this.onLayout?.(payload);
        this.layoutChange.emit(payload.map(cloneTile));
    }
    changeTile(id, patch) {
        this.commit(this.layout.map((tile) => (tile.id === id ? { ...tile, ...patch } : tile)));
    }
    moveTile(id, dx, dy) {
        const tile = this.layout.find((candidate) => candidate.id === id);
        if (!tile)
            return;
        this.changeTile(id, { x: tile.x + dx, y: tile.y + dy });
    }
    resizeTile(id, dw, dh) {
        const tile = this.layout.find((candidate) => candidate.id === id);
        if (!tile)
            return;
        this.changeTile(id, { w: tile.w + dw, h: tile.h + dh });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: DashboardGrid, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: DashboardGrid, isStandalone: true, selector: "st-dashboard-grid", inputs: { tiles: "tiles", columns: "columns", rowHeight: "rowHeight", gap: "gap", editable: "editable", label: "label", onLayout: "onLayout", classInput: ["class", "classInput"] }, outputs: { layoutChange: "layoutChange" }, usesOnChanges: true, ngImport: i0, template: `
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
  `, isInline: true, dependencies: [{ kind: "directive", type: NgFor, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }, { kind: "directive", type: NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: DashboardGrid, decorators: [{
            type: Component,
            args: [{
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
                }]
        }], propDecorators: { tiles: [{
                type: NgInput
            }], columns: [{
                type: NgInput
            }], rowHeight: [{
                type: NgInput
            }], gap: [{
                type: NgInput
            }], editable: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], onLayout: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }], layoutChange: [{
                type: NgOutput
            }] } });
//# sourceMappingURL=DashboardGrid.js.map