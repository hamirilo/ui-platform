"use client";

import { Check, Grip } from "lucide-react";
import * as React from "react";
import { cn } from "../../lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

export interface ProductSwitcherItem {
  /** 一意なキー */
  key: string;
  /** 表示名 */
  name: string;
  /** 遷移先。別ドメインでも同じタブで開く（target は付けない） */
  href: string;
  /** 名前の下に出す一行の説明 */
  description?: string;
  /** タイルに出す 2 文字程度の略号。省略時は名前の先頭 2 文字 */
  monogram?: string;
  /** いま居るプロダクト。`aria-current="page"` とチェックが付く */
  current?: boolean;
}

export interface ProductSwitcherProps {
  /** 並べるプロダクト。並び順のまま描く */
  items: ProductSwitcherItem[];
  /** パネル見出しの左（デフォルト: "プロダクト"） */
  title?: string;
  /** パネル見出しの右（デフォルト: "プロダクト切り替え"） */
  caption?: string;
  /** トリガーの aria-label / title（デフォルト: "プロダクトを切り替える"） */
  triggerLabel?: string;
  /** 開閉の通知。一覧を開いたときに取り直す、などに使う */
  onOpenChange?: (open: boolean) => void;
  /** トリガーに足す CSS クラス */
  className?: string;
}

/**
 * 同じ組織の別プロダクトへ移る切り替え（ヘッダー右上の 9 点アイコン）。
 *
 * 一覧の取得はしない。どこから一覧を得るか（設定・JSON・API）は利用側が決めて items で渡す
 * （decisions/adr-0003: endpoint 設定を内部に持たない）。
 */
export function ProductSwitcher({
  items,
  title = "プロダクト",
  caption = "プロダクト切り替え",
  triggerLabel = "プロダクトを切り替える",
  onOpenChange,
  className,
}: ProductSwitcherProps) {
  return (
    <Popover onOpenChange={(open) => onOpenChange?.(open)}>
      <PopoverTrigger
        aria-label={triggerLabel}
        title={triggerLabel}
        className={cn(
          "flex items-center justify-center rounded-xl p-2 text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
          className,
        )}
      >
        <Grip className="size-5" aria-hidden="true" />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 gap-0 rounded-xl p-2">
        <div className="mb-1 flex items-center justify-between border-b border-border px-2.5 pt-1.5 pb-2.5">
          <span className="text-xs font-bold tracking-wider text-muted-foreground">{title}</span>
          <span className="text-[11px] text-muted-foreground">{caption}</span>
        </div>
        <nav aria-label={caption} className="flex flex-col gap-0.5">
          {items.map((item) => (
            <ProductRow key={item.key} item={item} />
          ))}
        </nav>
      </PopoverContent>
    </Popover>
  );
}

function ProductRow({ item }: { item: ProductSwitcherItem }) {
  const monogram = item.monogram ?? item.name.slice(0, 2);
  return (
    <a
      href={item.href}
      aria-current={item.current ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-[10px] p-2.5 outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring",
        item.current && "bg-muted",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg text-sm font-extrabold",
          item.current
            ? "bg-primary text-primary-foreground"
            : "bg-card text-foreground ring-1 ring-border ring-inset",
        )}
      >
        {monogram}
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-sm font-extrabold text-foreground">{item.name}</span>
        {item.description && (
          <span className="truncate text-xs text-muted-foreground">{item.description}</span>
        )}
      </span>
      {item.current && <Check className="size-[18px] shrink-0 text-primary" aria-hidden="true" />}
    </a>
  );
}
