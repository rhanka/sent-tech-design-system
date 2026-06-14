// Store partagé du framework d'implémentation sélectionné dans le header docs.
// Mêmes mécaniques que locale.svelte.ts : un singleton réactif Svelte 5 ($state),
// lisible/écrivable depuis le layout, les chromes tiers et les pages composant.

export type FrameworkId = "svelte" | "react" | "vue" | "angular";

export interface FrameworkOption {
  id: FrameworkId;
  label: string;
}

export const FRAMEWORKS: FrameworkOption[] = [
  { id: "svelte", label: "Svelte" },
  { id: "react", label: "React" },
  { id: "vue", label: "Vue" },
  { id: "angular", label: "Angular" }
];

export const FRAMEWORK_STORAGE_KEY = "docs-framework";
export const DEFAULT_FRAMEWORK: FrameworkId = "svelte";

function isFrameworkId(value: string | null): value is FrameworkId {
  return FRAMEWORKS.some((entry) => entry.id === value);
}

class FrameworkStore {
  value = $state<FrameworkId>(DEFAULT_FRAMEWORK);

  get option(): FrameworkOption {
    return FRAMEWORKS.find((entry) => entry.id === this.value) ?? FRAMEWORKS[0];
  }

  /** Restaure le choix persisté (client uniquement). */
  restore(): void {
    const saved = localStorage.getItem(FRAMEWORK_STORAGE_KEY);
    if (isFrameworkId(saved)) {
      this.value = saved;
    }
  }

  /** Persiste + reflète le choix sur <html data-st-framework>. */
  persist(): void {
    localStorage.setItem(FRAMEWORK_STORAGE_KEY, this.value);
    document.documentElement.setAttribute("data-st-framework", this.value);
  }
}

export const framework = new FrameworkStore();
