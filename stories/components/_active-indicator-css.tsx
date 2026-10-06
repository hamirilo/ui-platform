/**
 * ActiveIndicator の CSS 実装の試作（比較用。配布物ではない）。
 *
 * 現行の ActiveIndicator は Framer Motion の `layoutId`（Shared Layout）で
 * 指標を項目間で移動させている。そのためだけに framer-motion が依存に入り、
 * NavItem を使う利用側の bundle は gzip で約 40KB 増える。
 *
 * 一方 tokens/motion.css は冒頭でこう宣言している。
 *
 *   > 実装は CSS transform + cubic-bezier を使い、framer-motion 等ライブラリに依存しない。
 *   > --motion-duration-base: 200ms;  ナビ切り替え・ハイライト移動等
 *
 * つまり Token 側は最初から CSS 実装を前提にしていて、framer-motion の方が逸脱。
 * ここでは Token の想定どおりに書けるか、見た目がどれだけ変わるかを確かめる。
 *
 * `_` 始まりのファイル名は Story として収集されない。
 */

import * as React from "react";
import { cn } from "../../lib/utils";

/* ==========================================================================
 * 案 A: フェードのみ（項目に内包・現行と同じ構造）
 *
 * 指標は選択中の項目の中に描かれ、移動せずにその場で現れる。
 * 現行 ActiveIndicator と差し替えるだけで済み、API も構造も変わらない。
 * 失うのは「どこから来たか」が見えること。
 * ========================================================================== */

export function FadeIndicator({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 z-0 rounded-lg border",
        "border-primary/20 bg-primary/10",
        "motion-safe:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-95",
        className,
      )}
      style={{ animationDuration: "var(--motion-duration-fast)" }}
    />
  );
}

/* ==========================================================================
 * 案 B: 移動する（コンテナが指標を 1 つ持つ）
 *
 * コンテナが指標を 1 枚だけ持ち、選択中の項目の位置と高さへ transform で寄せる。
 * Framer Motion の layoutId と同じ「移動して見える」挙動を CSS transition で出す。
 *
 * 代償は API が変わること。現行は NavItem が自分で指標を描くので項目だけ置けば
 * よいが、この案は親（NavList）が要る。
 * ========================================================================== */

export function NavList({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [box, setBox] = React.useState<{ top: number; height: number } | null>(null);
  // 初回は移動させない（マウント時に 0 から滑ってくると目障りなため）
  const [ready, setReady] = React.useState(false);

  React.useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;

    /* 毎レンダー測り直すので、値が変わったときだけ state を更新する。
     * 毎回新しいオブジェクトを渡すと再レンダー -> 再測定の無限ループになる。 */
    const measure = () => {
      const active = root.querySelector<HTMLElement>('[data-active="true"]');
      const next = active ? { top: active.offsetTop, height: active.offsetHeight } : null;
      setBox((prev) => {
        if (prev === next) return prev;
        if (prev && next && prev.top === next.top && prev.height === next.height) return prev;
        return next;
      });
    };

    measure();
    // 項目の増減・折り返し・フォントの読み込みで位置が変わる
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    for (const el of root.children) observer.observe(el);

    const raf = requestAnimationFrame(() => setReady(true));
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  });

  return (
    <div ref={ref} className={cn("relative", className)}>
      {box && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 z-0 rounded-lg border border-primary/20 bg-primary/10"
          style={{
            height: box.height,
            transform: `translateY(${box.top}px)`,
            transition: ready
              ? "transform var(--motion-duration-base) var(--motion-ease-default), height var(--motion-duration-base) var(--motion-ease-default)"
              : undefined,
          }}
        />
      )}
      {children}
    </div>
  );
}
