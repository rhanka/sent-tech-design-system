import { NgTemplateOutlet } from "@angular/common";
import { Component, Input as NgInput } from "@angular/core";

import { classNames } from "./classNames.js";

/** Balise rendue. `span`/`div` = inline/bloc neutre ; `h2`/`h3` quand l'overline
 * sert d'en-tête de région (sémantique de titre). */
export type OverlineAs = "span" | "div" | "h2" | "h3";

export type OverlineProps = {
  /** Balise : `span` (défaut) inline, `div` bloc, `h2`/`h3` pour un en-tête de région. */
  as?: OverlineAs;
  class?: string;
};

@Component({
  selector: "st-overline",
  standalone: true,
  imports: [NgTemplateOutlet],
  // Un SEUL <ng-content> (réutilisé via ngTemplateOutlet) : avec createComponent
  // (île Angular des docs), projectableNodes ne remplit que le slot d'index 0.
  // Mettre un <ng-content> par @case créait 4 slots dont un seul recevait le
  // contenu — la balise active (span/h3) n'affichait donc rien. Un unique
  // ng-content dans un <ng-template> partagé garantit la projection pour TOUTES
  // les balises.
  styles: [":host { display: contents; }"],
  template: `
    <ng-template #content><ng-content></ng-content></ng-template>
    @switch (resolvedTag) {
      @case ("div") {
        <div [attr.data-st-component]="componentName" [class]="hostClass"><ng-container [ngTemplateOutlet]="content" /></div>
      }
      @case ("h2") {
        <h2 [attr.data-st-component]="componentName" [class]="hostClass"><ng-container [ngTemplateOutlet]="content" /></h2>
      }
      @case ("h3") {
        <h3 [attr.data-st-component]="componentName" [class]="hostClass"><ng-container [ngTemplateOutlet]="content" /></h3>
      }
      @default {
        <span [attr.data-st-component]="componentName" [class]="hostClass"><ng-container [ngTemplateOutlet]="content" /></span>
      }
    }
  `,
})
export class Overline {
  static readonly stComponentName = "Overline";
  readonly componentName = "Overline";
  @NgInput() as?: OverlineAs;
  @NgInput("class") classInput?: string;

  get resolvedTag(): OverlineAs {
    return this.as ?? "span";
  }

  get hostClass(): string {
    return classNames("st-overline", this.classInput);
  }
}
