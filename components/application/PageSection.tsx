/**
 * PageSection - ページの地の上に置く節（見出し・説明・操作・本文）
 *
 * まとまりを Card ではなく「見出し + 余白（必要なら区切り線）」で作るための部品
 * （decisions/adr-0009）。面（枠・背景・影）を持たない。
 * 詳細画面の各節、集計画面の各節、設定項目の群に使う。
 *
 * テンプレート側の `.page-section`（tokens/classes.css）と 1:1。
 * `.section` は利用側 Application が既に別の意味で使っているため、PageHeader と対の名前にしている。
 *
 * <important>
 * - 中身が 1 つの「もの」として並ぶ（一覧の各項目・選択肢）なら Card を使う。PageSection は面を持たない。
 * - 見出しは既定で h2（PageHeader の h1 の下）。入れ子にするときは `headingLevel` を 1 つ下げる。
 * - 注記は `description` に置く。本文の外（節の下）に浮かせない。
 * - 区切り線は節の境目が読み取りにくいとき（節が長い、続けて並ぶ）にだけ付ける。
 * </important>
 */

import * as React from "react";
import { cn } from "../../lib/utils";

export interface PageSectionProps extends Omit<React.ComponentPropsWithoutRef<"section">, "title"> {
  /** 節の見出し */
  title: React.ReactNode;

  /** 見出しの下に置く 1〜2 行の説明・注記 */
  description?: React.ReactNode;

  /** 見出しの右に置く操作（「すべて見る」、二次的なボタン等） */
  actions?: React.ReactNode;

  /**
   * 見出し要素のレベル
   * @default 2
   */
  headingLevel?: 2 | 3 | 4;

  /**
   * 節の上端に区切り線を引く
   * @default false
   */
  divider?: boolean;
}

/**
 * PageSection コンポーネント
 *
 * @example
 * ```tsx
 * <PageSection title="チャネル別" description="クリックの多い順">
 *   <Table variant="plain" columns={columns} rows={rows} />
 * </PageSection>
 *
 * <PageSection divider title="配布用URL" actions={<Button size="sm">URLを追加</Button>}>
 *   …
 * </PageSection>
 * ```
 */
export const PageSection = React.forwardRef<HTMLElement, PageSectionProps>(
  (
    {
      title,
      description,
      actions,
      headingLevel = 2,
      divider = false,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const Heading = `h${headingLevel}` as const;
    const titleId = React.useId();

    return (
      <section
        ref={ref}
        aria-labelledby={titleId}
        data-divider={divider || undefined}
        className={cn("cn-page-section", className)}
        {...props}
      >
        <div className="cn-page-section-header">
          <div className="cn-page-section-heading">
            <Heading id={titleId} className="cn-page-section-title">
              {title}
            </Heading>
            {description && <p className="cn-page-section-description">{description}</p>}
          </div>
          {actions && <div className="cn-page-section-actions">{actions}</div>}
        </div>
        {children}
      </section>
    );
  },
);

PageSection.displayName = "PageSection";
