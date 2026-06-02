<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  export type DisplayFontScale = "normal" | "large" | "extra-large";
  export type DisplayContrast = "default" | "high";
  export type DisplayLineSpacing = "normal" | "comfortable";

  export interface DisplaySettingsState {
    fontScale: DisplayFontScale;
    contrast: DisplayContrast;
    lineSpacing: DisplayLineSpacing;
    reducedMotion: boolean;
  }

  type DisplaySettingsProps = Omit<HTMLAttributes<HTMLElement>, "children" | "class"> & {
    title?: string;
    values?: Partial<DisplaySettingsState>;
    showFontScale?: boolean;
    showContrast?: boolean;
    showLineSpacing?: boolean;
    showReducedMotion?: boolean;
    onChange?: (settings: DisplaySettingsState) => void;
    class?: string;
  };

  const DEFAULT_SETTINGS: DisplaySettingsState = {
    fontScale: "normal",
    contrast: "default",
    lineSpacing: "normal",
    reducedMotion: false
  };

  let {
    title = "Paramètres d’affichage",
    values,
    showFontScale = true,
    showContrast = true,
    showLineSpacing = true,
    showReducedMotion = true,
    onChange,
    class: className,
    ...rest
  }: DisplaySettingsProps = $props();

  const resolvedValues = $derived(() => ({
    fontScale: values?.fontScale ?? DEFAULT_SETTINGS.fontScale,
    contrast: values?.contrast ?? DEFAULT_SETTINGS.contrast,
    lineSpacing: values?.lineSpacing ?? DEFAULT_SETTINGS.lineSpacing,
    reducedMotion: values?.reducedMotion ?? DEFAULT_SETTINGS.reducedMotion
  }));

  let state = $state<DisplaySettingsState>({ ...DEFAULT_SETTINGS });

  $effect(() => {
    const synced = resolvedValues();
    if (
      state.fontScale !== synced.fontScale ||
      state.contrast !== synced.contrast ||
      state.lineSpacing !== synced.lineSpacing ||
      state.reducedMotion !== synced.reducedMotion
    ) {
      state = {
        ...state,
        ...synced
      };
    }
  });

  const currentState = () => ({
    fontScale: state.fontScale,
    contrast: state.contrast,
    lineSpacing: state.lineSpacing,
    reducedMotion: state.reducedMotion
  });

  const classes = () => ["st-displaySettings", className].filter(Boolean).join(" ");

  function update(next: Partial<DisplaySettingsState>) {
    state = {
      ...state,
      ...next
    };
    onChange?.(currentState());
  }

  const onFontScaleChange = (event: Event) => {
    update({
      fontScale: (event.currentTarget as HTMLSelectElement).value as DisplayFontScale
    });
  };

  const onContrastChange = (event: Event) => {
    update({ contrast: (event.currentTarget as HTMLSelectElement).value as DisplayContrast });
  };

  const onLineSpacingChange = (event: Event) => {
    update({ lineSpacing: (event.currentTarget as HTMLSelectElement).value as DisplayLineSpacing });
  };

  const onReducedMotionChange = (event: Event) => {
    update({ reducedMotion: (event.currentTarget as HTMLInputElement).checked });
  };
</script>

<div class={classes()} {...rest}>
  <p class="st-displaySettings__title">{title}</p>

  <div class="st-displaySettings__grid">
    {#if showFontScale}
      <label class="st-displaySettings__field">
        <span class="st-displaySettings__label">Taille de texte</span>
        <select value={state.fontScale} onchange={onFontScaleChange}>
          <option value="normal">Normale</option>
          <option value="large">Grande</option>
          <option value="extra-large">Très grande</option>
        </select>
      </label>
    {/if}

    {#if showContrast}
      <label class="st-displaySettings__field">
        <span class="st-displaySettings__label">Contraste</span>
        <select value={state.contrast} onchange={onContrastChange}>
          <option value="default">Standard</option>
          <option value="high">Élevé</option>
        </select>
      </label>
    {/if}

    {#if showLineSpacing}
      <label class="st-displaySettings__field">
        <span class="st-displaySettings__label">Interligne</span>
        <select value={state.lineSpacing} onchange={onLineSpacingChange}>
          <option value="normal">Normal</option>
          <option value="comfortable">Confortable</option>
        </select>
      </label>
    {/if}

    {#if showReducedMotion}
      <label class="st-displaySettings__field st-displaySettings__field--switch">
        <span class="st-displaySettings__label">Animations (réduction)</span>
        <input
          type="checkbox"
          role="switch"
          checked={state.reducedMotion}
          onchange={onReducedMotionChange}
        />
      </label>
    {/if}
  </div>
</div>

<style>
  .st-displaySettings {
    border: 1px solid var(--st-semantic-border-subtle);
    border-radius: 0.5rem;
    padding: 0.75rem 0.875rem;
  }

  .st-displaySettings__title {
    color: var(--st-semantic-text-primary);
    font-size: 0.8125rem;
    font-weight: 600;
    margin: 0;
    text-transform: uppercase;
  }

  .st-displaySettings__grid {
    display: grid;
    gap: 0.75rem;
    margin-top: 0.75rem;
  }

  .st-displaySettings__field {
    display: grid;
    gap: 0.35rem;
    color: var(--st-semantic-text-secondary);
    font-size: 0.875rem;
  }

  .st-displaySettings__label {
    font-weight: 600;
  }

  .st-displaySettings select,
  .st-displaySettings input[type="checkbox"] {
    appearance: auto;
    width: 100%;
    border: 1px solid var(--st-component-control-border, var(--st-semantic-border-subtle));
    border-radius: 0.375rem;
    color: var(--st-semantic-text-primary);
    background: var(--st-component-control-background, var(--st-semantic-surface-primary));
    padding: 0.5rem 0.65rem;
    font: inherit;
  }

  .st-displaySettings input[type="checkbox"] {
    width: fit-content;
    min-width: 1.2rem;
    min-height: 1.2rem;
    margin: 0;
  }

  .st-displaySettings__field--switch {
    align-items: center;
    grid-template-columns: 1fr auto;
    gap: 0.5rem;
  }
</style>
