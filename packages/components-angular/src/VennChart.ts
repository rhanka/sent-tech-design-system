import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type VennChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type VennChartArea = {
  sets: string[];
  value: number;
};

export type VennChartProps = {
  data: VennChartArea[];
  label: string;
  width?: number;
  height?: number;
  class?: string;
};

const TONES: VennChartTone[] = [
  "category1", "category2", "category3", "category4",
  "category5", "category6", "category7", "category8",
];

type VennCircle = {
  name: string;
  tone: VennChartTone;
  cx: number;
  cy: number;
  r: number;
  total: number;
  labelX: number;
  labelY: number;
  anchor: "start" | "middle" | "end";
};

type VennRegion = {
  sets: string[];
  value: number;
  x: number;
  y: number;
};

type VennLayout = {
  circles: VennCircle[];
  regions: VennRegion[];
  items: string[];
};

function safeValue(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function computeVennLayout(data: VennChartArea[], width: number, height: number): VennLayout {
  const areas = data
    .map((d) => ({ sets: Array.isArray(d.sets) ? d.sets.filter((s) => typeof s === "string") : [], value: safeValue(d.value) }))
    .filter((d) => d.sets.length > 0 && d.value > 0);

  const order: string[] = [];
  for (const a of areas) {
    for (const s of a.sets) if (!order.includes(s)) order.push(s);
  }
  const names = order.slice(0, 3);

  if (names.length === 0) {
    return { circles: [], regions: [], items: [] };
  }

  const totals = new Map<string, number>();
  for (const name of names) {
    let sum = 0;
    for (const a of areas) if (a.sets.includes(name)) sum += a.value;
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
  const radiusFor = (root: number) => (rootSpan > 0 ? rMin + ((root - rootMin) / rootSpan) * (rMax - rMin) : rMax);

  let centers: Array<{ cx: number; cy: number }>;
  if (names.length === 1) {
    centers = [{ cx, cy }];
  } else if (names.length === 2) {
    const off = span * 0.16;
    centers = [
      { cx: cx - off, cy },
      { cx: cx + off, cy },
    ];
  } else {
    const off = span * 0.17;
    centers = [
      { cx: cx - off, cy: cy - off * 0.6 },
      { cx: cx + off, cy: cy - off * 0.6 },
      { cx, cy: cy + off * 0.85 },
    ];
  }

  const circles: VennCircle[] = names.map((name, i) => {
    const r = radiusFor(roots[i]);
    const c = centers[i];
    const dx = c.cx - cx;
    const dy = c.cy - cy;
    const len = Math.hypot(dx, dy) || 1;
    const ux = names.length === 1 ? 0 : dx / len;
    const uy = names.length === 1 ? -1 : dy / len;
    const labelX = c.cx + ux * (r + 6);
    const labelY = c.cy + uy * (r + 6);
    const anchor: "start" | "middle" | "end" = ux > 0.3 ? "start" : ux < -0.3 ? "end" : "middle";
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
  const regions: VennRegion[] = areas
    .filter((a) => a.sets.length >= 2)
    .map((a) => {
      const pts = a.sets.map((s) => centerByName.get(s)).filter((c): c is VennCircle => c !== undefined);
      const px = pts.length > 0 ? pts.reduce((s, c) => s + c.cx, 0) / pts.length : cx;
      const py = pts.length > 0 ? pts.reduce((s, c) => s + c.cy, 0) / pts.length : cy;
      return { sets: a.sets, value: a.value, x: px, y: py };
    });

  const items = areas.map((a) => `${a.sets.join(" ∩ ")}: ${a.value}`);

  return { circles, regions, items };
}

@Component({
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
})
export class VennChart {
  static readonly stComponentName = "VennChart";
  readonly componentName = "VennChart";

  hoveredIndex: number | null = null;

  @NgInput() data: VennChartArea[] = [];
  @NgInput() label = "";
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames("st-vennChart", this.classInput);
  }

  get widthValue(): number { return this.width ?? 420; }
  get heightValue(): number { return this.height ?? 360; }
  get viewBox(): string { return `0 0 ${this.widthValue} ${this.heightValue}`; }

  get layout(): VennLayout {
    return computeVennLayout(this.data, this.widthValue, this.heightValue);
  }

  circleClass(i: number): string {
    const circle = this.layout.circles[i];
    return classNames(
      "st-vennChart__circle",
      circle ? `st-vennChart__circle--${circle.tone}` : "",
      this.hoveredIndex !== null && this.hoveredIndex !== i && "st-vennChart__circle--dim",
    );
  }

  get tooltipLeft(): number {
    const c = this.hoveredIndex !== null ? this.layout.circles[this.hoveredIndex] : undefined;
    return c ? (c.cx / this.widthValue) * 100 : 0;
  }

  get tooltipTop(): number {
    const c = this.hoveredIndex !== null ? this.layout.circles[this.hoveredIndex] : undefined;
    return c ? (c.cy / this.heightValue) * 100 : 0;
  }

  handleVisualPointerMove(event: PointerEvent): void {
    const target = event.target as { getAttribute?: (name: string) => string | null } | null;
    const raw = Number(target?.getAttribute?.("data-chart-index"));
    this.hoveredIndex = Number.isInteger(raw) && !isNaN(raw) ? raw : null;
  }
}
