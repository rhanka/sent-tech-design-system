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
      <div class="st-mediaContent__media" [style.--st-mediaContent-ratio]="resolvedAspectRatio">
        @if (hasMedia) {
          @if (resolvedKind === 'video') {
            <video [controls]="resolvedControls" [src]="media" [attr.aria-label]="title || 'Contenu média'" preload="metadata">
              <track
                kind="captions"
                [src]="mediaCaptions ?? defaultCaptions"
                [attr.srclang]="resolvedCaptionsLang"
                [attr.label]="resolvedCaptionsLabel"
                default
              />
            </video>
          } @else {
            <img [src]="media" [alt]="mediaAlt ?? ''" loading="lazy" decoding="async" />
          }
        } @else {
          <ng-content></ng-content>
        }
      </div>

      @if (title || caption || byline) {
        <figcaption class="st-mediaContent__caption">
          @if (title) { <p class="st-mediaContent__title">{{ title }}</p> }
          @if (caption) { <p>{{ caption }}</p> }
          @if (byline) { <p class="st-mediaContent__byline">{{ byline }}</p> }
        </figcaption>
      }
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

  readonly defaultCaptions = "data:text/vtt,WEBVTT";

  get hasMedia(): boolean {
    return Boolean(this.media?.trim());
  }

  get resolvedKind(): MediaKind {
    return this.mediaKind ?? "image";
  }

  get resolvedControls(): boolean {
    return this.mediaControls ?? true;
  }

  get resolvedAspectRatio(): string {
    return this.aspectRatio ?? "16/9";
  }

  get resolvedCaptionsLabel(): string {
    return this.mediaCaptionsLabel ?? "Français";
  }

  get resolvedCaptionsLang(): string {
    return this.mediaCaptionsLang ?? "fr";
  }

  get hostClass(): string {
    return classNames("st-mediaContent", this.classInput);
  }
}
