/**
 * The `focus` ENGINE CHUNK (§6.6): everything `<st-decision-dossier>` needs
 * beyond the core — the §4.3 focus semantic port plus the imposed Focus
 * renderer defaults F-R0–F-R7 (lot L6): whole-card selection control (F-R1),
 * 1 px token strokes (F-R2, see `dossier-styles.ts`), light local selection
 * (F-R3), folded long arguments (F-R4), renderer-chosen list-or-grid layout
 * (F-R5), annotation as display state only (F-R6) and a discreet
 * recommendation badge that never preselects (F-R7). F-R0 stays a validation
 * property: any author layout hint is refused with `schema-violation`
 * before this renderer ever runs (§4.5 panel, never a partial dossier).
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
import { adoptDossierSheet, FOLD_THRESHOLD_CHARS } from "./dossier-styles.js";

/** The §4.3 semantic port: the pinned focus validator is the authority. */
export const port: SemanticPort = createFocusPort(validateDecisionDossierDocument);

/** The intent dispatch the renderer receives (core's `dispatchIntent`). */
export type DossierDispatch = (optionId: string) => void;

/** The renderer-chosen layout of one option set (AMB-L6-3, one function). */
export type OptionSetLayout = "list" | "grid";

/**
 * The layout decision table (AMB-L6-3, §11.2 F-R5): any long (folded)
 * option forces the list at any count; otherwise one or two options render
 * as a list and three or more short options as a grid capped at two
 * columns — never four tall side-by-side columns of long cards.
 */
export function decideOptionSetLayout(optionCount: number, hasLongOption: boolean): OptionSetLayout {
  if (hasLongOption) return "list";
  if (optionCount <= 2) return "list";
  return "grid";
}

