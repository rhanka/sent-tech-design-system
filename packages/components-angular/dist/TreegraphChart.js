import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
const TONES = [
    "category1", "category2", "category3", "category4",
    "category5", "category6", "category7", "category8",
];
const R = 7;
const PAD_X = 80;
const PAD_Y = 12;
function computeLayout(data, width, height) {
    if (!data || data.length === 0)
        return { nodes: [], links: [], rowH: 0 };
    const byId = new Map();
    for (const n of data)
        if (n.id != null && !byId.has(n.id))
            byId.set(n.id, n);
    const validParent = (n) => {
        const p = n.parentId;
        if (p == null)
            return null;
        if (!byId.has(p) || p === n.id)
            return null;
        let cursor = p;
        const seen = new Set([n.id]);
        while (cursor != null) {
            if (seen.has(cursor))
                return null;
            seen.add(cursor);
            const parent = byId.get(cursor);
            cursor = parent ? (parent.parentId ?? null) : null;
        }
        return p;
    };
    const childrenOf = new Map();
    const roots = [];
    for (const n of byId.values()) {
        const p = validParent(n);
        if (p == null) {
            roots.push(n.id);
        }
        else {
            const list = childrenOf.get(p) ?? [];
            list.push(n.id);
            childrenOf.set(p, list);
        }
    }
    const depthOf = new Map();
    const leafOrder = new Map();
    let leafCounter = 0;
    let maxDepth = 0;
    const visit = (id, depth) => {
        depthOf.set(id, depth);
        if (depth > maxDepth)
            maxDepth = depth;
        const kids = childrenOf.get(id) ?? [];
        if (kids.length === 0) {
            leafOrder.set(id, leafCounter);
            leafCounter += 1;
            return;
        }
        for (const k of kids)
            visit(k, depth + 1);
    };
    for (const r of roots)
        visit(r, 0);
    const leafCount = Math.max(leafCounter, 1);
    const usableY = Math.max(height - PAD_Y * 2, 1);
    const rowH = usableY / leafCount;
    const centerY = new Map();
    const computeY = (id) => {
        const cached = centerY.get(id);
        if (cached != null)
            return cached;
        const kids = childrenOf.get(id) ?? [];
        let cy;
        if (kids.length === 0) {
            const row = leafOrder.get(id) ?? 0;
            cy = PAD_Y + row * rowH + rowH / 2;
        }
        else {
            const ys = kids.map((k) => computeY(k));
            cy = ys.reduce((s, v) => s + v, 0) / ys.length;
        }
        centerY.set(id, cy);
        return cy;
    };
    for (const r of roots)
        computeY(r);
    const levels = maxDepth + 1;
    const usableX = Math.max(width - PAD_X * 2, 1);
    const colGap = levels > 1 ? usableX / (levels - 1) : 0;
    const xForDepth = (d) => (levels > 1 ? PAD_X + d * colGap : width / 2);
    const nodes = [];
    let toneIdx = 0;
    const ordered = [...byId.values()].filter((n) => depthOf.has(n.id));
    for (const n of ordered) {
        const depth = depthOf.get(n.id) ?? 0;
        const tone = n.tone ?? TONES[toneIdx % TONES.length];
        if (!n.tone)
            toneIdx += 1;
        nodes.push({
            id: n.id,
            label: n.label,
            tone,
            depth,
            x: xForDepth(depth),
            y: centerY.get(n.id) ?? height / 2,
            parentId: validParent(n),
        });
    }
    const nodeById = new Map(nodes.map((b) => [b.id, b]));
    const links = [];
    for (const b of nodes) {
        if (b.parentId == null)
            continue;
        const parent = nodeById.get(b.parentId);
        if (!parent)
            continue;
        links.push({
            id: b.id,
            x1: parent.x + R,
            y1: parent.y,
            x2: b.x - R,
            y2: b.y,
        });
    }
    return { nodes, links, rowH };
}
export class TreegraphChart {
    static stComponentName = "TreegraphChart";
    componentName = "TreegraphChart";
    R = R;
    data = [];
    width;
    height;
    label = "";
    classInput;
    get hostClass() {
        return classNames("st-treegraphChart", this.classInput);
    }
    get widthValue() {
        return this.width ?? 640;
    }
    get heightValue() {
        return this.height ?? 360;
    }
    get viewBox() {
        return `0 0 ${this.widthValue} ${this.heightValue}`;
    }
    get layout() {
        return computeLayout(this.data, this.widthValue, this.heightValue);
    }
    get fontSize() {
        const rowH = this.layout.rowH;
        return rowH < 18 ? 9 : rowH < 26 ? 10 : 11;
    }
    get maxChars() {
        return Math.max(2, Math.floor((PAD_X - R - 6) / (this.fontSize * 0.58)));
    }
    get dataValueItems() {
        return this.layout.nodes.map((b) => {
            const parent = b.parentId != null ? this.layout.nodes.find((p) => p.id === b.parentId) : undefined;
            return parent ? `${b.label} (${b.id}) → ${parent.label}` : `${b.label} (${b.id})`;
        });
    }
    clip(s, n) {
        return s.length > n ? `${s.slice(0, Math.max(1, n - 1))}…` : s;
    }
    isLeaf(node) {
        return !this.layout.nodes.some((c) => c.parentId === node.id);
    }
    dotClass(node) {
        return classNames("st-treegraphChart__dot", `st-treegraphChart__dot--${node.tone}`);
    }
    linkPath(link) {
        const cx = (link.x1 + link.x2) / 2;
        return `M ${link.x1} ${link.y1} C ${cx} ${link.y1} ${cx} ${link.y2} ${link.x2} ${link.y2}`;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: TreegraphChart, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: TreegraphChart, isStandalone: true, selector: "st-treegraph-chart", inputs: { data: "data", width: "width", height: "height", label: "label", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div class="st-treegraphChart__visual" role="img" [attr.aria-label]="label">
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
              class="st-treegraphChart__link"
              [attr.d]="linkPath(link)"
              fill="none"
            />
          }

          @for (node of layout.nodes; track node.id) {
            <g class="st-treegraphChart__node">
              <circle
                [class]="dotClass(node)"
                [attr.cx]="node.x"
                [attr.cy]="node.y"
                [attr.r]="R"
              />
              <text
                class="st-treegraphChart__label"
                [attr.x]="isLeaf(node) ? node.x + R + 4 : node.x - R - 4"
                [attr.y]="node.y"
                [attr.text-anchor]="isLeaf(node) ? 'start' : 'end'"
                dominant-baseline="central"
                [attr.style]="'font-size: ' + fontSize + 'px'"
              >{{ clip(node.label, maxChars) }}</text>
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
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: TreegraphChart, decorators: [{
            type: Component,
            args: [{
                    selector: "st-treegraph-chart",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div class="st-treegraphChart__visual" role="img" [attr.aria-label]="label">
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
              class="st-treegraphChart__link"
              [attr.d]="linkPath(link)"
              fill="none"
            />
          }

          @for (node of layout.nodes; track node.id) {
            <g class="st-treegraphChart__node">
              <circle
                [class]="dotClass(node)"
                [attr.cx]="node.x"
                [attr.cy]="node.y"
                [attr.r]="R"
              />
              <text
                class="st-treegraphChart__label"
                [attr.x]="isLeaf(node) ? node.x + R + 4 : node.x - R - 4"
                [attr.y]="node.y"
                [attr.text-anchor]="isLeaf(node) ? 'start' : 'end'"
                dominant-baseline="central"
                [attr.style]="'font-size: ' + fontSize + 'px'"
              >{{ clip(node.label, maxChars) }}</text>
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
//# sourceMappingURL=TreegraphChart.js.map