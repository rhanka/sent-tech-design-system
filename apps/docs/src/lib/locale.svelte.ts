import type { Locale } from "./i18n";

class LocaleStore {
  value = $state<Locale>("fr");
}

export const locale = new LocaleStore();
