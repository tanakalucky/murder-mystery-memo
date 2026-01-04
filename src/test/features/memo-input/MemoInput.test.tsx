import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { describe, expect, test, vi } from "vitest";
import { MemoInput } from "../../../react-app/features/memo-input";

describe("MemoInput", () => {
  test("入力欄にテキストを入力できる", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();

    render(<MemoInput onAdd={onAdd} />);

    const input = screen.getByPlaceholderText("メモを入力してEnterキーで追加...");
    await user.type(input, "テストメモ");

    expect(input).toHaveValue("テストメモ");
  });

  test("Enterキーを押すとメモが追加される", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();

    render(<MemoInput onAdd={onAdd} />);

    const input = screen.getByPlaceholderText("メモを入力してEnterキーで追加...");
    await user.type(input, "新しいメモ");
    await user.keyboard("{Enter}");

    expect(onAdd).toHaveBeenCalledWith("新しいメモ");
    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  test("メモ追加後に入力欄がクリアされる", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();

    render(<MemoInput onAdd={onAdd} />);

    const input = screen.getByPlaceholderText("メモを入力してEnterキーで追加...");
    await user.type(input, "クリアされるメモ");
    await user.keyboard("{Enter}");

    expect(input).toHaveValue("");
  });

  test("空文字列は追加されない", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();

    render(<MemoInput onAdd={onAdd} />);

    await user.keyboard("{Enter}");

    expect(onAdd).not.toHaveBeenCalled();
  });

  test("スペースのみの文字列は追加されない", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();

    render(<MemoInput onAdd={onAdd} />);

    const input = screen.getByPlaceholderText("メモを入力してEnterキーで追加...");
    await user.type(input, "   ");
    await user.keyboard("{Enter}");

    expect(onAdd).not.toHaveBeenCalled();
  });

  test("前後の空白はトリムされて追加される", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();

    render(<MemoInput onAdd={onAdd} />);

    const input = screen.getByPlaceholderText("メモを入力してEnterキーで追加...");
    await user.type(input, "  トリムされるメモ  ");
    await user.keyboard("{Enter}");

    expect(onAdd).toHaveBeenCalledWith("トリムされるメモ");
  });
});
