/**
 * FileDropZone - ファイルの選択とドラッグ＆ドロップ
 *
 * 「ここにファイルをドロップ / ファイルを選択」の枠、選択済みファイルの一覧と削除、
 * 種類・サイズ・件数の事前チェックを 1 つにまとめたもの。アップロードそのものは行わない
 * （フォーム送信か、呼び出し側の fetch に任せる）。
 *
 * <important>
 * - サイズ超過・種類違いは選択した瞬間に部品内（role="alert"）で伝え、`onFilesChange` には
 *   合格したファイルだけを渡す。サーバーで弾かれるまで待たせない。
 * - Django の `<input type="file">` と組み合わせるときは `onBrowse` を渡して内部 input を描かない。
 *   name の重複を避けるため（Islands の `file-drop-zone` がこの形を使う）。
 * - 選択済み一覧の削除は `onFilesChange` に残りを渡すだけ。親が `files` を持つ制御コンポーネント。
 * - 枠のどこを押しても選択が開く（ボタンと同じ処理）。キーボードの入口はボタンだけにしてある。
 * </important>
 */

import { FileIcon, Upload, X } from "lucide-react";
import * as React from "react";
import { cn } from "../../lib/utils";
import { Button } from "./Button";

export interface FileDropZoneProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "onChange" | "onDrop"> {
  /** 選択済みのファイル（制御） */
  files?: File[];

  /** 選択・ドロップ・削除の結果。合格したファイルだけが入る */
  onFilesChange: (files: File[]) => void;

  /** 受け付ける種類（`<input accept>` と同じ書式。`.pdf,image/*` 等） */
  accept?: string;

  /**
   * 複数選択を許すか
   * @default false
   */
  multiple?: boolean;

  /** 1 ファイルの上限（バイト） */
  maxSize?: number;

  /** ファイル数の上限（multiple のとき） */
  maxFiles?: number;

  /** 内部 input の name（React のフォームで素直に送るとき） */
  name?: string;

  /**
   * 「ファイルを選択」が押されたときの処理。渡すと内部の `<input type="file">` を描かない
   * （Django の input を使うとき）
   */
  onBrowse?: () => void;

  disabled?: boolean;

  /** 外から渡すエラー状態（FormField の error と連動） */
  error?: boolean;

  /**
   * 枠内の見出し
   * @default "ここにファイルをドロップ"
   */
  label?: React.ReactNode;

  /** 枠内の補足（受け付ける種類・上限など） */
  description?: React.ReactNode;

