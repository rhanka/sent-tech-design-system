import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const docsRoot = resolve(__dirname, "../../..");
const docsSearchSource = readFileSync(
  resolve(docsRoot, "src/lib/chat/DocsSearch.svelte"),
  "utf8"
);

describe("docs search result contract", () => {
  it("makes the whole result card one link, including the excerpt", () => {
    const resultLoop = docsSearchSource.match(
      /\{#each results as result \(result\.doc\.id\)\}[\s\S]*?\{\/each\}/
    )?.[0] ?? "";

    expect(resultLoop).toContain('<a class="docs-search-result-link" href={result.doc.url}>');
    expect(resultLoop).toMatch(
      /<a class="docs-search-result-link" href=\{result\.doc\.url\}>[\s\S]*docs-search-result-excerpt[\s\S]*<\/a>/
    );
    expect(resultLoop).not.toMatch(/<\/a>\s*\{#if result\.doc\.excerpt/);
    expect(docsSearchSource).toMatch(/\.docs-search-result\s*\{[\s\S]*padding: 0;/);
    expect(docsSearchSource).toMatch(
      /\.docs-search-result-link\s*\{[\s\S]*display: flex;[\s\S]*padding:/
    );
  });
});
