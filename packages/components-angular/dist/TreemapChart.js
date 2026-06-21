import { Component, Input as NgInput } from "@angular/core";
import { contrastTextForTone } from "./chartContrast.js";
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
const PADDING = 2;
const LABEL_MIN_W = 44;
const LABEL_MIN_H = 22;
const VALUE_MIN_H = 38;
export class TreemapChart {
    static stComponentName = "TreemapChart";
    componentName = "TreemapChart";
    data;
    tiling;
    showLabels;
    legend;
    width;
    height;
    label;
    classInput;
    hoveredIndex = null;
    LABEL_MIN_W = LABEL_MIN_W;
    LABEL_MIN_H = LABEL_MIN_H;
    VALUE_MIN_H = VALUE_MIN_H;
    clipPrefix = `st-treemap-clip-${Math.random().toString(36).slice(2, 9)}`;
    get widthValue() {
        return this.width ?? 480;
    }
    get heightValue() {
        return this.height ?? 300;
    }
    get showLabelsValue() {
        return this.showLabels !== false;
    }
    get hostClass() {
        return ["st-treemapChart", this.classInput].filter(Boolean).join(" ");
    }
    leafValue(v) {
        return Number.isFinite(v) && v > 0 ? v : 0;
    }
    sumValue(d) {
        if (d.children && d.children.length > 0) {
            return d.children.reduce((s, c) => s + this.sumValue(c), 0);
        }
        return this.leafValue(d.value);
    }
    squarify(nodes, rect) {
        const out = [];
        const total = nodes.reduce((s, n) => s + n.value, 0);
        if (total <= 0 || nodes.length === 0)
            return out;
        const area = rect.w * rect.h;
        const scale = area / total;
        const items = nodes.map((n) => ({ datum: n.datum, value: n.value, area: n.value * scale }));
        let free = { ...rect };
        let row = [];
        const worst = (r, side) => {
            if (r.length === 0 || side <= 0)
                return Infinity;
            const s = r.reduce((acc, it) => acc + it.area, 0);
            let max = -Infinity;
            let min = Infinity;
            for (const it of r) {
                if (it.area > max)
                    max = it.area;
                if (it.area < min)
                    min = it.area;
            }
            const s2 = s * s;
            const side2 = side * side;
            return Math.max((side2 * max) / s2, s2 / (side2 * min));
        };
        const layoutRow = (r, side, area2) => {
            const s = r.reduce((acc, it) => acc + it.area, 0);
            if (side <= 0)
                return area2;
            const thickness = s / side;
            if (area2.w >= area2.h) {
                let oy = area2.y;
                for (const it of r) {
                    const h = it.area / thickness;
                    out.push({ datum: it.datum, value: it.value, rect: { x: area2.x, y: oy, w: thickness, h } });
                    oy += h;
                }
                return { x: area2.x + thickness, y: area2.y, w: area2.w - thickness, h: area2.h };
            }
            else {
                let ox = area2.x;
                for (const it of r) {
                    const w = it.area / thickness;
                    out.push({ datum: it.datum, value: it.value, rect: { x: ox, y: area2.y, w, h: thickness } });
                    ox += w;
                }
                return { x: area2.x, y: area2.y + thickness, w: area2.w, h: area2.h - thickness };
            }
        };
        for (const it of items) {
            const side = Math.min(free.w, free.h);
            const next = [...row, it];
            if (row.length === 0 || worst(next, side) <= worst(row, side)) {
                row = next;
            }
            else {
                free = layoutRow(row, side, free);
                row = [it];
            }
        }
        if (row.length > 0) {
            free = layoutRow(row, Math.min(free.w, free.h), free);
        }
        return out;
    }
    inset(r, pad) {
        const w = Math.max(r.w - pad * 2, 0);
        const h = Math.max(r.h - pad * 2, 0);
        return { x: r.x + pad, y: r.y + pad, w, h };
    }
    get cells() {
        if (!this.data || this.data.length === 0)
            return [];
        const roots = this.data
            .map((d, i) => ({ datum: d, value: this.sumValue(d), tone: d.tone ?? TONES[i % TONES.length] }))
            .filter((n) => n.value > 0)
            .sort((a, b) => b.value - a.value);
        if (roots.length === 0)
            return [];
        const topRects = this.squarify(roots.map((r) => ({ datum: r.datum, value: r.value })), { x: 0, y: 0, w: this.widthValue, h: this.heightValue });
        const result = [];
        topRects.forEach((tr) => {
            const root = roots.find((r) => r.datum === tr.datum);
            const children = (tr.datum.children ?? [])
                .filter((c) => this.leafValue(c.value) > 0)
                .sort((a, b) => this.leafValue(b.value) - this.leafValue(a.value));
            if (children.length > 0) {
                const innerRect = this.inset(tr.rect, PADDING);
                const childRects = this.squarify(children.map((c) => ({ datum: c, value: this.leafValue(c.value) })), innerRect);
                childRects.forEach((cr, ci) => {
                    const tone = cr.datum.tone ?? root.tone ?? TONES[ci % TONES.length];
                    result.push({
                        datum: cr.datum,
                        value: cr.value,
                        tone,
                        textColor: contrastTextForTone(tone),
                        rect: this.inset(cr.rect, PADDING / 2),
                        parentLabel: tr.datum.label,
                        depth: 1,
                    });
                });
            }
            else {
                result.push({
                    datum: tr.datum,
                    value: tr.value,
                    tone: root.tone,
                    textColor: contrastTextForTone(root.tone),
                    rect: this.inset(tr.rect, PADDING / 2),
                    depth: 0,
                });
            }
        });
        return result;
    }
    get legendItems() {
        if (!this.data)
            return [];
        return this.data
            .map((d, i) => ({ label: d.label, tone: d.tone ?? TONES[i % TONES.length] }))
            .filter((_, i) => this.sumValue(this.data[i]) > 0);
    }
    get dataValueItems() {
        return this.cells.map((c) => c.parentLabel ? `${c.parentLabel}, ${c.datum.label}: ${c.value}` : `${c.datum.label}: ${c.value}`);
    }
    cellKey(cell) {
        return cell.parentLabel ? `${cell.parentLabel}/${cell.datum.label}` : cell.datum.label;
    }
    clipId(index) {
        return `${this.clipPrefix}-${index}`;
    }
    rectClass(cell, index) {
        const base = `st-treemapChart__rect st-treemapChart__rect--${cell.tone}`;
        if (this.hoveredIndex !== null && this.hoveredIndex !== index) {
            return base + " st-treemapChart__rect--dim";
        }
        return base;
    }
    tooltipLeft() {
        if (this.hoveredIndex === null)
            return "0%";
        const cell = this.cells[this.hoveredIndex];
        return `${((cell.rect.x + cell.rect.w / 2) / this.widthValue) * 100}%`;
    }
    tooltipTop() {
        if (this.hoveredIndex === null)
            return "0%";
        const cell = this.cells[this.hoveredIndex];
        return `${(cell.rect.y / this.heightValue) * 100}%`;
    }
    tooltipLabel() {
        if (this.hoveredIndex === null)
            return "";
        const cell = this.cells[this.hoveredIndex];
        return cell ? (cell.parentLabel ? `${cell.parentLabel} · ${cell.datum.label}` : cell.datum.label) : "";
    }
    tooltipValue() {
        if (this.hoveredIndex === null)
            return "";
        return this.cells[this.hoveredIndex]?.value ?? "";
    }
    handleVisualPointerMove(event) {
        const target = event.target;
        if (!(target instanceof Element)) {
            this.hoveredIndex = null;
            return;
        }
        const raw = Number(target.getAttribute("data-chart-index"));
        this.hoveredIndex = Number.isInteger(raw) && !Number.isNaN(raw) ? raw : null;
    }
    handleLeave() {
        this.hoveredIndex = null;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: TreemapChart, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: TreemapChart, isStandalone: true, selector: "st-treemap-chart", inputs: { data: "data", tiling: "tiling", showLabels: "showLabels", legend: "legend", width: "width", height: "height", label: "label", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-treemapChart__visual"
        role="img"
        [attr.aria-label]="label"
        (pointermove)="handleVisualPointerMove($event)"
        (pointerleave)="handleLeave()"
      >
        <svg
          [attr.viewBox]="'0 0 ' + widthValue + ' ' + heightValue"
          preserveAspectRatio="xMidYMid meet"
          width="100%"
          height="100%"
          focusable="false"
          aria-hidden="true"
        >
          <defs>
            @for (cell of cells; track cellKey(cell)) {
              <clipPath [attr.id]="clipId($index)">
                <rect
                  [attr.x]="cell.rect.x"
                  [attr.y]="cell.rect.y"
                  [attr.width]="cell.rect.w"
                  [attr.height]="cell.rect.h"
                  rx="2"
                ></rect>
              </clipPath>
            }
          </defs>

          @for (cell of cells; track cellKey(cell)) {
            <g class="st-treemapChart__cell" [attr.data-chart-index]="$index">
              <rect
                [class]="rectClass(cell, $index)"
                [attr.x]="cell.rect.x"
                [attr.y]="cell.rect.y"
                [attr.width]="cell.rect.w"
                [attr.height]="cell.rect.h"
                rx="2"
                [attr.data-chart-index]="$index"
              ></rect>
              @if (showLabelsValue && cell.rect.w >= LABEL_MIN_W && cell.rect.h >= LABEL_MIN_H) {
                <g [attr.clip-path]="'url(#' + clipId($index) + ')'">
                  <text
                    class="st-treemapChart__label"
                    [attr.x]="cell.rect.x + 6"
                    [attr.y]="cell.rect.y + 15"
                    [attr.data-chart-index]="$index"
                    [attr.style]="'fill: ' + cell.textColor"
                  >
                    {{ cell.datum.label }}
                  </text>
                  @if (cell.rect.h >= VALUE_MIN_H) {
                    <text
                      class="st-treemapChart__value"
                      [attr.x]="cell.rect.x + 6"
                      [attr.y]="cell.rect.y + 30"
                      [attr.data-chart-index]="$index"
                      [attr.style]="'fill: ' + cell.textColor"
                    >
                      {{ cell.value }}
                    </text>
                  }
                </g>
              }
            </g>
          }
        </svg>
      </div>

      <ul class="st-chartDataList" [attr.aria-label]="label + ' data'">
        @for (item of dataValueItems; track item) {
          <li>{{ item }}</li>
        }
      </ul>

      @if (hoveredIndex !== null && cells[hoveredIndex]) {
        <div
          class="st-treemapChart__tooltip"
          role="presentation"
          [style.left]="tooltipLeft()"
          [style.top]="tooltipTop()"
        >
          <span class="st-treemapChart__tooltipLabel">{{ tooltipLabel() }}</span>
          <span class="st-treemapChart__tooltipValue">{{ tooltipValue() }}</span>
        </div>
      }

      @if (legend && legendItems.length > 0) {
        <ul class="st-treemapChart__legend" aria-hidden="true">
          @for (item of legendItems; track item.label) {
            <li class="st-treemapChart__legendItem">
              <span
                [class]="'st-treemapChart__legendSwatch st-treemapChart__legendSwatch--' + item.tone"
                aria-hidden="true"
              ></span>
              {{ item.label }}
            </li>
          }
        </ul>
      }
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: TreemapChart, decorators: [{
            type: Component,
            args: [{
                    selector: "st-treemap-chart",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-treemapChart__visual"
        role="img"
        [attr.aria-label]="label"
        (pointermove)="handleVisualPointerMove($event)"
        (pointerleave)="handleLeave()"
      >
        <svg
          [attr.viewBox]="'0 0 ' + widthValue + ' ' + heightValue"
          preserveAspectRatio="xMidYMid meet"
          width="100%"
          height="100%"
          focusable="false"
          aria-hidden="true"
        >
          <defs>
            @for (cell of cells; track cellKey(cell)) {
              <clipPath [attr.id]="clipId($index)">
                <rect
                  [attr.x]="cell.rect.x"
                  [attr.y]="cell.rect.y"
                  [attr.width]="cell.rect.w"
                  [attr.height]="cell.rect.h"
                  rx="2"
                ></rect>
              </clipPath>
            }
          </defs>

          @for (cell of cells; track cellKey(cell)) {
            <g class="st-treemapChart__cell" [attr.data-chart-index]="$index">
              <rect
                [class]="rectClass(cell, $index)"
                [attr.x]="cell.rect.x"
                [attr.y]="cell.rect.y"
                [attr.width]="cell.rect.w"
                [attr.height]="cell.rect.h"
                rx="2"
                [attr.data-chart-index]="$index"
              ></rect>
              @if (showLabelsValue && cell.rect.w >= LABEL_MIN_W && cell.rect.h >= LABEL_MIN_H) {
                <g [attr.clip-path]="'url(#' + clipId($index) + ')'">
                  <text
                    class="st-treemapChart__label"
                    [attr.x]="cell.rect.x + 6"
                    [attr.y]="cell.rect.y + 15"
                    [attr.data-chart-index]="$index"
                    [attr.style]="'fill: ' + cell.textColor"
                  >
                    {{ cell.datum.label }}
                  </text>
                  @if (cell.rect.h >= VALUE_MIN_H) {
                    <text
                      class="st-treemapChart__value"
                      [attr.x]="cell.rect.x + 6"
                      [attr.y]="cell.rect.y + 30"
                      [attr.data-chart-index]="$index"
                      [attr.style]="'fill: ' + cell.textColor"
                    >
                      {{ cell.value }}
                    </text>
                  }
                </g>
              }
            </g>
          }
        </svg>
      </div>

      <ul class="st-chartDataList" [attr.aria-label]="label + ' data'">
        @for (item of dataValueItems; track item) {
          <li>{{ item }}</li>
        }
      </ul>

      @if (hoveredIndex !== null && cells[hoveredIndex]) {
        <div
          class="st-treemapChart__tooltip"
          role="presentation"
          [style.left]="tooltipLeft()"
          [style.top]="tooltipTop()"
        >
          <span class="st-treemapChart__tooltipLabel">{{ tooltipLabel() }}</span>
          <span class="st-treemapChart__tooltipValue">{{ tooltipValue() }}</span>
        </div>
      }

      @if (legend && legendItems.length > 0) {
        <ul class="st-treemapChart__legend" aria-hidden="true">
          @for (item of legendItems; track item.label) {
            <li class="st-treemapChart__legendItem">
              <span
                [class]="'st-treemapChart__legendSwatch st-treemapChart__legendSwatch--' + item.tone"
                aria-hidden="true"
              ></span>
              {{ item.label }}
            </li>
          }
        </ul>
      }
    </div>
  `,
                }]
        }], propDecorators: { data: [{
                type: NgInput
            }], tiling: [{
                type: NgInput
            }], showLabels: [{
                type: NgInput
            }], legend: [{
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
//# sourceMappingURL=TreemapChart.js.map