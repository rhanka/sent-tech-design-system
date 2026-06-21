import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type OrganizationChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type OrganizationChartNode = {
  id: string;
  parentId?: string | null;
  label: string;
  tone?: OrganizationChartTone;
};

export type OrganizationChartProps = {
  data: OrganizationChartNode[];
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

const TONES = [
  "category1", "category2", "category3", "category4",
  "category5", "category6", "category7", "category8",
] as const;

type LayoutBox = {
  id: string;
  label: string;
  tone: OrganizationChartTone;
  depth: number;
  x: number;
  y: number;
  parentId: string | null;
};

type LayoutLink = { id: string; x1: number; y1: number; x2: number; y2: number };

type Layout = { boxes: LayoutBox[]; links: LayoutLink[]; boxW: number };

const BOX_H = 36;
const GAP_X = 16;
const PAD_X = 8;

function computeLayout(data: OrganizationChartNode[], width: number, height: number): Layout {
  if (!data || data.length === 0) return { boxes: [], links: [], boxW: 0 };

  const byId = new Map<string, OrganizationChartNode>();
  for (const n of data) if (n.id != null && !byId.has(n.id)) byId.set(n.id, n);

  const validParent = (n: OrganizationChartNode): string | null => {
    const p = n.parentId;
    if (p == null) return null;
    if (!byId.has(p) || p === n.id) return null;
    let cursor: string | null = p;
    const seen = new Set<string>([n.id]);
    while (cursor != null) {
      if (seen.has(cursor)) return null;
      seen.add(cursor);
      const parent: OrganizationChartNode | undefined = byId.get(cursor);
      cursor = parent ? (parent.parentId ?? null) : null;
    }
    return p;
  };

  const childrenOf = new Map<string, string[]>();
  const roots: string[] = [];
  for (const n of byId.values()) {
    const p = validParent(n);
    if (p == null) {
      roots.push(n.id);
    } else {
      const list = childrenOf.get(p) ?? [];
      list.push(n.id);
      childrenOf.set(p, list);
    }
  }

  const depthOf = new Map<string, number>();
  const leafOrder = new Map<string, number>();
  let leafCounter = 0;
  let maxDepth = 0;

  const visit = (id: string, depth: number) => {
    depthOf.set(id, depth);
    if (depth > maxDepth) maxDepth = depth;
    const kids = childrenOf.get(id) ?? [];
    if (kids.length === 0) {
      leafOrder.set(id, leafCounter);
      leafCounter += 1;
      return;
    }
    for (const k of kids) visit(k, depth + 1);
  };
  for (const r of roots) visit(r, 0);

  const leafCount = Math.max(leafCounter, 1);
  const usable = Math.max(width - PAD_X * 2, 1);
  const colW = usable / leafCount;
  const boxW = Math.max(colW - GAP_X, 24);

  const centerX = new Map<string, number>();
  const computeX = (id: string): number => {
    const cached = centerX.get(id);
    if (cached != null) return cached;
    const kids = childrenOf.get(id) ?? [];
    let cx: number;
    if (kids.length === 0) {
      const col = leafOrder.get(id) ?? 0;
      cx = PAD_X + col * colW + colW / 2;
    } else {
      const xs = kids.map((k) => computeX(k));
      cx = xs.reduce((s, v) => s + v, 0) / xs.length;
    }
    centerX.set(id, cx);
    return cx;
  };
  for (const r of roots) computeX(r);

  const levels = maxDepth + 1;
  const usableY = Math.max(height - BOX_H, 1);
  const rowGap = levels > 1 ? usableY / (levels - 1) : 0;
  const yForDepth = (d: number) => (levels > 1 ? d * rowGap : (height - BOX_H) / 2);

  const boxes: LayoutBox[] = [];
  let toneIdx = 0;
  const ordered = [...byId.values()].filter((n) => depthOf.has(n.id));
  for (const n of ordered) {
    const depth = depthOf.get(n.id) ?? 0;
    const tone = n.tone ?? TONES[toneIdx % TONES.length];
    if (!n.tone) toneIdx += 1;
    boxes.push({
      id: n.id,
      label: n.label,
      tone,
      depth,
      x: centerX.get(n.id) ?? width / 2,
      y: yForDepth(depth),
      parentId: validParent(n),
    });
  }

  const boxById = new Map(boxes.map((b) => [b.id, b]));
  const links: LayoutLink[] = [];
  for (const b of boxes) {
    if (b.parentId == null) continue;
    const parent = boxById.get(b.parentId);
    if (!parent) continue;
    links.push({
      id: b.id,
      x1: parent.x,
      y1: parent.y + BOX_H,
      x2: b.x,
      y2: b.y,
    });
  }

  return { boxes, links, boxW };
}

@Component({
  selector: "st-organization-chart",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div class="st-organizationChart__visual" role="img" [attr.aria-label]="label">
        <svg
          [attr.viewBox]="viewBox"
          preserveAspectRatio="xMidYMid meet"
          width="100%"
          height="100%"
          focusable="false"
          aria-hidden="true"
        >
          @for (link of layout.links; track link.id) {
            <path
              class="st-organizationChart__link"
              [attr.d]="linkPath(link)"
              fill="none"
            />
          }

          @for (box of layout.boxes; track box.id) {
            <g class="st-organizationChart__node">
              <rect
                [class]="boxClass(box)"
                [attr.x]="box.x - layout.boxW / 2"
                [attr.y]="box.y"
                [attr.width]="layout.boxW"
                [attr.height]="BOX_H"
                rx="6"
              />
              <text
                class="st-organizationChart__label"
                [attr.x]="box.x"
                [attr.y]="box.y + BOX_H / 2"
                text-anchor="middle"
                dominant-baseline="central"
                [attr.style]="'font-size: ' + fontSize + 'px'"
              >{{ clip(box.label, maxChars) }}</text>
            </g>
          }
        </svg>
      </div>

      <ul class="st-chartDataList" [attr.aria-label]="label + ' data'">
        @for (item of dataValueItems; track item) {
          <li>{{ item }}</li>
        }
      </ul>
    </div>
  `,
})
export class OrganizationChart {
  static readonly stComponentName = "OrganizationChart";
  readonly componentName = "OrganizationChart";
  readonly BOX_H = BOX_H;

  @NgInput() data: OrganizationChartNode[] = [];
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() label = "";
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames("st-organizationChart", this.classInput);
  }

  get widthValue(): number {
    return this.width ?? 640;
  }

  get heightValue(): number {
    return this.height ?? 320;
  }

  get viewBox(): string {
    return `0 0 ${this.widthValue} ${this.heightValue}`;
  }

  get layout(): Layout {
    return computeLayout(this.data, this.widthValue, this.heightValue);
  }

  get fontSize(): number {
    const w = this.layout.boxW;
    return w < 56 ? 9 : w < 88 ? 10 : 12;
  }

  get maxChars(): number {
    return Math.max(2, Math.floor((this.layout.boxW - 10) / (this.fontSize * 0.58)));
  }

  get dataValueItems(): string[] {
    return this.layout.boxes.map((b) => {
      const parent = b.parentId != null ? this.layout.boxes.find((p) => p.id === b.parentId) : undefined;
      return parent ? `${b.label} (${b.id}) → ${parent.label}` : `${b.label} (${b.id})`;
    });
  }

  clip(s: string, n: number): string {
    return s.length > n ? `${s.slice(0, Math.max(1, n - 1))}…` : s;
  }

  boxClass(box: LayoutBox): string {
    return classNames("st-organizationChart__box", `st-organizationChart__box--${box.tone}`);
  }

  linkPath(link: LayoutLink): string {
    const midY = (link.y1 + link.y2) / 2;
    return `M ${link.x1} ${link.y1} V ${midY} H ${link.x2} V ${link.y2}`;
  }
}
