import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
const TONES = [
    "category1",
    "category2",
    "category3",
    "category4",
    "category5",
    "category6",
    "category7",
    "category8",
];
const MARGIN = { top: 16, right: 16, bottom: 44, left: 16 };
const GAP = 4;
export class TileMapChart {
    static stComponentName = "TileMapChart";
    componentName = "TileMapChart";
    data = [];
    width;
    height;
    label = "";
    classInput;
    hoveredIndex = null;
    legendTones = TONES;
    get hostClass() {
        return classNames("st-tileMapChart", this.classInput);
    }
    get widthValue() {
        return this.width ?? 480;
    }
    get heightValue() {
        return this.height ?? 360;
    }
    get viewBox() {
        return `0 0 ${this.widthValue} ${this.heightValue}`;
    }
    get plotWidth() {
        return Math.max(this.widthValue - MARGIN.left - MARGIN.right, 1);
    }
    get plotHeight() {
        return Math.max(this.heightValue - MARGIN.top - MARGIN.bottom, 1);
    }
    get valid() {
        return this.data.filter((tile) => Number.isFinite(tile.col) && Number.isFinite(tile.row) && Number.isFinite(tile.value));
    }
    get tiles() {
        const valid = this.valid;
        if (valid.length === 0)
            return [];
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
    get hoveredTile() {
        return this.hoveredIndex !== null ? this.tiles[this.hoveredIndex] : undefined;
    }
    get dataValueItems() {
        return this.valid.map((tile) => `${tile.label}: ${this.formatNumber(tile.value)}`);
    }
    toneForValue(value, min, max) {
        if (!Number.isFinite(value) || max <= min)
            return "category1";
        const index = Math.max(0, Math.min(TONES.length - 1, Math.floor(((value - min) / (max - min)) * TONES.length)));
        return TONES[index];
    }
    formatNumber(value) {
        if (value === undefined || !Number.isFinite(value))
            return "0";
        if (Number.isInteger(value))
            return String(value);
        return value.toFixed(2).replace(/\.?0+$/, "");
    }
    tileClass(tile) {
        return classNames("st-tileMapChart__tile", `st-tileMapChart__tile--${tile.tone}`, this.hoveredIndex !== null && this.hoveredIndex !== tile.index ? "st-tileMapChart__tile--dim" : null);
    }
    tooltipLeft() {
        const tile = this.hoveredTile;
        if (!tile)
            return "0%";
        return `${(tile.cx / this.widthValue) * 100}%`;
    }
    tooltipTop() {
        const tile = this.hoveredTile;
        if (!tile)
            return "0%";
        return `${(tile.cy / this.heightValue) * 100}%`;
    }
    handleLeave() {
        this.hoveredIndex = null;
    }
    handleVisualPointerMove(event) {
        const target = event.target;
        const raw = Number(target?.getAttribute?.("data-chart-index"));
        this.hoveredIndex = Number.isInteger(raw) ? raw : null;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: TileMapChart, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: TileMapChart, isStandalone: true, selector: "st-tile-map-chart", inputs: { data: "data", width: "width", height: "height", label: "label", classInput: ["class", "classInput"] }, ngImport: i0, template: `
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
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: TileMapChart, decorators: [{
            type: Component,
            args: [{
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
                }]
        }], propDecorators: { data: [{
                type: NgInput
            }], width: [{
                type: NgInput
            }], height: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=TileMapChart.js.map