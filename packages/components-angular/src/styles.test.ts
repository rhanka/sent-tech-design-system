import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Angular styles", () => {
  it("matches the React package byte-for-byte", () => {
    const angular = readFileSync(resolve("src/styles.css"), "utf8");
    const react = readFileSync(resolve("../components-react/src/styles.css"), "utf8");

    expect(angular).toBe(react);
  });

  it("does not introduce raw hex colors after the GeoMap block starts", () => {
    const styles = readFileSync(resolve("src/styles.css"), "utf8");
    const geoMapStart = styles.indexOf(".st-geoMap {");

    expect(geoMapStart).toBeGreaterThanOrEqual(0);
    expect(styles.slice(geoMapStart)).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
  });
});
