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

const colorStyles: Record<NavItemColor, { text: string; indicator: string; badge: string }> = {
  primary: {
    text: "text-primary font-semibold",
    indicator: "bg-primary/10 border-primary/20",
    badge: "bg-primary/20 text-primary",
  },
  blue: {
    text: "text-blue-600 dark:text-blue-400 font-semibold",
    indicator: "bg-blue-600/10 dark:bg-blue-600/20 border-blue-500/20",
    badge: "bg-blue-600/20 text-blue-600 dark:text-blue-400",
  },
  indigo: {
    text: "text-indigo-600 dark:text-indigo-400 font-semibold",
    indicator: "bg-indigo-600/10 dark:bg-indigo-600/20 border-indigo-500/20",
    badge: "bg-indigo-600/20 text-indigo-600 dark:text-indigo-400",
  },
  teal: {
    text: "text-teal-600 dark:text-teal-400 font-semibold",
    indicator: "bg-teal-600/10 dark:bg-teal-600/20 border-teal-500/20",
    badge: "bg-teal-600/20 text-teal-600 dark:text-teal-400",
  },
  amber: {
    text: "text-amber-600 dark:text-amber-400 font-semibold",
    indicator: "bg-amber-600/10 dark:bg-amber-600/20 border-amber-500/20",
    badge: "bg-amber-600/20 text-amber-600 dark:text-amber-400",
  },
  rose: {
    text: "text-rose-600 dark:text-rose-400 font-semibold",
    indicator: "bg-rose-600/10 dark:bg-rose-600/20 border-rose-500/20",
    badge: "bg-rose-600/20 text-rose-600 dark:text-rose-400",
  },
  emerald: {
    text: "text-emerald-600 dark:text-emerald-400 font-semibold",
    indicator: "bg-emerald-600/10 dark:bg-emerald-600/20 border-emerald-500/20",
    badge: "bg-emerald-600/20 text-emerald-600 dark:text-emerald-400",
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
