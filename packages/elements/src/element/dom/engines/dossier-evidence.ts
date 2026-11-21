import type { AnnexBlock, DecisionDossierDocumentV2, EvidenceSource } from "@sentropic/focus";

export function markDossierAnchor(container: HTMLElement, id: string): void {
  container.dataset.anchorId = id;
  container.dataset.commentable = "";
}

function label(tag: string, value: string): HTMLElement {
  const element = document.createElement(tag);
  element.textContent = value;
  return element;
}

export function dossierReference(id: string, value: string): HTMLAnchorElement {
  const link = document.createElement("a");
  link.setAttribute("href", `#${encodeURIComponent(id)}`);
  link.textContent = value;
  return link;
}

export function dossierSourceOrigin(source: EvidenceSource): string {
  return "uri" in source.origin ? source.origin.uri
    : `${source.origin.repo}@${source.origin.revision}:${source.origin.path}`;
}

type CitationCalls = (refs: unknown, container: HTMLElement) => void;

/** Number references in document order. Only the index entries are definitions. */
export function dossierCitations(doc: DecisionDossierDocumentV2 | undefined): CitationCalls {
  const numbers = new Map(doc?.citations.map((citation, index) => [citation.id, index + 1]));
  return (refs, container) => {
    if (!Array.isArray(refs) || refs.length === 0) return;
    const calls = document.createElement(container instanceof HTMLOListElement ? "li" : "span");
    calls.className = "st-dossier__citations";
    for (const id of refs) {
      const number = numbers.get(id);
      if (number === undefined) continue;
      const link = dossierReference(id, `[${number}]`);
      link.setAttribute("aria-label", `Citation ${number}`);
      calls.append(link);
    }
    if (calls.hasChildNodes()) container.append(calls);
  };
}

function annexBlock(block: AnnexBlock, calls: CitationCalls): HTMLElement {
  if (block.kind === "table") {
    const table = document.createElement("table");
    const header = table.createTHead().insertRow();
    for (const column of block.columns) {
      const heading = label("th", column);
      heading.setAttribute("scope", "col");
      header.append(heading);
    }
    const body = table.createTBody();
    for (const cells of block.rows) {
      const row = body.insertRow();
      for (const cell of cells) row.insertCell().textContent = cell;
    }
    return table;
  }
  if (block.kind === "references") {
    const paragraph = document.createElement("p");
    calls(block.citationRefs, paragraph);
    return paragraph;
  }
  if (block.kind === "text") return label("p", block.text);
  const pre = document.createElement("pre");
  pre.append(label("code", block.text));
  return pre;
}

function sourceDefinition(source: EvidenceSource, hasBibliographyDownload: boolean): HTMLDetailsElement {
  const definition = document.createElement("details");
  markDossierAnchor(definition, source.id);
  definition.append(
    label("summary", source.title),
    label("p", `${dossierSourceOrigin(source)} · ${source.mediaType} · ${source.size} bytes · SHA-256 ${source.sha256}`),
  );
  if (!hasBibliographyDownload) {
    const download = document.createElement("a");
    download.href = `data:application/octet-stream;base64,${source.data}`;
    download.download = `evidence-${source.id.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    download.textContent = "Download source";
    definition.append(download);
  }
  if (source.mediaType === "image/png" || source.mediaType === "image/jpeg") {
    const preview = document.createElement("img");
    preview.src = `data:${source.mediaType};base64,${source.data}`;
    preview.alt = source.alt ?? source.title;
    definition.append(preview);
  } else {
    const bytes = Uint8Array.from(atob(source.data), (character) => character.charCodeAt(0));
    definition.append(label("pre", new TextDecoder().decode(bytes)));
  }
  return definition;
}

export function appendDossierEvidence(
  root: HTMLElement,
  doc: DecisionDossierDocumentV2,
  calls: CitationCalls,
  snapshot = false,
): void {
  const evidence = document.createElement("section");
  evidence.className = "st-dossier__evidence";
  evidence.append(label("h2", snapshot ? "Embedded evidence" : "Evidence"));
  const sources = new Map(doc.sources.map((source) => [source.id, source]));
  const downloadedSources = new Set(snapshot ? doc.citations.map(({ sourceId }) => sourceId) : []);
  if (sources.size > 0) {
    if (!snapshot) evidence.append(label("h3", "Sources"));
    for (const source of sources.values()) {
      evidence.append(sourceDefinition(source, downloadedSources.has(source.id)));
    }
  }
  if (!snapshot && doc.citations.length > 0) {
    const index = document.createElement("ol");
    for (const citation of doc.citations) {
      const entry = label("li", citation.label);
      markDossierAnchor(entry, citation.id);
      const source = sources.get(citation.sourceId);
      const locator = citation.locator.kind === "image" ? citation.locator.caption
        : `lines ${citation.locator.start}–${citation.locator.end}`;
      if (source !== undefined) entry.append(" · ", dossierReference(source.id, source.title));
      entry.append(` · ${locator}`);
      index.append(entry);
    }
    evidence.append(label("h3", "Citations"), index);
  }
  for (const group of doc.evidenceGroups) {
    const block = label("p", group.summary);
    markDossierAnchor(block, group.id);
    calls(group.citationRefs, block);
    for (const id of group.sourceRefs) block.append(" · ", dossierReference(id, sources.get(id)?.title ?? id));
    evidence.append(block);
  }
  const anchors = new Set(Array.from(root.querySelectorAll<HTMLElement>("[data-anchor-id]"), (node) => node.dataset.anchorId));
  for (const annex of doc.annexes) {
    const block = document.createElement("details");
    markDossierAnchor(block, annex.id);
    block.append(label("summary", annex.title), label("p", annex.summary));
    for (const item of annex.blocks) block.append(annexBlock(item, calls));
    if (annex.backRefs.length > 0) {
      const back = label("p", "Related blocks");
      for (const id of annex.backRefs) back.append(" · ", anchors.has(id) ? dossierReference(id, id) : id);
      block.append(back);
    }
    evidence.append(block);
  }
  if (evidence.children.length > 1) root.append(evidence);
}
