import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Rating } from "./Rating";

describe("Rating", () => {
  it("onChange が無ければ表示専用（role=img）で、点数を読み上げに載せる", () => {
    render(<Rating value={3} />);
    const root = screen.getByRole("img");
    expect(root.getAttribute("aria-label")).toBe("評価: 5 段階中 3");
    expect(root.querySelectorAll("button")).toHaveLength(0);
  });

  it("onChange があれば radiogroup になり、押した星を通知する", () => {
    const onChange = vi.fn();
    render(<Rating value={0} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText("5 段階中 4"));
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it("readOnly のときは onChange を渡しても押せる星を作らない", () => {
    const onChange = vi.fn();
    render(<Rating value={2} onChange={onChange} readOnly />);
    expect(screen.queryAllByRole("radio")).toHaveLength(0);
  });

  it("矢印キーで増減する（下限 0 / 上限 max）", () => {
    const onChange = vi.fn();
    const { rerender } = render(<Rating value={5} max={5} onChange={onChange} />);
    fireEvent.keyDown(screen.getByRole("radiogroup"), { key: "ArrowRight" });
    expect(onChange).toHaveBeenLastCalledWith(5);

    rerender(<Rating value={0} max={5} onChange={onChange} />);
    fireEvent.keyDown(screen.getByRole("radiogroup"), { key: "ArrowLeft" });
    expect(onChange).toHaveBeenLastCalledWith(0);
  });

  it("max を超えた分は空の星にする", () => {
    const { container } = render(<Rating value={2} max={5} />);
    expect(container.querySelectorAll(".cn-rating-star")).toHaveLength(5);
    expect(container.querySelectorAll(".cn-rating-star-empty")).toHaveLength(3);
  });

  it("showValue は未評価のとき emptyText を出す", () => {
    render(<Rating value={0} showValue />);
    expect(screen.getByText("未評価")).toBeTruthy();
  });
});
