import type { Node } from "@xyflow/react";

export type MemoNodeData = {
  content: string;
  isEditing: boolean;
  [key: string]: unknown;
};

export type MemoNode = Node<MemoNodeData, "memo">;
