import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type TileMapChartTile = {
  label: string;
  col: number;
  row: number;
  value: number;
};

export type TileMapChartProps = {
  data: TileMapChartTile[];
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

type TileGeometry = {
  tile: TileMapChartTile;
  index: number;
  tone: string;
  x: number;
  y: number;
  side: number;
  cx: number;
  cy: number;
};

const TONES = [
  "category1",
  "category2",
  "category3",
  "category4",
  "category5",
  "category6",
  "category7",
  "category8",
] as const;

const MARGIN = { top: 16, right: 16, bottom: 44, left: 16 };
const GAP = 4;

@Component({
  selector: "st-tile-map-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-tileMapChart__visual"
        role="img"
        [attr.aria-label]="label"
        (pointermove)="handleVisualPointerMove($event)"
        (pointerleave)="handleLeave()"
      >
        <svg
          [attr.viewBox]="viewBox"
          preserveAspectRatio="xMidYMid meet"
          width="100%"
          height="100%"
          focusable="false"
          aria-hidden="true"
        >
          @for (tile of tiles; track $index) {
            <g>
              <rect
                [class]="tileClass(tile)"
                [attr.x]="tile.x"
                [attr.y]="tile.y"
                [attr.width]="tile.side"
                [attr.height]="tile.side"
                rx="3"
                [attr.data-chart-index]="tile.index"
              ></rect>
              @if (tile.side > 18) {
                <text
                  class="st-tileMapChart__tileLabel"
                  [attr.x]="tile.cx"
                  [attr.y]="tile.cy"
                  text-anchor="middle"
                  dominant-baseline="middle"
                  pointer-events="none"
                >
                  {{ tile.tile.label }}
                </text>
              }
            </g>
          }
        </svg>
      </div>

      <ul class="st-chartDataList" [attr.aria-label]="'Data values for ' + label">
        @for (item of dataValueItems; track $index) {
          <li>{{ item }}</li>
        }
      </ul>

      @if (hoveredIndex !== null && tiles[hoveredIndex ?? -1]) {
        <div
          class="st-tileMapChart__tooltip"
          role="presentation"
          [style.left]="tooltipLeft()"
          [style.top]="tooltipTop()"
        >
          <span class="st-tileMapChart__tooltipLabel">{{ hoveredTile?.tile?.label }}</span>
          <span class="st-tileMapChart__tooltipValue">{{ formatNumber(hoveredTile?.tile?.value) }}</span>
        </div>
      }

      <div class="st-tileMapChart__legend" aria-hidden="true">
        <span class="st-tileMapChart__legendText">Low</span>
        <span class="st-tileMapChart__legendRamp">
          @for (tone of legendTones; track tone) {
            <span [class]="'st-tileMapChart__legendSwatch st-tileMapChart__legendSwatch--' + tone"></span>
          }
        </span>
        <span class="st-tileMapChart__legendText">High</span>
      </div>
    </div>
  `,
})
export class TileMapChart {
  static readonly stComponentName = "TileMapChart";
  readonly componentName = "TileMapChart";

  @NgInput() data: TileMapChartTile[] = [];
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() label = "";
  @NgInput("class") classInput?: string;

  hoveredIndex: number | null = null;

  readonly legendTones: readonly string[] = TONES;

  get hostClass(): string {
    return classNames("st-tileMapChart", this.classInput);
  }

  get widthValue(): number {
    return this.width ?? 480;
  }

  get heightValue(): number {
    return this.height ?? 360;
  }

  get viewBox(): string {
    return `0 0 ${this.widthValue} ${this.heightValue}`;
  }

  get plotWidth(): number {
    return Math.max(this.widthValue - MARGIN.left - MARGIN.right, 1);
  }

  get plotHeight(): number {
    return Math.max(this.heightValue - MARGIN.top - MARGIN.bottom, 1);
  }

  get valid(): TileMapChartTile[] {
    return this.data.filter(
      (tile) => Number.isFinite(tile.col) && Number.isFinite(tile.row) && Number.isFinite(tile.value),
    );
  }

  get tiles(): TileGeometry[] {
    const valid = this.valid;
    if (valid.length === 0) return [];

    const cols = Math.max(...valid.map((t) => t.col)) + 1;
    const rows = Math.max(...valid.map((t) => t.row)) + 1;
    const values = valid.map((t) => t.value);
    const min = Math.min(...values);
    const max = Math.max(...values);

    const side = Math.max(Math.min(this.plotWidth / cols, this.plotHeight / rows) - GAP, 1);
    const gridW = cols * (side + GAP) - GAP;
    const gridH = rows * (side + GAP) - GAP;
    const offsetX = MARGIN.left + Math.max((this.plotWidth - gridW) / 2, 0);
    const offsetY = MARGIN.top + Math.max((this.plotHeight - gridH) / 2, 0);

    return valid.map((tile, index) => {
      const x = offsetX + tile.col * (side + GAP);
      const y = offsetY + tile.row * (side + GAP);
      return {
        tile,
        index,
        tone: this.toneForValue(tile.value, min, max),
        x,
        y,
        side,
        cx: x + side / 2,
        cy: y + side / 2,
      };
    });
  }

  get hoveredTile(): TileGeometry | undefined {
    return this.hoveredIndex !== null ? this.tiles[this.hoveredIndex] : undefined;
  }

  get dataValueItems(): string[] {
    return this.valid.map((tile) => `${tile.label}: ${this.formatNumber(tile.value)}`);
  }

  toneForValue(value: number, min: number, max: number): string {
    if (!Number.isFinite(value) || max <= min) return "category1";
    const index = Math.max(0, Math.min(TONES.length - 1, Math.floor(((value - min) / (max - min)) * TONES.length)));
    return TONES[index];
  }

  formatNumber(value: number | undefined): string {
    if (value === undefined || !Number.isFinite(value)) return "0";
    if (Number.isInteger(value)) return String(value);
    return value.toFixed(2).replace(/\.?0+$/, "");
  }

  tileClass(tile: TileGeometry): string {
    return classNames(
      "st-tileMapChart__tile",
      `st-tileMapChart__tile--${tile.tone}`,
      this.hoveredIndex !== null && this.hoveredIndex !== tile.index ? "st-tileMapChart__tile--dim" : null,
    );
  }

  tooltipLeft(): string {
    const tile = this.hoveredTile;
    if (!tile) return "0%";
    return `${(tile.cx / this.widthValue) * 100}%`;
  }

  tooltipTop(): string {
    const tile = this.hoveredTile;
    if (!tile) return "0%";
    return `${(tile.cy / this.heightValue) * 100}%`;
  }

  handleLeave(): void {
    this.hoveredIndex = null;
  }

  handleVisualPointerMove(event: PointerEvent): void {
    const target = event.target as { getAttribute?: (name: string) => string | null } | null;
    const raw = Number(target?.getAttribute?.("data-chart-index"));
    this.hoveredIndex = Number.isInteger(raw) ? raw : null;
  }
}
