<script setup lang="ts">
import { ref, computed, onBeforeUnmount, onMounted, useId } from 'vue';
import { classNames } from './classNames.js';
import AppHeader from './AppHeader.vue';
import Glyph from './AppChromeGlyph.vue';


export interface AppChromeNavItem {
  label: string;
  href: string;
  /** Marqué actif (souligné, aria-current=page). */
  active?: boolean;
  /** Roles autorisés à voir l'item. Vide/undefined = visible par tous. */
  roles?: string[];
  /** Alias pratique pour un seul rôle autorisé. */
  role?: string;
  /** Coupe la navigation tout en gardant l'item visible/annoncé. */
  disabled?: boolean;
  ariaLabel?: string;
  target?: string;
  rel?: string;
  onClick?: (event: MouseEvent) => void;
}


export interface AppChromeThemeOption {
  id: string;
  label: string;
}


export type AppChromeColorMode = "light" | "dark" | "auto";

export type AppChromeLocale = "fr" | "en";


export type AppChromeProps = {
  brandName?: string;
  productName?: string;
  logoSrc?: string;
  logoAlt?: string;
  brandHref?: string;
  brandLabel?: string;
  nav?: AppChromeNavItem[];
  navLabel?: string;
  /** Roles de l'utilisateur courant pour filtrer les nav items gatés par rôle. */
  userRoles?: string[];
  themes?: AppChromeThemeOption[];
  theme?: string;
  onThemeChange?: (id: string) => void;
  themeLabel?: string;
  colorMode?: AppChromeColorMode;
  onColorModeChange?: (mode: AppChromeColorMode) => void;
  colorModeLabels?: { light: string; dark: string; auto: string };
  locale?: AppChromeLocale;
  onLocaleChange?: (locale: AppChromeLocale) => void;
  localeLabel?: string;
  githubHref?: string;
  githubLabel?: string;
  mobileMenuOpen?: boolean;
  onMobileMenuToggle?: () => void;
  menuLabel?: string;
  class?: string;
};
defineOptions({ name: 'AppChrome', inheritAttrs: false });
const props = withDefaults(defineProps<AppChromeProps>(), { brandName: "Sentropic", productName: undefined, logoSrc: undefined, logoAlt: "", brandHref: "/", brandLabel: undefined, nav: () => [], navLabel: "Primary", userRoles: () => [], themes: () => [], theme: undefined, onThemeChange: undefined, themeLabel: "Change theme", colorMode: undefined, onColorModeChange: undefined, colorModeLabels: () => ({ light: "Light mode", dark: "Dark mode", auto: "Auto mode" }), locale: undefined, onLocaleChange: undefined, localeLabel: "Change language", githubHref: undefined, githubLabel: "GitHub", mobileMenuOpen: false, onMobileMenuToggle: undefined, menuLabel: "Menu", class: undefined });
defineSlots<{ identity?: () => unknown; extraSelectors?: () => unknown }>();


    const drawerId = `st-appChrome-drawer-${useId()}`;

    const isThemeOpen = ref(false);

    const isLocaleOpen = ref(false);


    function onDocClick(e: MouseEvent) {
      const target = e.target as Element | null;
      if (isThemeOpen.value && target && !target.closest(".st-appChrome__themeWrap")) isThemeOpen.value = false;
      if (isLocaleOpen.value && target && !target.closest(".st-appChrome__localeWrap")) isLocaleOpen.value = false;
    }

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        isThemeOpen.value = false;
        isLocaleOpen.value = false;
      }
    }

    onMounted(() => {
      document.addEventListener("click", onDocClick);
      document.addEventListener("keydown", onKey);
    });

    onBeforeUnmount(() => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onKey);
    });


    function cycleColorMode() {
      const next: AppChromeColorMode =
        props.colorMode === "light" ? "dark" : props.colorMode === "dark" ? "auto" : "light";
      props.onColorModeChange?.(next);
    }
