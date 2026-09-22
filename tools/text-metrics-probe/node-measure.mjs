import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import { readFileSync } from 'node:fs';
const FONT_PATH = new URL('./DejaVuSans.ttf', import.meta.url).pathname;
GlobalFonts.registerFromPath(FONT_PATH, 'SondeDS');
const strings = JSON.parse(readFileSync(new URL('./strings.json', import.meta.url), 'utf8'));
const ctx = createCanvas(10, 10).getContext('2d');
const out = {};
for (const size of [12, 14, 18]) {
  ctx.font = `${size}px SondeDS`;
  out[size] = Object.fromEntries(strings.map((s) => [s, +ctx.measureText(s).width.toFixed(3)]));
}
console.log(JSON.stringify({ moteur: 'napi-rs/canvas', mesures: out }));