/** Narrow read of one known document field (the schema already validated it). */
function field(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

/**
 * The fold rule (AMB-L6-2, F-R4): fold when the rendered argument exceeds
 * 300 characters — the option `body` when one exists, else the
 * label-plus-consequence text rendered in its place.
 */
export function argumentText(option: Record<string, unknown>): string {
  const body = field(option.body);
  if (body !== undefined) return body;
  return [field(option.label) ?? "", field(option.consequence) ?? ""].filter((part) => part.length > 0).join("\n");
}

/** True when the option's rendered argument folds (over the threshold). */
export function isLongOption(option: Record<string, unknown>): boolean {
  return argumentText(option).length > FOLD_THRESHOLD_CHARS;
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

/** True when the interactions disable choosing this option (L2 gate). */
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

/** The ids of every option in the document (recommendation matching). */
function optionIdsOf(sections: readonly unknown[]): Set<string> {
  const ids = new Set<string>();
  for (const section of sections) {
    if (typeof section !== "object" || section === null) continue;
    const record = section as Record<string, unknown>;
    if (record.kind !== "optionSet" || !Array.isArray(record.options)) continue;
    for (const option of record.options) {
      if (typeof option !== "object" || option === null) continue;
      const id = field((option as Record<string, unknown>).id);
      if (id !== undefined) ids.add(id);
    }
  }
  return ids;
}

/** The recommended option id per question id (F-R7 badge source). */
function recommendedByQuestion(sections: readonly unknown[]): Map<string, string> {
  const recommended = new Map<string, string>();
  for (const section of sections) {
    if (typeof section !== "object" || section === null) continue;
    const record = section as Record<string, unknown>;
    if (record.kind !== "question") continue;
    const questionId = field(record.id);
    const recommendedId = field(record.recommendedOptionId);
    if (questionId !== undefined && recommendedId !== undefined) recommended.set(questionId, recommendedId);
  }
  return recommended;
}

/** The option sets linked to one question, in relative document order. */
function optionSetsForQuestion(sections: readonly unknown[], questionId: string): Record<string, unknown>[] {
  const linked: Record<string, unknown>[] = [];
  for (const section of sections) {
    if (typeof section !== "object" || section === null) continue;
    const record = section as Record<string, unknown>;
    if (record.kind !== "optionSet") continue;
    if (field(record.questionId) === questionId) linked.push(record);
  }
  return linked;
}

/**
 * The display text of one question's recommended answer (owner parity).
 * Mirrors `preparePresentation` in `@sentropic/focus/dist/render/presentation.js`:
 * when the trimmed answer does not already start with the trimmed label of
 * the recommended option (case-insensitive, followed by end of string or a
 * boundary character), the label is prefixed with an em dash. The badge stays
 * the selection marker; this text is display parity only (F-R7 unchanged).
 * Unlike the owner, a question without a resolvable recommended label keeps
 * its trimmed answer verbatim instead of throwing, so any valid document
 * still renders.
 */
function displayRecommendedAnswer(question: Record<string, unknown>, sections: readonly unknown[]): string | undefined {
  const raw = field(question.recommendedAnswer);
  if (raw === undefined) return undefined;
  const answer = raw.trim();
  const questionId = field(question.id);
  const recommendedId = field(question.recommendedOptionId);
  if (questionId === undefined || recommendedId === undefined) return answer;
  const labelRaw = optionSetsForQuestion(sections, questionId)
    .flatMap((set) => (Array.isArray(set.options) ? set.options : []))
    .find(
      (option): option is Record<string, unknown> =>
        typeof option === "object" && option !== null && field((option as Record<string, unknown>).id) === recommendedId,
    );
  const labelField = labelRaw === undefined ? undefined : field(labelRaw.label);
  if (labelField === undefined) return answer;
  const label = labelField.trim();
  const alreadyNamed =
    answer.toLowerCase().startsWith(label.toLowerCase()) && /^(?:$|[\s,:;.!?—–-])/.test(answer.slice(label.length));
  return alreadyNamed ? answer : `${label} — ${answer}`;
}

/** One annotation marker: display state only, never a control (F-R6). */
function annotationNode(option: Record<string, unknown>): HTMLElement | undefined {
  const annotation = field(option.annotation);
  if (annotation === undefined || annotation === "none") return undefined;
  const marker = text("span", "st-dossier__optionAnnotation", annotation);
  marker.setAttribute("data-annotation", annotation);
  return marker;
}

/** One header row: label plus the discreet badge on one line (F-R7). */
function optionHead(label: string, recommended: boolean): HTMLElement {
  const head = document.createElement("div");
  head.className = "st-dossier__optionHead";
  head.append(text("span", "st-dossier__optionLabel", label));
  if (recommended) head.append(text("span", "st-dossier__badge", "Recommended"));
  return head;
}

/** One option card. The select and the fold are siblings (F-R1, F-R4). */
function optionCard(
  option: Record<string, unknown>,
  face: { readonly disabled: boolean; readonly recommended: boolean; readonly selected: boolean; readonly expanded: boolean },
): HTMLElement {
  const id = field(option.id) ?? "";
  const label = field(option.label) ?? "";
  const consequence = field(option.consequence);
  const annotationComment = field(option.annotationComment);
  const bodyText = field(option.body);
  const long = isLongOption(option);
  if (face.disabled) {
    const card = document.createElement("div");
    card.className = "st-dossier__optionCard st-dossier__optionCard--disabled";
    card.setAttribute("data-option-disabled", id);
    card.setAttribute("aria-disabled", "true");
    card.append(optionHead(label, face.recommended));
    if (long) {
      if (bodyText !== undefined) {
        if (consequence !== undefined) card.append(text("span", "st-dossier__optionConsequence", consequence));
        const folded = text("span", "st-dossier__optionBody", bodyText);
        folded.id = `st-dossier-body-${id}`;
        folded.setAttribute("hidden", "");
        card.append(folded);
      } else {
        const folded = text("span", "st-dossier__optionBody", consequence ?? argumentText(option));
        folded.id = `st-dossier-body-${id}`;
        folded.setAttribute("hidden", "");
        card.append(folded);
      }
    } else {
      if (consequence !== undefined) card.append(text("span", "st-dossier__optionConsequence", consequence));
      if (bodyText !== undefined) card.append(text("span", "st-dossier__optionBody", bodyText));
    }
    const marker = annotationNode(option);
    if (marker !== undefined) card.append(marker);
    if (annotationComment !== undefined) card.append(text("span", "st-dossier__optionAnnotationComment", annotationComment));
    return card;
  }
  const card = document.createElement("div");
  card.className = "st-dossier__optionCard";
  card.setAttribute("data-option-card", id);
  card.setAttribute("role", "group");
  const select = document.createElement("button");
  select.type = "button";
  select.className = "st-dossier__optionSelect";
  select.setAttribute("data-option-id", id);
  select.setAttribute("aria-pressed", face.selected ? "true" : "false");
  if (face.selected) select.setAttribute("data-st-selected", "true");
  select.append(optionHead(label, face.recommended));
  if (!(long && bodyText === undefined) && consequence !== undefined) {
    select.append(text("span", "st-dossier__optionConsequence", consequence));
  }
  const marker = annotationNode(option);
  if (marker !== undefined) select.append(marker);
  if (annotationComment !== undefined) select.append(text("span", "st-dossier__optionAnnotationComment", annotationComment));
  if (!long && bodyText !== undefined) {
    select.append(text("span", "st-dossier__optionBody", bodyText));
  }
  card.append(select);
  if (long) {
    const fold = document.createElement("button");
    fold.type = "button";
    fold.className = "st-dossier__optionFold";
    fold.setAttribute("data-option-fold", id);
    fold.setAttribute("aria-expanded", face.expanded ? "true" : "false");
    fold.setAttribute("aria-controls", `st-dossier-body-${id}`);
    fold.textContent = face.expanded ? "Hide details" : "Show details";
    card.append(fold);
    const foldedText = bodyText ?? consequence ?? argumentText(option);
    const body = text("span", "st-dossier__optionBody", foldedText);
    body.id = `st-dossier-body-${id}`;
    if (!face.expanded) body.setAttribute("hidden", "");
    card.append(body);
  }
  return card;
}

/** One section of the dossier, by its validated `kind`. */
function sectionNode(
  section: Record<string, unknown>,
  face: {
    readonly interactions: readonly unknown[];
    readonly recommended: Map<string, string>;
    readonly knownOptions: Set<string>;
    readonly selected: Map<string, string>;
    readonly expanded: Set<string>;
    readonly sections: readonly unknown[];
  },
): HTMLElement {
  const kind = field(section.kind) ?? "";
  if (kind === "prose") {
    return markdownBlock(field(section.markdown) ?? "");
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
    const context = field(section.context);
    if (context !== undefined) wrap.append(text("p", "st-dossier__questionContext", context));
    const readingTime = section.readingTimeMinutes;
    if (typeof readingTime === "number") wrap.append(text("p", "st-dossier__readingTime", `Reading time: ${readingTime} min`));
    const answer = field(section.answer);
    if (answer !== undefined) wrap.append(text("p", "st-dossier__questionAnswer", answer));
    const recommendedAnswer = field(section.recommendedAnswer);
    if (recommendedAnswer !== undefined) {
      wrap.append(text("p", "st-dossier__questionReco", displayRecommendedAnswer(section, face.sections) ?? recommendedAnswer));
    }
    return wrap;
  }
  if (kind === "optionSet") {
    const wrap = document.createElement("div");
    wrap.className = "st-dossier__options";
    wrap.setAttribute("data-st-option-set", field(section.id) ?? "");
    const options = Array.isArray(section.options) ? section.options : [];
    const records = options.filter((option): option is Record<string, unknown> => typeof option === "object" && option !== null);
    wrap.setAttribute("data-st-layout", decideOptionSetLayout(records.length, records.some(isLongOption)));
    const title = field(section.title);
    if (title !== undefined) wrap.append(text("h4", "st-dossier__optionsTitle", title));
    const setId = field(section.id) ?? "";
    const recommendedKey = field(section.questionId) ?? field(section.targetRef);
    const recommendedId = recommendedKey !== undefined ? face.recommended.get(recommendedKey) : undefined;
    for (const record of records) {
      const optionId = field(record.id) ?? "";
      wrap.append(
        optionCard(record, {
          disabled: optionDisabled(face.interactions, optionId),
          recommended: recommendedId !== undefined && recommendedId === optionId,
          selected: face.selected.get(setId) === optionId,
          expanded: face.expanded.has(optionId),
        }),
      );
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
 * the §4.6 `choose-option` intent through `dispatch`. Selection is local
 * renderer state only (F-R3): it never writes back into the envelope or the
 * document. The fold control toggles the long argument and never selects.
 */
export function renderDossier(
  node: HTMLElement,
  document_: unknown,
  dispatch: DossierDispatch,
): () => void {
  const doc = (document_ ?? {}) as Record<string, unknown>;
  const sections = Array.isArray(doc.sections) ? doc.sections : [];
  const interactions = Array.isArray(doc.interactions) ? doc.interactions : [];
  const recommended = recommendedByQuestion(sections);
  const knownOptions = optionIdsOf(sections);
  const selected = new Map<string, string>();
  const expanded = new Set<string>();

  const root = node.getRootNode();
  adoptDossierSheet(root instanceof ShadowRoot || root instanceof Document ? root : document);

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

  const face = { interactions, recommended, knownOptions, selected, expanded, sections };
  const questionIds = new Set<string>();
  for (const section of sections) {
    if (typeof section !== "object" || section === null) continue;
    const record = section as Record<string, unknown>;
    if (record.kind !== "question") continue;
    const questionId = field(record.id);
    if (questionId !== undefined) questionIds.add(questionId);
  }
  const setWraps: HTMLElement[] = [];
  const emittedSets = new Set<Record<string, unknown>>();
  for (const section of sections) {
    if (typeof section !== "object" || section === null) continue;
    const record = section as Record<string, unknown>;
    if (record.kind === "optionSet") {
      // Deferred when linked to a question; an orphan renders at its position.
      const linkId = field(record.questionId);
      if (linkId !== undefined && questionIds.has(linkId)) continue;
      const rendered = sectionNode(record, face);
      setWraps.push(rendered);
      article.append(rendered);
      continue;
    }
    article.append(sectionNode(record, face));
    if (record.kind === "question") {
      const questionId = field(record.id);
      if (questionId === undefined) continue;
      for (const linked of optionSetsForQuestion(sections, questionId)) {
        if (emittedSets.has(linked)) continue;
        emittedSets.add(linked);
        const rendered = sectionNode(linked, face);
        setWraps.push(rendered);
        article.append(rendered);
      }
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

  /** Apply one selection move inside its option set (F-R3 single rule). */
  const applySelection = (select: Element): void => {
    const optionId = select.getAttribute("data-option-id");
    if (optionId === null) return;
    const set = select.closest("[data-st-option-set]");
    const setId = set?.getAttribute("data-st-option-set") ?? "";
    if (selected.get(setId) === optionId) {
      selected.delete(setId);
      select.removeAttribute("data-st-selected");
      select.setAttribute("aria-pressed", "false");
      return;
    }
    const previous = set?.querySelector('[data-st-selected="true"]');
    previous?.removeAttribute("data-st-selected");
    previous?.setAttribute("aria-pressed", "false");
    selected.set(setId, optionId);
    select.setAttribute("data-st-selected", "true");
    select.setAttribute("aria-pressed", "true");
    dispatch(optionId);
  };

  const onClick = (event: Event): void => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest("[data-option-fold]") !== null) return;
    const select = target.closest("[data-option-id]");
    if (select !== null && node.contains(select) && select.closest("[data-option-disabled]") === null) {
      applySelection(select);
      return;
    }
    const card = target.closest("[data-option-card]");
    if (card !== null && node.contains(card) && card.closest("[data-option-disabled]") === null) {
      const ownSelect = card.querySelector("[data-option-id]");
      if (ownSelect !== null) applySelection(ownSelect);
    }
  };
  const onKeyDown = (event: Event): void => {
    if (!(event instanceof KeyboardEvent)) return;
    if (event.key !== "Enter" && event.key !== " ") return;
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest("[data-option-fold]") !== null) return;
    const select = target.closest("[data-option-id]");
    if (select !== null && node.contains(select) && select.closest("[data-option-disabled]") === null) {
      event.preventDefault();
      applySelection(select);
    }
  };
  const onFold = (event: Event): void => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const control = target.closest("[data-option-fold]");
    if (control === null || !node.contains(control)) return;
    event.stopPropagation();
    const optionId = control.getAttribute("data-option-fold") ?? "";
    const card = control.closest("[data-option-card]");
    const body = card?.querySelector(".st-dossier__optionBody") ?? undefined;
    if (expanded.has(optionId)) {
      expanded.delete(optionId);
      control.setAttribute("aria-expanded", "false");
      control.textContent = "Show details";
      body?.setAttribute("hidden", "");
    } else {
      expanded.add(optionId);
      control.setAttribute("aria-expanded", "true");
      control.textContent = "Hide details";
      body?.removeAttribute("hidden");
    }
  };
  node.addEventListener("click", onClick);
  node.addEventListener("keydown", onKeyDown);
  node.addEventListener("click", onFold);
  node.replaceChildren(article);

  return () => {
    node.removeEventListener("click", onClick);
    node.removeEventListener("keydown", onKeyDown);
    node.removeEventListener("click", onFold);
    node.replaceChildren();
  };
}
