import { useState } from "react";

type MemoInputProps = {
  onAdd: (content: string) => void;
};

/**
 * メモ入力コンポーネント
 */
export function MemoInput({ onAdd }: MemoInputProps) {
  const [content, setContent] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const trimmedContent = content.trim();
      if (trimmedContent) {
        onAdd(trimmedContent);
        setContent("");
      }
    }
  };

  return (
    <div className="w-full">
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="メモを入力してEnterキーで追加..."
        className="w-full px-4 py-3 bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] border border-[var(--color-accent)] rounded focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
      />
    </div>
  );
}
