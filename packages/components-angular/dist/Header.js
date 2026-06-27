import { Component, Input as NgInput } from "@angular/core";
import { classNames } from "./classNames.js";
import * as i0 from "@angular/core";
export function deriveInitials(name) {
    return (name ?? "")
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("");
}
export class Header {
    static stComponentName = "Header";
    componentName = "Header";
    brand;
    title;
    navigation;
    navItems;
    account;
    sticky;
    label;
    compact = false;
    classInput;
    /** Liens de navigation : `navigation` prime, sinon `navItems` (parité React/Vue). */
    get links() {
        return this.navigation ?? this.navItems ?? [];
    }
    /** Initiales dérivées du nom du compte connecté (mêmes règles que React/Vue). */
    get accountInitials() {
        return deriveInitials(this.account?.name);
    }
    get hostClass() {
        return classNames("st-header", this.sticky && "st-header--sticky", this.classInput);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Header, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.2.17", type: Header, isStandalone: true, selector: "st-header", inputs: { brand: "brand", title: "title", navigation: "navigation", navItems: "navItems", account: "account", sticky: "sticky", label: "label", compact: "compact", classInput: ["class", "classInput"] }, ngImport: i0, template: `
    <header [attr.data-st-component]="componentName" [class]="hostClass" [attr.aria-label]="label">
      <div class="st-header__leading">
        @if (brand) {
          <a class="st-header__logo" href="/">{{ brand }}</a>
        }
        @if (title) {
          <span class="st-header__title">{{ title }}</span>
        }
      </div>
      <nav class="st-header__navigation">
        @for (link of links; track link.href) {
          <a [attr.href]="link.href">{{ link.label }}</a>
        }
      </nav>
      @if (account) {
        <div class="st-header__account">
          <span class="st-header__avatar st-header__avatar--initials">{{ accountInitials }}</span>
          <span class="st-header__account-name">{{ account.name }}</span>
          @if (account.email) {
            <span class="st-header__account-email">{{ account.email }}</span>
          }
        </div>
      }
    </header>
  `, isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.17", ngImport: i0, type: Header, decorators: [{
            type: Component,
            args: [{
                    selector: "st-header",
                    standalone: true,
                    // Structure alignée byte-pour-byte sur React (catalog.tsx) et Vue (Header.ts) :
                    // zone "leading" (logo/brand + title), navigation (liens), et zone compte.
                    // L'ancienne version ne rendait QUE des <ng-content>, donc les props title /
                    // navItems / account (passées par les démos docs) n'apparaissaient jamais.
                    template: `
    <header [attr.data-st-component]="componentName" [class]="hostClass" [attr.aria-label]="label">
      <div class="st-header__leading">
        @if (brand) {
          <a class="st-header__logo" href="/">{{ brand }}</a>
        }
        @if (title) {
          <span class="st-header__title">{{ title }}</span>
        }
      </div>
      <nav class="st-header__navigation">
        @for (link of links; track link.href) {
          <a [attr.href]="link.href">{{ link.label }}</a>
        }
      </nav>
      @if (account) {
        <div class="st-header__account">
          <span class="st-header__avatar st-header__avatar--initials">{{ accountInitials }}</span>
          <span class="st-header__account-name">{{ account.name }}</span>
          @if (account.email) {
            <span class="st-header__account-email">{{ account.email }}</span>
          }
        </div>
      }
    </header>
  `,
                }]
        }], propDecorators: { brand: [{
                type: NgInput
            }], title: [{
                type: NgInput
            }], navigation: [{
                type: NgInput
            }], navItems: [{
                type: NgInput
            }], account: [{
                type: NgInput
            }], sticky: [{
                type: NgInput
            }], label: [{
                type: NgInput
            }], compact: [{
                type: NgInput
            }], classInput: [{
                type: NgInput,
                args: ["class"]
            }] } });
//# sourceMappingURL=Header.js.map