/**
 * DESIGN.md の `colors:` を tokens/tokens.css から生成する。
 *
 * DESIGN.md は Claude Design（design-sync）へ渡す設計参照で、色を hex で持つ。
 * 一方 Token 具体値の Single Source of Truth は tokens/tokens.css の `@theme` で、
 * そちらは oklch。**同じ値を 2 つの表現で手書きすると必ず分裂する**
 * （実際に `--color-primary` は Blue 500 だが DESIGN.md は Blue 600 の #2563eb を
 * 持っていた）。そこで hex 側を生成物にし、`just check` で差分を検出する。
 *
 *   bun run scripts/sync-design-md.ts          # DESIGN.md を書き換える
 *   bun run scripts/sync-design-md.ts --check  # 差分があれば exit 1（CI 用）
 *
 * <important>
 * 生成するのは `colors:` だけ。`typography` / `rounded` / `spacing` / `components` は
 * DESIGN.md 固有の名前（`body-lg`、`rounded.md` 等）を持っていて tokens.css から
 * 一意に導けないため、引き続き手で維持する。
 * </important>
 */

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

/**
 * DESIGN.md へ出さない Token。
 * `destructive` は shadcn/ui 互換のために `danger` と同値で置いてある別名なので、
 * 設計参照へ 2 つ目の赤として見せない。
 */
const EXCLUDED = new Set(["destructive", "destructive-foreground"]);

/**
 * oklch(L C H) → #rrggbb（sRGB 域外は clamp する）
 *
 * 変換経路はブラウザと同じ CSS Color 4 の定義にそろえる。
 *   OKLCh → OKLab → LMS → XYZ(D65) → linear sRGB → sRGB
 * Ottosson の LMS→sRGB 直結行列を使うと、丸めの境目で Chromium と 1/255 ずれる。
 * 期待値は scripts/fixtures/oklch-srgb.json（Chromium の canvas で実測）で固定してある。
 */
export function oklchToHex(l: number, c: number, hDeg: number): string {
  const h = (hDeg * Math.PI) / 180;
  const a = c * Math.cos(h);
  const b = c * Math.sin(h);

  // OKLab → LMS（立方根空間を戻す）
  const lms = [
    (l + 0.3963377773761749 * a + 0.2158037573099136 * b) ** 3,
    (l - 0.1055613458156586 * a - 0.0638541728258133 * b) ** 3,
    (l - 0.0894841775298119 * a - 1.291485548019409 * b) ** 3,
  ];

  // LMS → XYZ (D65)
  const xyz = [
    1.2268798758459243 * lms[0] - 0.5578149944602171 * lms[1] + 0.2813910456659647 * lms[2],
    -0.0405757452148008 * lms[0] + 1.112286803280317 * lms[1] - 0.0717110580655164 * lms[2],
    -0.0763729366746601 * lms[0] - 0.4214933324022432 * lms[1] + 1.5869240198367816 * lms[2],
  ];

  // XYZ (D65) → linear sRGB
  const lin = [
    3.2409699419045226 * xyz[0] - 1.537383177570094 * xyz[1] - 0.4986107602930034 * xyz[2],
    -0.9692436362808796 * xyz[0] + 1.8759675015077204 * xyz[1] + 0.0415550574071756 * xyz[2],
    0.0556300796969936 * xyz[0] - 0.2039769588889765 * xyz[1] + 1.0569715142428784 * xyz[2],
  ];

  const channel = (v: number) => {
    const sign = v < 0 ? -1 : 1;
    const abs = Math.abs(v);
    const srgb = abs <= 0.0031308 ? 12.92 * v : sign * (1.055 * abs ** (1 / 2.4) - 0.055);
    const byte = Math.round(Math.min(1, Math.max(0, srgb)) * 255);
    return byte.toString(16).padStart(2, "0");
  };

  return `#${lin.map(channel).join("")}`;
}

/** tokens.css の最初の `@theme { ... }` から `--color-*: oklch(...)` を順番どおり読む */
export function readColorTokens(css: string): { name: string; hex: string }[] {
  const start = css.indexOf("@theme {");
  if (start === -1) throw new Error("tokens.css に @theme ブロックが無い");
  const end = css.indexOf("\n}", start);
  if (end === -1) throw new Error("@theme ブロックが閉じていない");
  const block = css.slice(start, end);

  const out: { name: string; hex: string }[] = [];
  const re = /^\s*--color-([a-z0-9-]+):\s*oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)/gm;
  for (const m of block.matchAll(re)) {
    const name = m[1];
    if (EXCLUDED.has(name)) continue;
    out.push({ name, hex: oklchToHex(Number(m[2]), Number(m[3]), Number(m[4])) });
  }

  const nonOklch = block.match(/^\s*--color-[a-z0-9-]+:\s*(?!oklch)\S/gm);
  if (nonOklch) {
    throw new Error(
      `@theme に oklch 以外の --color-* がある。このスクリプトを拡張すること:\n${nonOklch.join("\n")}`,
    );
  }
  return out;
}

/** DESIGN.md の front matter の `colors:` ブロックを差し替える */
export function renderDesignMd(md: string, colors: { name: string; hex: string }[]): string {
  const body = colors.map((c) => `  ${c.name}: "${c.hex}"`).join("\n");
  // `colors:` の次の行から、次のトップレベルキー（行頭が空白でない）直前まで
  const re = /^colors:\n(?:[ \t].*\n)*/m;
  if (!re.test(md)) throw new Error("DESIGN.md に colors: ブロックが見つからない");
  return md.replace(re, `colors:\n${body}\n`);
}

// 直接起動されたときだけ走らせる（テストから関数を import できるようにするため）
if (import.meta.main) main();

function main(): void {
  // パス解決は CLI 実行時だけ。テストから関数を import するときは評価しない。
  const TOKENS_CSS = fileURLToPath(new URL("../tokens/tokens.css", import.meta.url));
  const DESIGN_MD = fileURLToPath(new URL("../DESIGN.md", import.meta.url));

  const check = process.argv.includes("--check");
  const current = readFileSync(DESIGN_MD, "utf8");
  const next = renderDesignMd(current, readColorTokens(readFileSync(TOKENS_CSS, "utf8")));

  if (current === next) {
    console.log("DESIGN.md の colors は tokens/tokens.css と一致しています。");
    process.exit(0);
  }

  if (!check) {
    writeFileSync(DESIGN_MD, next);
    console.log("DESIGN.md の colors を tokens/tokens.css から更新しました。");
    process.exit(0);
  }

  const before = new Map(
    [...current.matchAll(/^ {2}([a-z0-9-]+): "(#[0-9a-f]{6})"$/gm)].map((m) => [m[1], m[2]]),
  );
  const after = new Map(
    [...next.matchAll(/^ {2}([a-z0-9-]+): "(#[0-9a-f]{6})"$/gm)].map((m) => [m[1], m[2]]),
  );

  console.error("DESIGN.md の colors が tokens/tokens.css と一致しません。");
  console.error("`bun run sync:design` で更新してください。\n");
  for (const [name, hex] of after) {
    const old = before.get(name);
    if (old !== hex) console.error(`  ${name}: ${old ?? "(無し)"} -> ${hex}`);
  }
  for (const name of before.keys()) {
    if (!after.has(name)) console.error(`  ${name}: 削除（tokens.css に存在しない）`);
  }
  process.exit(1);
}
