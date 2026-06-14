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
export class ForceGraph {
    static stComponentName = "ForceGraph";
    componentName = "ForceGraph";
    nodes;
    edges;
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
    get hostClass() {
        return ["st-forceGraph", this.classInput].filter(Boolean).join(" ");
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: ForceGraph, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "21.2.17", type: ForceGraph, isStandalone: true, selector: "st-force-graph", inputs: { nodes: "nodes", edges: "edges", label: "label", width: "width", height: "height", nodeRadius: "nodeRadius", showLabels: "showLabels", iterations: "iterations", selectedIds: "selectedIds", focusId: "focusId", legend: "legend", edgeCurve: "edgeCurve", repulsion: "repulsion", onSelect: "onSelect", onOpenEntity: "onOpenEntity", onEdgeHover: "onEdgeHover", onNodeHover: "onNodeHover", mergePair: "mergePair", onMergeComplete: "onMergeComplete", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
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
      <ng-content></ng-content>
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