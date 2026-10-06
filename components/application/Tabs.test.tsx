import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Tabs } from "./Tabs";

const ITEMS = [
  { value: "overview", label: "概要", content: <p>概要パネル</p> },
  { value: "history", label: "履歴", content: <p>履歴パネル</p> },
];

describe("Tabs", () => {
  it("items の先頭を既定で選ぶ", () => {
    render(<Tabs items={ITEMS} />);
    expect(screen.getByRole("tab", { name: "概要" }).getAttribute("aria-selected")).toBe("true");
    expect(screen.getByText("概要パネル")).toBeTruthy();
  });

  it("disabled の項目は選択不可にする", () => {
    render(
      <Tabs items={[...ITEMS, { value: "x", label: "無効", content: null, disabled: true }]} />,
    );
    const disabled = screen.getByRole("tab", { name: "無効" });
    expect(
      disabled.hasAttribute("disabled") || disabled.getAttribute("aria-disabled") === "true",
    ).toBe(true);
  });

  // 以下 2 件は primitive が持つ表現を wrapper が塞がないことの回帰テスト。
  // items API を足す代わりに variant / orientation を落としていた時期があるため残す。
  it("variant を TabsList へ通す", () => {
    const { container } = render(<Tabs items={ITEMS} variant="line" />);
    expect(container.querySelector('[data-slot="tabs-list"]')?.getAttribute("data-variant")).toBe(
      "line",
    );
  });

  it("orientation を root へ通す", () => {
    const { container } = render(<Tabs items={ITEMS} orientation="vertical" />);
    expect(container.querySelector('[data-slot="tabs"]')?.getAttribute("data-orientation")).toBe(
      "vertical",
    );
  });
});
