import { inject, InjectionToken } from "@angular/core";

/** Private composition channel; deliberately absent from the package barrel. */
export interface MenuHost {
  readonly rootMenuId: string;
  select(keyboard: boolean, cascade: boolean): void;
}
export const MENU_HOST_CONTEXT = Symbol("st-menu-host-context");
export const MENU_HOST = new InjectionToken<MenuHost>("st-menu-host");

/** Allow the existing direct-construction Node tests without masking DI errors. */
export function injectMenuDependency<T>(token: import("@angular/core").ProviderToken<T>): T | null {
  try {
    return inject(token, { optional: true });
  } catch (error) {
    if ((error as { code?: number }).code === -203) return null;
    throw error;
  }
}
