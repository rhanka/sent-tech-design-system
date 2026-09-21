import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { contentName, externalizeInlineScripts } from "../../scripts/externalize-inline-scripts.mjs";
import { parseScripts } from "../../scripts/html-scripts.mjs";

// Script pré-hydratation (inline en tête de <head> dans app.html).
const PRE_HYDRATION = `(function () { document.documentElement.setAttribute("data-color-mode", "dark"); })();`;

// Amorce d'hydratation telle que SvelteKit l'écrit dans une page prérendue.
const BOOT = `
				{
					__sveltekit_x = { base: "" };
					const element = document.currentScript.parentElement;
					Promise.all([import("/_app/immutable/entry/start.js")]).then(([kit]) => kit.start(element));
				}
			`;

const PAGE = `<!doctype html><html><head>
<script>${PRE_HYDRATION}</script>
<link rel="stylesheet" href="/x.css">
<script type="application/json" data-sveltekit-fetched>{"a":1}</script>
<script></script>
</head><body><div style="display: contents"><main>contenu</main>
			<script>${BOOT}</script>
		</div></body></html>`;

let dir: string | undefined;

afterEach(() => {
  if (dir) rmSync(dir, { recursive: true, force: true });
  dir = undefined;
});

function makeBuild(pages: Record<string, string> = { "components/button.html": PAGE, "404.html": PAGE }): string {
  dir = mkdtempSync(join(tmpdir(), "docs-externalize-"));
  for (const [path, html] of Object.entries(pages)) {
    mkdirSync(join(dir, path, ".."), { recursive: true });
    writeFileSync(join(dir, path), html);
  }
  return dir;
}

const page = (script: string) => `<!doctype html><html><head></head><body>${script}</body></html>`;

describe("externalizeInlineScripts", () => {
  it("moves the SvelteKit boot script to a content-addressed file, at the same place", () => {
    const build = makeBuild();

    expect(externalizeInlineScripts(build)).toEqual({ pages: 2, scripts: 4, files: 2 });

    const html = readFileSync(join(build, "components/button.html"), "utf8");
    const src = `/_app/immutable/inline/${contentName(BOOT)}`;
    // Même position : dernier enfant du conteneur d'hydratation, pour que
    // document.currentScript.parentElement reste ce conteneur.
    expect(html).toContain(`<main>contenu</main>\n\t\t\t<script src="${src}"></script>\n\t\t</div>`);
    // Contenu déplacé à l'identique, et plus aucun code inline dans la page.
    expect(readFileSync(join(build, src), "utf8")).toBe(BOOT);
    expect(html).not.toContain("__sveltekit_x");
  });

  it("serves the pre-hydration script from a content-addressed name, first in <head>, still synchronous", () => {
    const build = makeBuild();
    externalizeInlineScripts(build);

    const html = readFileSync(join(build, "components/button.html"), "utf8");
    const name = contentName(PRE_HYDRATION);
    // Nom = hash du contenu : un ancien contenu ne peut pas être servi sous ce nom.
    expect(name).toMatch(/^[0-9a-f]{24}\.js$/);
    expect(readFileSync(join(build, "_app/immutable/inline", name), "utf8")).toBe(PRE_HYDRATION);
    // Premier script, avant la feuille de style, sans async/defer/module.
    expect(html).toContain(`<head>\n<script src="/_app/immutable/inline/${name}"></script>\n<link rel="stylesheet"`);
    // Un contenu différent donne un autre nom.
    expect(contentName(`${PRE_HYDRATION} `)).not.toBe(name);
  });

  it("leaves external scripts, data blocks and empty scripts untouched", () => {
    const build = makeBuild();
    externalizeInlineScripts(build);

    const html = readFileSync(join(build, "404.html"), "utf8");
    expect(html).toContain('<script type="application/json" data-sveltekit-fetched>{"a":1}</script>');
    expect(html).toContain("<script></script>");
  });

  it("keeps type=module and nomodule, the only attributes it can transpose", () => {
    const build = makeBuild({ "a.html": page('<script type="module">m()</script><script nomodule>n()</script>') });
    externalizeInlineScripts(build);

    const html = readFileSync(join(build, "a.html"), "utf8");
    expect(html).toContain(`<script type="module" src="/_app/immutable/inline/${contentName("m()")}"></script>`);
    expect(html).toContain(`<script nomodule src="/_app/immutable/inline/${contentName("n()")}"></script>`);
  });

  it.each([
    ["async", "<script async>a()</script>", "attribut(s) non transposable(s) : async"],
    ["defer", "<script defer>a()</script>", "attribut(s) non transposable(s) : defer"],
    ["data-*", '<script data-x="1">a()</script>', "attribut(s) non transposable(s) : data-x"],
    ["data-src (not a real src)", '<script data-src="/a.js">a()</script>', "attribut(s) non transposable(s) : data-src"],
    ["data-type (not a real type)", '<script data-type="text/plain">a()</script>', "data-type"],
    ["importmap", '<script type="importmap">{"imports":{}}</script>', 'type="importmap"'],
    ["`>` in attributes", '<script type="module" x=">">a()</script>', "`>` dans les attributs"]
  ])("refuses an inline executable script with %s, without touching the build", (_, script, reason) => {
    const html = page(script);
    const build = makeBuild({ "a.html": html });

    expect(() => externalizeInlineScripts(build)).toThrow(reason);
    expect(readFileSync(join(build, "a.html"), "utf8")).toBe(html);
    expect(readdirSync(build)).toEqual(["a.html"]);
  });

  it("refuses a name collision with a different content instead of keeping the first silently", () => {
    const build = makeBuild({ "a.html": page("<script>a()</script>") });
    mkdirSync(join(build, "_app/immutable/inline"), { recursive: true });
    writeFileSync(join(build, "_app/immutable/inline", contentName("a()")), "autre()");

    expect(() => externalizeInlineScripts(build)).toThrow("collision de nom");
    expect(readFileSync(join(build, "a.html"), "utf8")).toBe(page("<script>a()</script>"));
  });

  it("is idempotent", () => {
    const build = makeBuild();
    externalizeInlineScripts(build);
    const first = readFileSync(join(build, "components/button.html"), "utf8");

    expect(externalizeInlineScripts(build)).toEqual({ pages: 0, scripts: 0, files: 0 });
    expect(readFileSync(join(build, "components/button.html"), "utf8")).toBe(first);
    expect(readdirSync(join(build, "_app/immutable/inline"))).toHaveLength(2);
  });
});

describe("parseScripts (shared with csp-check)", () => {
  it("reads real attributes only: data-src is not src, data-type is not type", () => {
    const [dataSrc, dataType, real] = parseScripts(
      '<script data-src="/a.js">a()</script><script data-type="text/plain">b()</script><script src="/c.js"></script>'
    );
    expect(dataSrc).toMatchObject({ kind: "classic", inlineExecutable: true });
    expect(dataType).toMatchObject({ kind: "classic", inlineExecutable: true });
    expect(real).toMatchObject({ kind: "external", inlineExecutable: false });
  });

  it("does not end a tag on a quoted `>` and rejects unreadable attributes", () => {
    const [script] = parseScripts('<script x=">">a()</script>');
    expect(script.source).toBe("a()");
    expect(script.raw).toContain(">");
    expect(() => parseScripts('<script src="/a.js" "b">a()</script>')).toThrow("attributs de <script> illisibles");
  });
});
