import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class Transcription {
    static stComponentName = "Transcription";
    componentName = "Transcription";
    title;
    segments;
    entries;
    text;
    classInput;
    open;
    showTimestamps = true;
    get hostClass() {
        return classNames("st-transcription", this.classInput);
    }
    get resolvedSegments() {
        return (this.segments ?? []).filter((s) => Boolean(s.text?.trim()));
    }
    formatInterval(seg) {
        if (!this.showTimestamps || (!seg.startTime && !seg.endTime))
            return "";
        if (!seg.startTime)
            return seg.endTime ? `- ${seg.endTime}` : "";
        if (!seg.endTime)
            return `${seg.startTime} -`;
        return `${seg.startTime} - ${seg.endTime}`;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Transcription, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: Transcription, isStandalone: true, selector: "st-transcription", inputs: { title: "title", segments: "segments", entries: "entries", text: "text", classInput: ["class", "classInput"], open: "open", showTimestamps: "showTimestamps" }, ngImport: i0, template: `
    <details [attr.data-st-component]="componentName" [class]="hostClass" [attr.open]="open ? '' : null">
      <summary>{{ title ?? 'Transcription' }}</summary>
      <div class="st-transcription__content">
        @if (resolvedSegments.length > 0) {
          <ol class="st-transcription__list">
            @for (seg of resolvedSegments; track $index) {
              <li class="st-transcription__item">
                <p class="st-transcription__meta">
                  @if (seg.speaker) {
                    <span class="st-transcription__speaker">{{ seg.speaker }}</span>
                  }
                  @if (showTimestamps && (seg.startTime || seg.endTime)) {
                    <time>{{ formatInterval(seg) }}</time>
                  }
                </p>
                <p class="st-transcription__text">{{ seg.text }}</p>
              </li>
            }
          </ol>
        } @else if (text) {
          <p class="st-transcription__text">{{ text }}</p>
        } @else {
          <p class="st-transcription__text">Aucun contenu de transcription fourni.</p>
        }
      </div>
    </details>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Transcription, decorators: [{
            type: Component,
            args: [{
                    selector: "st-transcription",
                    standalone: true,
                    template: `
    <details [attr.data-st-component]="componentName" [class]="hostClass" [attr.open]="open ? '' : null">
      <summary>{{ title ?? 'Transcription' }}</summary>
      <div class="st-transcription__content">
        @if (resolvedSegments.length > 0) {
          <ol class="st-transcription__list">
            @for (seg of resolvedSegments; track $index) {
              <li class="st-transcription__item">
                <p class="st-transcription__meta">
                  @if (seg.speaker) {
                    <span class="st-transcription__speaker">{{ seg.speaker }}</span>
                  }
                  @if (showTimestamps && (seg.startTime || seg.endTime)) {
                    <time>{{ formatInterval(seg) }}</time>
                  }
                </p>
                <p class="st-transcription__text">{{ seg.text }}</p>
              </li>
            }
          </ol>
        } @else if (text) {
          <p class="st-transcription__text">{{ text }}</p>
        } @else {
          <p class="st-transcription__text">Aucun contenu de transcription fourni.</p>
        }
      </div>
    </details>
  `,
                }]
        }], propDecorators: { title: [{
                type: NgInput
            }], segments: [{
                type: NgInput
            }], entries: [{
                type: NgInput
            }], text: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }], open: [{
                type: NgInput
            }], showTimestamps: [{
                type: NgInput
            }] } });
//# sourceMappingURL=Transcription.js.map