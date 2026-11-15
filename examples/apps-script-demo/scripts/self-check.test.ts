// Negative witnesses for the self-check: each fixture plants ONE violation in a
// page that otherwise passes, and the named assertion must fail. A rule with no
// failing fixture has not been shown to detect anything.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { noticesComment } from "./notices.js";
import { verifyDemoHtml } from "./verify-html.js";

const NOTICES = [
  "# Third-party notices",
  "Copyright 2016 The Inter Project Authors (https://github.com/rsms/inter)",
  "SIL OPEN FONT LICENSE Version 1.1 - 26 February 2007",
  "MIT: Permission is hereby granted, free of charge, to any person obtaining a copy",
  "ISC: Permission to use, copy, modify, and/or distribute this software for any purpose",
  "",
].join("\n");
const STYLE = "@font-face{font-family:Inter;src:url(data:font/woff2;base64,AAAA) format(\"woff2\")}body{margin:0}";
const SCRIPT = "var ns=`http://www.w3.org/2000/svg`;var doc=`https://svelte.dev/e/effect_orphan`;var t=`<svg><use href=\"#a\"></use><path marker-end=\"url(#m)\"></path></svg>`;document.getElementById(`app`).textContent=`ok`;";
const page = ({ script = SCRIPT, style = STYLE, head = "", body = "", notices = NOTICES } = {}) =>
  `<!doctype html>\n${noticesComment(notices)}<html lang="en">\n<head>\n<meta charset="utf-8">\n<base target="_top">\n${head}<style>\n${style}\n</style>\n</head>\n<body>\n<div id="app"></div>\n${body}<script>\n${script}\n</script>\n</body>\n</html>\n`;

const failing = (html: string, gasHtml = html, notices = NOTICES) =>
  verifyDemoHtml({ html, gasHtml, notices }).filter((check) => check.found > 0).map((check) => check.name);

test("the reference fixture passes every assertion", () => {
  assert.deepEqual(failing(page()), []);
});

test("the committed gas/demo.html passes every assertion", () => {
  const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");
  const html = read("../gas/demo.html");
  assert.ok(html.length > 100_000, "gas/demo.html is unexpectedly small");
  assert.deepEqual(failing(html, html, read("../gas/THIRD-PARTY-NOTICES.md")), []);
});

