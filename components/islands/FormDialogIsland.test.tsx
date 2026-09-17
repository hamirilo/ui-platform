import { render, screen, waitFor } from "@testing-library/react";
import { act } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FormDialogIsland } from "./FormDialogIsland";
import type { HtmxApi } from "./types";

/** `window.htmx` の最小スタブ。ajax は渡されたコンテナへ HTML を差し込む。 */
function stubHtmx(html = '<form id="loaded"><button type="submit">保存</button></form>') {
  const ajax = vi.fn(async (_verb: string, _path: string, context: { target: HTMLElement }) => {
    context.target.innerHTML = html;
  });
  const htmx: HtmxApi = { ajax, process: vi.fn(), trigger: vi.fn() };
  window.htmx = htmx;
  return { ajax, htmx };
}

function open(id: string) {
  act(() => {
    window.openFormDialog?.[id]?.();
  });
}

describe("FormDialogIsland", () => {
  afterEach(() => {
    window.htmx = undefined;
    vi.restoreAllMocks();
  });

  /**
   * ダイアログの中身は Base UI の Portal の中にあり、`open` が true になった
   * 最初のコミットではまだマウントされていない。取得先のコンテナを ref オブジェクトで
   * 持つと、その時点では null なので取得を諦め、依存配列が変わらないまま再実行されず、
   * 中身が空のダイアログが開いたままになる。
   */
  it("開いたら Portal のマウントを待って htmx でフォームを取得する", async () => {
    const { ajax } = stubHtmx();
    render(<FormDialogIsland id="subject-create" title="対象を登録" formUrl="/subjects/create/" />);

    open("subject-create");

    await waitFor(() => expect(ajax).toHaveBeenCalledTimes(1));
    expect(ajax.mock.calls[0][0]).toBe("GET");
    expect(ajax.mock.calls[0][1]).toBe("/subjects/create/");
    await screen.findByRole("button", { name: "保存" });
  });

  it("取得した HTML の htmx 属性を有効化する", async () => {
    const { htmx } = stubHtmx();
    render(<FormDialogIsland id="subject-create" title="対象を登録" formUrl="/subjects/create/" />);

    open("subject-create");

    await waitFor(() => expect(htmx.process).toHaveBeenCalled());
  });

  it("取得に失敗したら空のままにせず、読み込めなかったことを伝える", async () => {
    const ajax = vi.fn(async () => {
      throw new Error("boom");
    });
    window.htmx = { ajax, process: vi.fn(), trigger: vi.fn() } as unknown as HtmxApi;
    render(<FormDialogIsland id="subject-create" title="対象を登録" formUrl="/subjects/create/" />);

    open("subject-create");

    await screen.findByText("フォームの読み込みに失敗しました。");
  });

  it("成功イベントを受けたらダイアログを閉じる", async () => {
    stubHtmx();
    // 既定の reloadOnSuccess は happy-dom で実装されていないため切る。
    render(
      <FormDialogIsland
        id="subject-create"
        title="対象を登録"
        formUrl="/subjects/create/"
        reloadOnSuccess={false}
      />,
    );

    open("subject-create");
    await screen.findByRole("button", { name: "保存" });

    act(() => {
      document.body.dispatchEvent(new CustomEvent("application-form-success", { bubbles: true }));
    });

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });
});
