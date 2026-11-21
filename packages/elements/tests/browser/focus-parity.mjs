/** Compare the whole packaged review root with the complete owner render. */
export async function compareFocusMount(doc, ownerHtml) {
  const { mountDossier } = await import("/focus-mount.js");
  const { createAnchorFromElement } = await import("/focus-review-core/index.js");
  const host = document.querySelector("[data-st-dossier-page]");
  const dossier = mountDossier(host);
  const expected = new DOMParser().parseFromString(ownerHtml, "text/html").querySelector("article");
  function markDefinition(element, id) {
    element.setAttribute("data-anchor-id", id);
    element.setAttribute("data-commentable", "");
  }
  markDefinition(expected.querySelector("header"), doc.ref);
  const sections = doc.sections.filter(({ kind }) => kind !== "optionSet").flatMap((section) =>
    section.kind === "question"
      ? [section, ...doc.sections.filter(({ kind, questionId }) => kind === "optionSet" && questionId === section.id)]
      : [section]);
  const blocks = [...expected.querySelectorAll(
    ":scope > :is(.focus-prose, .focus-question, .focus-optionset, .focus-outcome, .focus-diagram, .focus-amendment-trace)",
  )];
  // Focus places calls after their blocks. The kit keeps them with the content
  // they cite so review capture inherits the section or option ID.
  for (const calls of expected.querySelectorAll(
    ":scope > sup:has(> a.focus-citation), :scope > p:has(> sup > a.focus-citation)",
  )) calls.remove();
  const citationNumbers = new Map(doc.citations?.map(({ id }, index) => [id, index + 1]));
  const fragment = (id) => `#${encodeURIComponent(id)}`;
  function appendCalls(element, refs = []) {
    for (const id of refs) {
      const badge = expected.ownerDocument.createElement("sup");
      const link = expected.ownerDocument.createElement("a");
      link.setAttribute("href", fragment(id));
      link.textContent = `[${citationNumbers.get(id)}]`;
      badge.append(link);
      element.append(badge);
    }
  }
  for (const [index, section] of sections.entries()) {
    markDefinition(blocks[index], section.id);
    appendCalls(blocks[index], section.citationRefs);
  }

  // The mount provides real selection buttons on the read-only option list.
  const disabled = new Set(doc.interactions.filter((action) => action.name === "choose-option" && !action.enabled)
    .map((action) => action.targetRef));
  const options = sections.flatMap(({ options }) => options ?? []);
  for (const [index, card] of [...expected.querySelectorAll(".focus-option")].entries()) {
    const option = options[index];
    markDefinition(card, option.id);
    if (option.annotation !== "none") {
      const disposition = expected.ownerDocument.createElement("span");
      disposition.textContent = option.annotation;
      card.querySelector(":scope > .focus-consequence").after(disposition);
    }
    appendCalls(card, option.citationRefs);
    if (disabled.has(option.id)) {
      card.setAttribute("aria-disabled", "true");
    } else {
      const label = card.firstElementChild;
      const button = expected.ownerDocument.createElement("button");
      label.before(button);
      button.append(label);
    }
  }

  for (const [index, row] of [...expected.querySelectorAll(":scope > .focus-sources > ol > li")].entries()) {
    const citation = doc.citations[index];
    markDefinition(row, citation.id);
    const source = doc.sources.find(({ id }) => id === citation.sourceId);
    const htmlTextLength = (text) => text.replace(/\r\n?/g, "\n").length;
    const title = row.firstChild.splitText(htmlTextLength(`${citation.label} · `));
    title.splitText(htmlTextLength(source.title));
    const link = expected.ownerDocument.createElement("a");
    link.setAttribute("href", fragment(source.id));
    link.textContent = title.data;
    title.replaceWith(link);
  }
  // The report's annex contents appear once, in the kit's anchored disclosure.
  for (const annex of expected.querySelectorAll(":scope > .focus-annex")) annex.remove();

  // Focus's owner HTML lists the evidence. Only the mount opens the original
  // bytes and provides the commentable source, group and annex definitions.
  const supplemental = () => {
    if (!(doc.sources?.length || doc.evidenceGroups?.length || doc.annexes?.length)) return "";
    const escape = (value) => String(value).replace(/[&<>"']/g, (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
    const definition = (id) => `data-anchor-id="${escape(id)}" data-commentable`;
    const sourceTitle = (id) => escape(doc.sources.find((source) => source.id === id).title);
    const calls = (refs) => refs.length ? `<span>${refs.map((ref) =>
      `<a href="${fragment(ref)}">[${citationNumbers.get(ref)}]</a>`).join("")}</span>` : "";
    const sources = doc.sources.map((source) => {
      const { origin } = source;
      const location = origin.uri ?? `${origin.repo}@${origin.revision}:${origin.path}`;
      const filename = `evidence-${source.id.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const download = doc.citations.some(({ sourceId }) => sourceId === source.id) ? ""
        : `<a href="data:application/octet-stream;base64,${escape(source.data)}" download="${filename}">Download source</a>`;
      const preview = source.mediaType.startsWith("image/")
        ? `<img alt="${escape(source.alt ?? source.title)}">`
        : `<pre>${escape(new TextDecoder().decode(Uint8Array.from(atob(source.data), (char) => char.charCodeAt(0))))}</pre>`;
      return `<details ${definition(source.id)}><summary>${escape(source.title)}</summary><p>${escape(location)} · ${escape(source.mediaType)} · ${source.size} bytes · SHA-256 ${escape(source.sha256)}</p>${download}${preview}</details>`;
    }).join("");
    const groups = doc.evidenceGroups.map((group) => `<p ${definition(group.id)}>${escape(group.summary)}${calls(group.citationRefs)}${group.sourceRefs
      .map((id) => ` · <a href="${fragment(id)}">${sourceTitle(id)}</a>`).join("")}</p>`).join("");
    const annexes = doc.annexes.map((annex) => {
      const blocks = annex.blocks.map((block) => {
        switch (block.kind) {
          case "code": return `<pre><code>${escape(block.text)}</code></pre>`;
          case "references": return `<p>${calls(block.citationRefs)}</p>`;
          case "table": return `<table><thead><tr>${block.columns.map((cell) => `<th>${escape(cell)}</th>`).join("")}</tr></thead><tbody>${block.rows
            .map((row) => `<tr>${row.map((cell) => `<td>${escape(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
          case "text": return `<p>${escape(block.text)}</p>`;
        }
      }).join("");
      const backlinks = annex.backRefs.length ? `<p>Related blocks${annex.backRefs
        .map((id) => ` · <a href="${fragment(id)}">${escape(id)}</a>`).join("")}</p>` : "";
      return `<details ${definition(annex.id)}><summary>${escape(annex.title)}</summary><p>${escape(annex.summary)}</p>${blocks}${backlinks}</details>`;
    }).join("");
    return `<section><h2>Embedded evidence</h2>${sources}${groups}${annexes}</section>`;
  };
  expected.insertAdjacentHTML("beforeend", supplemental());

  // A stylesheet has no rendered tree. Traverse every content node, including
  // closed disclosures, and also compare the visible text in the live page.
  const attributes = ["alt", "aria-disabled", "data-anchor-id", "data-commentable", "download", "hidden", "href", "open"];
  function tree(node, captureAid) {
    if (node.nodeType === Node.TEXT_NODE) return node.data;
    if (node.nodeType !== Node.ELEMENT_NODE || node.localName === "style") return null;
    const children = [];
    for (const childNode of node.childNodes) {
      const child = tree(childNode, captureAid);
      if (child === null) continue;
      // DOM construction can split text that the HTML parser reads as one node.
      if (typeof child === "string" && typeof children.at(-1) === "string") {
        children[children.length - 1] += child;
      } else {
        children.push(child);
      }
    }
    return {
      tag: node.localName,
      aid: captureAid(node),
      attributes: attributes.map((name) => node.getAttribute(name)),
      children,
    };
  }

  const differences = [];
  const preview = (value) => JSON.stringify(value)?.slice(0, 240);
  function compare(actual, reference, path) {
    if (actual === reference) return;
    if (actual?.tag && actual.tag === reference?.tag) {
      if (actual.aid !== reference.aid) {
        differences.push(`${path}/aid: mounted ${preview(actual.aid)}, Focus ${preview(reference.aid)}`);
      }
      for (const [index, name] of attributes.entries()) {
        if (actual.attributes[index] !== reference.attributes[index]) {
          differences.push(`${path}/@${name}: mounted ${preview(actual.attributes[index])}, Focus ${preview(reference.attributes[index])}`);
        }
      }
      for (let index = 0; index < Math.max(actual.children.length, reference.children.length); index++) {
        const child = actual.children[index];
        const expectedChild = reference.children[index];
        compare(child, expectedChild, `${path}/${expectedChild?.tag ?? child?.tag ?? "text"}[${index + 1}]`);
      }
    } else {
      differences.push(`${path}: mounted ${preview(actual)}, Focus ${preview(reference)}`);
    }
  }

  // Keep the reference live for innerText without inheriting the kit CSS.
  const frame = document.createElement("iframe");
  document.body.append(frame);
  try {
    frame.contentDocument.body.append(expected);
    dossier.render(doc);
    const root = dossier.reviewRoot;
    const captureAid = (node) => createAnchorFromElement(root, node, doc.hash)?.aid;
    const expectedAid = (node) => node.closest("[data-anchor-id]")?.getAttribute("data-anchor-id");
    compare(tree(root, captureAid), tree(expected, expectedAid), "article");
    const visible = dossier.reviewRoot.innerText;
    const ownerVisible = expected.innerText;
    if (visible !== ownerVisible) {
      let offset = 0;
      while (visible[offset] === ownerVisible[offset]) offset++;
      const start = Math.max(0, offset - 30);
      differences.push(`visible text at ${offset}: mounted ${preview(visible.slice(start))}, Focus ${preview(ownerVisible.slice(start))}`);
    }
    return differences;
  } finally {
    frame.remove();
    dossier.destroy();
  }
}
