import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { describe, expect, test, vi } from "vitest";
import { MemoList } from "../../../react-app/features/memo-list";

describe("MemoList", () => {
  const mockMemos = [
    { id: "1", content: "メモ1", order: 0 },
    { id: "2", content: "メモ2", order: 1 },
    { id: "3", content: "メモ3", order: 2 },
  ];

  test("すべてのメモが表示される", () => {
    const onUpdate = vi.fn();
    const onDelete = vi.fn();
    const onReorder = vi.fn();

    render(
      <MemoList memos={mockMemos} onUpdate={onUpdate} onDelete={onDelete} onReorder={onReorder} />,
    );

    expect(screen.getByText("メモ1")).toBeInTheDocument();
    expect(screen.getByText("メモ2")).toBeInTheDocument();
    expect(screen.getByText("メモ3")).toBeInTheDocument();
  });

  test("メモがない場合は何も表示されない", () => {
    const onUpdate = vi.fn();
    const onDelete = vi.fn();
    const onReorder = vi.fn();

    const { container } = render(
      <MemoList memos={[]} onUpdate={onUpdate} onDelete={onDelete} onReorder={onReorder} />,
    );

    const memosContainer = container.querySelector(".space-y-2");
    expect(memosContainer?.children.length).toBe(0);
  });

  test("メモを削除すると onDelete が呼ばれる", async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn();
    const onDelete = vi.fn();
    const onReorder = vi.fn();

    render(
      <MemoList memos={mockMemos} onUpdate={onUpdate} onDelete={onDelete} onReorder={onReorder} />,
    );

    const deleteButtons = screen.getAllByRole("button", { name: "削除" });
    await user.click(deleteButtons[0]);

    expect(onDelete).toHaveBeenCalledWith("1");
  });

  test("メモを編集すると onUpdate が呼ばれる", async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn();
    const onDelete = vi.fn();
    const onReorder = vi.fn();

    render(
      <MemoList memos={mockMemos} onUpdate={onUpdate} onDelete={onDelete} onReorder={onReorder} />,
    );

    const memo1 = screen.getByText("メモ1");
    await user.dblClick(memo1);

    const input = screen.getByDisplayValue("メモ1");
    await user.clear(input);
    await user.type(input, "編集されたメモ");
    await user.keyboard("{Enter}");

    expect(onUpdate).toHaveBeenCalledWith("1", "編集されたメモ");
  });
});
