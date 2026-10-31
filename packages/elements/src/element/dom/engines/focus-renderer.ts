/**
 * The `focus` ENGINE CHUNK (§6.6): everything `<st-decision-dossier>` needs
 * beyond the core — the §4.3 focus semantic port and the MINIMAL lazy
 * renderer L2 uses until lot L6 lands the imposed Focus renderer defaults
 * (F-R0–F-R7). What L6 must replace here: the Markdown subset (this file's
 * `renderMarkdown` call), the content parity with the owner's `renderHtml`,
 * the readability gate, and the interactions gating — L2 gates an option
 * card only on an `interactions` entry `{ name: "choose-option", targetRef:
 * <option id>, enabled: false }`, which renders the card inert.
 *
 * U-14 sanitizer choice: the only string that ever enters the DOM as MARKUP
 * is the prose the minimal Markdown renderer produces; it passes through
 * DOMPurify (sanitized, then injected as `innerHTML` inside the shadow
 * root). Every other value enters through `textContent`, which cannot
 * carry markup. No `eval`-shaped API is used anywhere (§6.4).
 */

import DOMPurify from "dompurify";
import { validateDecisionDossierDocument } from "@sentropic/focus/validate";
import { renderMarkdown } from "../../markdown/minimal-markdown.js";
import { createFocusPort } from "../../../ports/focus.js";
import type { SemanticPort } from "../../../ports/types.js";

/** The §4.3 semantic port: the pinned focus validator is the authority. */
export const port: SemanticPort = createFocusPort(validateDecisionDossierDocument);

/** The intent dispatch the renderer receives (core's `dispatchIntent`). */
export type DossierDispatch = (optionId: string) => void;

/** Narrow read of one known document field (the schema already validated it). */
function field(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

/**
 * The sanitizer allowlist (U-14, review 1 follow-up): EXACTLY the tag and
 * attribute subset `renderMarkdown` emits — `p`, `ul`, `li`, `code`, `a`,
 * `strong`, `em` and `href` on anchors only. No `h1`-`h4`, `blockquote`,
 * `pre`, `ol`, `br`, tables or divs (the minimal subset never emits them);
 * no event handlers, `style`, or `class`; no data attributes
 * (`ALLOW_DATA_ATTR: false`); `href` limited to the package's own rule —
 * `renderMarkdown` emits only `https:` anchors, so the sanitizer keeps only
 * `https:` (`http:`, `mailto:`, relative, `javascript:` and `data:` lose the
 * attribute). DOMPurify UNWRAPS a disallowed tag but keeps allowed children,
 * so the invariant is on survivors, never on input shape.
 */
const SANITIZER_ALLOWED_TAGS = ["p", "ul", "li", "code", "a", "strong", "em"];
const SANITIZER_ALLOWED_ATTR = ["href"];
const SANITIZER_ALLOWED_URI = /^https:\/\/[^\s"'<>]+$/i;

/** Sanitize one HTML string to the `renderMarkdown` subset (U-14). */
export function renderMarkdownToSafeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: SANITIZER_ALLOWED_TAGS,
    ALLOWED_ATTR: SANITIZER_ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    ALLOWED_URI_REGEXP: SANITIZER_ALLOWED_URI,
  });
}

/** One sanitized markdown block (U-14): the only `innerHTML` path. */
function markdownBlock(source: string): HTMLDivElement {
  const block = document.createElement("div");
  block.className = "st-dossier__prose";
  block.innerHTML = renderMarkdownToSafeHtml(renderMarkdown(source));
  return block;
}

/** One plain text element. */
function text(tag: string, className: string, text: string): HTMLElement {
  const node = document.createElement(tag);
  node.className = className;
  node.textContent = text;
  return node;
}

/** True when the interactions array disables choosing this option (L2 gate). */
function optionDisabled(interactions: readonly unknown[], optionId: string): boolean {
  return interactions.some(
    (entry) =>
      typeof entry === "object" &&
      entry !== null &&
      (entry as Record<string, unknown>).name === "choose-option" &&
      (entry as Record<string, unknown>).targetRef === optionId &&
      (entry as Record<string, unknown>).enabled === false,
  );
}

/** One option card: a real button while the interactions allow choosing it. */
function optionCard(option: Record<string, unknown>, disabled: boolean): HTMLElement {
  const id = field(option.id) ?? "";
  const label = field(option.label) ?? "";
  if (disabled) {
    const card = text("div", "st-dossier__option st-dossier__option--disabled", label);
    card.setAttribute("data-option-disabled", id);
    return card;
  }
  const card = document.createElement("button");
  card.type = "button";
  card.className = "st-dossier__option";
  card.setAttribute("data-option-id", id);
  card.append(text("span", "st-dossier__optionLabel", label));
  const body = field(option.body);
  if (body !== undefined) card.append(text("span", "st-dossier__optionBody", body));
  const annotation = field(option.annotation);
  if (annotation !== undefined && annotation !== "none") {
    card.append(text("span", "st-dossier__optionAnnotation", annotation));
  }
  return card;
}

