// Assertions on the built page, as a pure function so that they can be tested
// against fixtures that MUST fail (scripts/self-check.test.ts).
//
// Almost all of the page DOM is created from inside the single <script>
// (compiled Svelte templates), so every rule below scans the WHOLE document —
// markup, styles and script — never the static markup alone. The only part that
// is set aside is the leading third-party notices comment, which is compared
// byte-for-byte with THIRD-PARTY-NOTICES.md instead (licence texts name URLs).
import { noticesComment } from "./notices.js";

export interface Check {
  name: string;
  /** Number of violations; the check passes when it is 0. */
  found: number;
  /** First offending excerpts, for the report. */
  samples: string[];
}

// Absolute URLs that are inert compile-time constants: XML namespaces, the
// identifier of a JSON Schema dialect, and the documentation URL that Svelte
// puts in its error messages. Nothing else may appear, anywhere.
const ALLOWED_URLS: RegExp[] = [
  /^http:\/\/www\.w3\.org\/1999\/xhtml$/,
  /^http:\/\/www\.w3\.org\/2000\/svg$/,
  /^http:\/\/www\.w3\.org\/1998\/Math\/MathML$/,
  /^http:\/\/www\.w3\.org\/1999\/xlink$/,
  /^https:\/\/json-schema\.org\/draft\/2020-12\/schema$/,
  /^https:\/\/svelte\.dev\/e\/[a-z0-9_]+$/,
];

export interface VerifyInput {
  /** The freshly built page (dist/demo.html). */
  html: string;
  /** The committed copy served by Apps Script (gas/demo.html). */
  gasHtml: string;
  /** The committed notices file (gas/THIRD-PARTY-NOTICES.md). */
  notices: string;
}

export function verifyDemoHtml({ html, gasHtml, notices }: VerifyInput): Check[] {
  const checks: Check[] = [];
  const flag = (name: string, failed: boolean) => checks.push({ name, found: failed ? 1 : 0, samples: [] });
  const none = (name: string, source: string, pattern: RegExp, keep: (match: RegExpMatchArray) => boolean = () => true) => {
    const matches = [...source.matchAll(pattern)].filter(keep);
    checks.push({ name, found: matches.length, samples: matches.slice(0, 3).map((match) => source.slice(Math.max(0, match.index - 30), match.index + match[0].length + 30).replace(/\s+/g, " ")) });
  };

  // 0. Notices: the page starts with the doctype, then the exact notices comment.
  const expectedHead = `<!doctype html>\n${noticesComment(notices)}`;
  const hasNotices = notices.length > 0 && html.startsWith(expectedHead);
  flag("third-party notices comment missing or different from THIRD-PARTY-NOTICES.md", !hasNotices);
  flag("notices lack the SIL Open Font License 1.1 text", !/SIL OPEN FONT LICENSE Version 1\.1/.test(notices) || !/Copyright 2016 The Inter Project Authors/.test(notices));
  flag("notices lack an MIT permission notice", !/Permission is hereby granted, free of charge/.test(notices));
  flag("notices lack the ISC permission notice", !/Permission to use, copy, modify, and\/or distribute this software/.test(notices));
  // Everything below scans the document without that one comment.
  const doc = hasNotices ? `<!doctype html>\n${html.slice(expectedHead.length)}` : html;
  none("HTML comments other than the notices block", doc, /<!--/g);

  const scripts = [...doc.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
  const js = scripts.map((match) => match[2]!).join("\n");
  const markup = doc.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "<script></script>").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "<style></style>");

  // 1. No external resource, wherever it is written.
  none("absolute URL outside the allowlist", doc, /\b(?:https?|wss?|ftp|file|blob|filesystem):\/\/[^\s"'`<>)\\]*/gi, (match) => !ALLOWED_URLS.some((allowed) => allowed.test(match[0])));
  none("protocol-relative URL", doc, /(?:^|["'`\s=(,])\/\/[a-z0-9]/gim);
  none("resource attribute with a value other than a #fragment (src, href, srcset…)", doc, /(?:^|[\s"'`])(?:src|href|srcset|srcdoc|poster|formaction|ping|xlink:href)\s*=\s*(?!\\?["'`]?#)/gi);
  none("resource attribute set from script", doc, /setAttribute(?:NS)?\(\s*(?:null\s*,\s*)?["'`](?:src|href|srcset|srcdoc|poster|action|formaction|ping|xlink:href)["'`]/gi);
  none("resource property assigned from script", js, /\.(?:src|href|srcset|srcdoc|action|formAction|poster)\s*=(?!=)/g);
  none("<link>/<iframe>/<object>/<embed>/<frame>/<portal>/<form> elements", doc, /<(?:link|iframe|object|embed|frame|frameset|portal|form)\b/gi);
  none("<meta http-equiv>", doc, /http-equiv/gi);
  none("src/href attributes in the static markup", markup, /\s(?:src|href)\s*=/gi);
  none("external url() in styles or script", doc, /url\(\s*\\?["'`]?(?!data:|#)/gi);
  none("@import", doc, /@import\b/gi);
  flag("<script src> element", scripts.some((match) => /\ssrc\s*=/i.test(match[1]!)));

  // 2. No network API, no navigation away.
  none("fetch(", js, /\bfetch\s*\(/g);
  none("XMLHttpRequest", js, /\bXMLHttpRequest\b/g);
  none("dynamic import()", js, /\bimport\s*\(/g);
  none("WebSocket / EventSource / WebTransport / RTCPeerConnection", js, /\b(?:WebSocket|EventSource|WebTransport|RTCPeerConnection)\b/g);
  none("sendBeacon", js, /\bsendBeacon\b/g);
  none("importScripts / worker / service worker", js, /\bimportScripts\b|\bnew\s+(?:Shared)?Worker\b|\bserviceWorker\b/g);
  none("window.open / location change", js, /\bwindow\.open\s*\(|\blocation\s*\.\s*(?:assign|replace|reload)\s*\(|\blocation(?:\.href)?\s*=(?!=)/g);

  // 3. No runtime code generation.
  none("eval(", js, /\beval\s*\(/g);
  none("new Function", js, /\bnew\s+Function\b|\bFunction\s*\(\s*["'`]/g);
  none("string timers", js, /\bset(?:Timeout|Interval)\s*\(\s*["'`]/g);

  // 4. No storage: the page keeps its state in memory only.
  none("web storage / IndexedDB / cookies", js, /\b(?:localStorage|sessionStorage|indexedDB|openDatabase|cookieStore)\b|\bdocument\.cookie\b|\.cookie\s*=(?!=)/g);

  // 5. Shape of the page.
  flag("not exactly one inline <script>", scripts.length !== 1);
  flag('missing <base target="_top">', !/<base target="_top">/.test(markup));
  flag("missing inlined font (data: woff2)", !/url\(data:font\/woff2;base64,/.test(doc));
  flag("built page differs from the committed gas/demo.html", html !== gasHtml);
  return checks;
}
