import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProductSwitcher, type ProductSwitcherItem } from "./ProductSwitcher";

const items: ProductSwitcherItem[] = [
  { key: "alpha", name: "alpha", monogram: "al", description: "一つ目", href: "/", current: true },
  { key: "beta", name: "beta", description: "二つ目", href: "https://beta.example/" },
];

function open() {
  fireEvent.click(screen.getByRole("button", { name: "プロダクトを切り替える" }));
}

describe("ProductSwitcher", () => {
  it("トリガーは既定のラベルを aria-label と title に持つ", () => {
    render(<ProductSwitcher items={items} />);
    const trigger = screen.getByRole("button", { name: "プロダクトを切り替える" });
    expect(trigger.getAttribute("title")).toBe("プロダクトを切り替える");
  });

  it("開くと items を並び順のまま、同じタブで開くリンクとして描く", async () => {
    render(<ProductSwitcher items={items} />);
    open();
    const links = await screen.findAllByRole("link");
    expect(links.map((link) => link.getAttribute("href"))).toEqual(["/", "https://beta.example/"]);
    expect(links.every((link) => !link.hasAttribute("target"))).toBe(true);
  });

  it("現在のプロダクトにだけ aria-current を付ける", async () => {
    render(<ProductSwitcher items={items} />);
    open();
    const [alpha, beta] = await screen.findAllByRole("link");
    expect(alpha.getAttribute("aria-current")).toBe("page");
    expect(beta.hasAttribute("aria-current")).toBe(false);
  });

  it("monogram を省略すると名前の先頭 2 文字を出す", async () => {
    render(<ProductSwitcher items={items} />);
    open();
    const beta = (await screen.findAllByRole("link"))[1];
    expect(beta.textContent).toContain("be");
    expect(beta.textContent).toContain("二つ目");
  });

  it("見出しとラベルを差し替えられ、開閉を通知する", async () => {
    const onOpenChange = vi.fn();
    render(
      <ProductSwitcher
        items={items}
        title="hamirilo のプロダクト"
        caption="切り替え"
        triggerLabel="移動"
        onOpenChange={onOpenChange}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "移動" }));
    expect(await screen.findByText("hamirilo のプロダクト")).toBeTruthy();
    expect(screen.getByRole("navigation", { name: "切り替え" })).toBeTruthy();
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });
});
