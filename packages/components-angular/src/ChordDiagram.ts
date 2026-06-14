import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import { chartDataList } from "./chartScale.js";

import { contrastTextForTone } from "./chartContrast.js";

export type ChordDiagramTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type ChordDiagramFlow = {
  from: string;
  to: string;
  value: number;
};

export type ChordDiagramProps = {
  data: ChordDiagramFlow[];
  labels?: Record<string, string>;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

@Component({
  selector: "st-chord-diagram",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class ChordDiagram {
  static readonly stComponentName = "ChordDiagram";
  readonly componentName = "ChordDiagram";
  @NgInput() data!: ChordDiagramFlow[];
  @NgInput() labels?: Record<string, string>;
  @NgInput() width?: number;
  @NgInput() height?: number;
  @NgInput() label!: string;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-chordDiagram", this.classInput].filter(Boolean).join(" ");
  }
}
