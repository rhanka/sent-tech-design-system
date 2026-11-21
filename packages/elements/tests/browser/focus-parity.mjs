/** Compare the rendered blocks in the browser, where the packaged mount runs. */
export async function compareFocusMount(doc, ownerHtml) {
  const { mountDossier } = await import("/focus-mount.js");
  const host = document.querySelector("[data-st-dossier-page]");
  const dossier = mountDossier(host);
  dossier.render(doc);
  const mounted = dossier.reviewRoot;
  const owner = new DOMParser().parseFromString(ownerHtml, "text/html").querySelector("article");
  const differences = [];
  const compare = (block, actual, expected) => {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      differences.push(`${block}: mounted ${JSON.stringify(actual)}, Focus ${JSON.stringify(expected)}`);
    }
  };
  const all = (node, selector) => [...(node?.querySelectorAll(selector) ?? [])];
  const clean = (value) => value?.replace(/\s+/g, " ").trim() ?? "";
  const text = (node, selector) => clean(node?.querySelector(selector)?.textContent);
  const texts = (node, selector) => all(node, selector).map((element) => clean(element.textContent));
  const markup = (elements) => elements.map((element) => clean(element.outerHTML));
  const badges = (node) => texts(node, "a").filter((value) => /^\[\d+\]$/.test(value));
  const following = (node, selector) => {
    const siblings = [];
    for (let sibling = node.nextElementSibling; sibling?.matches(selector); sibling = sibling.nextElementSibling) {
      siblings.push(sibling);
    }
    return siblings;
  };

  const sectionSelectors = {
    prose: [".st-dossier__prose", ".focus-prose"],
    question: ["[data-st-question]", ".focus-question"],
    optionSet: ["[data-st-option-set]", ".focus-optionset"],
    outcome: ["[data-st-outcome]", ".focus-outcome"],
    diagram: ["[data-st-diagram]", ".focus-diagram"],
    amendmentTrace: ["[data-st-trace], [data-st-trace-footer]", ".focus-amendment-trace"],
  };
  const sections = (root, index) => [...root.children].flatMap((node) => {
    const kind = Object.keys(sectionSelectors).find((kind) => node.matches(sectionSelectors[kind][index]));
    return kind ? [{ kind, node }] : [];
  });
  const mountedSections = sections(mounted, 0);
  const ownerSections = sections(owner, 1);
  compare("section order", mountedSections.map(({ kind }) => kind), ownerSections.map(({ kind }) => kind));
  compare("header", [text(mounted, "header h1"), text(mounted, "header p")],
    [text(owner, "header h1"), text(owner, "header p").replace(/^subject: /, "").split(" · ref: ")[0]]);
  const readability = (root, selector) => all(root.querySelector(selector), "h2, blockquote, p, summary, dt, dd")
    .map((node) => [node.localName, clean(node.textContent)]);
  compare("readability and glossary", readability(mounted, ".st-dossier__readability"), readability(owner, ".focus-readability"));

  const citationCalls = (block) => following(block, "sup").flatMap(badges);
  for (const kind of Object.keys(sectionSelectors)) {
    const actual = mountedSections.filter((section) => section.kind === kind).map(({ node }) => node);
    const expected = ownerSections.filter((section) => section.kind === kind).map(({ node }) => node);
    for (const [index, reference] of expected.entries()) {
      const block = actual[index];
      const label = `${kind} ${index + 1}`;
      if (block) {
        compare(`${label} citations`, badges(block.querySelector(":scope > .st-dossier__citations")), citationCalls(reference));
      }
      if (kind === "prose") {
        compare(`${label} Markdown`, markup(all(block, ":scope > p:not(.st-dossier__criterion), :scope > ul:not(:has(.st-dossier__input)), :scope > table")),
          markup(all(reference, ":scope > p:not(.focus-completion-criterion), :scope > ul:not(.focus-inputs), :scope > table")));
      }
      if (kind === "prose" || kind === "question") {
        compare(`${label} context`, [texts(block, ".st-dossier__input"), text(block, ".st-dossier__criterion")],
          [all(reference, ".focus-inputs li").map((item) => {
            const label = text(item, "span");
            const ref = text(item, "code");
            return label === ref ? ref : `${label} (${ref})`;
          }), text(reference, ".focus-completion-criterion")]);
      }
      if (kind === "question") {
        compare(label, [".st-dossier__questionText", ".st-dossier__state", ".st-dossier__questionContext", ".st-dossier__readingTime",
          ".st-dossier__questionReco", ".st-dossier__questionAnswer"].map((selector) => text(block, selector)), [
          text(reference, ".focus-q").replace(/^Q: /, "").replace(/ \([^)]*\)$/, ""),
          text(reference, ".focus-q em").slice(1, -1), text(reference, ".focus-context"), text(reference, ".focus-reading-time"),
          text(reference, ".focus-preco").replace(/^préco: /, ""), text(reference, ".focus-answer").replace(/^answer: /, ""),
        ]);
      }
      if (kind === "optionSet") {
        compare(`${label} heading`, text(block, "h3, h4"), text(reference, "h3"));
        const optionCalls = new Map(following(following(reference, "sup").at(-1) ?? reference, "p").map((line) => [
          clean(line.firstChild?.textContent), badges(line),
        ]));
        compare(`${label} cards`, all(block, "[data-anchor-id]").map((card) => [
          ...["Label", "Consequence", "Body", "AnnotationComment"].map((part) => text(card, `.st-dossier__option${part}`)),
          card.querySelector("[data-annotation]")?.getAttribute("data-annotation") ?? "none", badges(card),
        ]), all(reference, ".focus-option").map((option) => [
          text(option, "strong"), text(option, ".focus-consequence"), text(option, ".focus-option-body"),
          text(option, ".focus-option-comment").replace(/^— /, ""), option.getAttribute("data-annotation"),
          optionCalls.get(text(option, "strong")) ?? [],
        ]));
      }
      if (kind === "outcome") {
        compare(`${label} heading and statement`, texts(block, "h3, p"), texts(reference, "h3, p"));
      }
      if (kind === "diagram") {
        compare(label, texts(block, "figcaption, pre"), texts(reference, "figcaption, pre"));
      }
      if (kind === "amendmentTrace") {
        compare(`${label} heading and entries`, texts(block, "h3, li:not(.st-dossier__citations), p"), texts(reference, "h3, li, p"));
      }
    }
  }

  const evidence = mounted.querySelector(".st-dossier__evidence");
  const sourceRows = all(evidence, "details:has(a[download])");
  const sources = new Map(sourceRows.map((row) => [row.dataset.anchorId, row]));
  const citationRows = all(evidence, "ol > [data-anchor-id]");
  const referenceCitations = all(owner, ".focus-sources li");
  compare("bibliography", citationRows.map((row) => {
    const sourceLink = row.querySelector("a");
    const source = sources.get(decodeURIComponent(sourceLink.hash.slice(1)));
    const origin = text(source, "p").split(" · ")[0];
    const locator = clean(sourceLink.nextSibling?.textContent).slice(2);
    const location = locator.startsWith("lines ") ? `${origin}:${locator.slice(6)}` : `${origin} · ${locator}`;
    return `${clean(row.firstChild?.textContent)} · ${clean(sourceLink.textContent)} · ${location}`;
  }), referenceCitations.map((row) => clean(row.firstChild?.textContent).replace(/ ·$/, "")));
  const downloads = (root) => all(root, "a[download]").map((link) => [link.download, link.getAttribute("href")]).sort();
  compare("source downloads", downloads(evidence), downloads(owner));

  const evidenceIndex = owner.querySelector(".focus-evidence pre")?.textContent.split("\n") ?? [];
  compare("source index", sourceRows.map((row) => {
    const [origin, ...metadata] = text(row, "p").split(" · ");
    return [`Source ${row.dataset.anchorId}: ${text(row, "summary")}`, ...metadata, origin];
  }), evidenceIndex.filter((line) => line.startsWith("Source ")).map((line) => {
    const fields = line.split(" · ");
    const origin = JSON.parse(fields.pop());
    return [...fields, origin.uri ?? `${origin.repo}@${origin.revision}:${origin.path}`];
  }));
  const groups = all(evidence, ":scope > p[data-anchor-id]");
  for (const group of groups) {
    const refs = all(group, "a").map((link) => link.textContent.startsWith("[")
      ? link.textContent : `Source ${decodeURIComponent(link.hash.slice(1))}`);
    const label = `${group.dataset.anchorId}: `;
    compare(`${label}evidence`, `${label}${clean(group.firstChild?.textContent)} → ${refs.join(", ")}`,
      evidenceIndex.find((line) => line.startsWith(label)));
  }
  compare("evidence group count", groups.length, doc.evidenceGroups?.length ?? 0);

  const annexes = all(evidence, "details:not(:has(a[download]))");
  const referenceAnnexes = all(owner, ".focus-annex");
  compare("annex count", annexes.length, doc.annexes?.length ?? 0);
  for (const [index, annex] of annexes.entries()) {
    const [title, summary, ...blocks] = annex.children;
    const backRefs = blocks.at(-1)?.textContent.startsWith("Related blocks") ? blocks.pop().textContent.split(" · ").slice(1) : [];
    const label = `Annex ${annex.dataset.anchorId}: `;
    compare(`${label}index`, `${label}${title.textContent} — ${summary.textContent} · ${blocks.length} support blocks · back: ${backRefs.join(", ")}`,
      evidenceIndex.find((line) => line.startsWith(label)));
    const reference = referenceAnnexes[index];
    if (reference) {
      const items = (nodes) => nodes.flatMap((node) => {
        if (node.matches("table")) return [["table", all(node, "tr").map((row) => texts(row, "th, td"))]];
        const refs = badges(node);
        if (refs.length > 0) return refs.map((badge) => ["p", clean(citationRows[Number(badge.slice(1, -1)) - 1]?.firstChild?.textContent)]);
        return [[node.localName, clean(node.textContent)]];
      });
      compare(`${label}blocks`, [clean(title.textContent), clean(summary.textContent), items(blocks)],
        [text(reference, "h2"), text(reference, "p"), items([...reference.children].slice(2))]);
    }
  }
  dossier.destroy();
  return differences;
}
