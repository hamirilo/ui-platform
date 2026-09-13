import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AnimatedNavItem } from "./AnimatedNavItem";
import { NavItem } from "./NavItem";

describe("AnimatedNavItem", () => {
  it("NavItem と同じ要素・属性で描き、背景だけを motion 版にする", () => {
    const { getByRole, container } = render(
      <AnimatedNavItem href="/inbox" active activeColor="rose" label="お気に入り" badge={3} />,
    );
    const link = getByRole("link", { name: /お気に入り/ });
    expect(link.getAttribute("aria-current")).toBe("page");

    // 静的な背景は描かない
    expect(container.querySelector('[data-slot="nav-item-indicator"]')).toBeNull();
    const motionIndicator = link.querySelector('div[aria-hidden="true"]');
    expect(motionIndicator?.className).toContain("bg-rose-600/10");
  });

  it("layoutId を DOM 属性へ漏らさない", () => {
    const { getByRole } = render(<AnimatedNavItem active layoutId="sidebar" label="受信トレイ" />);
    expect(getByRole("button").hasAttribute("layoutid")).toBe(false);
  });

  it("button 版の class は NavItem と一致する", () => {
    const animated = render(<AnimatedNavItem label="同じ見た目" />).getByRole("button");
    const plain = render(<NavItem label="同じ見た目" />).getAllByRole("button")[1];
    expect(animated.className).toBe(plain.className);
  });
});
