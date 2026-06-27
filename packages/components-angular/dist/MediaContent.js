import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class MediaContent {
    static stComponentName = "MediaContent";
    componentName = "MediaContent";
    title;
    caption;
    byline;
    media;
    mediaAlt;
    mediaKind;
    mediaControls;
    aspectRatio;
    mediaCaptions;
    mediaCaptionsLabel;
    mediaCaptionsLang;
    classInput;
    defaultCaptions = "data:text/vtt,WEBVTT";
    get hasMedia() {
        return Boolean(this.media?.trim());
    }
    get resolvedKind() {
        return this.mediaKind ?? "image";
    }
    get resolvedControls() {
        return this.mediaControls ?? true;
    }
    get resolvedAspectRatio() {
        return this.aspectRatio ?? "16/9";
    }
    get resolvedCaptionsLabel() {
        return this.mediaCaptionsLabel ?? "Français";
    }
    get resolvedCaptionsLang() {
        return this.mediaCaptionsLang ?? "fr";
    }
    get hostClass() {
        return classNames("st-mediaContent", this.classInput);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: MediaContent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: MediaContent, isStandalone: true, selector: "st-media-content", inputs: { title: "title", caption: "caption", byline: "byline", media: "media", mediaAlt: "mediaAlt", mediaKind: "mediaKind", mediaControls: "mediaControls", aspectRatio: "aspectRatio", mediaCaptions: "mediaCaptions", mediaCaptionsLabel: "mediaCaptionsLabel", mediaCaptionsLang: "mediaCaptionsLang", classInput: ["class", "classInput"] }, ngImport: i0, template: `
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
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: MediaContent, decorators: [{
            type: Component,
            args: [{
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
                }]
        }], propDecorators: { title: [{
                type: NgInput
            }], caption: [{
                type: NgInput
            }], byline: [{
                type: NgInput
            }], media: [{
                type: NgInput
            }], mediaAlt: [{
                type: NgInput
            }], mediaKind: [{
                type: NgInput
            }], mediaControls: [{
                type: NgInput
            }], aspectRatio: [{
                type: NgInput
            }], mediaCaptions: [{
                type: NgInput
            }], mediaCaptionsLabel: [{
                type: NgInput
            }], mediaCaptionsLang: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=MediaContent.js.map