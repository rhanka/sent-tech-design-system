<script module lang="ts">
  // Types exportes — en Svelte 5 les exports de module vont dans <script module>
  // (le <script> d'instance ne sert qu'aux props/runes).
  export type IdentityState = "anonymous" | "authenticated";
  export type IdentityMode = "icon" | "button" | "menu";
  export type IdentityTone = "default" | "onColor";
  export interface IdentityUser {
    name: string;
    avatarSrc?: string;
  }
  export interface IdentityMenuEntry {
    label: string;
    href?: string;
    onClick?: () => void;
  }
</script>

<script lang="ts">
  // IdentityButton — composant d'identite DS multi-modes (incubation app-shell).
  // Dedup l'ancien split (IconButton+user pour l'anonyme / IdentityMenu pour
  // l'authentifie) en UN composant a modes. Compose les composants DS
  // (IconButton / Button / MenuPopover / Menu) — zero primitive nouvelle.
  import IconButton from "./IconButton.svelte";
  import Button from "./Button.svelte";
  import MenuPopover from "./MenuPopover.svelte";
  import Menu from "./Menu.svelte";
  import { User } from "@lucide/svelte";

  let {
    authState = "anonymous",
    user = null,
    mode = "icon",
    tone = "default",
    signInLabel = "Se connecter",
    accountLabel = "Compte",
    onSignIn,
    onSignOut,
    menu = [],
  }: {
    authState?: IdentityState;
    user?: IdentityUser | null;
    mode?: IdentityMode;
    tone?: IdentityTone;
    signInLabel?: string;
    accountLabel?: string;
    onSignIn?: () => void;
    onSignOut?: () => void;
    menu?: IdentityMenuEntry[];
  } = $props();

  let triggerEl = $state<HTMLElement | null>(null);
  let open = $state(false);

  const initials = $derived(
    user?.name
      ? user.name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase()
      : "",
  );
  const authed = $derived(authState === "authenticated");
  // Items du menu compte (mode "menu" ou clic sur l'avatar authentifie).
  const menuItems = $derived([
    ...menu.map((e) => ({ label: e.label, value: e.href ?? e.label })),
    ...(onSignOut ? [{ label: "Se déconnecter", value: "__signout" }] : []),
  ]);
  function onMenuSelect(value: string) {
    open = false;
    if (value === "__signout") return onSignOut?.();
    const entry = menu.find((e) => (e.href ?? e.label) === value);
    if (entry?.onClick) entry.onClick();
    else if (entry?.href) location.href = entry.href;
  }
</script>

{#snippet face()}
  {#if authed && user?.avatarSrc}
    <img class="st-identityBtn__avatar" src={user.avatarSrc} alt="" aria-hidden="true" />
  {:else if authed && initials}
    <span class="st-identityBtn__initials" aria-hidden="true">{initials}</span>
  {:else}
    <User size={16} strokeWidth={2.1} aria-hidden="true" />
  {/if}
{/snippet}

<span class="st-identityBtn" class:st-identityBtn--onColor={tone === "onColor"}>
  {#if mode === "button"}
    <Button variant={authed ? "ghost" : "secondary"} size="sm" onclick={() => (authed ? (open = !open) : onSignIn?.())}>
      {@render face()}
      <span>{authed ? (user?.name ?? accountLabel) : signInLabel}</span>
    </Button>
  {:else if mode === "menu"}
    <span class="st-identityBtn__wrap" bind:this={triggerEl}>
      <IconButton size="sm" variant="ghost" aria-label={authed ? accountLabel : signInLabel} onclick={() => (open = !open)}>
        {@render face()}
      </IconButton>
    </span>
    {#if menuItems.length}
      <MenuPopover bind:open trigger={triggerEl} placement="bottom-end" label={accountLabel}>
        <Menu label={accountLabel} items={menuItems} onselect={onMenuSelect} />
      </MenuPopover>
    {/if}
  {:else}
    <!-- mode "icon" (defaut) : icone/avatar seul. -->
    <IconButton
      size="sm"
      variant="ghost"
      aria-label={authed ? accountLabel : signInLabel}
      onclick={() => (authed ? (menuItems.length ? (open = !open) : undefined) : onSignIn?.())}
    >
      {@render face()}
    </IconButton>
  {/if}
</span>

<style>
  .st-identityBtn { display: inline-flex; }
  .st-identityBtn__wrap { display: inline-flex; }
  .st-identityBtn__avatar { width: 1.5rem; height: 1.5rem; border-radius: 50%; object-fit: cover; }
  .st-identityBtn__initials {
    width: 1.5rem; height: 1.5rem; border-radius: 50%;
    display: inline-flex; align-items: center; justify-content: center;
    font-size: 0.6875rem; font-weight: 650;
    background: var(--st-semantic-surface-subtle, #f1f5f9);
    color: var(--st-semantic-text-primary, #0f172a);
  }
  /* tone onColor : icone blanche pour chromes colores (Airbus/DSFR/sombres). */
  .st-identityBtn--onColor :global(.st-iconButton),
  .st-identityBtn--onColor :global(.st-button) { color: #ffffff; }
</style>
