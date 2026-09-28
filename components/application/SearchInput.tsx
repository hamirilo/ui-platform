/**
 * SearchInput - 共有 UI ライブラリの検索入力コンポーネント
 *
 * shadcn/ui の InputGroup に検索アイコンとクリアボタンを組み合わせたもの。
 * 一覧・テーブルの上に置くフィルタ用検索欄で使う。
 *
 * <important>
 * ラベルを視覚的に置かない場面が多いため、`aria-label` を必ず渡すこと
 * （FormField で囲む場合は不要）。
 * </important>
 */

import { SearchIcon, XIcon } from "lucide-react";
import * as React from "react";
import { cn } from "../../lib/utils";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "../ui/input-group";

export interface SearchInputProps
  extends Omit<React.ComponentPropsWithoutRef<"input">, "size" | "type"> {
  /**
   * クリアボタンを押したときのコールバック。
   * 渡すと値がある間だけクリアボタン（×）が表示される。
   */
  onClear?: () => void;

  /** ラッパー（InputGroup）に付けるクラス */
  className?: string;
}

/**
 * SearchInput コンポーネント
 *
 * @example
 * ```tsx
 * // 基本（非制御）
 * <SearchInput aria-label="検索" placeholder="タイトルで検索" />
 *
 * // 制御付き + クリアボタン
 * <SearchInput
 *   aria-label="検索"
 *   placeholder="タイトルで検索"
 *   value={keyword}
 *   onChange={(e) => setKeyword(e.target.value)}
 *   onClear={() => setKeyword("")}
 * />
 * ```
 */
export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, onClear, value, ...props }, ref) => {
    const hasValue = value !== undefined && value !== "";

    return (
      <InputGroup className={className}>
        <InputGroupAddon align="inline-start" aria-hidden="true">
          <SearchIcon />
        </InputGroupAddon>

        <InputGroupInput
          ref={ref}
          type="search"
          // 検索欄の下には絞り込み結果や候補を並べることが多く、ブラウザの入力履歴が
          // それに重なる。履歴を使いたい場合は利用側で autoComplete="on" を渡す
          autoComplete="off"
          value={value}
          // ブラウザ標準の × は位置もサイズも揃わないため隠し、クリアボタンに一本化する
          className={cn("[&::-webkit-search-cancel-button]:hidden")}
          {...props}
        />

        {onClear && hasValue && (
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              size="icon-xs"
              onClick={onClear}
              aria-label="検索キーワードをクリア"
              className="rounded-full"
            >
              <XIcon />
            </InputGroupButton>
          </InputGroupAddon>
        )}
      </InputGroup>
    );
  },
);

SearchInput.displayName = "SearchInput";
