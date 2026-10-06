/**
 * FormDialog - 共有 UI ライブラリのフォームダイアログコンポーネント
 *
 * フォーム入力を含むダイアログで使用します。
 * Dialog をベースに、フォーム送信・バリデーション機能を提供します。
 */

import * as React from "react";
import { Dialog } from "./Dialog";

export interface FormDialogProps {
  /**
   * ダイアログの開閉状態
   */
  open: boolean;

  /**
   * ダイアログを閉じるコールバック
   */
  onOpenChange: (open: boolean) => void;

  /**
   * ダイアログのタイトル
   */
  title: string;

  /**
   * ダイアログの説明文（オプション）
   */
  description?: string;

  /**
   * フォームのコンテンツ
   */
  children: React.ReactNode;

  /**
   * 送信ボタンのテキスト
   * @default "保存"
   */
  submitText?: string;

  /**
   * キャンセルボタンのテキスト
   * @default "キャンセル"
   */
  cancelText?: string;

  /**
   * フォーム送信時のコールバック
   * 非同期関数をサポート
   */
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void | Promise<void>;

  /**
   * キャンセルボタンクリック時のコールバック（オプション）
   */
  onCancel?: () => void;

  /**
   * 送信ボタンのバリアント
   * @default "primary"
   */
  submitVariant?: "primary" | "success";

  /**
   * 送信ボタンのローディング状態
   */
  loading?: boolean;

  /**
   * 送信ボタンの無効化
   */
  disabled?: boolean;

  /**
   * ダイアログの最大幅
   * @default "lg"
   */
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
}

/**
 * FormDialog コンポーネント
 *
 * @example
 * ```tsx
 * // 基本的な使い方
 * const [open, setOpen] = useState(false)
 * const [loading, setLoading] = useState(false)
 *
 * const handleSubmit = async (e: React.FormEvent) => {
 *   e.preventDefault()
 *   setLoading(true)
 *   try {
 *     const formData = new FormData(e.currentTarget as HTMLFormElement)
 *     await createTask(formData)
 *     setOpen(false)
 *   } catch (error) {
 *     console.error(error)
 *   } finally {
 *     setLoading(false)
 *   }
 * }
 *
 * <FormDialog
 *   open={open}
 *   onOpenChange={setOpen}
 *   title="新規タスク作成"
 *   description="タスクの情報を入力してください。"
 *   submitText="作成"
 *   onSubmit={handleSubmit}
 *   loading={loading}
 * >
 *   <div className="space-y-4">
 *     <div>
 *       <label htmlFor="title" className="block text-sm font-medium mb-1">
 *         タイトル
 *       </label>
 *       <input
 *         id="title"
 *         name="title"
 *         type="text"
 *         required
 *         className="w-full px-3 py-2 border rounded-lg"
 *       />
 *     </div>
 *     <div>
 *       <label htmlFor="description" className="block text-sm font-medium mb-1">
 *         説明
 *       </label>
 *       <textarea
 *         id="description"
 *         name="description"
 *         rows={4}
 *         className="w-full px-3 py-2 border rounded-lg"
 *       />
 *     </div>
 *   </div>
 * </FormDialog>
 *
 * // React Hook Form との併用
 * const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()
 *
 * <FormDialog
 *   open={open}
 *   onOpenChange={setOpen}
 *   title="ユーザー編集"
 *   submitText="更新"
 *   onSubmit={handleSubmit(onSubmit)}
 *   loading={isSubmitting}
 * >
 *   <div className="space-y-4">
 *     <FormField label="名前" required error={errors.name && "必須項目です"}>
 *       <Input {...register("name", { required: true })} />
 *     </FormField>
 *   </div>
 * </FormDialog>
 * ```
 */
export const FormDialog = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  submitText = "保存",
  cancelText = "キャンセル",
  onSubmit,
  onCancel,
  submitVariant = "primary",
  loading = false,
  disabled = false,
  maxWidth = "lg",
}: FormDialogProps) => {
  const formRef = React.useRef<HTMLFormElement>(null);

  // フォーム送信ハンドラー
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await onSubmit(e);
  };

  // 確定ボタンのクリックハンドラー（form submit をトリガー）
  const handleConfirm = () => {
    formRef.current?.requestSubmit();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      confirmText={submitText}
      cancelText={cancelText}
      onConfirm={handleConfirm}
      onCancel={onCancel}
      confirmVariant={submitVariant}
      confirmLoading={loading}
      maxWidth={maxWidth}
    >
      <form ref={formRef} onSubmit={handleSubmit}>
        <fieldset disabled={disabled || loading}>{children}</fieldset>
      </form>
    </Dialog>
  );
};
