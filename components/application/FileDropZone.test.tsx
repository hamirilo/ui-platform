import { fireEvent, render, screen } from "@testing-library/react";
import * as React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FileDropZone } from "./FileDropZone";

const file = (name: string, size: number, type = "application/pdf") => {
  const f = new File(["x".repeat(size)], name, { type });
  return f;
};

function drop(zone: HTMLElement, files: File[]) {
  fireEvent.drop(zone, { dataTransfer: { files } });
}

/** happy-dom に DataTransfer が無い場合の最小スタブ */
class DataTransferStub {
  private list: File[] = [];
  items = { add: (f: File) => this.list.push(f) };
  get files() {
    return this.list as unknown as FileList;
  }
}

/** 実際の使い方どおり、親が files を state で持つ */
function Stateful(props: { name?: string; multiple?: boolean; accept?: string }) {
  const [files, setFiles] = React.useState<File[]>([]);
  return <FileDropZone files={files} onFilesChange={setFiles} {...props} />;
}

describe("FileDropZone", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("ドロップしたファイルを onFilesChange に渡す", () => {
    const onFilesChange = vi.fn();
    const { container } = render(<FileDropZone onFilesChange={onFilesChange} />);
    drop(container.firstElementChild as HTMLElement, [file("a.pdf", 10)]);
    expect(onFilesChange).toHaveBeenCalledTimes(1);
    expect(onFilesChange.mock.calls[0][0].map((f: File) => f.name)).toEqual(["a.pdf"]);
  });

  it("maxSize を超えるものは弾き、理由を role=alert で出す", () => {
    const onFilesChange = vi.fn();
    const { container } = render(
      <FileDropZone onFilesChange={onFilesChange} maxSize={100} multiple />,
    );
    drop(container.firstElementChild as HTMLElement, [file("big.pdf", 200), file("ok.pdf", 50)]);
    expect(screen.getByRole("alert").textContent).toContain("big.pdf");
    expect(onFilesChange.mock.calls[0][0].map((f: File) => f.name)).toEqual(["ok.pdf"]);
  });

  it("accept に合わない種類は弾く（拡張子・MIME ワイルドカード）", () => {
    const onFilesChange = vi.fn();
    const { container } = render(
      <FileDropZone onFilesChange={onFilesChange} accept=".pdf,image/*" multiple />,
    );
    drop(container.firstElementChild as HTMLElement, [
      file("doc.pdf", 10),
      file("photo.png", 10, "image/png"),
      file("memo.txt", 10, "text/plain"),
    ]);
    expect(screen.getByRole("alert").textContent).toContain("memo.txt");
    expect(onFilesChange.mock.calls[0][0].map((f: File) => f.name)).toEqual([
      "doc.pdf",
      "photo.png",
    ]);
  });

  it("multiple でないときは 1 件だけにする", () => {
    const onFilesChange = vi.fn();
    const { container } = render(<FileDropZone onFilesChange={onFilesChange} />);
    drop(container.firstElementChild as HTMLElement, [file("a.pdf", 1), file("b.pdf", 1)]);
    expect(onFilesChange.mock.calls[0][0]).toHaveLength(1);
    expect(screen.getByRole("alert").textContent).toContain("1 件");
  });

  it("選択済み一覧の削除で残りを onFilesChange に渡す", () => {
    const onFilesChange = vi.fn();
    render(
      <FileDropZone
        files={[file("a.pdf", 1), file("b.pdf", 1)]}
        onFilesChange={onFilesChange}
        multiple
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "a.pdf を削除" }));
    expect(onFilesChange.mock.calls[0][0].map((f: File) => f.name)).toEqual(["b.pdf"]);
  });

  it("onBrowse 省略時は選んだファイルを内部の input.files に保つ（form 送信に載る）", () => {
    if (typeof globalThis.DataTransfer === "undefined")
      vi.stubGlobal("DataTransfer", DataTransferStub);
    const { container } = render(<Stateful name="attachment" accept=".pdf" multiple />);
    const input = container.querySelector<HTMLInputElement>(
      'input[type="file"]',
    ) as HTMLInputElement;
    let written: FileList | null = null;
    Object.defineProperty(input, "files", {
      configurable: true,
      get: () => written ?? ([] as unknown as FileList),
      set: (value: FileList) => {
        written = value;
      },
    });

    // 受け付けるものと弾くものを同時に選ぶ
    written = [file("a.pdf", 10), file("memo.txt", 10, "text/plain")] as unknown as FileList;
    fireEvent.change(input);

    expect(screen.getByText("a.pdf")).toBeTruthy();
    const names = () => Array.from(written as unknown as File[]).map((f) => f.name);
    expect(names()).toEqual(["a.pdf"]);

    // 一覧から削除すると input からも消える
    fireEvent.click(screen.getByRole("button", { name: "a.pdf を削除" }));
    expect(names()).toEqual([]);
  });

  it("onBrowse を渡すと内部の input を描かず、選択ボタンで onBrowse を呼ぶ", () => {
    const onBrowse = vi.fn();
    const { container } = render(<FileDropZone onFilesChange={() => {}} onBrowse={onBrowse} />);
    expect(container.querySelector('input[type="file"]')).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "ファイルを選択" }));
    expect(onBrowse).toHaveBeenCalledTimes(1);
  });

  it("枠のどこを押しても選択を開く（ボタン以外の見出し・アイコンの上でも）", () => {
    const onBrowse = vi.fn();
    render(<FileDropZone onFilesChange={() => {}} onBrowse={onBrowse} />);
    fireEvent.click(screen.getByText("ここにファイルをドロップ"));
    expect(onBrowse).toHaveBeenCalledTimes(1);
  });

  it("ボタンを押したときは枠のクリックと二重に開かない", () => {
    const onBrowse = vi.fn();
    render(<FileDropZone onFilesChange={() => {}} onBrowse={onBrowse} />);
    fireEvent.click(screen.getByRole("button", { name: "ファイルを選択" }));
    expect(onBrowse).toHaveBeenCalledTimes(1);
  });

  it("内部 input のときも枠のクリックで input を 1 回だけ開く", () => {
    const { container } = render(<FileDropZone onFilesChange={() => {}} />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const opened = vi.fn();
    input.addEventListener("click", opened);
    fireEvent.click(screen.getByText("ここにファイルをドロップ"));
    expect(opened).toHaveBeenCalledTimes(1);
  });

  it("disabled のときは枠を押しても開かない", () => {
    const onBrowse = vi.fn();
    render(<FileDropZone onFilesChange={() => {}} onBrowse={onBrowse} disabled />);
    fireEvent.click(screen.getByText("ここにファイルをドロップ"));
    expect(onBrowse).not.toHaveBeenCalled();
  });

  it("枠はフォーカスを取らない（キーボードの入口はボタンだけ）", () => {
    const { container } = render(<FileDropZone onFilesChange={() => {}} />);
    const area = container.querySelector(".cn-file-drop-zone-area") as HTMLElement;
    expect(area.hasAttribute("tabindex")).toBe(false);
  });
});
