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
    get hostClass() {
        return classNames("st-mediaContent", this.classInput);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: MediaContent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: MediaContent, isStandalone: true, selector: "st-media-content", inputs: { title: "title", caption: "caption", byline: "byline", media: "media", mediaAlt: "mediaAlt", mediaKind: "mediaKind", mediaControls: "mediaControls", aspectRatio: "aspectRatio", mediaCaptions: "mediaCaptions", mediaCaptionsLabel: "mediaCaptionsLabel", mediaCaptionsLang: "mediaCaptionsLang", classInput: ["class", "classInput"] }, ngImport: i0, template: `
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
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: MediaContent, decorators: [{
            type: Component,
            args: [{
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