"use client";

import { cn } from "../../lib/utils";
import {
  type NavItemBaseProps,
  type NavItemIndicatorProps,
  type NavItemPropsOf,
  createNavItem,
} from "./nav-item-base";

export type { NavItemColor } from "./nav-item-base";

interface NavItemOwnProps extends NavItemBaseProps {
  /**
   * @deprecated NavItem は framer-motion を使わないため、この値は無視されます。
   * アクティブ背景を項目間で移動させたい場合は `AnimatedNavItem` を使ってください。
   * v8.0.0 で削除します。
   */
  layoutId?: string;
}

export type NavItemProps = NavItemPropsOf<NavItemOwnProps>;
export type NavItemLinkProps = Extract<NavItemProps, { href: string }>;
export type NavItemButtonProps = Exclude<NavItemProps, NavItemLinkProps>;

/**
 * アクティブ背景を CSS だけで描く。
 *
 * 見た目は ActiveIndicator と同じ class を持つが、framer-motion に依存しない。
 * `<button>` の中に置くため div ではなく span にする（button の中身は phrasing content）。
 */
function StaticIndicator({ className }: NavItemIndicatorProps) {
  return (
    <span
      aria-hidden="true"
      data-slot="nav-item-indicator"
      className={cn(
        "absolute inset-0 border rounded-lg z-0 pointer-events-none bg-primary/10 border-primary/20",
        className,
      )}
    />
  );
}

/**
 * サイドバー等のナビゲーション項目。`href` があれば `<a>`、なければ `<button>` になる。
 *
 * アクティブ背景は静的に描く（framer-motion をバンドルに含めない）。
 * Django Templates + Islands のようにページ遷移がフルリロードになる構成では
 * 項目間のアニメーションは見えないため、既定はこちら。
 * 同じページ内で active を切り替え、背景の移動を見せたい場合は `AnimatedNavItem` を使う。
 */
export const NavItem = createNavItem<NavItemOwnProps>("NavItem", StaticIndicator);
