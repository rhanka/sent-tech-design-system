import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
const TONES = [
    "category1", "category2", "category3", "category4",
    "category5", "category6", "category7", "category8",
];
function safeValue(value) {
    return Number.isFinite(value) && value > 0 ? value : 0;
}
function computeVennLayout(data, width, height) {
    const areas = data
        .map((d) => ({ sets: Array.isArray(d.sets) ? d.sets.filter((s) => typeof s === "string") : [], value: safeValue(d.value) }))
        .filter((d) => d.sets.length > 0 && d.value > 0);
    const order = [];
    for (const a of areas) {
        for (const s of a.sets)
            if (!order.includes(s))
                order.push(s);
    }
    const names = order.slice(0, 3);
    if (names.length === 0) {
        return { circles: [], regions: [], items: [] };
    }
    const totals = new Map();
    for (const name of names) {
        let sum = 0;
        for (const a of areas)
            if (a.sets.includes(name))
                sum += a.value;
        totals.set(name, sum);
    }
    const cx = width / 2;
    const cy = height / 2;
    const span = Math.min(width, height);
    const rMax = span * 0.3;
    const rMin = span * 0.2;
    const roots = names.map((n) => Math.sqrt(totals.get(n) ?? 0));
    const rootMin = Math.min(...roots);
    const rootMax = Math.max(...roots);
    const rootSpan = rootMax - rootMin;
    const radiusFor = (root) => (rootSpan > 0 ? rMin + ((root - rootMin) / rootSpan) * (rMax - rMin) : rMax);
    let centers;
    if (names.length === 1) {
        centers = [{ cx, cy }];
    }
    else if (names.length === 2) {
        const off = span * 0.16;
        centers = [
            { cx: cx - off, cy },
            { cx: cx + off, cy },
        ];
    }
    else {
        const off = span * 0.17;
        centers = [
            { cx: cx - off, cy: cy - off * 0.6 },
            { cx: cx + off, cy: cy - off * 0.6 },
            { cx, cy: cy + off * 0.85 },
        ];
    }
    const circles = names.map((name, i) => {
        const r = radiusFor(roots[i]);
        const c = centers[i];
        const dx = c.cx - cx;
        const dy = c.cy - cy;
        const len = Math.hypot(dx, dy) || 1;
        const ux = names.length === 1 ? 0 : dx / len;
        const uy = names.length === 1 ? -1 : dy / len;
        const labelX = c.cx + ux * (r + 6);
        const labelY = c.cy + uy * (r + 6);
        const anchor = ux > 0.3 ? "start" : ux < -0.3 ? "end" : "middle";
        return {
            name,
            tone: TONES[i % TONES.length],
            cx: c.cx,
            cy: c.cy,
            r,
            total: totals.get(name) ?? 0,
            labelX,
            labelY,
            anchor,
        };
    });
    const centerByName = new Map(circles.map((c) => [c.name, c]));
    const regions = areas
        .filter((a) => a.sets.length >= 2)
        .map((a) => {
        const pts = a.sets.map((s) => centerByName.get(s)).filter((c) => c !== undefined);
        const px = pts.length > 0 ? pts.reduce((s, c) => s + c.cx, 0) / pts.length : cx;
        const py = pts.length > 0 ? pts.reduce((s, c) => s + c.cy, 0) / pts.length : cy;
        return { sets: a.sets, value: a.value, x: px, y: py };
    });
    const items = areas.map((a) => `${a.sets.join(" ∩ ")}: ${a.value}`);
    return { circles, regions, items };
}
export class VennChart {
    static stComponentName = "VennChart";
    componentName = "VennChart";
    hoveredIndex = null;
    data = [];
    label = "";
    width;
    height;
    classInput;
    get hostClass() {
        return classNames("st-vennChart", this.classInput);
    }
    get widthValue() { return this.width ?? 420; }
    get heightValue() { return this.height ?? 360; }
    get viewBox() { return `0 0 ${this.widthValue} ${this.heightValue}`; }
    get layout() {
        return computeVennLayout(this.data, this.widthValue, this.heightValue);
    }
    circleClass(i) {
        const circle = this.layout.circles[i];
        return classNames("st-vennChart__circle", circle ? `st-vennChart__circle--${circle.tone}` : "", this.hoveredIndex !== null && this.hoveredIndex !== i && "st-vennChart__circle--dim");
    }
    get tooltipLeft() {
        const c = this.hoveredIndex !== null ? this.layout.circles[this.hoveredIndex] : undefined;
        return c ? (c.cx / this.widthValue) * 100 : 0;
    }
    get tooltipTop() {
        const c = this.hoveredIndex !== null ? this.layout.circles[this.hoveredIndex] : undefined;
        return c ? (c.cy / this.heightValue) * 100 : 0;
    }
    handleVisualPointerMove(event) {
        const target = event.target;
        const raw = Number(target?.getAttribute?.("data-chart-index"));
        this.hoveredIndex = Number.isInteger(raw) && !isNaN(raw) ? raw : null;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: VennChart, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: VennChart, isStandalone: true, selector: "st-venn-chart", inputs: { data: "data", label: "label", width: "width", height: "height", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-vennChart__visual"
        role="img"
        [attr.aria-label]="label"
        (pointermove)="handleVisualPointerMove($event)"
        (pointerleave)="hoveredIndex = null"
      >
        <svg
          [attr.viewBox]="viewBox"
          preserveAspectRatio="xMidYMid meet"
          width="100%"
          height="100%"
          focusable="false"
          aria-hidden="true"
        >
          @for (circle of layout.circles; track circle.name; let i = $index) {
            <circle
              [class]="circleClass(i)"
              [attr.cx]="circle.cx"
              [attr.cy]="circle.cy"
              [attr.r]="circle.r"
              [attr.data-chart-index]="i"
            ></circle>
          }

          @for (region of layout.regions; track region.sets.join('|')) {
            <text
              class="st-vennChart__value"
              [attr.x]="region.x"
              [attr.y]="region.y"
              text-anchor="middle"
              dominant-baseline="middle"
            >{{ region.value }}</text>
          }

          @for (circle of layout.circles; track circle.name) {
            <text
              class="st-vennChart__label"
              [attr.x]="circle.labelX"
              [attr.y]="circle.labelY"
              [attr.text-anchor]="circle.anchor"
              dominant-baseline="middle"
            >{{ circle.name }}</text>
          }
        </svg>
      </div>

      <ul class="st-chartDataList" [attr.aria-label]="'Data values for ' + label">
        @for (item of layout.items; track item) {
          <li>{{ item }}</li>
        }
      </ul>

      @if (hoveredIndex !== null && layout.circles[hoveredIndex]) {
        <div
          class="st-vennChart__tooltip"
          role="presentation"
          [style.left]="tooltipLeft + '%'"
          [style.top]="tooltipTop + '%'"
        >
          <span class="st-vennChart__tooltipLabel">{{ layout.circles[hoveredIndex].name }}</span>
          <span class="st-vennChart__tooltipValue">{{ layout.circles[hoveredIndex].total }}</span>
        </div>
      }
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: VennChart, decorators: [{
            type: Component,
            args: [{
                    selector: "st-venn-chart",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div
        class="st-vennChart__visual"
        role="img"
        [attr.aria-label]="label"
        (pointermove)="handleVisualPointerMove($event)"
        (pointerleave)="hoveredIndex = null"
      >
        <svg
          [attr.viewBox]="viewBox"
          preserveAspectRatio="xMidYMid meet"
          width="100%"
          height="100%"
          focusable="false"
          aria-hidden="true"
        >
          @for (circle of layout.circles; track circle.name; let i = $index) {
            <circle
              [class]="circleClass(i)"
              [attr.cx]="circle.cx"
              [attr.cy]="circle.cy"
              [attr.r]="circle.r"
              [attr.data-chart-index]="i"
            ></circle>
          }

          @for (region of layout.regions; track region.sets.join('|')) {
            <text
              class="st-vennChart__value"
              [attr.x]="region.x"
              [attr.y]="region.y"
              text-anchor="middle"
              dominant-baseline="middle"
            >{{ region.value }}</text>
          }

          @for (circle of layout.circles; track circle.name) {
            <text
              class="st-vennChart__label"
              [attr.x]="circle.labelX"
              [attr.y]="circle.labelY"
              [attr.text-anchor]="circle.anchor"
              dominant-baseline="middle"
            >{{ circle.name }}</text>
          }
        </svg>
      </div>

      <ul class="st-chartDataList" [attr.aria-label]="'Data values for ' + label">
        @for (item of layout.items; track item) {
          <li>{{ item }}</li>
        }
      </ul>

      @if (hoveredIndex !== null && layout.circles[hoveredIndex]) {
        <div
          class="st-vennChart__tooltip"
          role="presentation"
          [style.left]="tooltipLeft + '%'"
          [style.top]="tooltipTop + '%'"
        >
          <span class="st-vennChart__tooltipLabel">{{ layout.circles[hoveredIndex].name }}</span>
          <span class="st-vennChart__tooltipValue">{{ layout.circles[hoveredIndex].total }}</span>
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
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=VennChart.js.map