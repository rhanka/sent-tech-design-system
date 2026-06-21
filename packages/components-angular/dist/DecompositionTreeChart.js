import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
const DTC_MARGIN = { top: 16, right: 16, bottom: 16, left: 16 };
const DTC_BAR_H = 22;
const DTC_BAR_GAP = 10;
const DTC_COL_GAP = 36;
const DTC_BAR_W = 110;
function dtcToneForLevel(level) {
    return `category${(level % 8) + 1}`;
}
function dtcEllipsize(text, maxChars) {
    if (text.length <= maxChars)
        return text;
    if (maxChars <= 1)
        return "…";
    return `${text.slice(0, maxChars - 1)}…`;
}
function dtcFormatValue(v) {
    if (Math.abs(v) >= 1000)
        return `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`;
    if (Number.isInteger(v))
        return String(v);
    return v.toFixed(1);
}
function dtcCharsFor(w) {
    return Math.max(0, Math.floor((w - 8) / 6.6));
}
function dtcLinkPath(link) {
    const x1 = link.from.x + link.from.barWidth;
    const y1 = link.from.cy;
    const x2 = link.to.x;
    const y2 = link.to.cy;
    const mid = (x1 + x2) / 2;
    return `M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`;
}
function buildDtcLayout(data) {
    const cells = [];
    const links = [];
    if (!data || typeof data.measure !== "string")
        return { cells, links };
    const plotTop = DTC_MARGIN.top;
    const colX = (level) => DTC_MARGIN.left + level * (DTC_BAR_W + DTC_COL_GAP);
    const levels = (data.levels ?? []).filter((lvl) => lvl && typeof lvl.dimension === "string");
    const firstLevelTotal = levels[0]
        ? levels[0].nodes.filter((n) => n && Number.isFinite(n.value)).reduce((s, n) => s + Math.max(n.value, 0), 0)
        : 0;
    const rootValue = firstLevelTotal > 0 ? firstLevelTotal : 1;
    const rootCell = {
        key: "root",
        label: data.measure,
        dimension: data.measure,
        value: rootValue,
        level: 0,
        x: colX(0),
        y: plotTop,
        barWidth: DTC_BAR_W,
        tone: dtcToneForLevel(0),
        cx: colX(0) + DTC_BAR_W / 2,
        cy: plotTop + DTC_BAR_H / 2,
        parentKey: null,
    };
    cells.push(rootCell);
    let prevColumn = [rootCell];
    levels.forEach((lvl, li) => {
        const level = li + 1;
        const nodes = (lvl.nodes ?? []).filter((n) => n && typeof n.label === "string" && Number.isFinite(n.value));
        const levelMax = nodes.reduce((m, n) => Math.max(m, Math.max(n.value, 0)), 0) || 1;
        const x = colX(level);
        const column = [];
        nodes.forEach((n, ni) => {
            const y = plotTop + ni * (DTC_BAR_H + DTC_BAR_GAP);
            const barWidth = Math.max((Math.max(n.value, 0) / levelMax) * DTC_BAR_W, 2);
            const parentCell = (n.parent !== undefined && prevColumn.find((p) => p.label === n.parent)) || prevColumn[0] || null;
            const cell = {
                key: `${level}-${ni}`,
                label: n.label,
                dimension: lvl.dimension,
                value: n.value,
                level,
                x,
                y,
                barWidth,
                tone: dtcToneForLevel(level),
                cx: x + barWidth / 2,
                cy: y + DTC_BAR_H / 2,
                parentKey: parentCell ? parentCell.key : null,
            };
            cells.push(cell);
            column.push(cell);
            if (parentCell) {
                links.push({ key: `${parentCell.key}>${cell.key}`, from: parentCell, to: cell });
            }
        });
        if (column.length > 0)
            prevColumn = column;
    });
    return { cells, links };
}
export class DecompositionTreeChart {
    static stComponentName = "DecompositionTreeChart";
    componentName = "DecompositionTreeChart";
    BAR_H = DTC_BAR_H;
    Math = Math;
    hoveredKey = null;
    data;
    label;
    width;
    height = 320;
    size;
    classInput;
    get hostClass() {
        return classNames("st-decompositionTreeChart", this.classInput);
    }
    get resolvedWidth() {
        return this.width ?? this.size ?? 640;
    }
    get layout() {
        if (!this.data)
            return { cells: [], links: [] };
        return buildDtcLayout(this.data);
    }
    get cells() {
        return this.layout.cells;
    }
    get links() {
        return this.layout.links;
    }
    get computedHeight() {
        if (this.cells.length === 0)
            return this.height;
        const maxBottom = this.cells.reduce((m, c) => Math.max(m, c.y + DTC_BAR_H), DTC_MARGIN.top);
        return Math.max(this.height, maxBottom + DTC_MARGIN.bottom);
    }
    get computedWidth() {
        if (this.cells.length === 0)
            return this.resolvedWidth;
        const maxRight = this.cells.reduce((m, c) => Math.max(m, c.x + DTC_BAR_W), DTC_MARGIN.left);
        return Math.max(this.resolvedWidth, maxRight + DTC_MARGIN.right);
    }
    get viewBox() {
        return `0 0 ${this.computedWidth} ${this.computedHeight}`;
    }
    get hoveredCell() {
        if (this.hoveredKey === null)
            return null;
        return this.cells.find((c) => c.key === this.hoveredKey) ?? null;
    }
    get dataValueItems() {
        return this.cells.map((c) => `${"·".repeat(c.level)}${c.label}: ${c.value}`);
    }
    charsFor(w) {
        return dtcCharsFor(w);
    }
    ellipsize(text, maxChars) {
        return dtcEllipsize(text, maxChars);
    }
    formatValueFor(v) {
        return dtcFormatValue(v);
    }
    linkPathFor(link) {
        return dtcLinkPath(link);
    }
    linkClass(link) {
        const dim = this.hoveredKey !== null && this.hoveredKey !== link.from.key && this.hoveredKey !== link.to.key;
        return classNames("st-decompositionTreeChart__link", dim && "st-decompositionTreeChart__link--dim");
    }
    barClass(cell) {
        const dim = this.hoveredKey !== null && this.hoveredKey !== cell.key;
        return classNames("st-decompositionTreeChart__bar", `st-decompositionTreeChart__bar--${cell.tone}`, dim && "st-decompositionTreeChart__bar--dim");
    }
    tooltipLeft(cell) {
        return (cell.cx / this.computedWidth) * 100;
    }
    tooltipTop(cell) {
        return (cell.cy / this.computedHeight) * 100;
    }
    handlePointerMove(event) {
        const target = event.target;
        const key = target?.getAttribute?.("data-chart-key") ?? null;
        this.hoveredKey = key;
    }
    handlePointerLeave() {
        this.hoveredKey = null;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: DecompositionTreeChart, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: DecompositionTreeChart, isStandalone: true, selector: "st-decomposition-tree-chart", inputs: { data: "data", label: "label", width: "width", height: "height", size: "size", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-decompositionTreeChart__visual"
        role="img"
        [attr.aria-label]="label"
        (pointermove)="handlePointerMove($event)"
        (pointerleave)="handlePointerLeave()"
      >
        <svg
          [attr.viewBox]="viewBox"
          preserveAspectRatio="xMidYMid meet"
          width="100%"
          height="100%"
          focusable="false"
          aria-hidden="true"
        >
          @for (link of links; track link.key) {
            <path
              [class]="linkClass(link)"
              [attr.d]="linkPathFor(link)"
            ></path>
          }

          @for (cell of cells; track cell.key) {
            <g class="st-decompositionTreeChart__node">
              <rect
                [class]="barClass(cell)"
                [attr.x]="cell.x"
                [attr.y]="cell.y"
                [attr.width]="Math.max(cell.barWidth, 2)"
                [attr.height]="BAR_H"
                rx="2"
                [attr.data-chart-key]="cell.key"
              ></rect>
              @if (charsFor(cell.barWidth) >= 2) {
                <text
                  class="st-decompositionTreeChart__label"
                  [attr.x]="cell.x + 4"
                  [attr.y]="cell.y + BAR_H / 2"
                  dominant-baseline="central"
                >
                  {{ ellipsize(cell.label, charsFor(cell.barWidth)) }}
                </text>
              }
            </g>
          }
        </svg>
      </div>

      <ul class="st-chartDataList" [attr.aria-label]="'Data values for ' + (label ?? 'decomposition tree')">
        @for (item of dataValueItems; track $index) {
          <li>{{ item }}</li>
        }
      </ul>

      @if (hoveredCell) {
        <div
          class="st-decompositionTreeChart__tooltip"
          role="presentation"
          [style.left]="tooltipLeft(hoveredCell) + '%'"
          [style.top]="tooltipTop(hoveredCell) + '%'"
        >
          <span class="st-decompositionTreeChart__tooltipLabel">{{ hoveredCell.dimension }} · {{ hoveredCell.label }}</span>
          <span class="st-decompositionTreeChart__tooltipValue">{{ formatValueFor(hoveredCell.value) }}</span>
        </div>
      }
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: DecompositionTreeChart, decorators: [{
            type: Component,
            args: [{
                    selector: "st-decomposition-tree-chart",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-decompositionTreeChart__visual"
        role="img"
        [attr.aria-label]="label"
        (pointermove)="handlePointerMove($event)"
        (pointerleave)="handlePointerLeave()"
      >
        <svg
          [attr.viewBox]="viewBox"
          preserveAspectRatio="xMidYMid meet"
          width="100%"
          height="100%"
          focusable="false"
          aria-hidden="true"
        >
          @for (link of links; track link.key) {
            <path
              [class]="linkClass(link)"
              [attr.d]="linkPathFor(link)"
            ></path>
          }

          @for (cell of cells; track cell.key) {
            <g class="st-decompositionTreeChart__node">
              <rect
                [class]="barClass(cell)"
                [attr.x]="cell.x"
                [attr.y]="cell.y"
                [attr.width]="Math.max(cell.barWidth, 2)"
                [attr.height]="BAR_H"
                rx="2"
                [attr.data-chart-key]="cell.key"
              ></rect>
              @if (charsFor(cell.barWidth) >= 2) {
                <text
                  class="st-decompositionTreeChart__label"
                  [attr.x]="cell.x + 4"
                  [attr.y]="cell.y + BAR_H / 2"
                  dominant-baseline="central"
                >
                  {{ ellipsize(cell.label, charsFor(cell.barWidth)) }}
                </text>
              }
            </g>
          }
        </svg>
      </div>

      <ul class="st-chartDataList" [attr.aria-label]="'Data values for ' + (label ?? 'decomposition tree')">
        @for (item of dataValueItems; track $index) {
          <li>{{ item }}</li>
        }
      </ul>

      @if (hoveredCell) {
        <div
          class="st-decompositionTreeChart__tooltip"
          role="presentation"
          [style.left]="tooltipLeft(hoveredCell) + '%'"
          [style.top]="tooltipTop(hoveredCell) + '%'"
        >
          <span class="st-decompositionTreeChart__tooltipLabel">{{ hoveredCell.dimension }} · {{ hoveredCell.label }}</span>
          <span class="st-decompositionTreeChart__tooltipValue">{{ formatValueFor(hoveredCell.value) }}</span>
        </div>
      }
    </div>
  `,
                }]
        }], propDecorators: { data: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], width: [{
                type: NgInput
            }], height: [{
                type: NgInput
            }], size: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=DecompositionTreeChart.js.map