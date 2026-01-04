import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { describe, expect, test, vi } from "vitest";
import { MemoItem } from "../../../react-app/entities/memo";

describe("MemoItem", () => {
  const mockMemo = {
    id: "test-id",
    content: "テストメモ",
    order: 0,
  };

  test("メモの内容が表示される", () => {
    const onUpdate = vi.fn();
    const onDelete = vi.fn();

    render(<MemoItem memo={mockMemo} onUpdate={onUpdate} onDelete={onDelete} />);

    expect(screen.getByText("テストメモ")).toBeInTheDocument();
  });

  test("ダブルクリックで編集モードになる", async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn();
    const onDelete = vi.fn();

    render(<MemoItem memo={mockMemo} onUpdate={onUpdate} onDelete={onDelete} />);

    const text = screen.getByText("テストメモ");
    await user.dblClick(text);

    const input = screen.getByDisplayValue("テストメモ");
    expect(input).toBeInTheDocument();
  });

  test("編集モードで内容を変更できる", async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn();
    const onDelete = vi.fn();

    render(<MemoItem memo={mockMemo} onUpdate={onUpdate} onDelete={onDelete} />);

    const text = screen.getByText("テストメモ");
    await user.dblClick(text);

    const input = screen.getByDisplayValue("テストメモ");
    await user.clear(input);
    await user.type(input, "編集されたメモ");

    expect(input).toHaveValue("編集されたメモ");
  });

  test("Enterキーで編集が保存される", async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn();
    const onDelete = vi.fn();

    render(<MemoItem memo={mockMemo} onUpdate={onUpdate} onDelete={onDelete} />);

    const text = screen.getByText("テストメモ");
    await user.dblClick(text);

    const input = screen.getByDisplayValue("テストメモ");
    await user.clear(input);
    await user.type(input, "新しい内容");
    await user.keyboard("{Enter}");

    expect(onUpdate).toHaveBeenCalledWith("test-id", "新しい内容");
  });

  test("Escapeキーで編集がキャンセルされる", async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn();
    const onDelete = vi.fn();

    render(<MemoItem memo={mockMemo} onUpdate={onUpdate} onDelete={onDelete} />);

    const text = screen.getByText("テストメモ");
    await user.dblClick(text);

    const input = screen.getByDisplayValue("テストメモ");
    await user.clear(input);
    await user.type(input, "キャンセルされる内容");
    await user.keyboard("{Escape}");

    expect(onUpdate).not.toHaveBeenCalled();
    expect(screen.getByText("テストメモ")).toBeInTheDocument();
  });

  test("内容が変更されていない場合は更新されない", async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn();
    const onDelete = vi.fn();

    render(<MemoItem memo={mockMemo} onUpdate={onUpdate} onDelete={onDelete} />);

    const text = screen.getByText("テストメモ");
    await user.dblClick(text);

    await user.keyboard("{Enter}");

    expect(onUpdate).not.toHaveBeenCalled();
  });

  test("空文字列では更新されない", async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn();
    const onDelete = vi.fn();

    render(<MemoItem memo={mockMemo} onUpdate={onUpdate} onDelete={onDelete} />);

    const text = screen.getByText("テストメモ");
    await user.dblClick(text);

    const input = screen.getByDisplayValue("テストメモ");
    await user.clear(input);
    await user.keyboard("{Enter}");

    expect(onUpdate).not.toHaveBeenCalled();
  });

  test("削除ボタンをクリックすると削除される", async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn();
    const onDelete = vi.fn();

    render(<MemoItem memo={mockMemo} onUpdate={onUpdate} onDelete={onDelete} />);

    const deleteButton = screen.getByRole("button", { name: "削除" });
    await user.click(deleteButton);

    expect(onDelete).toHaveBeenCalledWith("test-id");
  });
});
