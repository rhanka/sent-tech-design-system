import { isEvidenceDossier, renderHtml, type FocusDocument } from "@sentropic/focus";
import { DecisionDossierValidationError } from "@sentropic/focus/validate";
import {
  appendDossierEvidence, dossierCitations, dossierReference, dossierSourceOrigin, markDossierAnchor,
} from "./dossier-evidence.js";
import { renderDossierOptionAnnotation } from "./focus-renderer.js";

/** Render the pinned Focus snapshot, then wire the kit's controls and anchors. */
export function renderFocusSnapshot(
  doc: FocusDocument,
  renderMarkdown: (markdown: string) => string,
): HTMLElement | undefined {
  const template = document.createElement("template");
  try {
    // Focus escapes its fields. The host hook supplies sanitized Markdown.
    template.innerHTML = renderHtml(doc, { renderMarkdown, sanitizeHtml: (html) => html });
  } catch (error) {
    // Legacy documents that pass the schema but fail the readability gate
    // still render through the existing DOM renderer.
    if (error instanceof DecisionDossierValidationError) return undefined;
    throw error;
  }
  const article = template.content.querySelector("article")!;
  article.classList.add("st-dossier");
  article.setAttribute("data-st-dossier", "");
  const header = article.querySelector("header")!;
  markDossierAnchor(header, doc.ref);
  header.classList.add("st-dossier__header");
  header.setAttribute("data-st-dossier-title", "");
  header.querySelector("h1")!.classList.add("st-dossier__title");
  header.querySelector("p")!.classList.add("st-dossier__subject");
  // Focus emits a static glossary print rule. The kit supplies it externally.
  article.querySelector(".focus-readability > style")?.remove();

  const setsByQuestion = new Map<string, typeof doc.sections>();
  for (const section of doc.sections) {
    if (section.kind !== "optionSet" || section.questionId === undefined) continue;
    const sets = setsByQuestion.get(section.questionId) ?? [];
    setsByQuestion.set(section.questionId, [...sets, section]);
  }
  // Focus emits each option set beside its question, in document order.
  const sections = doc.sections.flatMap((section) => section.kind === "optionSet" ? [] :
    [section, ...(section.kind === "question" ? setsByQuestion.get(section.id) ?? [] : [])]);
  const blocks = article.querySelectorAll<HTMLElement>(
    ":scope > :is(.focus-prose, .focus-question, .focus-optionset, .focus-outcome, .focus-diagram, .focus-amendment-trace)",
  );
  if (blocks.length !== sections.length + 1) throw new Error("Unexpected Focus section count");
  const disabled = new Set(doc.interactions.filter(({ name, enabled }) => name === "choose-option" && !enabled)
    .map(({ targetRef }) => targetRef));
  const recommended = new Set(doc.sections.flatMap((section) =>
    section.kind === "question" ? [section.recommendedOptionId] : []));

  for (const [index, section] of sections.entries()) {
    const block = blocks[index]!;
    markDossierAnchor(block, section.id);
    // Focus puts citation calls beside their content. Move the existing
    // badges inside the block so review capture inherits its anchor.
    while (block.nextElementSibling?.matches("sup:has(> a.focus-citation)")) {
      block.append(block.nextElementSibling);
    }
    if (section.kind !== "optionSet") continue;
    block.setAttribute("data-st-option-set", section.id);
    const cards = block.querySelectorAll<HTMLElement>(":scope > ul > li");
    if (cards.length !== section.options.length) throw new Error("Unexpected Focus option count");
    for (const [cardIndex, { id, annotation, citationRefs }] of section.options.entries()) {
      const card = cards[cardIndex]!;
      const label = card.firstElementChild!;
      markDossierAnchor(card, id);
      label.classList.add("st-dossier__optionLabel");
      const marker = renderDossierOptionAnnotation(annotation);
      if (marker !== undefined) card.querySelector(":scope > .focus-consequence")!.after(marker);
      if (citationRefs?.length) {
        const calls = block.nextElementSibling;
        if (!calls?.matches("p:has(> sup > a.focus-citation)")) throw new Error("Missing Focus option citation calls");
        card.append(...calls.querySelectorAll(":scope > sup"));
        calls.remove();
      }
      if (recommended.has(id)) card.setAttribute("data-st-recommended", "");
      if (disabled.has(id)) {
        card.setAttribute("data-option-disabled", id);
        card.setAttribute("aria-disabled", "true");
        continue;
      }
      card.setAttribute("data-option-card", id);
      const button = document.createElement("button");
      button.type = "button";
      button.setAttribute("data-option-id", id);
      button.setAttribute("aria-pressed", "false");
      label.before(button);
      button.append(label);
    }
  }

  if (isEvidenceDossier(doc)) {
    const ids = new Map<string, string>();
    const sources = new Map(doc.sources.map((source) => [source.id, source]));
    const rows = article.querySelectorAll<HTMLElement>(":scope > .focus-sources > ol > li");
    if (rows.length !== doc.citations.length) throw new Error("Unexpected Focus citation count");
    for (const [index, { id, label, sourceId, locator }] of doc.citations.entries()) {
      const row = rows[index]!;
      ids.set(`#${row.id}`, id);
      row.removeAttribute("id");
      markDossierAnchor(row, id);
      const source = sources.get(sourceId)!;
      const origin = dossierSourceOrigin(source);
      const location = locator.kind === "lines" ? `${origin}:${locator.start}–${locator.end}` : `${origin} · ${locator.caption}`;
      const download = row.querySelector("a[download]");
      row.replaceChildren(`${label} · `, dossierReference(sourceId, source.title), ` · ${location}`);
      if (download !== null) row.append(" · ", download);
    }
    for (const link of article.querySelectorAll<HTMLAnchorElement>("a.focus-citation")) {
      const id = ids.get(link.getAttribute("href") ?? "");
      if (id !== undefined) link.setAttribute("href", `#${encodeURIComponent(id)}`);
    }
    // The kit supplies the same annex content in its anchored disclosures.
    for (const annex of article.querySelectorAll(":scope > .focus-annex")) annex.remove();
    appendDossierEvidence(article, doc, dossierCitations(doc), true);
  }
  return article;
}
