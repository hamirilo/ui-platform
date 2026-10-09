import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PageSection } from "./PageSection";

describe("PageSection", () => {
  it("見出しは既定で h2 で、節は見出しの名前を持つ", () => {
    render(<PageSection title="チャネル別">本文</PageSection>);
    expect(screen.getByRole("heading", { level: 2, name: "チャネル別" })).toBeTruthy();
    expect(screen.getByRole("region", { name: "チャネル別" })).toBeTruthy();
  });

  it("headingLevel で見出しのレベルを変えられる", () => {
    render(
      <PageSection headingLevel={3} title="ブラウザ">
        本文
      </PageSection>,
    );
    expect(screen.getByRole("heading", { level: 3, name: "ブラウザ" })).toBeTruthy();
  });

  it("description / actions / 本文を描く", () => {
    render(
      <PageSection
        title="配布用URL"
        description="チャネルごとに発行したURL"
        actions={<button type="button">URLを追加</button>}
      >
        <p>本文</p>
      </PageSection>,
    );
    expect(screen.getByText("チャネルごとに発行したURL").className).toContain(
      "cn-page-section-description",
    );
    expect(screen.getByRole("button", { name: "URLを追加" })).toBeTruthy();
    expect(screen.getByText("本文")).toBeTruthy();
  });

  it("divider は data-divider を付け、既定では付けない", () => {
    const { container } = render(
      <>
        <PageSection title="A">a</PageSection>
        <PageSection title="B" divider>
          b
        </PageSection>
      </>,
    );
    const [a, b] = Array.from(container.querySelectorAll(".cn-page-section"));
    expect(a?.hasAttribute("data-divider")).toBe(false);
    expect(b?.hasAttribute("data-divider")).toBe(true);
  });
});
