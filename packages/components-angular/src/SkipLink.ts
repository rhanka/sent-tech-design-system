import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

export type SkipLinkProps = {
  href?: string;
  class?: string;
};

@Component({
  selector: "st-skip-link",
  standalone: true,
  // Host transparent (parité React/Vue/Svelte qui n'ont pas d'élément hôte) :
  // sans cela l'élément <st-*> (display:inline par défaut) s'intercale dans le
  // layout (line-box autour du contenu, ou SVG width:100% qui collapse) et
  // désaligne le rendu. display:contents efface la boîte de l'hôte.
  styles: [":host { display: contents; }"],
  template: `
    <a [href]="href || '#main-content'" [attr.data-st-component]="componentName" [class]="hostClass">
      <ng-content>Aller au contenu principal</ng-content>
    </a>
  `,
})
export class SkipLink {
  static readonly stComponentName = "SkipLink";
  readonly componentName = "SkipLink";
  @NgInput() href?: string;
  @NgInput("class") classInput?: string;

  get hostClass(): string {
    return classNames("st-skipLink", this.classInput);
  }
}
