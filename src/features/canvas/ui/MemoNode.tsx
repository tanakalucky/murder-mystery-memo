import type { NodeProps } from "@xyflow/react";
import { useReactFlow } from "@xyflow/react";
import { useCallback, useEffect, useRef } from "react";

import type { MemoNode as MemoNodeType } from "../model/memo-node";

export const MemoNode = ({ id, data }: NodeProps<MemoNodeType>) => {
  const { updateNodeData } = useReactFlow<MemoNodeType>();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 編集モードに入ったときにtextareaにフォーカスし、カーソルを末尾に移動
  useEffect(() => {
    if (data.isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.selectionStart = textareaRef.current.value.length;
      textareaRef.current.selectionEnd = textareaRef.current.value.length;
    }
  }, [data.isEditing]);

  // コンテンツに応じてtextareaの高さを自動調整（D-05: スクロールバーなし）
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [data.content]);

  // D-14: stopPropagation でReactFlowへのキーイベント伝播を防止
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      e.stopPropagation();

      if (e.shiftKey && e.key === "Enter") {
        // Shift+Enter で編集確定（MEMO-04）
        e.preventDefault();
        updateNodeData(id, { isEditing: false });
      } else if (e.key === "Escape") {
        // Escape で編集キャンセル（MEMO-05）— D-12: 空メモは破棄しない
        updateNodeData(id, { isEditing: false });
      }
      // Enter のみはデフォルト動作（改行）を維持（MEMO-03）
    },
    [id, updateNodeData],
  );

  // MEMO-07: メモ外クリック（blur）で編集確定
  const handleBlur = useCallback(() => {
    updateNodeData(id, { isEditing: false });
  }, [id, updateNodeData]);

  if (data.isEditing) {
    return (
      // nodrag クラスで編集中のドラッグを無効化（D-08）
      <div className="nodrag w-48 rounded border border-black bg-white p-2">
        <textarea
          ref={textareaRef}
          value={data.content}
          placeholder="メモを入力..."
          className="w-full resize-none overflow-hidden bg-transparent text-black outline-none"
          onChange={(e) => updateNodeData(id, { content: e.target.value })}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          rows={1}
        />
      </div>
    );
  }

  return (
    <div className="w-48 rounded border border-black bg-white p-2">
      {/* D-03: 空メモも高さを維持するためスペースを表示 */}
      <p className="whitespace-pre-wrap text-black">{data.content || " "}</p>
    </div>
  );
};
