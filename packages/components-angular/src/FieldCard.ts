import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type FieldCardVariant = "plain" | "bordered" | "accent";

export type FieldCardTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type FieldCardProps = {
  label: string;
  variant?: FieldCardVariant;
  tone?: FieldCardTone;
  commentCount?: number;
  onOpenComments?: () => void;
  class?: string;
};

@Component({
  selector: "st-field-card",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div class="st-fieldCard__header">
        <span class="st-fieldCard__label">{{ label }}</span>
        @if (commentCount !== undefined && commentCount > 0) {
          <button type="button" class="st-fieldCard__comments" (click)="onOpenComments && onOpenComments()">
            {{ commentCount }}
          </button>
        }
      </div>
      <div class="st-fieldCard__body">
        <ng-content></ng-content>
      </div>
    </div>
  `,
})
export class FieldCard {
  static readonly stComponentName = "FieldCard";
  readonly componentName = "FieldCard";
  @NgInput() label!: string;
  @NgInput() variant?: FieldCardVariant;
  @NgInput() tone?: FieldCardTone;
  @NgInput() commentCount?: number;
  @NgInput() onOpenComments?: () => void;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames(
      "st-fieldCard",
      this.variant && `st-fieldCard--${this.variant}`,
      this.tone && `st-fieldCard--${this.tone}`,
      this.classInput,
    );
  }
}