const js = (code: string) => page({ script: `${SCRIPT}${code}` });
const cases: [what: string, html: string, expected: string][] = [
  ["remote https:// string in the script", js("var u=`https://example.org/collect`;"), "absolute URL outside the allowlist"],
  ["remote wss:// string in the script", js("var u='wss://example.org/socket';"), "absolute URL outside the allowlist"],
  ["URL that only starts like an allowed one", js("var u=`https://svelte.dev/e/x?to=//example.org`;"), "absolute URL outside the allowlist"],
  ["remote URL in a second HTML comment", page({ body: "<!-- https://example.org -->\n" }), "HTML comments other than the notices block"],
  ["protocol-relative URL", js("var u=\"//example.org/a.js\";"), "protocol-relative URL"],
  ["external url() in an inline style built by the script", js("el.style.cssText=`background:url(img/a.png)`;"), "external url() in styles or script"],
  ["external url() in the stylesheet", page({ style: `${STYLE}body{background:url("a.png")}` }), "external url() in styles or script"],
  ["@import in the stylesheet", page({ style: `@import "a.css";${STYLE}` }), "@import"],
  ["<link> in a script template", js("var t2=`<link rel=\"stylesheet\">`;"), "<link>/<iframe>/<object>/<embed>/<frame>/<portal>/<form> elements"],
  ["<iframe srcdoc> in a script template", js("var t2=`<iframe srcdoc=\"x\"></iframe>`;"), "<link>/<iframe>/<object>/<embed>/<frame>/<portal>/<form> elements"],
  ["relative src in a script template", js("var t2=`<img src=\"a.png\">`;"), "resource attribute with a value other than a #fragment (src, href, srcset…)"],
  ["srcset in a script template", js("var t2=`<img srcset=\"a.png 2x\">`;"), "resource attribute with a value other than a #fragment (src, href, srcset…)"],
  ["setAttribute(\"src\", …)", js("el.setAttribute(\"src\",u);"), "resource attribute set from script"],
  ["el.src = …", js("el.src=u;"), "resource property assigned from script"],
  ["compiled Svelte attribute: Z(e,`src`,value)", js("Z(q,`src`,`img/a.png`);"), "resource attribute name passed to a helper call (compiled Svelte attribute)"],
  ["compiled Svelte attribute, unminified: $.set_attribute(a, \"href\", u)", js("$.set_attribute(a, \"href\", u);"), "resource attribute name passed to a helper call (compiled Svelte attribute)"],
  ["Object.assign(img,{src:u})", js("Object.assign(img,{src:u});"), "resource attribute name used as an object key (spread attributes, Object.assign)"],
  ["spread attributes: attribute_effect(img,()=>({alt:``,\"srcset\":u}))", js("Bi(img,()=>({alt:``,\"srcset\":u}));"), "resource attribute name used as an object key (spread attributes, Object.assign)"],
  ["src attribute in the static markup", page({ body: "<img src=\"a.png\">\n" }), "src/href attributes in the static markup"],
  ["<meta http-equiv=refresh>", page({ head: "<meta http-equiv=\"refresh\" content=\"0\">\n" }), "<meta http-equiv>"],
  ["second <script src>", page({ body: "<script src=\"a.js\"></script>\n" }), "<script src> element"],
  ["second inline script", page({ body: "<script>var x=1</script>\n" }), "not exactly one inline <script>"],
  ["fetch(", js("fetch(u);"), "fetch("],
  ["XMLHttpRequest", js("new XMLHttpRequest();"), "XMLHttpRequest"],
  ["dynamic import()", js("import(u);"), "dynamic import()"],
  ["WebSocket", js("new WebSocket(u);"), "WebSocket / EventSource / WebTransport / RTCPeerConnection"],
  ["sendBeacon", js("navigator.sendBeacon(u);"), "sendBeacon"],
  ["new Worker", js("new Worker(u);"), "importScripts / worker / service worker"],
  ["window.open", js("window.open(u);"), "window.open / location change"],
  ["location.assign", js("location.assign(u);"), "window.open / location change"],
  ["eval(", js("eval(code);"), "eval("],
  ["new Function", js("new Function(code)();"), "new Function"],
  ["string timer", js("setTimeout(\"go()\",1);"), "string timers"],
  ["localStorage", js("localStorage.setItem(`k`,`v`);"), "web storage / IndexedDB / cookies"],
  ["sessionStorage", js("sessionStorage.getItem(`k`);"), "web storage / IndexedDB / cookies"],
  ["indexedDB", js("indexedDB.open(`db`);"), "web storage / IndexedDB / cookies"],
  ["document.cookie", js("document.cookie=`a=1`;"), "web storage / IndexedDB / cookies"],
  ["no <base target=_top>", page().replace("<base target=\"_top\">\n", ""), "missing <base target=\"_top\">"],
  ["no inlined font", page({ style: "body{margin:0}" }), "missing inlined font (data: woff2)"],
];
for (const [what, html, expected] of cases) {
  test(`fails on: ${what}`, () => {
    const names = failing(html);
    assert.ok(names.includes(expected), `expected "${expected}" to fail, got: ${JSON.stringify(names)}`);
  });
}

test("the compiled-attribute rules are the only ones that see the Svelte helper forms", () => {
  // Witness that the gap was real: without the two rules these plants pass.
  const others = (html: string) => failing(html).filter((name) => !/helper call|object key/.test(name));
  assert.deepEqual(others(js("Z(q,`src`,`img/a.png`);")), []);
  assert.deepEqual(others(js("Object.assign(img,{src:u});")), []);
});

test("fails when the built page differs from the committed copy", () => {
  assert.ok(failing(page(), page({ script: `${SCRIPT}var stale=1;` })).includes("built page differs from the committed gas/demo.html"));
});

test("fails when the notices comment is absent, altered, or not the committed notices", () => {
  const name = "third-party notices comment missing or different from THIRD-PARTY-NOTICES.md";
  assert.ok(failing(page().replace(noticesComment(NOTICES), "")).includes(name), "absent");
  assert.ok(failing(page().replace("Inter Project Authors", "Someone Else")).includes(name), "altered");
  assert.ok(failing(page(), page(), `${NOTICES}extra\n`).includes(name), "different file");
  assert.ok(failing(page(), page(), "").includes(name), "empty file");
});

test("fails when a licence family is missing from the notices", () => {
  const without = (marker: RegExp) => {
    const notices = NOTICES.split("\n").filter((line) => !marker.test(line)).join("\n");
    return failing(page({ notices }), page({ notices }), notices);
  };
  assert.ok(without(/SIL OPEN FONT/).includes("notices lack the SIL Open Font License 1.1 text"));
  assert.ok(without(/Inter Project Authors/).includes("notices lack the SIL Open Font License 1.1 text"));
  assert.ok(without(/^MIT/).includes("notices lack an MIT permission notice"));
  assert.ok(without(/^ISC/).includes("notices lack the ISC permission notice"));
});
