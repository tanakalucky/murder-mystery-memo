import { Check, FolderPlus, SendHorizonal, Trash2, X } from "lucide-react";
import { useRef, useState } from "react";

interface MemoInputProps {
  onSubmit: (body: string) => void;
  onDeleteAll: () => void;
  onAddGroup: (name: string) => void;
  hasCards: boolean;
}

export function MemoInput({ onSubmit, onDeleteAll, onAddGroup, hasCards }: MemoInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const groupInputRef = useRef<HTMLInputElement>(null);
  const [isGroupInput, setIsGroupInput] = useState(false);

  const handleSubmit = () => {
    const value = textareaRef.current?.value.trim();
    if (!value) return;

    onSubmit(value);

    if (textareaRef.current) {
      textareaRef.current.value = "";
      textareaRef.current.style.height = "auto";
    }
  };

  const handleGroupSubmit = () => {
    const value = groupInputRef.current?.value.trim();
    if (!value) return;
    onAddGroup(value);
    setIsGroupInput(false);
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
      {isGroupInput && (
        <div className="mx-auto mb-2 flex max-w-xl items-center gap-2 rounded-lg border border-amber-700/40 bg-amber-950/30 px-3 py-2">
          <input
            ref={groupInputRef}
            type="text"
            placeholder="グループ名を入力..."
            className="flex-1 bg-transparent font-serif text-sm text-amber-100/90 placeholder:text-amber-100/30 focus:outline-none"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                e.preventDefault();
                handleGroupSubmit();
              }
              if (e.key === "Escape") setIsGroupInput(false);
            }}
          />
          <button
            type="button"
            onClick={handleGroupSubmit}
            className="shrink-0 rounded p-1 text-amber-100/40 transition-colors hover:text-green-400"
          >
            <Check className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsGroupInput(false)}
            className="shrink-0 rounded p-1 text-amber-100/40 transition-colors hover:text-amber-100/80"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      <div className="mx-auto flex max-w-xl items-end gap-2 rounded-lg border border-amber-900/30 bg-amber-950/20 px-3 py-2">
        <textarea
          ref={textareaRef}
          rows={1}
          placeholder="手がかりを記入..."
          className="flex-1 resize-none bg-transparent font-serif text-sm text-amber-100/90 placeholder:text-amber-100/30 focus:outline-none"
          onKeyDown={handleKeyDown}
          onInput={handleInput}
        />
        <button
          type="button"
          onClick={() => setIsGroupInput(!isGroupInput)}
          className="shrink-0 rounded p-1 text-amber-100/40 transition-colors hover:text-amber-100/80"
          title="グループを追加"
        >
          <FolderPlus className="size-5" />
        </button>
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
