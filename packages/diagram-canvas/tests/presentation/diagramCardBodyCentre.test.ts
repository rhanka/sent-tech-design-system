import { describe, expect, it } from "vitest";
import {
  CARD_GEOMETRY,
  cardFullText,
  defaultCardMeasure,
  layoutCard,
  lineBoxHeight,
} from "../../src/presentation/diagramCardModel.js";

const BODY_H = lineBoxHeight(CARD_GEOMETRY.body.size); // 31.1875

/**
 * Owner card-body-centring: on every diagram card the body text
 * (description) is centred horizontally AND vertically in the area that
 * remains under the title. The card box stays frozen at 460 × 200 —
 * multi-line wrap and measured ellipsis are preserved and the accessible
 * text still carries the complete description.
 */
describe("diagram card body centring (owner card-body-centring)", () => {
  it("should keep the frozen 460x200 box while centring the body", () => {
    const layout = layoutCard(
      { entityId: "entity:llm-gateway", title: "llm-gateway", body: ["Achemine les demandes de modèles"] },
      defaultCardMeasure,
    );
    expect(layout.box).toEqual({ width: 460, height: 200 });
    expect(layout.diagnostics).toEqual([]);
  });

  it("should centre a single body line horizontally and vertically (llm-gateway)", () => {
    const layout = layoutCard(
      { entityId: "entity:llm-gateway", title: "llm-gateway", body: ["Achemine les demandes de modèles"] },
      defaultCardMeasure,
    );
    expect(layout.body).toHaveLength(1);
    const [line] = layout.body;
    // Horizontal: middle-anchored at the body-box centre (14 + 436 / 2).
    expect(line?.anchor).toBe("middle");
    expect(line?.x).toBe(232);
    expect(layout.bodyX + layout.bodyWidth / 2).toBe(232);
    // Vertical: the line box is centred in the remaining body area —
    // no footer, so the area runs from the header gap to the bottom inset.
    expect(layout.bodyArea).toEqual({ top: 86, bottom: 190 });
    const spare = layout.bodyArea.bottom - layout.bodyArea.top - BODY_H;
    expect(line?.baseline).toBe(layout.bodyArea.top + spare / 2 + 22);
    // Symmetric gutters above and below the centred line box.
    const boxTop = (line?.baseline ?? 0) - 22;
    expect(boxTop - layout.bodyArea.top).toBe(layout.bodyArea.bottom - (boxTop + BODY_H));
  });

  it("should keep top-aligned baselines when two lines fill the body box", () => {
    const layout = layoutCard(
      {
        entityId: "entity:contract",
        kicker: "KICKER",
        title: "Title",
        body: ["Body", "Detail"],
        detailCount: 1,
        footer: "Footer",
      },
      defaultCardMeasure,
    );
    // Two 31.1875 px lines fill the 62.375 px area: no spare space, the
    // centred block coincides with the top-aligned one.
    expect(layout.bodyArea).toEqual({ top: 86.1875, bottom: 148.5625 });
    expect(layout.body.map((line) => line.baseline)).toEqual([108.1875, 139.375]);
    for (const line of layout.body) {
      expect(line.anchor).toBe("middle");
      expect(line.x).toBe(232);
    }
    expect(layout.body[1]?.secondary).toBe(true);
  });

  it("should preserve multi-line wrap and the measured ellipsis", () => {
    const wrapped = layoutCard(
      {
        entityId: "entity:wrap",
        title: "Title",
        body: ["Organisation humains-agents coordonne les demandes de modèles pour chaque occurrence"],
      },
      defaultCardMeasure,
    );
    expect(wrapped.body.length).toBeGreaterThan(1);
    expect(wrapped.diagnostics).toEqual([]);
    for (const line of wrapped.body) {
      expect(line.anchor).toBe("middle");
      expect(line.x).toBe(232);
    }

    const long = layoutCard(
      { entityId: "entity:long", title: "Title", body: ["W".repeat(500)] },
      defaultCardMeasure,
    );
    const overflow = long.diagnostics.filter((d) => d.code === "card-overflow" && d.slot === "body");
    expect(overflow).toHaveLength(1);
    expect(long.body.at(-1)?.text).toMatch(/…$/u);
    expect(overflow[0]?.hiddenLength).toBeGreaterThan(0);
    expect(overflow[0]?.text).toBe("W".repeat(500));
  });

  it("should retain the complete description in the accessible text", () => {
    const body = ["Achemine les demandes de modèles"];
    const props = { entityId: "entity:llm-gateway", title: "llm-gateway", body };
    expect(cardFullText(props)).toBe("llm-gateway\nAchemine les demandes de modèles");
    const layout = layoutCard(props, defaultCardMeasure);
    expect(layout.diagnostics).toEqual([]);
  });
});
