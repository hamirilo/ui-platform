import { fireEvent, render } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { NavItem } from "./NavItem";

/* NavItem は framer-motion を import しないことが公開契約（decisions/adr-0008）。
 * 読み込まれた時点でテストファイルごと落ちるようにして、依存が戻ってきたら検知する。 */
vi.mock("framer-motion", () => {
  throw new Error("NavItem が framer-motion を読み込んでいます。AnimatedNavItem へ分けてください");
});

function indicator(container: HTMLElement) {
  return container.querySelector('[data-slot="nav-item-indicator"]');
}

describe("NavItem", () => {
  it("href があれば a 要素になり、active のとき aria-current=page を付ける", () => {
    const { getByRole } = render(<NavItem href="/inbox" active label="受信トレイ" />);
    const link = getByRole("link", { name: "受信トレイ" });
    expect(link.getAttribute("href")).toBe("/inbox");
    expect(link.getAttribute("aria-current")).toBe("page");
  });

  it("非アクティブの a 要素には aria-current を付けない", () => {
    const { getByRole } = render(<NavItem href="/inbox" label="受信トレイ" />);
    expect(getByRole("link").hasAttribute("aria-current")).toBe(false);
  });

  it("href がなければ type=button の button 要素になり、aria-pressed で状態を示す", () => {
    const onClick = vi.fn();
    const { getByRole } = render(<NavItem active label="受信トレイ" onClick={onClick} />);
    const button = getByRole("button", { name: "受信トレイ" });
    expect(button.getAttribute("type")).toBe("button");
    expect(button.getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("active のときだけ装飾用の背景を描き、色の class を渡す", () => {
    const { container, rerender } = render(
      <NavItem href="#" active activeColor="teal" label="教材" />,
    );
    const el = indicator(container);
    expect(el).not.toBeNull();
    expect(el?.tagName).toBe("SPAN");
    expect(el?.getAttribute("aria-hidden")).toBe("true");
    expect(el?.className).toContain("bg-teal-600/10");
    // 既定色の class は tailwind-merge で置き換わり、残らない
    expect(el?.className).not.toContain("bg-primary/10");

    rerender(<NavItem href="#" activeColor="teal" label="教材" />);
    expect(indicator(container)).toBeNull();
  });

  it("layoutId は無視し、DOM 属性へ漏らさない", () => {
    const { getByRole } = render(<NavItem href="#" active layoutId="sidebar" label="受信トレイ" />);
    const link = getByRole("link");
    expect(link.hasAttribute("layoutid")).toBe(false);
    expect(link.hasAttribute("layoutId")).toBe(false);
  });

  it("label がなければ children を表示する", () => {
    const { getByRole } = render(<NavItem href="#">アーカイブ</NavItem>);
    expect(getByRole("link", { name: "アーカイブ" })).toBeTruthy();
  });

  it("badge を表示し、0 も表示する（null / undefined のときだけ出さない）", () => {
    const { getByText, container, rerender } = render(<NavItem href="#" label="受信" badge={0} />);
    expect(getByText("0")).toBeTruthy();

    rerender(<NavItem href="#" label="受信" badge={null} />);
    expect(container.querySelectorAll("a > span")).toHaveLength(1);
  });

  it("ref を描画した要素へ渡す", () => {
    const linkRef = createRef<HTMLAnchorElement | HTMLButtonElement>();
    render(<NavItem ref={linkRef} href="#" label="a" />);
    expect(linkRef.current?.tagName).toBe("A");

    const buttonRef = createRef<HTMLAnchorElement | HTMLButtonElement>();
    render(<NavItem ref={buttonRef} label="b" />);
    expect(buttonRef.current?.tagName).toBe("BUTTON");
  });
});
