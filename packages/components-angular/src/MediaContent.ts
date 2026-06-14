import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type MediaKind = "image" | "video";

export type MediaContentProps = {
  title?: string;
  caption?: string;
  byline?: string;
  media?: string;
  mediaAlt?: string;
  mediaKind?: MediaKind;
  mediaControls?: boolean;
  aspectRatio?: string;
  mediaCaptions?: string;
  mediaCaptionsLabel?: string;
  mediaCaptionsLang?: string;
  class?: string;
};

@Component({
  selector: "st-media-content",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class MediaContent {
  static readonly stComponentName = "MediaContent";
  readonly componentName = "MediaContent";
  @NgInput() title?: string;
  @NgInput() caption?: string;
  @NgInput() byline?: string;
  @NgInput() media?: string;
  @NgInput() mediaAlt?: string;
  @NgInput() mediaKind?: MediaKind;
  @NgInput() mediaControls?: boolean;
  @NgInput() aspectRatio?: string;
  @NgInput() mediaCaptions?: string;
  @NgInput() mediaCaptionsLabel?: string;
  @NgInput() mediaCaptionsLang?: string;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-mediaContent", this.classInput].filter(Boolean).join(" ");
  }
}
