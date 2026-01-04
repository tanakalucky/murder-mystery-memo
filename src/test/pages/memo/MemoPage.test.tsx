import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { MemoPage } from "../../../react-app/pages/memo";

// LocalStorageのモック
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// crypto.randomUUIDのモック
let uuidCounter = 0;
Object.defineProperty(globalThis.crypto, "randomUUID", {
  value: () => `test-uuid-${++uuidCounter}`,
});

describe("MemoPage", () => {
  beforeEach(() => {
    localStorageMock.clear();
    uuidCounter = 0;
  });

  test("ページが正しくレンダリングされる", () => {
    render(<MemoPage />);

    expect(screen.getByText("マーダーミステリーメモ")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "すべてリセット" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("メモを入力してEnterキーで追加...")).toBeInTheDocument();
  });

  test("メモを追加できる", async () => {
    const user = userEvent.setup();

    render(<MemoPage />);

    const input = screen.getByPlaceholderText("メモを入力してEnterキーで追加...");
    await user.type(input, "テストメモ");
    await user.keyboard("{Enter}");

    expect(screen.getByText("テストメモ")).toBeInTheDocument();
  });

  test("複数のメモを追加できる", async () => {
    const user = userEvent.setup();

    render(<MemoPage />);

    const input = screen.getByPlaceholderText("メモを入力してEnterキーで追加...");

    await user.type(input, "メモ1");
    await user.keyboard("{Enter}");

    await user.type(input, "メモ2");
    await user.keyboard("{Enter}");

    await user.type(input, "メモ3");
    await user.keyboard("{Enter}");

    expect(screen.getByText("メモ1")).toBeInTheDocument();
    expect(screen.getByText("メモ2")).toBeInTheDocument();
    expect(screen.getByText("メモ3")).toBeInTheDocument();
  });

  test("メモを削除できる", async () => {
    const user = userEvent.setup();

    render(<MemoPage />);

    const input = screen.getByPlaceholderText("メモを入力してEnterキーで追加...");
    await user.type(input, "削除するメモ");
    await user.keyboard("{Enter}");

    expect(screen.getByText("削除するメモ")).toBeInTheDocument();

    const deleteButton = screen.getByLabelText("削除");
    await user.click(deleteButton);

    expect(screen.queryByText("削除するメモ")).not.toBeInTheDocument();
  });

  test("リセットボタンですべてのメモが削除される", async () => {
    const user = userEvent.setup();

    render(<MemoPage />);

    const input = screen.getByPlaceholderText("メモを入力してEnterキーで追加...");

    await user.type(input, "メモ1");
    await user.keyboard("{Enter}");

    await user.type(input, "メモ2");
    await user.keyboard("{Enter}");

    expect(screen.getByText("メモ1")).toBeInTheDocument();
    expect(screen.getByText("メモ2")).toBeInTheDocument();

    const resetButton = screen.getByRole("button", { name: "すべてリセット" });
    await user.click(resetButton);

    expect(screen.queryByText("メモ1")).not.toBeInTheDocument();
    expect(screen.queryByText("メモ2")).not.toBeInTheDocument();
  });
});
