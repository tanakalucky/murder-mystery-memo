import { useState } from "react";

type MemoInputProps = {
  onAdd: (content: string) => void;
};

export function MemoInput({ onAdd }: MemoInputProps) {
  const [content, setContent] = useState("");
  const [isComposing, setIsComposing] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isComposing) {
      const trimmedContent = content.trim();
      if (trimmedContent) {
        onAdd(trimmedContent);
        setContent("");
      }
    }
  };

  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionEnd = () => {
    setIsComposing(false);
  };

  return (
    <div className="w-full">
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        placeholder="メモを入力してEnterキーで追加..."
        className="w-full px-5 py-4 bg-(--color-bg-secondary) text-text-primary border-2 border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-accent)] transition-all duration-200 placeholder:text-(--color-text-secondary)]"
        style={{
          boxShadow: "0 4px 12px rgba(212, 175, 55, 0.2)",
        }}
      />
    </div>
  );
}
