/** Compare the whole packaged review root with the complete owner render. */
export async function compareFocusMount(doc, ownerHtml) {
  const { mountDossier } = await import("/focus-mount.js");
  const host = document.querySelector("[data-st-dossier-page]");
  const dossier = mountDossier(host);
  const expected = new DOMParser().parseFromString(ownerHtml, "text/html").querySelector("article");

  // The mount provides real selection buttons on the read-only option list.
  const disabled = new Set(doc.interactions.filter((action) => action.name === "choose-option" && !action.enabled)
    .map((action) => action.targetRef));
  const optionIds = doc.sections.filter(({ kind }) => kind === "question")
    .flatMap(({ id }) => doc.sections.filter((section) => section.kind === "optionSet" && section.questionId === id))
    .flatMap(({ options }) => options.map(({ id }) => id));
  for (const [index, option] of [...expected.querySelectorAll(".focus-option")].entries()) {
    if (disabled.has(optionIds[index])) {
      option.setAttribute("aria-disabled", "true");
    } else {
      const label = option.firstElementChild;
      const button = expected.ownerDocument.createElement("button");
      label.before(button);
      button.append(label);
    }
  }

  // Focus's owner HTML lists the evidence. Only the mount opens the original
  // bytes and provides the commentable source, group and annex definitions.
  const supplemental = () => {
    if (!(doc.sources?.length || doc.evidenceGroups?.length || doc.annexes?.length)) return "";
    const escape = (value) => String(value).replace(/[&<>"']/g, (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
    const sourceTitle = (id) => escape(doc.sources.find((source) => source.id === id).title);
    const calls = (refs) => refs.length ? `<span>${refs.map((ref) =>
      `<a>[${doc.citations.findIndex((citation) => citation.id === ref) + 1}]</a>`).join("")}</span>` : "";
    const sources = doc.sources.map((source) => {
      const { origin } = source;
      const location = origin.uri ?? `${origin.repo}@${origin.revision}:${origin.path}`;
      const download = doc.citations.some(({ sourceId }) => sourceId === source.id) ? "" : "<a>Download source</a>";
      const preview = source.mediaType.startsWith("image/")
        ? `<img alt="${escape(source.alt ?? source.title)}">`
        : `<pre>${escape(new TextDecoder().decode(Uint8Array.from(atob(source.data), (char) => char.charCodeAt(0))))}</pre>`;
      return `<details><summary>${escape(source.title)}</summary><p>${escape(location)} · ${escape(source.mediaType)} · ${source.size} bytes · SHA-256 ${escape(source.sha256)}</p>${download}${preview}</details>`;
    }).join("");
    const groups = doc.evidenceGroups.map((group) => `<p>${escape(group.summary)}${calls(group.citationRefs)}${group.sourceRefs
      .map((id) => ` · <a>${sourceTitle(id)}</a>`).join("")}</p>`).join("");
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
      const backlinks = annex.backRefs.length ? `<p>Related blocks${annex.backRefs.map((id) => ` · <a>${escape(id)}</a>`).join("")}</p>` : "";
      return `<details><summary>${escape(annex.title)}</summary><p>${escape(annex.summary)}</p>${blocks}${backlinks}</details>`;
    }).join("");
    return `<section><h2>Embedded evidence</h2>${sources}${groups}${annexes}</section>`;
  };
  expected.insertAdjacentHTML("beforeend", supplemental());

  // A stylesheet has no rendered tree. Traverse every content node, including
  // closed disclosures, and also compare the visible text in the live page.
  // Attribute-only host wiring (class, anchor and selection IDs) is exercised
  // by the interaction and fragment tests.
  const attributes = ["alt", "aria-disabled", "hidden", "open"];
  function tree(node) {
    if (node.nodeType === Node.TEXT_NODE) return node.data;
    if (node.nodeType !== Node.ELEMENT_NODE || node.localName === "style") return null;
    const children = [];
    for (const childNode of node.childNodes) {
      const child = tree(childNode);
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
      attributes: attributes.map((name) => node.getAttribute(name)),
      children,
    };
  }

  const differences = [];
  const preview = (value) => JSON.stringify(value)?.slice(0, 240);
  function compare(actual, reference, path) {
    if (actual === reference) return;
    if (actual?.tag && actual.tag === reference?.tag) {
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
    compare(tree(dossier.reviewRoot), tree(expected), "article");
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
