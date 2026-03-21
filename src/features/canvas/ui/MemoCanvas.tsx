import { ReactFlow } from "@xyflow/react";

import { NODE_TYPES } from "../model/node-types";

export const MemoCanvas = () => {
  return (
    <ReactFlow
      nodes={[]}
      edges={[]}
      nodeTypes={NODE_TYPES}
      // panOnDrag はデフォルト true — CANVAS-02 を満たす
      // zoomOnScroll はデフォルト true — CANVAS-03 を満たす
    />
  );
};
