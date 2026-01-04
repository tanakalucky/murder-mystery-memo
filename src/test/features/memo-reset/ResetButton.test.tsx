import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { describe, expect, test, vi } from "vitest";
import { ResetButton } from "../../../react-app/features/memo-reset";

describe("ResetButton", () => {
  test("ボタンが正しくレンダリングされる", () => {
    const onReset = vi.fn();

    render(<ResetButton onReset={onReset} />);

    const button = screen.getByRole("button", { name: "すべてリセット" });
    expect(button).toBeInTheDocument();
  });

  test("ボタンをクリックするとonResetが呼ばれる", async () => {
    const user = userEvent.setup();
    const onReset = vi.fn();

    render(<ResetButton onReset={onReset} />);

    const button = screen.getByRole("button", { name: "すべてリセット" });
    await user.click(button);

    expect(onReset).toHaveBeenCalledTimes(1);
  });

  test("複数回クリックすると複数回onResetが呼ばれる", async () => {
    const user = userEvent.setup();
    const onReset = vi.fn();

    render(<ResetButton onReset={onReset} />);

    const button = screen.getByRole("button", { name: "すべてリセット" });
    await user.click(button);
    await user.click(button);
    await user.click(button);

    expect(onReset).toHaveBeenCalledTimes(3);
  });
});
