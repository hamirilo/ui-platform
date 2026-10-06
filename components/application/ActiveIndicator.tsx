/**
 * ActiveIndicator - 選択中の位置を示す装飾の面（NavItem の内部で使う）
 *
 * Framer Motion の Shared Layout（`layoutId`）で、同じ `layoutId` を持つ項目の間を
 * 面が移動する。操作もアクセシビリティも持たない装飾専用（`aria-hidden`）で、
 * 操作と読み上げは親（NavItem 等）が持つ。
 *
 * <important>
 * **このキットで `framer-motion` を使うのはこの部品と NavItem だけ。**
 * 配布物は依存を external にして部品ごとに file を分けてあるので、NavItem を
 * 使わない利用側の bundle には入らない（実測: 使わないと 43KB、使うと 83KB / gzip）。
 *
 * 新しい部品を framer-motion で作らないこと。この依存を optional な peerDependency へ
 * 移す案は、barrel（index.ts）がこの部品を re-export している限り成立しない
 * （未 install の利用側では `{ Button }` だけの import でも build が解決に失敗する）。
 * 移すなら NavItem ごと subpath export へ出す必要がある。
 * </important>
 */

"use client";

import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

export interface ActiveIndicatorProps {
  layoutId?: string;
  className?: string;
}

export function ActiveIndicator({
  layoutId = "active-nav-indicator",
  className,
}: ActiveIndicatorProps) {
  return (
    <motion.div
      layoutId={layoutId}
      aria-hidden="true"
      className={cn(
        "absolute inset-0 border rounded-lg z-0 pointer-events-none bg-primary/10 border-primary/20",
        className,
      )}
      transition={{ type: "spring", stiffness: 380, damping: 30 }}
    />
  );
}
