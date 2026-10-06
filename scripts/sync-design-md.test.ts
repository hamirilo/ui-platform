import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { oklchToHex, readColorTokens, renderDesignMd } from "./sync-design-md";

/**
 * 期待値は Chromium の canvas（`ctx.fillStyle = 'oklch(...)'` → `getImageData`）で
 * 実測したもの。ブラウザが実際に塗る sRGB と一致することを固定する。
 * tokens/tokens.css の全 Token 分は scripts/fixtures/oklch-srgb.json にある。
 */
const FIXTURE: Record<string, string> = JSON.parse(
  readFileSync("scripts/fixtures/oklch-srgb.json", "utf8"),
);

const CSS = readFileSync("tokens/tokens.css", "utf8");

describe("oklchToHex", () => {
  it("ブラウザが塗る sRGB と一致する（tokens.css の全 Token、チャンネルあたり ±1 まで）", () => {
    /* ±1 を許すのは丸めの境目だけのため。Chromium は canvas の合成を float32 で行うので、
     * 122.4993 のような値が 123 になることがある（こちらは double で 122）。
     * 目に見えない差で、どちらが「正しい」とも言えないので、系統的なズレだけを捕まえる。 */
    const channels = (hex: string) =>
      [1, 3, 5].map((i) => Number.parseInt(hex.slice(i, i + 2), 16));

    const mismatched: string[] = [];
    for (const { name, hex } of readColorTokens(CSS)) {
      const want = FIXTURE[name];
      expect(want, `${name} が fixture に無い`).toBeDefined();
      const diff = channels(hex).map((v, i) => Math.abs(v - channels(want)[i]));
      if (Math.max(...diff) > 1) mismatched.push(`${name}: ${hex} != ${want}`);
    }
    expect(mismatched).toEqual([]);
  });

  it("sRGB 域外は clamp する", () => {
    expect(oklchToHex(0.5, 0.4, 150)).toMatch(/^#[0-9a-f]{6}$/);
  });

  it("白と黒", () => {
    expect(oklchToHex(1, 0, 0)).toBe("#ffffff");
    expect(oklchToHex(0, 0, 0)).toBe("#000000");
  });
});

describe("readColorTokens", () => {
  it("shadcn/ui 互換の別名（destructive）は出さない", () => {
    const names = readColorTokens(CSS).map((c) => c.name);
    expect(names).not.toContain("destructive");
    expect(names).not.toContain("destructive-foreground");
  });

  it("@theme の順序を保つ", () => {
    const names = readColorTokens(CSS).map((c) => c.name);
    expect(names[0]).toBe("background");
    expect(names).toContain("nav-blue");
  });

  it("oklch 以外の --color-* があれば気づける", () => {
    expect(() => readColorTokens("@theme {\n  --color-x: #ff0000;\n}\n")).toThrow(/oklch 以外/);
  });
});

describe("renderDesignMd", () => {
  it("colors ブロックだけを差し替え、後続のキーを壊さない", () => {
    const md =
      'version: alpha\ncolors:\n  old: "#000000"\ntypography:\n  h1:\n    fontSize: 36px\n';
    const out = renderDesignMd(md, [{ name: "primary", hex: "#2b7fff" }]);
    expect(out).toBe(
      'version: alpha\ncolors:\n  primary: "#2b7fff"\ntypography:\n  h1:\n    fontSize: 36px\n',
    );
  });

  it("colors ブロックが無ければ失敗する", () => {
    expect(() => renderDesignMd("version: alpha\n", [])).toThrow(/colors:/);
  });
});
