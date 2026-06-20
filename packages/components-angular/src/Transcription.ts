import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type TranscriptionSegment = {
  speaker?: string;
  startTime?: string;
  endTime?: string;
  text: string;
};

/** Alias used by chat-oriented consumers. */
export type TranscriptionEntry = {
  role?: string;
  text: string;
  timestamp?: string;
};

export type TranscriptionProps = {
  title?: string;
  segments?: TranscriptionSegment[];
  entries?: TranscriptionEntry[];
  text?: string;
  class?: string;
  open?: boolean;
  showTimestamps?: boolean;
};

@Component({
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
})
export class Transcription {
  static readonly stComponentName = "Transcription";
  readonly componentName = "Transcription";

  @NgInput() title?: string;
  @NgInput() segments?: TranscriptionSegment[];
  @NgInput() entries?: TranscriptionEntry[];
  @NgInput() text?: string;
  @NgInput("class") classInput?: string;
  @NgInput() open?: boolean;
  @NgInput() showTimestamps?: boolean;

  get hostClass(): string {
    return classNames("st-transcription", this.classInput);
  }
}
