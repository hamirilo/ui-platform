import { act, fireEvent, render, screen, within } from "@testing-library/react";
import type * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { ScopeSearch, type ScopeSearchItem } from "./ScopeSearch";

const ITEMS: ScopeSearchItem[] = [
  {
    value: "10024",
    kind: "社員",
    label: "青木 里佐",
    description: "首都圏営業部 課長",
    keywords: "あおき りさ 10024",
  },
  {
    value: "10166",
    kind: "社員",
    label: "杉山 直美",
    description: "情報システム部 課長",
    keywords: "すぎやま なおみ 10166",
  },
  {
    value: "d1",
    kind: "部署",
    label: "首都圏営業部",
    description: "営業本部 ・ 42 名",
    keywords: "しゅとけんえいぎょうぶ",
  },
  {
    value: "s1",
    kind: "拠点",
    label: "本社（東京）",
    description: "東京都中央区",
    keywords: "ほんしゃ とうきょう",
  },
];

function open(props: Partial<React.ComponentProps<typeof ScopeSearch>> = {}) {
  const result = render(
    <ScopeSearch items={ITEMS} placeholder="社員・部署・拠点を検索" {...props} />,
  );
  const input = screen.getByRole("combobox");
  fireEvent.focus(input);
  return { ...result, input };
}

function type(input: HTMLElement, value: string) {
  fireEvent.change(input, { target: { value } });
}

/* パネルは呼び出し側の overflow: hidden で切れないよう portal で DOM の外へ出している。
 * DOM 上の親子関係に頼っていた「内側か」の判定と Tab の順路が壊れやすいので固定する。 */
describe("ScopeSearch（パネルの描画先）", () => {
  it("パネルは入力欄の DOM の外（document.body）へ描く", () => {
    const { container } = open();
    const listbox = screen.getByRole("listbox");
    expect(container.contains(listbox)).toBe(false);
    expect(document.body.contains(listbox)).toBe(true);
  });

  it("portalContainer を渡すとそこへ描く", () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const { unmount } = open({ portalContainer: host });
    expect(host.contains(screen.getByRole("listbox"))).toBe(true);
    unmount();
    host.remove();
  });

  it("パネル内の mousedown では閉じない", () => {
    open({ recentValues: ["s1"] });
    fireEvent.mouseDown(screen.getByRole("listbox"));
    expect(screen.getByRole("listbox")).toBeTruthy();
  });

  it("Tab で種別チップへ入り、Shift+Tab で入力欄へ戻る（パネルは閉じない）", () => {
    const { input } = open();
    act(() => input.focus());

    fireEvent.keyDown(input, { key: "Tab" });
    expect(document.activeElement?.textContent).toBe("すべて");
    expect(screen.getByRole("listbox")).toBeTruthy();

    fireEvent.keyDown(document.activeElement as HTMLElement, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(input);
    expect(screen.getByRole("listbox")).toBeTruthy();
  });

  it("パネルの最後から Tab で、ページ上の次の要素へ進んで閉じる", () => {
    render(
      <>
        <ScopeSearch items={ITEMS} placeholder="検索" />
        <button type="button">次の要素</button>
      </>,
    );
    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    act(() => input.focus());

    fireEvent.keyDown(input, { key: "Tab" });
    fireEvent.keyDown(document.activeElement as HTMLElement, { key: "Tab" });
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "次の要素" }));
    expect(screen.queryByRole("listbox")).toBeNull();
  });
});

