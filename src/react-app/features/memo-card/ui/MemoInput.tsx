import { SendHorizonal, Trash2 } from "lucide-react";
import { useRef } from "react";

interface MemoInputProps {
  onSubmit: (body: string) => void;
  onDeleteAll: () => void;
  hasCards: boolean;
}

export function MemoInput({ onSubmit, onDeleteAll, hasCards }: MemoInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    const value = textareaRef.current?.value.trim();
    if (!value) return;

    onSubmit(value);

    if (textareaRef.current) {
      textareaRef.current.value = "";
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    target.style.height = "auto";
    target.style.height = `${Math.min(target.scrollHeight, 160)}px`;
  };

  return (
    <div className="sticky bottom-0 border-t border-amber-900/30 bg-stone-950 px-4 pt-3 pb-4">
      <div className="mx-auto flex max-w-xl items-end gap-2 rounded-lg border border-amber-900/30 bg-amber-950/20 px-3 py-2">
        <textarea
          ref={textareaRef}
          rows={1}
          placeholder="手がかりを記入..."
          className="flex-1 resize-none bg-transparent font-serif text-sm text-amber-100/90 placeholder:text-amber-100/30 focus:outline-none"
          onKeyDown={handleKeyDown}
          onInput={handleInput}
        />
        {hasCards && (
          <button
            type="button"
            onClick={onDeleteAll}
            className="shrink-0 rounded p-1 text-amber-100/40 transition-colors hover:text-red-400"
          >
            <Trash2 className="size-5" />
          </button>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          className="shrink-0 rounded p-1 text-amber-100/40 transition-colors hover:text-amber-100/80"
        >
          <SendHorizonal className="size-5" />
        </button>
      </div>
    </div>
  );
}
