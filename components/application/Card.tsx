/**
 * Card - 「もの」を並べるときの面
 *
 * shadcn/ui の Card を土台に、タイトル行の下の罫線（`titleRule`）と、
 * muted の帯にしたフッター（`footerVariant="band"`）を載せたもの。
 * カテゴリや状態の色は左罫線ではなく、この罫線で示す（Storybook「基礎/角丸と影」）。
 * テンプレート側の `.card-title-rule` / `.card-footer-band`（tokens/classes.css）と 1:1。
 *
 * <important>
 * - 罫線は CardHeader の直後に描く。CardHeader がなければ `titleRule` は何も描かない。
 * - accent（2px の意味色）はカテゴリ・警告など意味を持つ色のときだけ使う。1 カード 1 色。
 * - 罫線と帯はカード幅いっぱいに引く。負のマージンは `--card-optical`（余白）から取るので、
 *   `className="p-6"` のように余白を上書きすると端が合わなくなる。
 * </important>
 */

import * as React from "react";
import { cn } from "../../lib/utils";
import {
  CardFooter as CardFooterPrimitive,
  CardHeader as CardHeaderPrimitive,
  Card as CardPrimitive,
} from "../ui/card";

export type CardTitleRule = "none" | "neutral" | "accent";
export type CardFooterVariant = "plain" | "band";

export interface CardProps extends React.ComponentProps<typeof CardPrimitive> {
  /**
   * タイトル行の下の罫線。neutral は 1px の border 色、accent は 2px の `accentColor`
   * @default "none"
   */
  titleRule?: CardTitleRule;

  /**
   * `titleRule="accent"` のときの罫線の色。CSS の色値（`var(--color-warning)` など Token を渡す）
   * @default "var(--color-primary)"
   */
  accentColor?: string;

  /**
   * フッターの見せ方。band は muted の帯にしてカード幅いっぱいに広げる
   * @default "plain"
   */
  footerVariant?: CardFooterVariant;
}

type CardContextValue = Pick<CardProps, "titleRule" | "accentColor" | "footerVariant">;

const CardContext = React.createContext<CardContextValue>({});

/**
 * Card コンポーネント
 *
 * @example
 * ```tsx
 * <Card titleRule="accent" accentColor="var(--color-warning)" footerVariant="band">
 *   <CardHeader>
 *     <CardTitle>交雑牛去勢 A5</CardTitle>
 *     <CardAction><Badge>牛</Badge></CardAction>
 *   </CardHeader>
 *   <CardContent>…</CardContent>
 *   <CardFooter>前年同月比 +9.5%</CardFooter>
 * </Card>
 * ```
 */
function Card({ titleRule = "none", accentColor, footerVariant = "plain", ...props }: CardProps) {
  const context = React.useMemo(
    () => ({ titleRule, accentColor, footerVariant }),
    [titleRule, accentColor, footerVariant],
  );
  return (
    <CardContext.Provider value={context}>
      <CardPrimitive {...props} />
    </CardContext.Provider>
  );
}

function CardHeader(props: React.ComponentProps<typeof CardHeaderPrimitive>) {
  const { titleRule, accentColor } = React.useContext(CardContext);
  if (!titleRule || titleRule === "none") return <CardHeaderPrimitive {...props} />;
  return (
    <>
      <CardHeaderPrimitive {...props} />
      <div
        aria-hidden="true"
        data-slot="card-title-rule"
        data-variant={titleRule}
        className="cn-card-title-rule"
        style={
          titleRule === "accent" && accentColor
            ? ({ "--card-rule-color": accentColor } as React.CSSProperties)
            : undefined
        }
      />
    </>
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<typeof CardFooterPrimitive>) {
  const { footerVariant } = React.useContext(CardContext);
  if (footerVariant !== "band") return <CardFooterPrimitive className={className} {...props} />;
  return (
    <CardFooterPrimitive
      data-variant="band"
      className={cn("cn-card-footer-band", className)}
      {...props}
    />
  );
}

export { Card, CardHeader, CardFooter };
