/**
 * Dropdown - 共有 UI ライブラリのドロップダウンメニューコンポーネント
 *
 * 行アクション（編集・削除・複製など）や、テーブル・カード上のメニューボタンで使用します。
 * shadcn/ui の DropdownMenu をラップし、`items` 配列を渡すだけで構築できる簡潔な API を提供します。
 *
 * 画面側では Dropdown のみを使用し、shadcn/ui の DropdownMenu を直接使用しないでください。
 */

import * as React from "react";
import { cn } from "../../lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export interface DropdownItem {
  /**
   * メニュー項目の一意なキー
   */
  key: string;

  /**
   * 表示ラベル
   */
  label: React.ReactNode;

  /**
   * 左側に表示するアイコン
   */
  icon?: React.ReactNode;

  /**
   * クリック時のコールバック
   */
  onSelect?: () => void;

  /**
   * 危険な操作（削除など）を赤色で表示
   */
  danger?: boolean;

  /**
   * 無効化
   */
  disabled?: boolean;

  /**
   * この項目の直前に区切り線を表示
   */
  separatorBefore?: boolean;
}

export interface DropdownProps {
  /**
   * メニューを開くトリガー要素（通常は Button や IconButton）
   */
  trigger: React.ReactNode;

  /**
   * メニュー項目一覧
   */
  items: DropdownItem[];

  /**
   * メニュー上部に表示するラベル（オプション）
   */
  label?: React.ReactNode;

  /**
   * メニューの配置位置
   * @default "end"
   */
  align?: "start" | "center" | "end";
}

/**
 * Dropdown コンポーネント
 *
 * @example
 * ```tsx
 * // タスクカードの行アクション（編集・削除）
 * <Dropdown
 *   trigger={
 *     <Button variant="ghost" size="icon">
 *       <MoreVertical />
 *     </Button>
 *   }
 *   items={[
 *     { key: "edit", label: "編集", icon: <Pencil />, onSelect: handleEdit },
 *     { key: "archive", label: "アーカイブ", icon: <Archive />, onSelect: handleArchive },
 *     {
 *       key: "delete",
 *       label: "削除",
 *       icon: <Trash />,
 *       danger: true,
 *       separatorBefore: true,
 *       onSelect: () => setDeleteConfirmOpen(true),
 *     },
 *   ]}
 * />
 * ```
 */
export const Dropdown = ({ trigger, items, label, align = "end" }: DropdownProps) => {
  const renderedItems = items.map((item) => (
    <React.Fragment key={item.key}>
      {item.separatorBefore && <DropdownMenuSeparator />}
      <DropdownMenuItem
        disabled={item.disabled}
        onClick={item.onSelect}
        className={cn(
          /* danger は status-danger の組を引く。この系統だけが light / dark の
           * 両方で「淡い面 + 読める濃い文字」になるよう Token 側で反転している
           * （--color-danger は反転しないため、暗い地で文字が沈む）。 */
          item.danger &&
            "text-status-danger-foreground data-highlighted:bg-status-danger data-highlighted:text-status-danger-foreground",
        )}
      >
        {item.icon}
        {item.label}
      </DropdownMenuItem>
    </React.Fragment>
  ));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={trigger as React.ReactElement} />
      <DropdownMenuContent align={align}>
        {/* 見出しは Base UI の Menu.GroupLabel。
            Menu.Group の外に置くと MenuGroupContext が無くて実行時エラーになるため、
            見出しを出すときは項目ごと Group で包む（見出しが指すのはこの項目群）。 */}
        {label ? (
          <DropdownMenuGroup>
            <DropdownMenuLabel>{label}</DropdownMenuLabel>
            {renderedItems}
          </DropdownMenuGroup>
        ) : (
          renderedItems
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
