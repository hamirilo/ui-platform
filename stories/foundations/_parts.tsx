/**
 * Foundations の MDX から使う表示部品。
 *
 * ここは「仕様書の描画」専用。アプリから import してはいけない
 * （アプリ用の共通部品は components/application/ に置く）。
 * `_` 始まりのファイル名は Story として収集されない。
 *
 * <important>
 * Tailwind のクラス名は必ずリテラル文字列で書く。
 * `bg-${name}-50` のような動的組立は静的解析されず、色が出ずに灰色の箱になる。
 * トークン名から色を引くときは tokens/*.ts の `bgClass`（リテラル）を経由する。
 * 出典: ai-dev-standards/principles.md
 * </important>
 *
 * <important>
 * 見本を囲む外枠には必ず `sb-unstyled` を付ける。
 * addon-docs は MDX の地の文を読みやすくするため
 * `:where(span:not(.sb-unstyled …)) { font-size: 16px }` のような
 * **レイヤー無し**のリセットを当てている。レイヤー無しの宣言は
 * `@layer components` の中にある `.badge` などより常に強いため、
 * `sb-unstyled` を付けないと見本が実アプリと違うサイズで描画される
 * （`.badge` の 12px が 16px になる）。
 * `sb-unstyled` は Storybook 側が用意した除外フックで、この 1 箇所で効く。
 * </important>
 */

import type * as React from "react";
import type { SemanticColor } from "../../tokens/colors";
import { ICON_NAMES, ICON_PATHS } from "../../tokens/icons.generated";

/** 仕様書内の表。素の table にしてダーク切替にも追従させる */
export function SpecTable({
  head,
  rows,
}: {
  head: React.ReactNode[];
  rows: React.ReactNode[][];
}) {
  return (
    <div className="sb-unstyled my-4 w-full overflow-x-auto rounded-xl border border-border">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-muted">
            {head.map((h, i) => (
              <th
                key={i}
                scope="col"
                className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className="border-b border-border last:border-0">
              {row.map((cell, ci) => (
                <td key={ci} className="px-3 py-2 align-middle text-foreground">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** インラインのコード表記 */
export function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
      {children}
    </code>
  );
}

/**
 * セマンティックカラーの一覧。
 *
 * ツールバーの Theme を dark に切り替えると、`.dark` で上書きしている
 * トークン（background / foreground / card / muted / border 等）だけが変化する。
 * primary / success / danger の色相が変わらないことも確認できる。
 */
export function ColorTable({ colors }: { colors: readonly SemanticColor[] }) {
  return (
    <SpecTable
      head={["見本", "トークン", "Tailwind クラス", "意味・使う場面"]}
      rows={colors.map((c) => [
        <div
          className={`h-8 w-16 rounded-lg border border-border ${c.bgClass}`}
          // 色そのものが情報なので、支援技術にはトークン名を伝える
          role="img"
          aria-label={`${c.name} の色見本`}
        />,
        <Code>{c.token}</Code>,
        <Code>{c.bgClass}</Code>,
        c.usage,
      ])}
    />
  );
}

/** ステータスバッジの一覧（意味 → 色） */
export function StatusTable({
  statuses,
}: {
  statuses: readonly { meaning: string; cls: string }[];
}) {
  return (
    <SpecTable
      head={["見本", "意味", "クラス"]}
      rows={statuses.map((s) => [
        <span className={`badge ${s.cls}`}>{s.meaning}</span>,
        s.meaning,
        <Code>{s.cls}</Code>,
      ])}
    />
  );
}

/** アイコン1つ。application の `{% icon %}` と同じ SVG 属性で描画する */
export function Icon({
  name,
  className = "w-5 h-5",
}: {
  name: string;
  className?: string;
}) {
  const path = ICON_PATHS[name];
  if (!path) return null;
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
      // path は自動生成された固定文字列（Heroicons v2）。外部入力ではない。
      dangerouslySetInnerHTML={{ __html: path }}
    />
  );
}

/** アイコン全件のグリッド。名前をコピーして `{% icon "名前" %}` に使う */
export function IconGrid() {
  return (
    <div className="sb-unstyled my-4 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
      {ICON_NAMES.map((name) => (
        <div
          key={name}
          className="flex flex-col items-center gap-1.5 rounded-lg border border-border bg-card p-3 text-center"
        >
          <Icon name={name} className="w-6 h-6 text-foreground" />
          <span className="break-all font-mono text-[10px] text-muted-foreground">{name}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * CSS クラスの見本。
 *
 * `sample` に素の HTML 文字列を渡す。テンプレートに
 * そのままコピーできる形にしておくため、React 要素ではなく文字列で持つ。
 */
export function ClassSample({
  sample,
  note,
}: {
  sample: string;
  note?: React.ReactNode;
}) {
  return (
    <div className="sb-unstyled my-4 overflow-hidden rounded-xl border border-border">
      <div className="flex flex-wrap items-center gap-3 bg-background p-4">
        {/* sample は仕様書に直接書かれた固定文字列。外部入力ではない。
         * w-full: 中身に合わせて縮むと、width: 100% を指定した見本（page-header 等）が広がらない */}
        <div className="w-full" dangerouslySetInnerHTML={{ __html: sample }} />
      </div>
      <pre className="overflow-x-auto border-t border-border bg-muted p-3 text-xs leading-relaxed text-foreground">
        <code>{sample}</code>
      </pre>
      {note && (
        <p className="border-t border-border bg-card px-3 py-2 text-xs text-muted-foreground">
          {note}
        </p>
      )}
    </div>
  );
}

/** 「使う / 使わない」の対比ブロック */
export function DoDont({
  doText,
  dontText,
}: {
  doText: React.ReactNode;
  dontText: React.ReactNode;
}) {
  return (
    <div className="sb-unstyled my-4 grid gap-3 md:grid-cols-2">
      <div className="rounded-xl border border-border bg-card p-3">
        <p className="mb-1 text-xs font-semibold text-success">✓ こうする</p>
        <div className="text-sm text-foreground">{doText}</div>
      </div>
      <div className="rounded-xl border border-border bg-card p-3">
        <p className="mb-1 text-xs font-semibold text-danger">✗ こうしない</p>
        <div className="text-sm text-foreground">{dontText}</div>
      </div>
    </div>
  );
}
