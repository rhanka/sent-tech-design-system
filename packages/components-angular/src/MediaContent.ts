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
    <figure [attr.data-st-component]="componentName" [class]="hostClass">
      @if (title) { <div class="st-mediaContent__title">{{ title }}</div> }
      @if (media && mediaKind === 'video') {
        <video class="st-mediaContent__video" [src]="media" [controls]="mediaControls" [attr.aspect-ratio]="aspectRatio">
          @if (mediaCaptions) {
            <track kind="subtitles" [src]="mediaCaptions" [srclang]="mediaCaptionsLang || 'fr'" [label]="mediaCaptionsLabel || 'Sous-titres'" />
          }
        </video>
      } @else if (media) {
        <img class="st-mediaContent__img" [src]="media" [alt]="mediaAlt || ''" />
      }
      @if (caption || byline) {
        <figcaption class="st-mediaContent__caption">
          @if (caption) { <span>{{ caption }}</span> }
          @if (byline) { <cite class="st-mediaContent__byline">{{ byline }}</cite> }
        </figcaption>
      }
      <ng-content></ng-content>
    </figure>
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
    return classNames("st-mediaContent", this.classInput);
  }
}
