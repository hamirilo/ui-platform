"use client";

import { ActiveIndicator } from "./ActiveIndicator";
import {
  type NavItemBaseProps,
  type NavItemIndicatorProps,
  type NavItemPropsOf,
  createNavItem,
} from "./nav-item-base";

interface AnimatedNavItemOwnProps extends NavItemBaseProps {
  /**
   * アクティブ背景の shared layout animation に使う id。
   * 同じグループの項目で同じ値を渡す。別々に動くナビが同じ画面に 2 つあるときは値を分ける。
   *
   * @default "active-nav-indicator"
   */
  layoutId?: string;
}

export type AnimatedNavItemProps = NavItemPropsOf<AnimatedNavItemOwnProps>;

function MotionIndicator({ className, layoutId = "active-nav-indicator" }: NavItemIndicatorProps) {
  return <ActiveIndicator layoutId={layoutId} className={className} />;
}

/**
 * アクティブ背景が項目間を移動する NavItem（framer-motion の shared layout animation）。
 *
 * 見た目と props は `NavItem` と同じ。framer-motion をバンドルに含めるため、
 * 同じページ内で active を切り替える（SPA 的な）ナビでだけ使う。
 * ページ遷移がフルリロードになる構成ではアニメーションが見えないので `NavItem` を使う。
 */
export const AnimatedNavItem = createNavItem<AnimatedNavItemOwnProps>(
  "AnimatedNavItem",
  MotionIndicator,
);
