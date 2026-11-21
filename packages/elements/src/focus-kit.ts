import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

export interface StandaloneDossier {
  /** Canonical UTF-8 JSON as supplied by the publisher. */
  readonly document: string;
  readonly manifest?: string;
  readonly views?: string;
}

function readKit(path: string): string {
  return readFileSync(new URL(`./focus-kit/${path}`, import.meta.url), "utf8").replace(/\r\n?/g, "\n");
}

function cspHash(text: string): string {
  return `'sha256-${createHash("sha256").update(text).digest("base64")}'`;
}

/** Inline the packaged renderer and canonical input bytes for a file:// reader. */
export function assembleStandaloneDossier({ document, manifest, views }: StandaloneDossier): string {
  const module = readKit("renderer/dossier.js").replace(/<\/script/gi, "<\\/script");
  const css = readKit("renderer/dossier.css");
  const csp = [
    "default-src 'none'",
    `script-src ${cspHash(module)}`,
    `style-src ${cspHash(css)}`,
    "img-src data:",
    "worker-src 'none'",
    "base-uri 'none'",
    "form-action 'none'",
  ].join("; ");
  const islands = [["document", document], ["manifest", manifest], ["views", views]]
    .flatMap(([name, value]) => value === undefined ? [] : [
      `<script type="application/octet-stream" data-st-dossier-${name}>${Buffer.from(value).toString("base64")}</script>`,
    ]);

  return readKit("index.html")
    .replace('<link rel="stylesheet" href="./renderer/dossier.css">', () =>
      `<meta http-equiv="Content-Security-Policy" content="${csp}">\n    <style>${css}</style>`)
    .replace('<script type="module" src="./renderer/dossier.js"></script>', () =>
      [...islands, `<script type="module">${module}</script>`].join("\n    "));
}
