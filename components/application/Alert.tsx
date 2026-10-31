/**
 * Alert - 継続して伝える注意・案内（インラインアラート / バナー）
 *
 * shadcn/ui の Alert を土台に、意味に対応した色調（tone）と、見出し・本文・操作・閉じるの
 * 定位置を載せたもの。Toast は「一時的な結果通知」、Alert は「利用者が対処または確認する
 * までページ上に残す表現」（Application UI Standard §4）。
 *
 * テンプレート側の `.alert .alert-{tone}`（tokens/classes.css）と 1:1。
 *
 * <important>
 * - 入力項目のエラーはここではなく FormField の error に出す（対象フィールドの近く）。
 * - 色だけに意味を持たせない。tone ごとのアイコンと見出し・本文で伝える。
 * - danger / warning は role="alert"（即時に読み上げ）、info / success は role="status"。
 * </important>
 */

import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import * as React from "react";
import { cn } from "../../lib/utils";
import {
  AlertAction as AlertActionPrimitive,
  AlertDescription as AlertDescriptionPrimitive,
  Alert as AlertPrimitive,
  AlertTitle as AlertTitlePrimitive,
} from "../ui/alert";

export type AlertTone = "info" | "success" | "warning" | "danger";

export type AlertVariant = "inline" | "banner";

export interface AlertProps extends Omit<React.ComponentPropsWithoutRef<"div">, "title"> {
  /**
   * 意味に対応した色調
   * - info: 案内・補足（既定）
   * - success: 完了・承認済みの状態を継続して示す
   * - warning: 注意。未完了の設定、期限が近い等
   * - danger: 対処が必要。権限がない、失敗した、削除される等
   * @default "info"
   */
  tone?: AlertTone;

  /**
   * 表示形
   * - inline: 画面内の一区画に置く（既定）
   * - banner: ページ幅いっぱいのお知らせ・環境バナー。角丸と左右の枠を外す
   * @default "inline"
   */
  variant?: AlertVariant;

  /** 見出し。1 行で要点を言う */
  title?: React.ReactNode;

  /**
   * 先頭のアイコン。省略時は tone ごとの既定アイコン。`false` で消す
   * @default tone ごとの lucide アイコン
   */
  icon?: React.ReactNode | false;

  /** 本文の下に並べる操作（Button 等） */
  actions?: React.ReactNode;

  /** 渡すと右上に閉じるボタンを出す。押されたときの処理（非表示にするのは呼び出し側） */
  onDismiss?: () => void;

  /**
   * 閉じるボタンの読み上げラベル
   * @default "閉じる"
   */
  dismissLabel?: string;
}

const TONE_CONFIG: Record<
  AlertTone,
  { icon: React.ComponentType<{ className?: string }>; className: string; role: "alert" | "status" }
> = {
  info: { icon: Info, className: "cn-alert-tone-info", role: "status" },
  success: { icon: CheckCircle2, className: "cn-alert-tone-success", role: "status" },
  warning: { icon: AlertTriangle, className: "cn-alert-tone-warning", role: "alert" },
  danger: { icon: XCircle, className: "cn-alert-tone-danger", role: "alert" },
};

/**
 * Alert コンポーネント
 *
 * @example
 * ```tsx
 * // 案内
 * <Alert title="下書きは 30 日間保存されます">期限を過ぎると自動的に削除されます。</Alert>
 *
 * // 対処が必要 + 操作
 * <Alert tone="danger" title="通知先が設定されていません"
 *   actions={<Button variant="secondary" size="sm">設定する</Button>}>
 *   通知先を設定するまで、担当者へメールが届きません。
 * </Alert>
 *
 * // 閉じられる
 * <Alert tone="success" title="保存しました" onDismiss={() => setShown(false)} />
 *
 * // ページ幅のお知らせ
 * <Alert variant="banner" tone="warning" title="9/10 21:00〜22:00 はメンテナンスのため利用できません" />
 * ```
 */
export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      tone = "info",
      variant = "inline",
      title,
      icon,
      actions,
      onDismiss,
      dismissLabel = "閉じる",
      children,
      className,
      ...props
    },
    ref,
  ) => {
    const config = TONE_CONFIG[tone];
    const Icon = config.icon;

    return (
      <AlertPrimitive
        ref={ref}
        role={config.role}
        data-tone={tone}
        className={cn(config.className, variant === "banner" && "cn-alert-banner", className)}
        {...props}
      >
        {icon === false ? null : icon !== undefined ? icon : <Icon aria-hidden="true" />}
        <div className="cn-alert-body">
          {title && <AlertTitlePrimitive>{title}</AlertTitlePrimitive>}
          {children && <AlertDescriptionPrimitive>{children}</AlertDescriptionPrimitive>}
          {actions && <div className="cn-alert-actions">{actions}</div>}
        </div>
        {onDismiss && (
          <AlertActionPrimitive>
            <button
              type="button"
              className="cn-alert-dismiss"
              aria-label={dismissLabel}
              onClick={onDismiss}
            >
              <X aria-hidden="true" />
            </button>
          </AlertActionPrimitive>
        )}
      </AlertPrimitive>
    );
  },
);

Alert.displayName = "Alert";
