import { Component, Input as NgInput } from "@angular/core";
import type { OnDestroy, OnInit } from "@angular/core";

import { classNames } from "./classNames.js";

export type BackToTopProps = {
  label?: string;
  disabled?: boolean;
  targetId?: string;
  threshold?: number;
  autoHide?: boolean;
  smooth?: boolean;
  class?: string;
};

@Component({
  selector: "st-back-to-top",
  standalone: true,
  template: `
    <button
      type="button"
      [attr.data-st-component]="componentName"
      [class]="hostClass"
      [disabled]="disabled ?? false"
      [attr.aria-label]="resolvedLabel"
      [attr.aria-hidden]="ariaHidden"
      [attr.aria-live]="ariaHidden ? 'polite' : null"
      [attr.tabindex]="ariaHidden ? -1 : null"
      (click)="goTop()"
    >
      <span class="st-backToTop__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 19V5"/>
          <path d="M5 12l7-7 7 7"/>
        </svg>
      </span>
      <span class="st-backToTop__label">{{ resolvedLabel }}</span>
    </button>
  `,
})
export class BackToTop implements OnInit, OnDestroy {
  static readonly stComponentName = "BackToTop";
  readonly componentName = "BackToTop";
  @NgInput() label?: string;
  @NgInput() disabled?: boolean;
  @NgInput() targetId?: string;
  @NgInput() threshold?: number;
  @NgInput() autoHide?: boolean;
  @NgInput() smooth?: boolean;
  @NgInput("class") classInput?: string;

  visible = false;
  private onScroll?: () => void;

  get resolvedLabel(): string {
    return this.label ?? "Retour en haut";
  }

  get resolvedAutoHide(): boolean {
    return this.autoHide !== false;
  }

  get ariaHidden(): boolean {
    return this.resolvedAutoHide && !this.visible;
  }

  ngOnInit(): void {
    if (!this.resolvedAutoHide) {
      this.visible = true;
      return;
    }
    if (typeof window === "undefined") return;
    const threshold = this.threshold ?? 240;
    this.onScroll = () => {
      this.visible = window.scrollY > threshold;
    };
    this.onScroll();
    window.addEventListener("scroll", this.onScroll, { passive: true });
  }

  ngOnDestroy(): void {
    if (this.onScroll && typeof window !== "undefined") {
      window.removeEventListener("scroll", this.onScroll);
    }
  }

  get hostClass(): string {
    return classNames("st-backToTop", this.classInput);
  }

  goTop(): void {
    if (typeof window === "undefined") return;
    const behavior: ScrollBehavior = this.smooth !== false ? "smooth" : "auto";
    const anchor = (this.targetId ?? "top").replace(/^#/, "");
    const el = anchor ? document.getElementById(anchor) : null;
    if (el) {
      el.scrollIntoView({ behavior, block: "start" });
    } else {
      window.scrollTo({ top: 0, behavior });
    }
  }
}
