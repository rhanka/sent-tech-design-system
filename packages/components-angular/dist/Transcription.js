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
    showTimestamps;
    get hostClass() {
        return classNames("st-transcription", this.classInput);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Transcription, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: Transcription, isStandalone: true, selector: "st-transcription", inputs: { title: "title", segments: "segments", entries: "entries", text: "text", classInput: ["class", "classInput"], open: "open", showTimestamps: "showTimestamps" }, ngImport: i0, template: `
    <div class="st-transcription" [class]="hostClass">
      @for (e of entries ?? []; track $index) {
        <div class="st-transcription__entry">
          <span class="st-transcription__text">{{ e.text }}</span>
        </div>
      }
      @if (!entries?.length) {
        <ng-content></ng-content>
      }
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Transcription, decorators: [{
            type: Component,
            args: [{
                    selector: "st-transcription",
                    standalone: true,
                    template: `
    <div class="st-transcription" [class]="hostClass">
      @for (e of entries ?? []; track $index) {
        <div class="st-transcription__entry">
          <span class="st-transcription__text">{{ e.text }}</span>
        </div>
      }
      @if (!entries?.length) {
        <ng-content></ng-content>
      }
    </div>
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