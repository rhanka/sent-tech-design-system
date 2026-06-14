import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

import type { AvatarSize } from "./Avatar.js";

export type AvatarGroupProps = {
  /** Nombre maximum d'avatars visibles. Au-delà, un jeton « +N » est affiché. */
  max?: number;
  /** Taille appliquée au jeton de débordement (doit refléter les Avatar). */
  size?: AvatarSize;
  /** Nombre total réel d'éléments (sert à calculer le « +N » si > max). */
  total?: number;
  class?: string;
};

@Component({
  selector: "st-avatar-group",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class AvatarGroup {
  static readonly stComponentName = "AvatarGroup";
  readonly componentName = "AvatarGroup";
  @NgInput() max?: number;
  @NgInput() size?: AvatarSize;
  @NgInput() total?: number;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-avatarGroup", this.classInput].filter(Boolean).join(" ");
  }
}
