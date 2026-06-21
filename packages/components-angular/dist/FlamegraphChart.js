import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
const MARGIN = { top: 16, right: 16, bottom: 16, left: 16 };
const ROW_H = 26;
const ROW_GAP = 2;
function toneForDepth(depth) {
    return `category${(depth % 8) + 1}`;
}
function ellipsize(text, maxChars) {
    if (text.length <= maxChars)
        return text;
    if (maxChars <= 1)
        return "…";
    return `${text.slice(0, maxChars - 1)}…`;
}
function charsFor(w) {
    return Math.max(0, Math.floor((w - 8) / 6.6));
}
function buildCells(data, plotWidth) {
    const out = [];
    if (!data || typeof data.name !== "string" || !Number.isFinite(data.value))
        return out;
    const walk = (node, depth, x0, w, path) => {
        if (w <= 0)
            return;
        const y = MARGIN.top + depth * (ROW_H + ROW_GAP);
        out.push({
            key: path,
            name: node.name,
            value: node.value,
            depth,
            x: x0,
            y,
            width: w,
            tone: toneForDepth(depth),
            cx: x0 + w / 2,
            cy: y + ROW_H / 2,
        });
        const kids = (node.children ?? []).filter((c) => c && typeof c.name === "string" && Number.isFinite(c.value) && c.value > 0);
        if (kids.length === 0)
            return;
        const total = kids.reduce((s, c) => s + Math.max(c.value, 0), 0);
        if (total <= 0)
            return;
        let cursor = x0;
        kids.forEach((child, ci) => {
            const cw = (Math.max(child.value, 0) / total) * w;
            walk(child, depth + 1, cursor, cw, `${path}.${ci}`);
            cursor += cw;
        });
    };
    walk(data, 0, MARGIN.left, plotWidth, "0");
    return out;
}
export class FlamegraphChart {
    static stComponentName = "FlamegraphChart";
    componentName = "FlamegraphChart";
    ROW_H = ROW_H;
    hoveredKey = null;
    data;
    label;
    width;
    height;
    size;
    classInput;
    get hostClass() {
        return classNames("st-flamegraphChart", this.classInput);
    }
    get resolvedWidth() {
        return this.width ?? this.size ?? 640;
    }
    get heightDefault() {
        return this.height ?? 320;
    }
    get plotWidth() {
        return Math.max(this.resolvedWidth - MARGIN.left - MARGIN.right, 1);
    }
    get cells() {
        if (!this.data)
            return [];
        return buildCells(this.data, this.plotWidth);
    }
    get computedHeight() {
        if (this.cells.length === 0)
            return this.heightDefault;
        const maxDepth = this.cells.reduce((m, c) => Math.max(m, c.depth), 0);
        const needed = MARGIN.top + (maxDepth + 1) * (ROW_H + ROW_GAP) - ROW_GAP + MARGIN.bottom;
        return Math.max(this.heightDefault, needed);
    }
    get viewBox() {
        return `0 0 ${this.resolvedWidth} ${this.computedHeight}`;
    }
    get hoveredCell() {
        if (this.hoveredKey === null)
            return null;
        return this.cells.find((c) => c.key === this.hoveredKey) ?? null;
    }
    get dataValueItems() {
        return this.cells.map((c) => `${"·".repeat(c.depth)}${c.name}: ${c.value}`);
    }
    frameClass(cell) {
        const dim = this.hoveredKey !== null && this.hoveredKey !== cell.key;
        return classNames("st-flamegraphChart__frame", `st-flamegraphChart__frame--${cell.tone}`, dim && "st-flamegraphChart__frame--dim");
    }
    charsFor(w) {
        return charsFor(w);
    }
    ellipsize(text, maxChars) {
        return ellipsize(text, maxChars);
    }
    handlePointerMove(event) {
        const target = event.target;
        const key = target?.getAttribute("data-chart-key");
        this.hoveredKey = key ?? null;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: FlamegraphChart, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: FlamegraphChart, isStandalone: true, selector: "st-flamegraph-chart", inputs: { data: "data", label: "label", width: "width", height: "height", size: "size", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-flamegraphChart__visual"
        role="img"
        [attr.aria-label]="label"
        (pointermove)="handlePointerMove($event)"
        (pointerleave)="hoveredKey = null"
      >
        <svg
          [attr.viewBox]="viewBox"
          preserveAspectRatio="xMidYMid meet"
          width="100%"
          height="100%"
          focusable="false"
          aria-hidden="true"
        >
          @for (cell of cells; track cell.key) {
            <g class="st-flamegraphChart__node">
              <rect
                [class]="frameClass(cell)"
                [attr.x]="cell.x"
                [attr.y]="cell.y"
                [attr.width]="cell.width < 1 ? 1 : cell.width"
                [attr.height]="ROW_H"
                rx="2"
                [attr.data-chart-key]="cell.key"
              ></rect>
              @if (charsFor(cell.width) >= 2) {
                <text
                  class="st-flamegraphChart__label"
                  [attr.x]="cell.x + 4"
                  [attr.y]="cell.y + ROW_H / 2"
                  dominant-baseline="central"
                >{{ ellipsize(cell.name, charsFor(cell.width)) }}</text>
              }
            </g>
          }
        </svg>
      </div>

      <ul class="st-chartDataList" [attr.aria-label]="'Data values for ' + (label ?? 'flamegraph')">
        @for (item of dataValueItems; track item) {
          <li>{{ item }}</li>
        }
      </ul>

      @if (hoveredCell; as cell) {
        <div
          class="st-flamegraphChart__tooltip"
          role="presentation"
          [style.left.%]="(cell.cx / resolvedWidth) * 100"
          [style.top.%]="(cell.cy / computedHeight) * 100"
        >
          <span class="st-flamegraphChart__tooltipLabel">{{ cell.name }}</span>
          <span class="st-flamegraphChart__tooltipValue">{{ cell.value }}</span>
        </div>
      }
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: FlamegraphChart, decorators: [{
            type: Component,
            args: [{
                    selector: "st-flamegraph-chart",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-flamegraphChart__visual"
        role="img"
        [attr.aria-label]="label"
        (pointermove)="handlePointerMove($event)"
        (pointerleave)="hoveredKey = null"
      >
        <svg
          [attr.viewBox]="viewBox"
          preserveAspectRatio="xMidYMid meet"
          width="100%"
          height="100%"
          focusable="false"
          aria-hidden="true"
        >
          @for (cell of cells; track cell.key) {
            <g class="st-flamegraphChart__node">
              <rect
                [class]="frameClass(cell)"
                [attr.x]="cell.x"
                [attr.y]="cell.y"
                [attr.width]="cell.width < 1 ? 1 : cell.width"
                [attr.height]="ROW_H"
                rx="2"
                [attr.data-chart-key]="cell.key"
              ></rect>
              @if (charsFor(cell.width) >= 2) {
                <text
                  class="st-flamegraphChart__label"
                  [attr.x]="cell.x + 4"
                  [attr.y]="cell.y + ROW_H / 2"
                  dominant-baseline="central"
                >{{ ellipsize(cell.name, charsFor(cell.width)) }}</text>
              }
            </g>
          }
        </svg>
      </div>

      <ul class="st-chartDataList" [attr.aria-label]="'Data values for ' + (label ?? 'flamegraph')">
        @for (item of dataValueItems; track item) {
          <li>{{ item }}</li>
        }
      </ul>

      @if (hoveredCell; as cell) {
        <div
          class="st-flamegraphChart__tooltip"
          role="presentation"
          [style.left.%]="(cell.cx / resolvedWidth) * 100"
          [style.top.%]="(cell.cy / computedHeight) * 100"
        >
          <span class="st-flamegraphChart__tooltipLabel">{{ cell.name }}</span>
          <span class="st-flamegraphChart__tooltipValue">{{ cell.value }}</span>
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
//# sourceMappingURL=FlamegraphChart.js.map