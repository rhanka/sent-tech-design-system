#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { basename } from "node:path";
import { PNG } from "pngjs";

function luminance(r, g, b) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function saturation(r, g, b) {
  const mx = Math.max(r, g, b);
  const mn = Math.min(r, g, b);
  return mx === 0 ? 0 : (mx - mn) / mx;
}

function pixel(png, x, y) {
  const i = (png.width * y + x) << 2;
  return [png.data[i], png.data[i + 1], png.data[i + 2], png.data[i + 3]];
}

export function detectRoundedBorderSeams(png, options = {}) {
  const minComponentPixels = options.minComponentPixels ?? 8;
  const maxBox = options.maxBox ?? 96;
  const minContrast = options.minContrast ?? 22;
  const minSaturation = options.minSaturation ?? 0.18;
  const maxLuminance = options.maxLuminance ?? 230;
  const edge = new Set();

  for (let y = 1; y < png.height - 1; y += 1) {
    for (let x = 1; x < png.width - 1; x += 1) {
      const [r, g, b, a] = pixel(png, x, y);
      if (a < 128) continue;
      const [r1, g1, b1] = pixel(png, x + 1, y);
      const [r2, g2, b2] = pixel(png, x - 1, y);
      const [r3, g3, b3] = pixel(png, x, y + 1);
      const [r4, g4, b4] = pixel(png, x, y - 1);
      const gx = Math.abs(luminance(r1, g1, b1) - luminance(r2, g2, b2));
      const gy = Math.abs(luminance(r3, g3, b3) - luminance(r4, g4, b4));
      if (Math.max(gx, gy) > minContrast || (saturation(r, g, b) > minSaturation && luminance(r, g, b) < maxLuminance)) {
        edge.add(`${x},${y}`);
      }
    }
  }

  const arc = new Set();
  for (const key of edge) {
    const [x, y] = key.split(",").map(Number);
    let n = 0;
    let hv = 0;
    let diag = 0;
    for (let dx = -2; dx <= 2; dx += 1) {
      for (let dy = -2; dy <= 2; dy += 1) {
        if (edge.has(`${x + dx},${y + dy}`)) n += 1;
      }
      if (edge.has(`${x + dx},${y}`)) hv += 1;
      if (edge.has(`${x},${y + dx}`)) hv += 1;
      if (edge.has(`${x + dx},${y + dx}`)) diag += 1;
      if (edge.has(`${x + dx},${y - dx}`)) diag += 1;
    }
    if (n >= 2 && n <= 13 && hv >= 2 && diag >= 2) arc.add(key);
  }

  const findings = [];
  const pending = new Set(arc);
  for (const first of arc) {
    if (!pending.has(first)) continue;
    pending.delete(first);
    const stack = [first];
    const comp = [];
    while (stack.length > 0) {
      const key = stack.pop();
      const [x, y] = key.split(",").map(Number);
      comp.push([x, y]);
      for (let dx = -1; dx <= 1; dx += 1) {
        for (let dy = -1; dy <= 1; dy += 1) {
          if (dx === 0 && dy === 0) continue;
          const nk = `${x + dx},${y + dy}`;
          if (pending.has(nk)) {
            pending.delete(nk);
            stack.push(nk);
          }
        }
      }
    }
    if (comp.length < minComponentPixels) continue;
    const xs = comp.map(([x]) => x);
    const ys = comp.map(([, y]) => y);
    const box = [Math.min(...xs), Math.min(...ys), Math.max(...xs) + 1, Math.max(...ys) + 1];
    const width = box[2] - box[0];
    const height = box[3] - box[1];
    if (width >= 3 && height >= 3 && width <= maxBox && height <= maxBox) {
      findings.push({ pixels: comp.length, box });
    }
  }

  return { edgeCandidates: edge.size, arcCandidates: arc.size, findings };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const file = process.argv[2];
  if (!file) {
    console.error(`usage: ${basename(process.argv[1])} <screenshot.png> [--expect-findings]`);
    process.exit(2);
  }
  const png = PNG.sync.read(readFileSync(file));
  const result = { file, size: [png.width, png.height], ...detectRoundedBorderSeams(png) };
  console.log(JSON.stringify(result, null, 2));
  if (process.argv.includes("--expect-findings") && result.findings.length === 0) process.exit(1);
  if (process.argv.includes("--expect-clean") && result.findings.length > 0) process.exit(1);
}