const activeTheme = computed(() => props.themes.find(t => t.id === props.theme) ?? props.themes[0]);
const visibleNav = computed(() => props.nav.filter(item => { const allowed = item.roles ?? (item.role ? [item.role] : []); return allowed.length === 0 || allowed.some(role => props.userRoles.includes(role)); }));
const navRel = (item: AppChromeNavItem) => item.disabled ? undefined : item.rel ?? (item.target === '_blank' ? 'noreferrer' : undefined);
function clickNav(event: MouseEvent, item: AppChromeNavItem, drawer = false) { if (item.disabled) event.preventDefault(); item.onClick?.(event); if (drawer && !item.disabled) props.onMobileMenuToggle?.(); }
const colorModeAriaLabel = computed(() => props.colorMode === 'light' ? props.colorModeLabels.dark : props.colorMode === 'dark' ? props.colorModeLabels.auto : props.colorModeLabels.light);
</script>

<template>
  <div v-bind="$attrs" :class="classNames('st-appChrome', props.class)">
    <AppHeader class="st-appChrome__header" :brand-href="props.brandHref" :brand-label="props.brandLabel">
      <template #logo><a class="st-appChrome__brand" :href="props.brandHref" :aria-label="props.brandLabel ?? ([props.brandName, props.productName].filter(Boolean).join(' ') || undefined)"><img v-if="props.logoSrc" class="st-appChrome__brandMark" :src="props.logoSrc" :alt="props.logoAlt" :aria-hidden="props.logoAlt ? undefined : 'true'" /><span v-if="props.brandName || props.productName" class="st-appChrome__brandCopy"><span v-if="props.brandName" class="st-appChrome__brandName">{{ props.brandName }}</span><span v-if="props.productName" class="st-appChrome__brandProduct">{{ props.productName }}</span></span></a></template>
      <template #nav><a v-for="item in visibleNav" :key="item.href" :href="item.disabled ? undefined : item.href" :aria-current="item.active ? 'page' : undefined" :aria-disabled="item.disabled ? 'true' : undefined" :aria-label="item.ariaLabel" :target="item.disabled ? undefined : item.target" :rel="navRel(item)" :class="classNames('st-appChrome__navLink st-appHeader__navLink', item.disabled ? 'st-appChrome__navLink--disabled' : undefined)" @click="clickNav($event, item)">{{ item.label }}</a></template>
      <template #actions><div class="st-appChrome__utilityNav">
        <div v-if="props.themes.length > 0" class="st-appChrome__themeWrap st-appChrome__menuWrap"><button type="button" class="st-appChrome__control st-appHeader__control" :aria-expanded="isThemeOpen ? 'true' : 'false'" aria-haspopup="true" :aria-label="props.themeLabel" @click="isThemeOpen = !isThemeOpen"><Glyph kind="palette" :size="14" /><span>{{ activeTheme?.label }}</span><Glyph kind="chevron" :size="12" :class="classNames('st-appChrome__chevron', isThemeOpen ? 'is-rotated' : undefined)" /></button><div v-if="isThemeOpen" class="st-appChrome__menu" role="menu"><button v-for="option in props.themes" :key="option.id" type="button" :class="classNames('st-appChrome__menuItem', props.theme === option.id ? 'is-active' : undefined)" role="menuitem" @click="props.onThemeChange?.(option.id); isThemeOpen = false"><span class="st-appChrome__check" aria-hidden="true">{{ props.theme === option.id ? '✓' : '' }}</span><span>{{ option.label }}</span></button></div></div>
        <button v-if="props.colorMode !== undefined" type="button" class="st-appChrome__control st-appChrome__iconControl st-appHeader__control" :aria-label="colorModeAriaLabel" @click="cycleColorMode"><Glyph v-if="props.colorMode === 'dark'" kind="moon" :size="16" /><Glyph v-else-if="props.colorMode === 'light'" kind="sun" :size="16" /><Glyph v-else kind="sun" :size="16" :stroke-width="1.5" :style="{ opacity: '0.65' }" /></button>
        <div v-if="props.locale !== undefined" class="st-appChrome__localeWrap st-appChrome__menuWrap"><button type="button" class="st-appChrome__control st-appHeader__control" :aria-expanded="isLocaleOpen ? 'true' : 'false'" aria-haspopup="true" :aria-label="props.localeLabel" @click="isLocaleOpen = !isLocaleOpen"><Glyph kind="globe" :size="14" /><span>{{ props.locale?.toUpperCase() }}</span><Glyph kind="chevron" :size="12" :class="classNames('st-appChrome__chevron', isLocaleOpen ? 'is-rotated' : undefined)" /></button><div v-if="isLocaleOpen" class="st-appChrome__menu" role="menu"><button v-for="value in (['fr', 'en'] as AppChromeLocale[])" :key="value" type="button" :class="classNames('st-appChrome__menuItem', props.locale === value ? 'is-active' : undefined)" role="menuitem" @click="props.onLocaleChange?.(value); isLocaleOpen = false"><span class="st-appChrome__check" aria-hidden="true">{{ props.locale === value ? '✓' : '' }}</span><span>{{ value === 'fr' ? 'Français' : 'English' }}</span></button></div></div>
        <a v-if="props.githubHref" class="st-appChrome__control st-appChrome__iconControl st-appHeader__control" :href="props.githubHref" rel="noreferrer" target="_blank" :aria-label="props.githubLabel"><Glyph kind="github" :size="16" :stroke-width="2.1" /></a><div v-if="$slots.identity" class="st-appChrome__identity"><slot name="identity" /></div><div v-if="$slots.extraSelectors" class="st-appChrome__extraSelectors"><slot name="extraSelectors" /></div>
      </div><button type="button" class="st-appChrome__burgerTrigger" :aria-expanded="props.mobileMenuOpen ? 'true' : 'false'" :aria-controls="drawerId" :aria-label="props.menuLabel" @click="props.onMobileMenuToggle"><Glyph kind="menu" :size="20" /></button></template>
    </AppHeader>
    <nav v-if="props.mobileMenuOpen" :id="drawerId" class="st-appChrome__drawer" :aria-label="props.navLabel"><div class="st-appChrome__drawerSection"><a v-for="item in visibleNav" :key="item.href" :href="item.disabled ? undefined : item.href" :aria-current="item.active ? 'page' : undefined" :aria-disabled="item.disabled ? 'true' : undefined" :aria-label="item.ariaLabel" :target="item.disabled ? undefined : item.target" :rel="navRel(item)" :class="classNames('st-appChrome__drawerLink', item.disabled ? 'st-appChrome__navLink--disabled' : undefined)" @click="clickNav($event, item, true)">{{ item.label }}</a></div>
      <div v-if="props.themes.length > 0" class="st-appChrome__drawerSection"><span class="st-appChrome__drawerLabel">{{ props.themeLabel }}</span><div class="st-appChrome__drawerSwitcher"><button v-for="option in props.themes" :key="option.id" type="button" :class="classNames('st-appChrome__drawerBtn', props.theme === option.id ? 'is-active' : undefined)" @click="props.onThemeChange?.(option.id); props.onMobileMenuToggle?.()">{{ option.label }}</button></div></div>
      <div v-if="props.colorMode !== undefined" class="st-appChrome__drawerSection"><span class="st-appChrome__drawerLabel">{{ props.colorModeLabels.light + ' / ' + props.colorModeLabels.dark }}</span><div class="st-appChrome__drawerSwitcher"><button v-for="mode in (['light', 'dark', 'auto'] as AppChromeColorMode[])" :key="mode" type="button" :class="classNames('st-appChrome__drawerBtn', props.colorMode === mode ? 'is-active' : undefined)" @click="props.onColorModeChange?.(mode)">{{ mode === 'light' ? props.colorModeLabels.light : mode === 'dark' ? props.colorModeLabels.dark : props.colorModeLabels.auto }}</button></div></div>
      <div v-if="props.locale !== undefined" class="st-appChrome__drawerSection"><span class="st-appChrome__drawerLabel">{{ props.localeLabel }}</span><div class="st-appChrome__drawerSwitcher"><button v-for="value in (['fr', 'en'] as AppChromeLocale[])" :key="value" type="button" :class="classNames('st-appChrome__drawerBtn', props.locale === value ? 'is-active' : undefined)" @click="props.onLocaleChange?.(value); props.onMobileMenuToggle?.()">{{ value === 'fr' ? 'Français' : 'English' }}</button></div></div>
      <div v-if="props.githubHref || $slots.identity" class="st-appChrome__drawerSection"><a v-if="props.githubHref" class="st-appChrome__drawerLink" :href="props.githubHref" rel="noreferrer" target="_blank">{{ props.githubLabel }}</a><div v-if="$slots.identity" class="st-appChrome__identity"><slot name="identity" /></div></div>
    </nav>
  </div>
</template>
