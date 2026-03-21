import type { NodeTypes } from "@xyflow/react";

import { MemoNode } from "../ui/MemoNode";

// NODE_TYPES はモジュールレベルの定数として定義（インライン定義するとノードが毎レンダーでリマウントされる）
export const NODE_TYPES = {
  memo: MemoNode,
} satisfies NodeTypes;
