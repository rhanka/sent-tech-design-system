import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export function edgeDashArray(dash, weak) {
    const effective = dash ?? (weak ? "dashed" : undefined);
    switch (effective) {
        case "dashed":
            return "6 4";
        case "dotted":
            return "1 4";
        case "long-dash":
            return "12 6";
        case "solid":
        default:
            return null;
    }
}
const STAR_INNER_RATIO = 0.42;
const STAR_AREA_FACTOR = 1.5953498885642274;
function fmt(n) {
    const value = Math.abs(n) < 1e-9 ? 0 : n;
    return Number(value.toFixed(4)).toString();
}
export function nodeShapePath(shape, r) {
    const s = shape ?? "dot";
    if (s === "dot" || s === "circle")
        return null;
    if (s === "diamond") {
        const d = Math.sqrt(Math.PI / 2) * r;
        return `M 0 ${fmt(-d)} L ${fmt(d)} 0 L 0 ${fmt(d)} L ${fmt(-d)} 0 Z`;
    }
    if (s === "star") {
        const outer = STAR_AREA_FACTOR * r;
        const inner = outer * STAR_INNER_RATIO;
        const points = [];
        for (let i = 0; i < 10; i += 1) {
            const angle = (i * Math.PI) / 5 - Math.PI / 2;
            const radius = i % 2 === 0 ? outer : inner;
            points.push(`${fmt(radius * Math.cos(angle))},${fmt(radius * Math.sin(angle))}`);
        }
        return `M ${points.join(" L ")} Z`;
    }
    if (s === "hexagon") {
        const d = Math.sqrt(Math.PI / (3 * Math.sqrt(3) / 2)) * r;
        const points = Array.from({ length: 6 }, (_value, i) => {
            const angle = (Math.PI / 3) * i - Math.PI / 6;
            return `${fmt(d * Math.cos(angle))},${fmt(d * Math.sin(angle))}`;
        });
        return `M ${points.join(" L ")} Z`;
    }
    if (s === "triangle") {
        const d = Math.sqrt(Math.PI / (3 * Math.sqrt(3) / 4)) * r;
        return `M 0 ${fmt(-d)} L ${fmt(d * Math.sin(Math.PI / 3))} ${fmt(d / 2)} L ${fmt(-d * Math.sin(Math.PI / 3))} ${fmt(d / 2)} Z`;
    }
    const half = (Math.sqrt(Math.PI) / 2) * r;
    if (s === "roundedbox") {
        const radius = Math.min(half * 0.35, 6);
        return `M ${fmt(-half + radius)} ${fmt(-half)} H ${fmt(half - radius)} Q ${fmt(half)} ${fmt(-half)} ${fmt(half)} ${fmt(-half + radius)} V ${fmt(half - radius)} Q ${fmt(half)} ${fmt(half)} ${fmt(half - radius)} ${fmt(half)} H ${fmt(-half + radius)} Q ${fmt(-half)} ${fmt(half)} ${fmt(-half)} ${fmt(half - radius)} V ${fmt(-half + radius)} Q ${fmt(-half)} ${fmt(-half)} ${fmt(-half + radius)} ${fmt(-half)} Z`;
    }
    return `M ${fmt(-half)} ${fmt(-half)} H ${fmt(half)} V ${fmt(half)} H ${fmt(-half)} Z`;
}
function mulberry32(seed) {
    let a = seed >>> 0;
    return () => {
        a |= 0;
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
function stableSeed(ns) {
    const ids = ns.map((n) => n.id).sort();
    let h = 0x811c9dc5;
    const joined = ids.join("|");
    for (let i = 0; i < joined.length; i++) {
        h ^= joined.charCodeAt(i);
        h = Math.imul(h, 0x01000193);
    }
    h ^= ns.length;
    return h >>> 0;
}
function runSimulation(ns, es, w, h, ticks, repulsionFactor) {
    const cx = w / 2, cy = h / 2;
    const rand = mulberry32(stableSeed(ns));
    const idIndex = new Map();
    const nodeRadius = 8; // default radius for clamping
    const sim = ns.map((n, i) => {
        idIndex.set(n.id, i);
        const fixed = typeof n.fx === "number" && typeof n.fy === "number";
        const angle = (i / Math.max(ns.length, 1)) * Math.PI * 2;
        const r = Math.min(w, h) * 0.3 * (0.5 + rand() * 0.5);
        return { id: n.id, x: fixed ? n.fx : cx + Math.cos(angle) * r, y: fixed ? n.fy : cy + Math.sin(angle) * r, vx: 0, vy: 0, fixed };
    });
    const links = es.map((e) => ({ s: idIndex.get(e.source), t: idIndex.get(e.target) })).filter((l) => l.s !== undefined && l.t !== undefined);
    const area = w * h;
    const k = Math.sqrt(area / Math.max(ns.length, 1));
    const clampedRepulsion = Math.min(Math.max(repulsionFactor, 0.1), 10);
    const repulsion = k * k * 0.9 * clampedRepulsion;
    const restLength = k * 0.8;
    const springK = 0.04;
    const gravity = 0.012;
    const damping = 0.85;
    let temperature = Math.min(w, h) * 0.08;
    const cooling = ticks > 0 ? Math.pow(0.02, 1 / ticks) : 0.95;
    for (let step = 0; step < ticks; step++) {
        for (let i = 0; i < sim.length; i++) {
            for (let j = i + 1; j < sim.length; j++) {
                let dx = sim[i].x - sim[j].x, dy = sim[i].y - sim[j].y;
                let dist2 = dx * dx + dy * dy;
                if (dist2 < 0.01) {
                    dx = (rand() - 0.5) * 0.1;
                    dy = (rand() - 0.5) * 0.1;
                    dist2 = dx * dx + dy * dy + 0.01;
                }
                const dist = Math.sqrt(dist2);
                const force = repulsion / dist2;
                const fx = (dx / dist) * force, fy = (dy / dist) * force;
                sim[i].vx += fx;
                sim[i].vy += fy;
                sim[j].vx -= fx;
                sim[j].vy -= fy;
            }
        }
        for (const l of links) {
            const a = sim[l.s], b = sim[l.t];
            const dx = b.x - a.x, dy = b.y - a.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
            const force = (dist - restLength) * springK;
            const fx = (dx / dist) * force, fy = (dy / dist) * force;
            a.vx += fx;
            a.vy += fy;
            b.vx -= fx;
            b.vy -= fy;
        }
        for (const node of sim) {
            if (node.fixed) {
                node.vx = 0;
                node.vy = 0;
                continue;
            }
            node.vx += (cx - node.x) * gravity;
            node.vy += (cy - node.y) * gravity;
            node.vx *= damping;
            node.vy *= damping;
            const speed = Math.sqrt(node.vx * node.vx + node.vy * node.vy);
            if (speed > temperature) {
                node.vx = (node.vx / speed) * temperature;
                node.vy = (node.vy / speed) * temperature;
            }
            node.x += node.vx;
            node.y += node.vy;
            const padX = w * 0.5 + nodeRadius * 2, padY = h * 0.5 + nodeRadius * 2;
            node.x = Math.max(-padX, Math.min(w + padX, node.x));
            node.y = Math.max(-padY, Math.min(h + padY, node.y));
        }
        temperature *= cooling;
    }
    const out = new Map();
    for (const node of sim)
        out.set(node.id, { x: node.x, y: node.y });
    return out;
}
const FG_TONES = [
    "category1", "category2", "category3", "category4",
    "category5", "category6", "category7", "category8",
];
const FG_CONTENT_MARGIN = 0.08;
const FG_CURVE_FACTOR = 0.5;
export class ForceGraph {
    static stComponentName = "ForceGraph";
    componentName = "ForceGraph";
    nodes = [];
    edges = [];
    label;
    width;
    height;
    nodeRadius;
    showLabels;
    iterations;
    selectedIds;
    focusId;
    legend;
    edgeCurve;
    repulsion;
    onSelect;
    onOpenEntity;
    onEdgeHover;
    onNodeHover;
    mergePair;
    onMergeComplete;
    classInput;
    hoveredIdx = null;
    fgNodes = [];
    fgEdges = [];
    _cb = { x: 0, y: 0, w: 480, h: 320 };
    ngOnInit() { this._layout(); }
    ngOnChanges(_c) { this._layout(); }
    _layout() {
        const w = this.width ?? 480, h = this.height ?? 320;
        const nr = this.nodeRadius ?? 8;
        const iter = Math.max(1, Math.round(this.iterations ?? 120));
        const layout = runSimulation(this.nodes, this.edges, w, h, iter, this.repulsion ?? 1);
        const toneMap = new Map();
        const groupTones = new Map();
        let gi = 0, ai = 0;
        for (const n of this.nodes) {
            if (n.tone) {
                toneMap.set(n.id, n.tone);
                continue;
            }
            if (n.group !== undefined) {
                if (!groupTones.has(n.group))
                    groupTones.set(n.group, FG_TONES[gi++ % 8]);
                toneMap.set(n.id, groupTones.get(n.group));
            }
        }
        for (const n of this.nodes) {
            if (!toneMap.has(n.id))
                toneMap.set(n.id, FG_TONES[ai++ % 8]);
        }
        this.fgNodes = this.nodes.map((n, i) => {
            const p = layout.get(n.id) ?? { x: w / 2, y: h / 2 };
            const r = nr * Math.sqrt(Math.max(n.weight ?? 1, 0.25));
            return { node: n, i, x: p.x, y: p.y, r, tone: toneMap.get(n.id) ?? "category1", title: n.label ?? n.id, shapePath: nodeShapePath(n.shape, r) };
        });
        if (this.fgNodes.length > 0) {
            let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
            for (const p of this.fgNodes) {
                const e = p.r * 1.7;
                x0 = Math.min(x0, p.x - e);
                y0 = Math.min(y0, p.y - e);
                x1 = Math.max(x1, p.x + e);
                y1 = Math.max(y1, p.y + e);
            }
            let bw = x1 - x0, bh = y1 - y0;
            if (!(bw > 0)) {
                bw = w;
                x0 = x1 - bw / 2;
            }
            if (!(bh > 0)) {
                bh = h;
                y0 = y1 - bh / 2;
            }
            const mx = bw * FG_CONTENT_MARGIN, my = bh * FG_CONTENT_MARGIN;
            this._cb = { x: x0 - mx, y: y0 - my, w: bw + 2 * mx, h: bh + 2 * my };
        }
        else {
            this._cb = { x: 0, y: 0, w, h };
        }
        const curve = Math.max(0, this.edgeCurve ?? 0);
        const nById = new Map(this.nodes.map((n) => [n.id, n]));
        this.fgEdges = this.edges.map((e, i) => {
            const a = layout.get(e.source), b = layout.get(e.target);
            if (!a || !b)
                return null;
            let path = null;
            let cx = (a.x + b.x) / 2, cy = (a.y + b.y) / 2;
            if (curve > 0) {
                const dx = b.x - a.x, dy = b.y - a.y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 0.0001;
                const off = curve * dist * FG_CURVE_FACTOR;
                cx = (a.x + b.x) / 2 + (-dy / dist) * off;
                cy = (a.y + b.y) / 2 + (dx / dist) * off;
                path = `M ${a.x} ${a.y} Q ${cx} ${cy} ${b.x} ${b.y}`;
            }
            return { edge: e, i, x1: a.x, y1: a.y, x2: b.x, y2: b.y, midX: cx, midY: cy, path, dashArray: edgeDashArray(e.dash, e.weak), strokeWidth: typeof e.width === "number" ? e.width : e.emphasis ? 2.5 : null, srcLabel: nById.get(e.source)?.label ?? e.source, tgtLabel: nById.get(e.target)?.label ?? e.target };
        }).filter((e) => e !== null);
    }
    get viewBox() { return `${this._cb.x} ${this._cb.y} ${this._cb.w} ${this._cb.h}`; }
    get hostClass() { return classNames("st-forceGraph", this.classInput); }
    get tooltipLeft() {
        const p = this.hoveredIdx !== null ? this.fgNodes[this.hoveredIdx] : null;
        return p ? ((p.x - this._cb.x) / this._cb.w) * 100 : 0;
    }
    get tooltipTop() {
        const p = this.hoveredIdx !== null ? this.fgNodes[this.hoveredIdx] : null;
        return p ? ((p.y - this._cb.y) / this._cb.h) * 100 : 0;
    }
    nodeClass(p) {
        return classNames("st-forceGraph__node", this.selectedIds?.includes(p.node.id) && "st-forceGraph__node--selected", this.focusId === p.node.id && "st-forceGraph__node--focused");
    }
    edgeClass(e) {
        return classNames("st-forceGraph__edge", e.edge.weak && "st-forceGraph__edge--weak", e.edge.emphasis && "st-forceGraph__edge--emphasis");
    }
    lgShapePath(entry) { return nodeShapePath(entry.shape, 5); }
    lgDashArray(entry) { return edgeDashArray(entry.dash, entry.weak); }
    handleNodeClick(node) { this.onSelect?.(node.id); }
    handlePointerMove(event) {
        const nodeId = event.target?.closest("[data-node-id]")?.getAttribute("data-node-id");
        const idx = nodeId ? this.fgNodes.findIndex((p) => p.node.id === nodeId) : -1;
        this.hoveredIdx = idx >= 0 ? idx : null;
        this.onNodeHover?.(idx >= 0 ? this.fgNodes[idx].node : null);
    }
    handlePointerLeave() { this.hoveredIdx = null; this.onNodeHover?.(null); }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: ForceGraph, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: ForceGraph, isStandalone: true, selector: "st-force-graph", inputs: { nodes: "nodes", edges: "edges", label: "label", width: "width", height: "height", nodeRadius: "nodeRadius", showLabels: "showLabels", iterations: "iterations", selectedIds: "selectedIds", focusId: "focusId", legend: "legend", edgeCurve: "edgeCurve", repulsion: "repulsion", onSelect: "onSelect", onOpenEntity: "onOpenEntity", onEdgeHover: "onEdgeHover", onNodeHover: "onNodeHover", mergePair: "mergePair", onMergeComplete: "onMergeComplete", classInput: ["class", "classInput"] }, usesOnChanges: true, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <svg
        [attr.viewBox]="viewBox"
        preserveAspectRatio="xMidYMid meet"
        width="100%"
        height="100%"
        focusable="false"
        [attr.aria-label]="label"
        role="img"
        (pointermove)="handlePointerMove($event)"
        (pointerleave)="handlePointerLeave()"
      >
        <g class="st-forceGraph__edges">
          @for (e of fgEdges; track e.i) {
            @if (e.path) {
              <path
                [class]="edgeClass(e)"
                [attr.d]="e.path"
                [attr.stroke-dasharray]="e.dashArray"
                [attr.stroke-width]="e.strokeWidth"
                fill="none"
                [attr.data-edge-index]="e.i"
              ></path>
            } @else {
              <line
                [class]="edgeClass(e)"
                [attr.x1]="e.x1" [attr.y1]="e.y1"
                [attr.x2]="e.x2" [attr.y2]="e.y2"
                [attr.stroke-dasharray]="e.dashArray"
                [attr.stroke-width]="e.strokeWidth"
                [attr.data-edge-index]="e.i"
              ></line>
            }
          }
        </g>
        <g class="st-forceGraph__nodes">
          @for (p of fgNodes; track p.node.id) {
            <g
              [class]="nodeClass(p)"
              [attr.transform]="'translate(' + p.x + ',' + p.y + ')'"
              [attr.data-node-id]="p.node.id"
              (click)="handleNodeClick(p.node)"
            >
              @if (p.shapePath) {
                <path
                  [class]="'st-forceGraph__nodeShape st-forceGraph__nodeShape--' + p.tone"
                  [attr.d]="p.shapePath"
                ></path>
              } @else {
                <circle
                  [class]="'st-forceGraph__nodeDot st-forceGraph__nodeDot--' + p.tone"
                  [attr.r]="p.r"
                ></circle>
              }
              @if (showLabels) {
                <text class="st-forceGraph__nodeLabel" [attr.dy]="p.r + 12" text-anchor="middle">{{ p.title }}</text>
              }
            </g>
          }
        </g>
      </svg>

      @if (legend && legend.length > 0) {
        <div class="st-forceGraph__legend">
          @for (entry of legend; track $index) {
            <div class="st-forceGraph__legendEntry">
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                @if (entry.shape !== undefined) {
                  <g transform="translate(8,8)">
                    @if (lgShapePath(entry)) {
                      <path [class]="'st-forceGraph__nodeShape st-forceGraph__nodeShape--' + (entry.tone ?? 'category1')" [attr.d]="lgShapePath(entry)"></path>
                    } @else {
                      <circle [class]="'st-forceGraph__nodeDot st-forceGraph__nodeDot--' + (entry.tone ?? 'category1')" r="5"></circle>
                    }
                  </g>
                } @else {
                  <line
                    [class]="'st-forceGraph__edge' + (entry.weak ? ' st-forceGraph__edge--weak' : '')"
                    x1="0" y1="8" x2="16" y2="8"
                    [attr.stroke-dasharray]="lgDashArray(entry)"
                  ></line>
                }
              </svg>
              <span class="st-forceGraph__legendLabel">{{ entry.label }}</span>
            </div>
          }
        </div>
      }

      @if (hoveredIdx !== null && fgNodes[hoveredIdx]) {
        <div class="st-forceGraph__tooltip" role="presentation"
          [style.left]="tooltipLeft + '%'"
          [style.top]="tooltipTop + '%'"
        >
          <span class="st-forceGraph__tooltipLabel">{{ fgNodes[hoveredIdx].title }}</span>
        </div>
      }
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: ForceGraph, decorators: [{
            type: Component,
            args: [{
                    selector: "st-force-graph",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <svg
        [attr.viewBox]="viewBox"
        preserveAspectRatio="xMidYMid meet"
        width="100%"
        height="100%"
        focusable="false"
        [attr.aria-label]="label"
        role="img"
        (pointermove)="handlePointerMove($event)"
        (pointerleave)="handlePointerLeave()"
      >
        <g class="st-forceGraph__edges">
          @for (e of fgEdges; track e.i) {
            @if (e.path) {
              <path
                [class]="edgeClass(e)"
                [attr.d]="e.path"
                [attr.stroke-dasharray]="e.dashArray"
                [attr.stroke-width]="e.strokeWidth"
                fill="none"
                [attr.data-edge-index]="e.i"
              ></path>
            } @else {
              <line
                [class]="edgeClass(e)"
                [attr.x1]="e.x1" [attr.y1]="e.y1"
                [attr.x2]="e.x2" [attr.y2]="e.y2"
                [attr.stroke-dasharray]="e.dashArray"
                [attr.stroke-width]="e.strokeWidth"
                [attr.data-edge-index]="e.i"
              ></line>
            }
          }
        </g>
        <g class="st-forceGraph__nodes">
          @for (p of fgNodes; track p.node.id) {
            <g
              [class]="nodeClass(p)"
              [attr.transform]="'translate(' + p.x + ',' + p.y + ')'"
              [attr.data-node-id]="p.node.id"
              (click)="handleNodeClick(p.node)"
            >
              @if (p.shapePath) {
                <path
                  [class]="'st-forceGraph__nodeShape st-forceGraph__nodeShape--' + p.tone"
                  [attr.d]="p.shapePath"
                ></path>
              } @else {
                <circle
                  [class]="'st-forceGraph__nodeDot st-forceGraph__nodeDot--' + p.tone"
                  [attr.r]="p.r"
                ></circle>
              }
              @if (showLabels) {
                <text class="st-forceGraph__nodeLabel" [attr.dy]="p.r + 12" text-anchor="middle">{{ p.title }}</text>
              }
            </g>
          }
        </g>
      </svg>

      @if (legend && legend.length > 0) {
        <div class="st-forceGraph__legend">
          @for (entry of legend; track $index) {
            <div class="st-forceGraph__legendEntry">
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                @if (entry.shape !== undefined) {
                  <g transform="translate(8,8)">
                    @if (lgShapePath(entry)) {
                      <path [class]="'st-forceGraph__nodeShape st-forceGraph__nodeShape--' + (entry.tone ?? 'category1')" [attr.d]="lgShapePath(entry)"></path>
                    } @else {
                      <circle [class]="'st-forceGraph__nodeDot st-forceGraph__nodeDot--' + (entry.tone ?? 'category1')" r="5"></circle>
                    }
                  </g>
                } @else {
                  <line
                    [class]="'st-forceGraph__edge' + (entry.weak ? ' st-forceGraph__edge--weak' : '')"
                    x1="0" y1="8" x2="16" y2="8"
                    [attr.stroke-dasharray]="lgDashArray(entry)"
                  ></line>
                }
              </svg>
              <span class="st-forceGraph__legendLabel">{{ entry.label }}</span>
            </div>
          }
        </div>
      }

      @if (hoveredIdx !== null && fgNodes[hoveredIdx]) {
        <div class="st-forceGraph__tooltip" role="presentation"
          [style.left]="tooltipLeft + '%'"
          [style.top]="tooltipTop + '%'"
        >
          <span class="st-forceGraph__tooltipLabel">{{ fgNodes[hoveredIdx].title }}</span>
        </div>
      }
    </div>
  `,
                }]
        }], propDecorators: { nodes: [{
                type: NgInput
            }], edges: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], width: [{
                type: NgInput
            }], height: [{
                type: NgInput
            }], nodeRadius: [{
                type: NgInput
            }], showLabels: [{
                type: NgInput
            }], iterations: [{
                type: NgInput
            }], selectedIds: [{
                type: NgInput
            }], focusId: [{
                type: NgInput
            }], legend: [{
                type: NgInput
            }], edgeCurve: [{
                type: NgInput
            }], repulsion: [{
                type: NgInput
            }], onSelect: [{
                type: NgInput
            }], onOpenEntity: [{
                type: NgInput
            }], onEdgeHover: [{
                type: NgInput
            }], onNodeHover: [{
                type: NgInput
            }], mergePair: [{
                type: NgInput
            }], onMergeComplete: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=ForceGraph.js.map