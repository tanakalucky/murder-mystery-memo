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
        className="w-full px-6 py-4 rounded-md focus:outline-none transition-all duration-300"
        style={{
          backgroundColor: "var(--color-bg-secondary)",
          color: "var(--color-text-primary)",
          fontFamily: "var(--font-body)",
          fontSize: "1rem",
          border: "2px solid transparent",
          boxShadow: "var(--shadow-md)",
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "var(--color-border-focus)";
          e.target.style.boxShadow = "0 0 0 3px rgba(196, 30, 58, 0.1)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "transparent";
          e.target.style.boxShadow = "var(--shadow-md)";
        }}
      />
    </div>
  );
}
