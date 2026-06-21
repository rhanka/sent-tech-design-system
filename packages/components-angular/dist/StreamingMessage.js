import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export class StreamingMessage {
    static stComponentName = "StreamingMessage";
    componentName = "StreamingMessage";
    streaming = false;
    content;
    text;
    events;
    mode;
    classInput;
    get hostClass() {
        return classNames("st-streamingMessage", this.streaming ? "st-streamingMessage--streaming" : undefined, this.classInput);
    }
    get resolvedText() {
        return this.content ?? this.text;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: StreamingMessage, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: StreamingMessage, isStandalone: true, selector: "st-streaming-message", inputs: { streaming: "streaming", content: "content", text: "text", events: "events", mode: "mode", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div class="st-streamingMessage__content">
        @if (resolvedText) {
          <p class="st-streamingMessage__text">{{ resolvedText }}</p>
        } @else {
          <p class="st-streamingMessage__text st-streamingMessage__text--muted">Streaming en cours…</p>
        }
      </div>
      @if (streaming) {
        <span class="st-streamingMessage__cursor" aria-hidden="true"></span>
      }
    </div>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: StreamingMessage, decorators: [{
            type: Component,
            args: [{
                    selector: "st-streaming-message",
                    standalone: true,
                    template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <div class="st-streamingMessage__content">
        @if (resolvedText) {
          <p class="st-streamingMessage__text">{{ resolvedText }}</p>
        } @else {
          <p class="st-streamingMessage__text st-streamingMessage__text--muted">Streaming en cours…</p>
        }
      </div>
      @if (streaming) {
        <span class="st-streamingMessage__cursor" aria-hidden="true"></span>
      }
    </div>
  `,
                }]
        }], propDecorators: { streaming: [{
                type: NgInput
            }], content: [{
                type: NgInput
            }], text: [{
                type: NgInput
            }], events: [{
                type: NgInput
            }], mode: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=StreamingMessage.js.map