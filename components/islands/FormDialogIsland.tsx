/**
 * FormDialogIsland - Django テンプレートから宣言的に使えるフォームダイアログ
 *
 * このコンポーネントの責務は「ダイアログ（枠）」だけです。
 * フォームの中身は React では組み立てず、htmx が Django View から取得した
 * HTML（Django テンプレートでレンダリングされたフォーム）をそのまま表示します
 * （ADR-0002 の許可パターン「React Island 内部からの HTML 取得」）。
 *
 * 構成:
 *   [ボタン click]
 *     → React が Dialog を開く
 *       → htmx が data-form-url を GET
 *         → Django View が Django Form を Django テンプレートでレンダリング
 *           → 返ってきた HTML をそのまま Dialog 内に表示（JSON 化しない）
 *
 * フォーム送信も htmx（hx-post）で Django View に送り、
 *   - 成功: サーバが HX-Trigger（既定: application-form-success）で通知 → ダイアログを閉じる
 *   - バリデーションエラー: サーバがエラー付きフォーム HTML を再レンダリング
 *                          → その HTML をそのまま差し替え表示
 *
 * Django テンプレートでの使い方:
 *
 * ```html
 * <div
 *   data-react="form-dialog"
 *   data-id="task-create-dialog"
 *   data-title="新規タスク作成"
 *   data-description="タスクの情報を入力してください。"
 *   data-form-url="{% url 'tasks:create_form' %}"
 * ></div>
 *
 * <button onclick="window.openFormDialog['task-create-dialog']()">新規作成</button>
 * ```
 *
 * Django View（フォーム取得・送信の両方を担当）:
 *
 * ```python
 * def create_form(request):
 *     if request.method == "POST":
 *         form = TaskForm(request.POST)
 *         if form.is_valid():
 *             form.save()
 *             # 成功: htmx にダイアログを閉じてリロードするよう通知
 *             resp = HttpResponse(status=204)
 *             resp["HX-Trigger"] = "application-form-success"
 *             return resp
 *         # バリデーションエラー: フォーム HTML をそのまま返す（エラー表示付き）
 *         return render(request, "tasks/partials/task_form.html", {"form": form})
 *     # GET: 空のフォームを返す
 *     return render(request, "tasks/partials/task_form.html", {"form": TaskForm()})
 * ```
 */

import { useEffect, useState } from "react";
import { Dialog } from "../application/Dialog";
import { toast } from "../application/Toast";
import "./types";

export interface FormDialogIslandProps {
  /**
   * この Island の ID（複数のダイアログを区別するため）
   */
  id?: string;

  /**
   * ダイアログのタイトル
   */
  title: string;

  /**
   * ダイアログの説明文（オプション）
   */
  description?: string;

  /**
   * フォーム HTML を取得する URL（Django View）
   * ダイアログを開いたときに htmx でこの URL を GET し、
   * 返ってきた HTML をそのまま表示します。
   */
  formUrl: string;

  /**
   * ダイアログの最大幅
   * @default "lg"
   */
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";

  /**
   * 送信成功時に発火する htmx イベント名。
   * Django View が HX-Trigger でこのイベント名を返すと、ダイアログを閉じます。
   * @default "application-form-success"
   */
  successEvent?: string;

  /**
   * 送信成功時に表示するトーストメッセージ（オプション）
   * 使う場合は base.html に toast-listener Island を置いてください。
   */
  successMessage?: string;

  /**
   * 送信成功時にページをリロードするか
   * @default true
   */
  reloadOnSuccess?: boolean;

  /**
   * 送信成功時にリダイレクトする URL（オプション）
   * 指定した場合は reloadOnSuccess より優先されます。
   */
  redirectUrl?: string;
}