  /**
   * 選択ボタンの文言
   * @default "ファイルを選択"
   */
  browseLabel?: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function matchesAccept(file: File, accept?: string): boolean {
  if (!accept) return true;
  const rules = accept
    .split(",")
    .map((rule) => rule.trim().toLowerCase())
    .filter(Boolean);
  if (!rules.length) return true;
  const name = file.name.toLowerCase();
  const type = (file.type || "").toLowerCase();
  return rules.some((rule) => {
    if (rule.startsWith(".")) return name.endsWith(rule);
    if (rule.endsWith("/*")) return type.startsWith(rule.slice(0, -1));
    return type === rule;
  });
}

/**
 * FileDropZone コンポーネント
 *
 * @example
 * ```tsx
 * const [files, setFiles] = useState<File[]>([]);
 *
 * <FileDropZone
 *   files={files}
 *   onFilesChange={setFiles}
 *   accept=".pdf,image/*"
 *   multiple
 *   maxSize={10 * 1024 * 1024}
 *   description="PDF または画像。1 ファイル 10MB まで"
 * />
 * ```
 */
export const FileDropZone = React.forwardRef<HTMLDivElement, FileDropZoneProps>(
  (
    {
      files = [],
      onFilesChange,
      accept,
      multiple = false,
      maxSize,
      maxFiles,
      name,
      onBrowse,
      disabled = false,
      error = false,
      label = "ここにファイルをドロップ",
      description,
      browseLabel = "ファイルを選択",
      className,
      ...props
    },
    ref,
  ) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [dragging, setDragging] = React.useState(false);
    const [rejections, setRejections] = React.useState<string[]>([]);

    // 内部の input（onBrowse 省略時）はそのまま form の送信対象になる。
    // 表示している一覧と input.files を常に一致させ、事前チェックで弾いたものや
    // 一覧から削除したものが送信されない・選んだものが消えないようにする。
    // 空にすれば value も空になるので、削除後に同じファイルをもう一度選べる。
    React.useEffect(() => {
      const input = inputRef.current;
      if (!input || onBrowse || typeof DataTransfer === "undefined") return;
      const transfer = new DataTransfer();
      for (const file of files) transfer.items.add(file);
      input.files = transfer.files;
    }, [files, onBrowse]);

    const handleIncoming = (incoming: File[]) => {
      if (disabled || !incoming.length) return;
      const reasons: string[] = [];
      const accepted: File[] = [];
      for (const file of incoming) {
        if (!matchesAccept(file, accept)) {
          reasons.push(`${file.name}: この種類のファイルは受け付けられません`);
          continue;
        }
        if (maxSize !== undefined && file.size > maxSize) {
          reasons.push(
            `${file.name}: サイズが上限（${formatBytes(maxSize)}）を超えています（${formatBytes(file.size)}）`,
          );
          continue;
        }
        accepted.push(file);
      }

      let next: File[];
      if (multiple) {
        next = [...files, ...accepted];
        if (maxFiles !== undefined && next.length > maxFiles) {
          const overflow = next.length - maxFiles;
          reasons.push(`ファイルは ${maxFiles} 件までです（${overflow} 件を除外しました）`);
          next = next.slice(0, maxFiles);
        }
      } else {
        next = accepted.length ? [accepted[0]] : files;
        if (accepted.length > 1) reasons.push("1 件だけ選べます。最初のファイルを使います");
      }

      setRejections(reasons);
      if (accepted.length) onFilesChange(next);
    };

    const removeAt = (index: number) => {
      setRejections([]);
      onFilesChange(files.filter((_, i) => i !== index));
    };

    const browse = () => {
      if (disabled) return;
      if (onBrowse) onBrowse();
      else inputRef.current?.click();
    };

    return (
      <div
        ref={ref}
        className={cn("cn-file-drop-zone", className)}
        data-dragging={dragging || undefined}
        data-disabled={disabled || undefined}
        aria-invalid={error || undefined}
        onDragOver={(event) => {
          if (disabled) return;
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          handleIncoming(Array.from(event.dataTransfer?.files ?? []));
        }}
        {...props}
      >
        {/* 点線の枠は押せそうに見えるので、枠のどこを押しても選択を開く（ボタンだけだと空振りになる）。
            キーボードはボタンが受け持つので、枠はフォーカスを取らない（Tab で 2 回止まらない）。 */}
        <div
          className="cn-file-drop-zone-area"
          onClick={(event) => {
            // ボタンは自分で browse を呼ぶ。input は browse が送った click の伝播。どちらも二重に開かない
            if ((event.target as HTMLElement).closest("button, input")) return;
            browse();
          }}
        >
          <Upload aria-hidden="true" className="cn-file-drop-zone-icon" />
          <div className="cn-file-drop-zone-text">
            <p className="cn-file-drop-zone-label">{label}</p>
            {description && <p className="cn-file-drop-zone-description">{description}</p>}
          </div>
          <Button type="button" variant="secondary" size="sm" onClick={browse} disabled={disabled}>
            {browseLabel}
          </Button>
          {!onBrowse && (
            <input
              ref={inputRef}
              type="file"
              name={name}
              accept={accept}
              multiple={multiple}
              disabled={disabled}
              tabIndex={-1}
              className="sr-only"
              onChange={(event) => handleIncoming(Array.from(event.target.files ?? []))}
            />
          )}
        </div>

        {rejections.length > 0 && (
          <ul className="cn-file-drop-zone-error" role="alert">
            {rejections.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        )}

        {files.length > 0 && (
          <ul className="cn-file-drop-zone-list">
            {files.map((file, index) => (
              <li key={`${file.name}-${file.size}-${index}`} className="cn-file-drop-zone-item">
                <FileIcon aria-hidden="true" className="cn-file-drop-zone-item-icon" />
                <span className="cn-file-drop-zone-item-name">{file.name}</span>
                <span className="cn-file-drop-zone-item-size">{formatBytes(file.size)}</span>
                {!disabled && (
                  <button
                    type="button"
                    className="cn-file-drop-zone-remove"
                    aria-label={`${file.name} を削除`}
                    onClick={() => removeAt(index)}
                  >
                    <X aria-hidden="true" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  },
);

FileDropZone.displayName = "FileDropZone";
