import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type ScoreCardType = "value" | "complexity";

export type ScoreCardSize = "sm" | "md" | "lg";

export type ScoreCardProps = {
  title: string;
  score: number;
  stars: number;
  max?: number;
  type?: ScoreCardType;
  unit?: string;
  size?: ScoreCardSize;
  class?: string;
};

@Component({
  selector: "st-score-card",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class ScoreCard {
  static readonly stComponentName = "ScoreCard";
  readonly componentName = "ScoreCard";
  @NgInput() title!: string;
  @NgInput() score!: number;
  @NgInput() stars!: number;
  @NgInput() max?: number;
  @NgInput("type") typeInput?: ScoreCardType;
  @NgInput() unit?: string;
  @NgInput() size?: ScoreCardSize;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-scoreCard", this.classInput].filter(Boolean).join(" ");
  }
}
