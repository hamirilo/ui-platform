"use client";

/**
 * NavItem / AnimatedNavItem の共通実装（公開 API ではない）。
 *
 * 2 つの違いはアクティブ背景を描く部品だけで、それを `createNavItem` の引数で受ける。
 * framer-motion を使う部品は AnimatedNavItem.tsx だけが import する。NavItem.tsx から
 * 参照すると、アニメーションを使わない利用側のバンドルにも framer-motion が入るため、
 * このファイルにも motion 版を置かない（decisions/adr-0008）。
 */

import * as React from "react";
import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

export type NavItemColor = "primary" | "blue" | "indigo" | "teal" | "amber" | "rose" | "emerald";

export interface NavItemBaseProps {
  active?: boolean;
  icon?: ReactNode;
  label?: ReactNode;
  badge?: ReactNode;
  activeColor?: NavItemColor;
  className?: string;
  children?: ReactNode;
}

/** href の有無で `<a>` / `<button>` の属性を切り替える props の組み立て */
export type NavItemPropsOf<P extends NavItemBaseProps> =
  | (P &
      Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof P> & {
        href: string;
      })
  | (P &
      Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof P> & {
        href?: undefined;
      });

/** アクティブ背景を描く部品が受ける props */
export interface NavItemIndicatorProps {
  className: string;
  layoutId?: string;
}

/**
 * activeColor ごとの見た目。
 *
 * 色は Semantic Token（`--color-nav-*` / `--color-primary`）だけを引く。
 * raw palette（`text-blue-600` 等）と `dark:` の出し分けを書かないこと。
 * ダークで 1 段明るくするのは Token 側（tokens/tokens.css の `.dark`）の仕事で、
 * ここは 7 色とも同じ式（文字 = 色、面 = /10、枠と件数バッジ = /20）で書く。
 */
const colorStyles: Record<NavItemColor, { text: string; indicator: string; badge: string }> = {
  primary: {
    text: "text-primary font-semibold",
    indicator: "bg-primary/10 border-primary/20",
    badge: "bg-primary/20 text-primary",
  },
  blue: {
    text: "text-nav-blue font-semibold",
    indicator: "bg-nav-blue/10 border-nav-blue/20",
    badge: "bg-nav-blue/20 text-nav-blue",
  },
  indigo: {
    text: "text-nav-indigo font-semibold",
    indicator: "bg-nav-indigo/10 border-nav-indigo/20",
    badge: "bg-nav-indigo/20 text-nav-indigo",
  },
  teal: {
    text: "text-nav-teal font-semibold",
    indicator: "bg-nav-teal/10 border-nav-teal/20",
    badge: "bg-nav-teal/20 text-nav-teal",
  },
  amber: {
    text: "text-nav-amber font-semibold",
    indicator: "bg-nav-amber/10 border-nav-amber/20",
    badge: "bg-nav-amber/20 text-nav-amber",
  },
  rose: {
    text: "text-nav-rose font-semibold",
    indicator: "bg-nav-rose/10 border-nav-rose/20",
    badge: "bg-nav-rose/20 text-nav-rose",
  },
  emerald: {
    text: "text-nav-emerald font-semibold",
    indicator: "bg-nav-emerald/10 border-nav-emerald/20",
    badge: "bg-nav-emerald/20 text-nav-emerald",
  },
};

/**
 * NavItem 系の Component を組み立てる。
 *
 * @param displayName React DevTools に出す名前
 * @param Indicator   アクティブ時に描く背景。`className` に色の class が渡る
 */
export function createNavItem<P extends NavItemBaseProps & { layoutId?: string }>(
  displayName: string,
  Indicator: React.ComponentType<NavItemIndicatorProps>,
) {
  const Component = React.forwardRef<HTMLAnchorElement | HTMLButtonElement, NavItemPropsOf<P>>(
    (props, ref) => {
      const {
        href,
        active = false,
        icon,
        label,
        badge,
        activeColor = "primary",
        layoutId,
        className,
        children,
        onClick,
        ...rest
      } = props as NavItemPropsOf<NavItemBaseProps & { layoutId?: string }>;

      const currentStyle = colorStyles[activeColor];

      const sharedClasses = cn(
        "cn-nav-item group relative flex w-full items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors border border-transparent select-none outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer h-auto",
        active ? currentStyle.text : "text-muted-foreground hover:text-foreground hover:bg-accent",
        className,
      );

      const innerContent = (
        <>
          <span className="cn-nav-item-label relative z-10 flex items-center">
            {icon}
            <span className="truncate">{label ?? children}</span>
          </span>

          {badge !== undefined && badge !== null && (
            <span
              className={cn(
                "relative z-10 px-2 py-0.5 text-xs font-semibold rounded-full",
                active ? currentStyle.badge : "bg-muted text-muted-foreground",
              )}
            >
              {badge}
            </span>
          )}

          {active && <Indicator layoutId={layoutId} className={currentStyle.indicator} />}
        </>
      );

      if (href) {
        return (
          <a
            ref={ref as React.Ref<HTMLAnchorElement>}
            href={href}
            onClick={onClick as React.MouseEventHandler<HTMLAnchorElement>}
            aria-current={active ? "page" : undefined}
            className={sharedClasses}
            {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
          >
            {innerContent}
          </a>
        );
      }

      return (
        <button
          ref={ref as React.Ref<HTMLButtonElement>}
          type="button"
          onClick={onClick as React.MouseEventHandler<HTMLButtonElement>}
          aria-pressed={active}
          className={sharedClasses}
          {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}
        >
          {innerContent}
        </button>
      );
    },
  );

  Component.displayName = displayName;
  return Component;
}
