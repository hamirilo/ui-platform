import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Stat, StatGroup } from "./Stat";

describe("Stat", () => {
  it("ラベル・値・単位を描く", () => {
    render(<Stat label="未対応" value="12" unit="件" />);
    expect(screen.getByText("未対応")).toBeTruthy();
    expect(screen.getByText("12")).toBeTruthy();
    expect(screen.getByText("件").className).toContain("cn-stat-unit");
  });

  it.each([
    ["neutral", "cn-stat-delta-neutral"],
    ["positive", "cn-stat-delta-positive"],
    ["negative", "cn-stat-delta-negative"],
    ["warning", "cn-stat-delta-warning"],
  ] as const)("tone=%s は delta に %s を付ける", (tone, cls) => {
    render(<Stat label="件数" value="1" delta="+1" tone={tone} />);
    expect(screen.getByText("+1").className).toContain(cls);
  });

  it("delta / hint が無ければ描かない", () => {
    const { container } = render(<Stat label="件数" value="1" />);
    expect(container.querySelector(".cn-stat-delta")).toBeNull();
    expect(container.querySelector(".cn-stat-hint")).toBeNull();
  });

  it('size="lg" は data-size を付け、既定では付けない', () => {
    const { container } = render(
      <>
        <Stat label="主指標" value="57" size="lg" />
        <Stat label="補助" value="64" />
      </>,
    );
    const [lg, normal] = Array.from(container.querySelectorAll(".cn-stat"));
    expect(lg?.getAttribute("data-size")).toBe("lg");
    expect(normal?.hasAttribute("data-size")).toBe(false);
  });
});

describe("StatGroup", () => {
  it("子の Stat を cn-stat-group の直下に並べる", () => {
    const { container } = render(
      <StatGroup aria-label="集計">
        <Stat size="lg" label="ユニーク" value="57" />
        <Stat label="総クリック" value="64" />
      </StatGroup>,
    );
    const group = container.querySelector(".cn-stat-group");
    expect(group?.getAttribute("aria-label")).toBe("集計");
    const children = Array.from(group?.children ?? []);
    expect(children).toHaveLength(2);
    expect(children.every((el) => el.classList.contains("cn-stat"))).toBe(true);
  });
});
