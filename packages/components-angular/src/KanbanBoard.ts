import { Component, Input as NgInput } from "@angular/core";

export type KanbanBoardCard = {
  id: string;
  title: string;
  description?: string;
};

export type KanbanBoardColumn = {
  id: string;
  title: string;
  cards: KanbanBoardCard[];
};

export type KanbanBoardProps = {
  columns?: KanbanBoardColumn[];
  class?: string;
};

@Component({
  selector: "st-kanban-board",
  standalone: true,
  template: `
    <div [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class KanbanBoard {
  static readonly stComponentName = "KanbanBoard";
  readonly componentName = "KanbanBoard";
  @NgInput() columns: KanbanBoardColumn[] = [];
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return ["st-kb", this.classInput].filter(Boolean).join(" ");
  }
}
