import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type TranscriptionSegment = {
  speaker?: string;
  startTime?: string;
  endTime?: string;
  text: string;
};

export type TranscriptionProps = {
  title?: string;
  segments?: TranscriptionSegment[];
  text?: string;
  class?: string;
  open?: boolean;
  showTimestamps?: boolean;
};

@Component({
  selector: "st-transcription",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class Transcription {
  static readonly stComponentName = "Transcription";
  readonly componentName = "Transcription";
  @NgInput() title?: string;
  @NgInput() segments?: TranscriptionSegment[];
  @NgInput() text?: string;
  @NgInput("class") classInput?: string;
  @NgInput() open?: boolean;
  @NgInput() showTimestamps?: boolean;

  get hostClass(): string {
    return ["st-transcription", this.classInput].filter(Boolean).join(" ");
  }
}
