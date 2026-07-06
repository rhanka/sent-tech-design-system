import assert from "node:assert/strict";
import test from "node:test";
import { PNG } from "pngjs";
import { detectRoundedBorderSeams } from "./detect-rounded-border-seams.mjs";

function roundedSeamFixture() {
  const png = new PNG({ width: 140, height: 80 });
  // White background.
  for (let y = 0; y < png.height; y += 1) {
    for (let x = 0; x < png.width; x += 1) {
      const i = (png.width * y + x) << 2;
      png.data[i] = 255;
      png.data[i + 1] = 255;
      png.data[i + 2] = 255;
      png.data[i + 3] = 255;
    }
  }
  // A grey rounded card surface.
  const left = 24;
  const top = 16;
  const width = 92;
  const height = 48;
  const radius = 12;
  for (let y = top; y < top + height; y += 1) {
    for (let x = left; x < left + width; x += 1) {
      const cx = x < left + radius ? left + radius : x >= left + width - radius ? left + width - radius - 1 : x;
      const cy = y < top + radius ? top + radius : y >= top + height - radius ? top + height - radius - 1 : y;
      if ((x - cx) ** 2 + (y - cy) ** 2 <= radius ** 2) {
        const i = (png.width * y + x) << 2;
        png.data[i] = 244;
        png.data[i + 1] = 247;
        png.data[i + 2] = 251;
      }
    }
  }
  // Forbidden pattern: a one-sided blue seam that follows the rounded host edge.
  for (let y = top + radius; y < top + height - radius; y += 1) {
    for (let x = left; x < left + 4; x += 1) {
      const i = (png.width * y + x) << 2;
      png.data[i] = 29;
      png.data[i + 1] = 78;
      png.data[i + 2] = 216;
    }
  }
  for (let a = Math.PI; a <= Math.PI * 1.5; a += 0.04) {
    for (let t = -1; t < 5; t += 1) {
      const x = Math.round(left + radius + Math.cos(a) * (radius - t));
      const y = Math.round(top + radius + Math.sin(a) * (radius - t));
      const i = (png.width * y + x) << 2;
      png.data[i] = 29;
      png.data[i + 1] = 78;
      png.data[i + 2] = 216;
    }
  }
  return png;
}

test("visual seam detector is calibrated on a rounded one-sided seam fixture", () => {
  const result = detectRoundedBorderSeams(roundedSeamFixture(), { minComponentPixels: 2 });
  assert.ok(result.findings.length >= 1, `expected at least one rounded seam finding, got ${JSON.stringify(result)}`);
});
