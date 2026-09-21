import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { externalizeInlineScripts } from "../../scripts/externalize-inline-scripts.mjs";

// Amorce d'hydratation telle que SvelteKit l'écrit dans une page prérendue.
const BOOT = `
				{
					__sveltekit_x = { base: "" };
					const element = document.currentScript.parentElement;
					Promise.all([import("/_app/immutable/entry/start.js")]).then(([kit]) => kit.start(element));
				}
			`;

const PAGE = `<!doctype html><html><head>
<script src="/pre-hydration.js?v=1"></script>
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

function makeBuild(): string {
  dir = mkdtempSync(join(tmpdir(), "docs-externalize-"));
  mkdirSync(join(dir, "components"));
  writeFileSync(join(dir, "components/button.html"), PAGE);
  writeFileSync(join(dir, "404.html"), PAGE);
  return dir;
}

describe("externalizeInlineScripts", () => {
  it("moves the SvelteKit boot script to a content-addressed file, at the same place", () => {
    const build = makeBuild();

    expect(externalizeInlineScripts(build)).toEqual({ pages: 2, scripts: 2, files: 1 });

    const html = readFileSync(join(build, "components/button.html"), "utf8");
    const [, src] = /<script src="(\/_app\/immutable\/inline\/[0-9a-f]{24}\.js)"><\/script>/.exec(html) ?? [];
    expect(src, "balise <script src> de l'amorce").toBeDefined();
    // Même position : dernier enfant du conteneur d'hydratation, pour que
    // document.currentScript.parentElement reste ce conteneur.
    expect(html).toContain(`<main>contenu</main>\n\t\t\t<script src="${src}"></script>\n\t\t</div>`);
    // Contenu déplacé à l'identique, et plus aucun code inline dans la page.
    expect(readFileSync(join(build, src!), "utf8")).toBe(BOOT);
    expect(html).not.toContain("__sveltekit_x");
  });

  it("leaves external scripts, data blocks and empty scripts untouched", () => {
    const build = makeBuild();
    externalizeInlineScripts(build);

    const html = readFileSync(join(build, "404.html"), "utf8");
    expect(html).toContain('<script src="/pre-hydration.js?v=1"></script>');
    expect(html).toContain('<script type="application/json" data-sveltekit-fetched>{"a":1}</script>');
    expect(html).toContain("<script></script>");
  });

  it("is idempotent", () => {
    const build = makeBuild();
    externalizeInlineScripts(build);
    const first = readFileSync(join(build, "components/button.html"), "utf8");

    expect(externalizeInlineScripts(build)).toEqual({ pages: 0, scripts: 0, files: 0 });
    expect(readFileSync(join(build, "components/button.html"), "utf8")).toBe(first);
    expect(readdirSync(join(build, "_app/immutable/inline"))).toHaveLength(1);
  });
});