/** One section of the dossier, by its validated `kind`. */
function sectionNode(section: Record<string, unknown>, interactions: readonly unknown[]): HTMLElement {
  const kind = field(section.kind) ?? "";
  if (kind === "prose") {
    const markdown = field(section.markdown) ?? "";
    return markdownBlock(markdown);
  }
  if (kind === "question") {
    const wrap = document.createElement("div");
    wrap.className = "st-dossier__question";
    wrap.setAttribute("data-st-question", field(section.id) ?? "");
    const question = text("h3", "st-dossier__questionText", field(section.question) ?? "");
    question.setAttribute("data-st-question-text", "");
    wrap.append(question);
    const state = field(section.state);
    if (state !== undefined) {
      const chip = text("span", "st-dossier__state", state);
      chip.setAttribute("data-st-question-state", state);
      wrap.append(chip);
    }
    return wrap;
  }
  if (kind === "optionSet") {
    const wrap = document.createElement("div");
    wrap.className = "st-dossier__options";
    wrap.setAttribute("data-st-option-set", field(section.id) ?? "");
    const title = field(section.title);
    if (title !== undefined) wrap.append(text("h4", "st-dossier__optionsTitle", title));
    const options = Array.isArray(section.options) ? section.options : [];
    for (const option of options) {
      if (typeof option === "object" && option !== null) {
        const record = option as Record<string, unknown>;
        wrap.append(optionCard(record, optionDisabled(interactions, field(record.id) ?? "")));
      }
    }
    return wrap;
  }
  if (kind === "outcome") {
    const wrap = document.createElement("div");
    wrap.className = "st-dossier__outcome";
    wrap.setAttribute("data-st-outcome", field(section.id) ?? "");
    const statement = text("p", "st-dossier__outcomeText", field(section.statement) ?? "");
    statement.setAttribute("data-st-outcome-statement", "");
    wrap.append(statement);
    const modality = field(section.modality);
    if (modality !== undefined) wrap.append(text("span", "st-dossier__modality", modality));
    return wrap;
  }
  if (kind === "amendmentTrace") {
    const wrap = document.createElement("ol");
    wrap.className = "st-dossier__trace";
    wrap.setAttribute("data-st-trace", field(section.id) ?? "");
    const steps = Array.isArray(section.steps) ? section.steps : [];
    for (const step of steps) {
      if (typeof step === "object" && step !== null) {
        const record = step as Record<string, unknown>;
        const at = field(record.at) ?? "";
        const author = field(record.author) ?? "";
        const summary = field(record.summary) ?? "";
        const item = text("li", "st-dossier__traceStep", summary);
        item.setAttribute("data-st-trace-step", `${at} ${author}`.trim());
        wrap.append(item);
      }
    }
    return wrap;
  }
  if (kind === "diagram") {
    const wrap = document.createElement("figure");
    wrap.className = "st-dossier__diagram";
    wrap.setAttribute("data-st-diagram", field(section.id) ?? "");
    const alt = field(section.alt);
    if (alt !== undefined) wrap.append(text("figcaption", "st-dossier__diagramAlt", alt));
    const pre = text("pre", "st-dossier__diagramSource", field(section.source) ?? "");
    pre.setAttribute("data-st-diagram-source", "");
    wrap.append(pre);
    return wrap;
  }
  return text("div", "st-dossier__unknownSection", kind);
}

/**
 * Render one validated dossier document into `node`. The single interaction
 * — choosing an option — is delegated at the container and dispatched as
 * the §4.6 `choose-option` intent through `dispatch`.
 */
export function renderDossier(
  node: HTMLElement,
  document_: unknown,
  dispatch: DossierDispatch,
): () => void {
  const doc = (document_ ?? {}) as Record<string, unknown>;
  const sections = Array.isArray(doc.sections) ? doc.sections : [];
  const interactions = Array.isArray(doc.interactions) ? doc.interactions : [];

  const article = document.createElement("article");
  article.className = "st-dossier";
  article.setAttribute("data-st-dossier", "");

  const header = document.createElement("header");
  header.className = "st-dossier__header";
  const subject = field(doc.subject);
  if (subject !== undefined) header.append(text("p", "st-dossier__subject", subject));
  header.append(text("h2", "st-dossier__title", field(doc.title) ?? ""));
  header.setAttribute("data-st-dossier-title", "");
  article.append(header);

  for (const section of sections) {
    if (typeof section === "object" && section !== null) {
      article.append(sectionNode(section as Record<string, unknown>, interactions));
    }
  }

  const trace = Array.isArray(doc.amendmentTrace) ? doc.amendmentTrace : [];
  if (trace.length > 0) {
    const footer = document.createElement("footer");
    footer.className = "st-dossier__traceFooter";
    footer.setAttribute("data-st-trace-footer", "");
    for (const step of trace) {
      if (typeof step === "object" && step !== null) {
        const record = step as Record<string, unknown>;
        const item = text("p", "st-dossier__traceEntry", field(record.summary) ?? "");
        item.setAttribute("data-st-trace-at", field(record.at) ?? "");
        footer.append(item);
      }
    }
    article.append(footer);
  }

  const provenance = (doc.provenance ?? {}) as Record<string, unknown>;
  const source = field(provenance.source);
  if (source !== undefined) {
    const note = text("p", "st-dossier__provenance", source);
    note.setAttribute("data-st-provenance", source);
    article.append(note);
  }

  const onClick = (event: Event): void => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const card = target.closest("[data-option-id]");
    if (card !== null && node.contains(card)) {
      dispatch(card.getAttribute("data-option-id") ?? "");
    }
  };
  node.addEventListener("click", onClick);
  node.replaceChildren(article);

  return () => {
    node.removeEventListener("click", onClick);
    node.replaceChildren();
  };
}
