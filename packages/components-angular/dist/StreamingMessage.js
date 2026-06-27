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
    mode = "live";
    placeholder = "Streaming en cours…";
    classInput;
    get hostClass() {
        return classNames("st-streamingMessage", `st-streamingMessage--${this.mode}`, this.classInput);
    }
    get resolvedText() {
        return this.content ?? this.text;
    }
    get isEmpty() {
        const value = this.resolvedText;
        return value == null || value === "";
    }
    get textClass() {
        return classNames("st-streamingMessage__text", this.isEmpty && "st-streamingMessage__text--muted");
    }
    get displayText() {
        return this.isEmpty ? this.placeholder : this.resolvedText;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: StreamingMessage, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: StreamingMessage, isStandalone: true, selector: "st-streaming-message", inputs: { streaming: "streaming", content: "content", text: "text", events: "events", mode: "mode", placeholder: "placeholder", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <section [attr.data-st-component]="componentName" [class]="hostClass">
      <p [class]="textClass">{{ displayText }}</p>
      @if (events?.length) {
        <ul class="st-streamingMessage__trailList">
          @for (event of events ?? []; track event.id) {
            <li>{{ event.label }}</li>
          }
        </ul>
      }
    </section>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: StreamingMessage, decorators: [{
            type: Component,
            args: [{
                    selector: "st-streaming-message",
                    standalone: true,
                    template: `
    <section [attr.data-st-component]="componentName" [class]="hostClass">
      <p [class]="textClass">{{ displayText }}</p>
      @if (events?.length) {
        <ul class="st-streamingMessage__trailList">
          @for (event of events ?? []; track event.id) {
            <li>{{ event.label }}</li>
          }
        </ul>
      }
    </section>
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
            }], placeholder: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=StreamingMessage.js.map