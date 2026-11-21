import { renderDossierContent } from "./engines/focus-renderer.js";
import { dispatchIntent } from "./intents.js";

export interface DossierMount {
  readonly reviewRoot: HTMLElement | null;
  render(document: unknown): void;
  destroy(): void;
}

export interface DossierReadyDetail {
  readonly reviewRoot: HTMLElement;
}

/** Mount in the host's light DOM. Load the dossier stylesheet in the host page. */
export function mountDossier(host: HTMLElement): DossierMount {
  let rendered: ReturnType<typeof renderDossierContent> | undefined;
  let destroyed = false;

  function clear(): void {
    const previous = rendered;
    rendered = undefined;
    previous?.destroy();
  }

  return {
    get reviewRoot() {
      return rendered?.reviewRoot ?? null;
    },
    render(document) {
      if (destroyed) throw new Error("The dossier mount has been destroyed");
      clear();
      rendered = renderDossierContent(host, document, (id) => dispatchIntent(host, "choose-option", id), "light");
      host.dispatchEvent(new CustomEvent<DossierReadyDetail>("st-dossier-ready", {
        detail: { reviewRoot: rendered.reviewRoot },
        bubbles: true,
      }));
    },
    destroy() {
      destroyed = true;
      clear();
    },
  };
}
