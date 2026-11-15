// Contrast of the success tag, computed from the published theme tokens (no
// browser): the override in src/page.css must reach WCAG AA for text (4.5:1) in
// both colour modes. The pairing drawn by the pinned component is measured too,
// as a witness that the override is what makes the difference.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { themeDeclarations } from "./theme.js";

type Rgb = [number, number, number];
const encode = (linear: number) => (linear <= 0.0031308 ? 12.92 * linear : 1.055 * linear ** (1 / 2.4) - 0.055);
const decode = (value: number) => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
const clamp = (value: number) => Math.min(1, Math.max(0, value));

/** Gamma-encoded sRGB components (0..1) of a hex or oklch() colour. */
function parse(value: string): Rgb {
  const hex = /^#([0-9a-f]{6})$/i.exec(value.trim());
  if (hex) return [0, 2, 4].map((at) => parseInt(hex[1]!.slice(at, at + 2), 16) / 255) as Rgb;
  const oklch = /^oklch\(\s*([\d.]+)%\s+([\d.]+)\s+([\d.]+)\s*\)$/i.exec(value.trim());
  if (!oklch) throw new Error(`Unsupported colour syntax: ${value}`);
  const [L, C, h] = [Number(oklch[1]) / 100, Number(oklch[2]), (Number(oklch[3]) * Math.PI) / 180];
  const [a, b] = [C * Math.cos(h), C * Math.sin(h)];
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].map((linear) => clamp(encode(clamp(linear)))) as Rgb;
}
/** color-mix(in srgb, a p%, b). */
const mix = (a: Rgb, percent: number, b: Rgb): Rgb => a.map((value, i) => (value * percent + b[i]! * (100 - percent)) / 100) as Rgb;
const luminance = ([r, g, b]: Rgb) => 0.2126 * decode(r) + 0.7152 * decode(g) + 0.0722 * decode(b);
const contrast = (x: Rgb, y: Rgb) => {
  const [hi, lo] = [luminance(x), luminance(y)].sort((p, q) => q - p) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
};

const css = readFileSync(new URL("../src/page.css", import.meta.url), "utf8");
const rule = /\.st-tag--success\s*\{\s*background:\s*color-mix\(in srgb, var\((--[\w-]+)\) (\d+)%, var\((--[\w-]+)\)\);\s*color:\s*var\((--[\w-]+)\);\s*\}/.exec(css);
const { light, dark } = themeDeclarations();
const modes = { light, dark: new Map([...light, ...dark]) };
const WHITE: Rgb = [1, 1, 1];

test("the success tag override is written with semantic tokens only", () => {
  assert.ok(rule, "src/page.css: success tag override not found in the expected form");
  for (const name of [rule[1]!, rule[3]!, rule[4]!]) assert.match(name, /^--st-semantic-/);
});

for (const [mode, tokens] of Object.entries(modes)) {
  const token = (name: string) => {
    const value = tokens.get(name);
    assert.ok(value, `${mode}: token ${name} is not defined by the theme`);
    return parse(value);
  };
  test(`success tag label reaches 4.5:1 in ${mode} mode`, () => {
    assert.ok(rule);
    const background = mix(token(rule[1]!), Number(rule[2]), token(rule[3]!));
    const ratio = contrast(token(rule[4]!), background);
    console.log(`${mode}: override ${ratio.toFixed(2)}:1`);
    assert.ok(ratio >= 4.5, `${mode}: ${ratio.toFixed(2)}:1 is below 4.5:1`);
  });
  test(`witness: the pinned component pairing is below 4.5:1 in ${mode} mode`, () => {
    const success = token("--st-semantic-feedback-success");
    const ratio = contrast(success, mix(success, 14, WHITE));
    console.log(`${mode}: component 0.41.2 pairing ${ratio.toFixed(2)}:1; feedback-success on surface-raised ${contrast(success, token("--st-semantic-surface-raised")).toFixed(2)}:1`);
    assert.ok(ratio < 4.5, `${mode}: the upstream pairing now reaches ${ratio.toFixed(2)}:1 — the override can be removed`);
  });
}