describe("ScopeSearch", () => {
  it("フォーカスするまでパネルを開かない", () => {
    render(<ScopeSearch items={ITEMS} placeholder="検索" />);
    expect(screen.queryByRole("listbox")).toBeNull();
    fireEvent.focus(screen.getByRole("combobox"));
    expect(screen.getByRole("listbox")).toBeTruthy();
  });

  it("空欄のときは recentValues の順で最近見た項目を出す", () => {
    open({ recentValues: ["s1", "10024"] });
    const options = screen.getAllByRole("option");
    expect(options.map((el) => el.textContent)).toEqual([
      "本社（東京）東京都中央区拠点",
      "青木 里佐首都圏営業部 課長社員",
    ]);
    expect(screen.getByText("最近見た項目")).toBeTruthy();
  });

  it("空欄で出す候補が無いときは案内文を出す（空のパネルにしない）", () => {
    open();
    expect(screen.getByText("キーワードを入力すると候補が出ます")).toBeTruthy();
  });

  it("入力すると種別ごとに見出しと件数を付けて出す", () => {
    const { input } = open();
    type(input, "首都圏");
    const list = within(screen.getByRole("listbox"));
    // 社員（青木・所属が首都圏営業部）と 部署（首都圏営業部）で 2 グループ
    expect(list.getAllByRole("group")).toHaveLength(2);
    expect(list.getAllByText("1 件")).toHaveLength(2);
    // フッターには合計が出る
    expect(screen.getByText("2 件")).toBeTruthy();
  });

  it("kinds を渡すとその順にグループを並べる", () => {
    const { input } = open({ kinds: ["部署", "社員", "拠点"] });
    type(input, "首都圏");
    const headings = within(screen.getByRole("listbox"))
      .getAllByRole("group")
      .map((el) => el.querySelector("span")?.textContent);
    expect(headings).toEqual(["部署", "社員"]);
  });

  it("keywords でかな・社員番号から引ける", () => {
    const { input } = open();
    type(input, "すぎやま");
    expect(screen.getAllByRole("option").map((el) => el.textContent?.slice(0, 5))).toEqual([
      "杉山 直美",
    ]);

    type(input, "10024");
    expect(screen.getAllByRole("option")).toHaveLength(1);
    expect(screen.getByRole("option").textContent).toContain("青木 里佐");
  });

  it("種別チップで絞り込める", () => {
    const onScopeChange = vi.fn();
    const { input } = open({ onScopeChange });
    type(input, "首都圏");
    expect(screen.getAllByRole("option")).toHaveLength(2);

    fireEvent.click(screen.getByRole("button", { name: "部署" }));
    expect(onScopeChange).toHaveBeenCalledWith("部署");
    expect(screen.getAllByRole("option")).toHaveLength(1);
    expect(screen.getByRole("option").textContent).toContain("首都圏営業部");
  });

  it("↑↓ でカーソルが動き、Enter で決定する", () => {
    const onSelect = vi.fn();
    const { input } = open({ onSelect });
    type(input, "首都圏");

    const [first, second] = screen.getAllByRole("option");
    expect(first?.getAttribute("aria-selected")).toBe("true");
    expect(input.getAttribute("aria-activedescendant")).toBe(first?.id);

    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(screen.getAllByRole("option")[1]?.getAttribute("aria-selected")).toBe("true");
    expect(input.getAttribute("aria-activedescendant")).toBe(second?.id);

    fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(screen.getAllByRole("option")[0]?.getAttribute("aria-selected")).toBe("true");

    fireEvent.keyDown(input, { key: "Enter" });
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls[0]?.[0].value).toBe("10024");
  });

  it("↑↓ は端で止まる（先頭より上・末尾より下へ行かない）", () => {
    const { input } = open();
    type(input, "首都圏");
    fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(screen.getAllByRole("option")[0]?.getAttribute("aria-selected")).toBe("true");
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(screen.getAllByRole("option")[1]?.getAttribute("aria-selected")).toBe("true");
  });

  it("入力を変えるとカーソルが先頭へ戻る（Enter が前の行を選ばない）", () => {
    const onSelect = vi.fn();
    const { input } = open({ onSelect });
    type(input, "課長");
    fireEvent.keyDown(input, { key: "ArrowDown" });
    type(input, "本社");
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onSelect.mock.calls[0]?.[0].value).toBe("s1");
  });

  it("クリックで決定し、入力欄に決定内容を残してパネルを閉じる", () => {
    const onSelect = vi.fn();
    const onQueryChange = vi.fn();
    const { input } = open({ onSelect, onQueryChange });
    type(input, "本社");
    fireEvent.click(screen.getByRole("option"));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onQueryChange).toHaveBeenLastCalledWith("本社（東京）");
    expect((input as HTMLInputElement).value).toBe("本社（東京）");
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("Escape で閉じる", () => {
    const { input } = open({ recentValues: ["s1"] });
    expect(screen.getByRole("listbox")).toBeTruthy();
    fireEvent.keyDown(input, { key: "Escape" });
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("外側の mousedown で閉じる", () => {
    open({ recentValues: ["s1"] });
    expect(screen.getByRole("listbox")).toBeTruthy();
    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("ヒット 0 件のときは文言と次の一手を出す", () => {
    const { input } = open({ emptySubMessage: "種別を「すべて」に戻して試してください" });
    type(input, "存在しない語");
    expect(screen.getByText("「存在しない語」に一致する項目がありません")).toBeTruthy();
    expect(screen.getByText("種別を「すべて」に戻して試してください")).toBeTruthy();
    expect(screen.queryAllByRole("option")).toHaveLength(0);
  });

  it('filterMode="none" では文字で絞らず items をそのまま出す（サーバー検索用）', () => {
    const { input } = open({ filterMode: "none" });
    type(input, "サーバーが解釈する語");
    expect(screen.getAllByRole("option")).toHaveLength(ITEMS.length);
  });

  it('filterMode="none" でも種別チップは効く', () => {
    const { input } = open({ filterMode: "none", defaultScope: "社員" });
    type(input, "何でも");
    expect(screen.getAllByRole("option")).toHaveLength(2);
  });

  it("loading のあいだは検索中を出す", () => {
    const { input } = open({ loading: true, filterMode: "none" });
    type(input, "あ");
    expect(screen.getByText("検索中")).toBeTruthy();
    expect(screen.queryByText("一致する項目がありません")).toBeNull();
  });

  it("query を制御すると親が渡した値だけが表示される", () => {
    const onQueryChange = vi.fn();
    render(
      <ScopeSearch items={ITEMS} placeholder="検索" query="本社" onQueryChange={onQueryChange} />,
    );
    const input = screen.getByRole("combobox") as HTMLInputElement;
    fireEvent.focus(input);
    expect(input.value).toBe("本社");

    type(input, "大阪");
    expect(onQueryChange).toHaveBeenCalledWith("大阪");
    // 親が query を更新しない限り表示は変わらない
    expect(input.value).toBe("本社");
  });

  /* kind は呼び出し側が自由に決める値なので、チップの内部 ID と衝突してはいけない。
   * 以前は kind をそのままチップの value にしていたため、kind: "__all__" の候補が
   * あるとその種別だけに絞れず、React の key も衝突していた。 */
  it("予約値のように見える kind でもその種別だけに絞れる", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <ScopeSearch
        items={[
          { value: "a", kind: "all", label: "予約 ID と同じ種別", description: "共通" },
          { value: "b", kind: "__all__", label: "旧予約値と同じ種別", description: "共通" },
          { value: "c", kind: "社員", label: "青木 里佐", description: "共通" },
        ]}
        placeholder="検索"
      />,
    );
    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    type(input, "共通");
    expect(screen.getAllByRole("option")).toHaveLength(3);

    for (const [kind, expected] of [
      ["all", "予約 ID と同じ種別"],
      ["__all__", "旧予約値と同じ種別"],
    ] as const) {
      fireEvent.click(screen.getByRole("button", { name: kind }));
      const options = screen.getAllByRole("option");
      expect(options).toHaveLength(1);
      expect(options[0]?.textContent).toContain(expected);
      // 押したチップだけが押下状態になる
      const pressed = screen
        .getAllByRole("button")
        .filter((button) => button.getAttribute("aria-pressed") === "true")
        .map((button) => button.textContent);
      expect(pressed).toEqual([kind]);
    }

    // 「すべて」に戻せる
    fireEvent.click(screen.getByRole("button", { name: "すべて" }));
    expect(screen.getAllByRole("option")).toHaveLength(3);

    // key 衝突などの警告を出していない
    expect(error).not.toHaveBeenCalled();
    error.mockRestore();
  });

  it("kinds に無い kind で絞っているときは「すべて」を押下状態にしない", () => {
    render(
      <ScopeSearch
        items={ITEMS}
        kinds={["社員", "部署"]}
        scope="拠点"
        defaultQuery="本社"
        placeholder="検索"
      />,
    );
    fireEvent.focus(screen.getByRole("combobox"));
    // 拠点で絞られている（社員の所属に「本社」を含む候補は出ない）
    expect(screen.getAllByRole("option")).toHaveLength(1);
    expect(screen.getByRole("option").textContent).toContain("本社（東京）");
    const pressed = screen
      .getAllByRole("button")
      .filter((button) => button.getAttribute("aria-pressed") === "true");
    expect(pressed).toHaveLength(0);
  });

  it("種別が1つしかないときは種別チップを出さない", () => {
    const single = ITEMS.filter((item) => item.kind === "社員");
    render(<ScopeSearch items={single} placeholder="検索" />);
    fireEvent.focus(screen.getByRole("combobox"));
    expect(screen.queryByRole("button", { name: "すべて" })).toBeNull();
  });

  it("disabled ではパネルを開かない", () => {
    render(<ScopeSearch items={ITEMS} placeholder="検索" disabled />);
    fireEvent.focus(screen.getByRole("combobox"));
    expect(screen.queryByRole("listbox")).toBeNull();
  });
});
