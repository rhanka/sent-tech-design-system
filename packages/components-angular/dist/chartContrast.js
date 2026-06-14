const LIGHT_TEXT = "oklch(98% 0.005 255)";
const DARK_TEXT = "oklch(18% 0.025 255)";
const LIGHT_TEXT_TONES = new Set(["category1"]);
export function contrastTextForTone(tone) {
    return tone && LIGHT_TEXT_TONES.has(tone) ? LIGHT_TEXT : DARK_TEXT;
}
//# sourceMappingURL=chartContrast.js.map