export function FormDialogIsland({
  id,
  title,
  description,
  formUrl,
  maxWidth = "lg",
  successEvent = "application-form-success",
  successMessage,
  reloadOnSuccess = true,
  redirectUrl,
}: FormDialogIslandProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  /**
   * htmx が取得した Django テンプレートの HTML を差し込むコンテナ。
   *
   * <important>
   * ref オブジェクトではなく state で持つ。ダイアログの中身は Base UI の Portal の
   * 中にあり、`open` が true になった最初のコミットではまだマウントされていない。
   * `useRef` だと下の effect が走る時点で `current` が null で、依存配列
   * `[open, formUrl]` は変わらないまま二度と再実行されず、**中身が空のダイアログが
   * 開いたままになる**。callback ref で state に入れると、Portal の中身が付いた
   * ときに再レンダリングが起きて effect が走り直す。
   * </important>
   */
  const [body, setBody] = useState<HTMLDivElement | null>(null);

  // 開閉トリガーを登録（CustomEvent / window.openFormDialog）
  useEffect(() => {
    const handleOpen = (event: Event) => {
      const customEvent = event as CustomEvent<{ id?: string }>;
      if (customEvent.detail?.id && customEvent.detail.id !== id) {
        return;
      }
      setOpen(true);
    };

    document.addEventListener("open-form-dialog", handleOpen);

    if (id) {
      if (!window.openFormDialog) {
        window.openFormDialog = {};
      }
      window.openFormDialog[id] = () => setOpen(true);
    }

    return () => {
      document.removeEventListener("open-form-dialog", handleOpen);
      if (id && window.openFormDialog) {
        delete window.openFormDialog[id];
      }
    };
  }, [id]);

  // ダイアログを開いたら htmx で Django からフォーム HTML を取得して差し込む
  useEffect(() => {
    if (!open) return;
    const container = body;
    const htmx = window.htmx;
    if (!container || !htmx) return;

    setLoading(true);

    // htmx.ajax: GET でフォーム HTML を取得し、コンテナにそのまま挿入する。
    // レスポンスは Django テンプレートがレンダリングした HTML そのもの（JSON ではない）。
    htmx
      .ajax("GET", formUrl, { target: container, swap: "innerHTML" })
      .then(() => {
        // 挿入した HTML 内の htmx 属性（hx-post 等）を有効化する
        htmx.process(container);
        setLoading(false);
      })
      .catch(() => {
        container.innerHTML =
          '<p class="text-sm text-destructive">フォームの読み込みに失敗しました。</p>';
        setLoading(false);
      });
  }, [open, body, formUrl]);

  // フォーム送信の成否を htmx イベントで受け取る
  useEffect(() => {
    if (!open) return;
    const container = body;
    if (!container) return;

    // 成功イベント（Django View が HX-Trigger で返す）
    const handleSuccess = () => {
      if (successMessage) {
        toast.success(successMessage);
      }
      setOpen(false);
      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else if (reloadOnSuccess) {
        window.location.reload();
      }
    };

    // 送信後の HTML 差し替え（バリデーションエラー時）でも htmx 属性を有効化
    const handleAfterSwap = (event: Event) => {
      const target = (event as CustomEvent).target as HTMLElement;
      if (container.contains(target) || target === container) {
        window.htmx?.process(container);
      }
    };

    // 送信中のローディング表示
    const handleBeforeRequest = (event: Event) => {
      const target = (event as CustomEvent).target as HTMLElement;
      if (container.contains(target)) setLoading(true);
    };
    const handleAfterRequest = (event: Event) => {
      const target = (event as CustomEvent).target as HTMLElement;
      if (container.contains(target)) setLoading(false);
    };

    document.body.addEventListener(successEvent, handleSuccess);
    document.body.addEventListener("htmx:afterSwap", handleAfterSwap);
    document.body.addEventListener("htmx:beforeRequest", handleBeforeRequest);
    document.body.addEventListener("htmx:afterRequest", handleAfterRequest);

    return () => {
      document.body.removeEventListener(successEvent, handleSuccess);
      document.body.removeEventListener("htmx:afterSwap", handleAfterSwap);
      document.body.removeEventListener("htmx:beforeRequest", handleBeforeRequest);
      document.body.removeEventListener("htmx:afterRequest", handleAfterRequest);
    };
  }, [open, body, successEvent, successMessage, reloadOnSuccess, redirectUrl]);

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
      title={title}
      description={description}
      maxWidth={maxWidth}
    >
      {/* React は枠だけ。中身は htmx が Django から取得した HTML をそのまま表示する。
          confirmText / cancelText / footer を渡さないため、フッターは描画されない
          （送信ボタンは Django Form 側の HTML が持つ）。

          <important>
          読み込み表示はコンテナの「外」に置く。同じ要素の子を React と htmx の
          両方が持つと、htmx が innerHTML を入れ替えたあとに React が自分の子を
          消そうとして `removeChild` が失敗する。コンテナの中は htmx だけが触る。
          </important> */}
      {loading && <p className="text-sm text-muted-foreground">読み込み中...</p>}
      <div ref={setBody} className="application-form-dialog-body" />
    </Dialog>
  );
}
