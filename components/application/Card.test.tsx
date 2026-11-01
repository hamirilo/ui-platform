import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./index";

function rule(container: HTMLElement) {
  return container.querySelector<HTMLElement>('[data-slot="card-title-rule"]');
}

describe("Card", () => {
  it("titleRule は既定で描かない", () => {
    const { container } = render(
      <Card>
        <CardHeader>
          <CardTitle>見出し</CardTitle>
        </CardHeader>
      </Card>,
    );
    expect(rule(container)).toBeNull();
  });

  it("titleRule は見出しの直後に罫線を描く", () => {
    const { container } = render(
      <Card titleRule="neutral">
        <CardHeader>
          <CardTitle>見出し</CardTitle>
        </CardHeader>
        <CardContent>本文</CardContent>
      </Card>,
    );
    const el = rule(container);
    expect(el?.dataset.variant).toBe("neutral");
    expect(el?.previousElementSibling?.getAttribute("data-slot")).toBe("card-header");
    expect(el?.getAttribute("aria-hidden")).toBe("true");
  });

  it("accent は accentColor を --card-rule-color に渡す", () => {
    const { container } = render(
      <Card titleRule="accent" accentColor="var(--color-warning)">
        <CardHeader>
          <CardTitle>見出し</CardTitle>
        </CardHeader>
      </Card>,
    );
    const el = rule(container);
    expect(el?.dataset.variant).toBe("accent");
    expect(el?.style.getPropertyValue("--card-rule-color")).toBe("var(--color-warning)");
  });

  it("accentColor を省くと style を持たない（CSS の既定 --color-primary を使う）", () => {
    const { container } = render(
      <Card titleRule="accent">
        <CardHeader>
          <CardTitle>見出し</CardTitle>
        </CardHeader>
      </Card>,
    );
    expect(rule(container)?.getAttribute("style")).toBeNull();
  });

  it("CardHeader がなければ titleRule を無視する", () => {
    const { container } = render(
      <Card titleRule="accent">
        <CardContent>本文</CardContent>
      </Card>,
    );
    expect(rule(container)).toBeNull();
  });

  it("footerVariant='band' はフッターを帯にし、既定では付けない", () => {
    const { rerender } = render(
      <Card>
        <CardFooter>注記</CardFooter>
      </Card>,
    );
    expect(screen.getByText("注記").dataset.variant).toBeUndefined();

    rerender(
      <Card footerVariant="band">
        <CardFooter>注記</CardFooter>
      </Card>,
    );
    const footer = screen.getByText("注記");
    expect(footer.dataset.variant).toBe("band");
    expect(footer.className).toContain("cn-card-footer-band");
  });
});
