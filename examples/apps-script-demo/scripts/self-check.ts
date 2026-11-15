// Self-check of the built page. Asserts that it is self-contained and offline:
//   - 0 external src/href (and no external url(), no <link>, no <iframe>, one inline <script>)
//   - 0 fetch / XMLHttpRequest / import() (nor WebSocket, EventSource, sendBeacon, importScripts)
//   - no eval / new Function / string timers
//   - dist/demo.html and gas/demo.html are identical
// Exits with a non-zero status on the first run that has a failing assertion.
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const html = await readFile(resolve(root, "dist/demo.html"), "utf8");
const gas = await readFile(resolve(root, "gas/demo.html"), "utf8");

const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
const stylesheets = [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)];
const js = scripts.map((match) => match[2]!).join("\n");
const css = stylesheets.map((match) => match[1]!).join("\n");
// Markup = the document without the inline script and style bodies.
const markup = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "<script></script>").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "<style></style>");

const count = (source: string, pattern: RegExp) => (source.match(pattern) ?? []).length;
const results: { name: string; found: number; allowed: number }[] = [];
const expectNone = (name: string, found: number) => results.push({ name, found, allowed: 0 });

// 1. No external resource. Any src/href attribute in the markup is refused, as is
//    any src/href assigned from script to an absolute or protocol-relative URL.
expectNone("src= attributes in markup", count(markup, /\ssrc\s*=/gi));
expectNone("href= attributes in markup", count(markup, /\shref\s*=/gi));
expectNone("<link> elements", count(markup, /<link\b/gi));
expectNone("<iframe>/<object>/<embed> elements", count(markup, /<(iframe|object|embed)\b/gi));
expectNone("<script src> elements", scripts.filter((match) => /\ssrc\s*=/i.test(match[1]!)).length);
expectNone("external url() in CSS", count(css, /url\(\s*["']?(?!data:|#)/gi));
expectNone("@import in CSS", count(css, /@import\b/gi));
expectNone("src/href set to a remote URL in script", count(js, /\b(src|href)\s*[:=]\s*["'`](https?:)?\/\//gi));
expectNone("external src/href inside script-built markup", count(js, /\s(src|href)=\\?["'](https?:)?\/\//gi));

// 2. No network API.
expectNone("fetch(", count(js, /\bfetch\s*\(/g));
expectNone("XMLHttpRequest", count(js, /\bXMLHttpRequest\b/g));
expectNone("dynamic import()", count(js, /\bimport\s*\(/g));
expectNone("WebSocket / EventSource", count(js, /\b(WebSocket|EventSource)\b/g));
expectNone("sendBeacon", count(js, /\bsendBeacon\b/g));
expectNone("importScripts / new Worker", count(js, /\bimportScripts\b|new\s+(Shared)?Worker\b/g));

// 3. No runtime code generation.
expectNone("eval(", count(js, /\beval\s*\(/g));
expectNone("new Function", count(js, /\bnew\s+Function\b|\bFunction\s*\(\s*["'`]/g));
expectNone("string timers", count(js, /\bset(Timeout|Interval)\s*\(\s*["'`]/g));

// 4. Shape of the page.
results.push({ name: "inline <script> elements other than exactly one", found: Math.abs(scripts.length - 1), allowed: 0 });
expectNone("dist/demo.html differs from gas/demo.html", html === gas ? 0 : 1);
expectNone("missing <base target=\"_top\">", /<base target="_top">/.test(markup) ? 0 : 1);
expectNone("missing inlined font (data: woff2)", /url\(data:font\/woff2;base64,/.test(css) ? 0 : 1);

let failed = 0;
for (const { name, found, allowed } of results) {
  const ok = found <= allowed;
  if (!ok) failed += 1;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}: ${found}`);
}
console.log(`\n${results.length - failed}/${results.length} assertions passed`);
if (failed > 0) process.exit(1);
