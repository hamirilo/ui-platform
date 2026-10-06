import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SearchInput } from "./SearchInput";

describe("SearchInput", () => {
  it("既定ではブラウザの入力履歴を出さない", () => {
    render(<SearchInput aria-label="検索" />);
    expect(screen.getByRole("searchbox", { name: "検索" }).getAttribute("autocomplete")).toBe(
      "off",
    );
  });

  it("利用側で autoComplete を上書きできる", () => {
    render(<SearchInput aria-label="検索" autoComplete="on" />);
    expect(screen.getByRole("searchbox", { name: "検索" }).getAttribute("autocomplete")).toBe("on");
  });
});
