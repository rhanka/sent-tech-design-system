import { assertFocusDocument } from "@sentropic/focus/validate";
import { renderMarkdown } from "../markdown/minimal-markdown.js";
import { connectDossier, renderDossierContent, renderMarkdownToSafeHtml } from "./engines/focus-renderer.js";
import { renderFocusSnapshot } from "./engines/focus-snapshot.js";
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
  const view = host.ownerDocument.defaultView;

  function followFragment(): void {
    const root = rendered?.reviewRoot;
    const hash = view?.location.hash;
    if (root === undefined || hash === undefined || hash.length < 2) return;
    let id: string;
    try {
      id = decodeURIComponent(hash.slice(1));
    } catch {
      return;
    }
    const target = Array.from(root.querySelectorAll<HTMLElement>("[data-anchor-id]"))
      .find((element) => element.dataset.anchorId === id);
    if (target === undefined) return;

    for (let element: HTMLElement | null = target; element !== null && element !== root; element = element.parentElement) {
      if (element instanceof HTMLDetailsElement) element.open = true;
    }
    if (!target.hasAttribute("tabindex")) target.tabIndex = -1;
    target.scrollIntoView?.({ block: "start" });
    target.focus({ preventScroll: true });
  }

  function followCurrentLink(event: MouseEvent): void {
    if (event.defaultPrevented || event.button !== 0 || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const link = event.target instanceof Element ? event.target.closest("a[href^='#']") : null;
    if (link !== null && rendered?.reviewRoot.contains(link) && link.getAttribute("href") === view?.location.hash) {
      followFragment();
    }
  }

  view?.addEventListener("hashchange", followFragment);
  host.addEventListener("click", followCurrentLink);

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
      const validated = assertFocusDocument(document);
      const { ref, sections } = validated;
      const sectionCollision = sections.some((section) => section.id === ref ||
        (section.kind === "optionSet" && section.options.some(({ id }) => id === ref)));
      const evidence = "sources" in validated
        ? [...validated.sources, ...validated.citations, ...validated.evidenceGroups, ...validated.annexes] : [];
      if (sectionCollision || evidence.some(({ id }) => id === ref)) {
        throw new Error(`focus-anchor-equals-document-ref: ${ref} is reserved for the header anchor`);
      }
      const snapshot = renderFocusSnapshot(validated, (source) => renderMarkdownToSafeHtml(renderMarkdown(source, true), true));
      const dispatch = (id: string) => dispatchIntent(host, "choose-option", id);
      clear();
      const current = snapshot === undefined
        ? renderDossierContent(host, validated, dispatch, "light")
        : connectDossier(host, snapshot, dispatch);
      rendered = current;
      host.dispatchEvent(new CustomEvent<DossierReadyDetail>("st-dossier-ready", {
        detail: { reviewRoot: current.reviewRoot },
        bubbles: true,
      }));
      if (rendered === current) followFragment();
    },
    destroy() {
      destroyed = true;
      view?.removeEventListener("hashchange", followFragment);
      host.removeEventListener("click", followCurrentLink);
      clear();
    },
  };
}
