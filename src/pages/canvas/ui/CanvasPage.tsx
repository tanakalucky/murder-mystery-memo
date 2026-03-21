import { ReactFlowProvider } from "@xyflow/react";

import { MemoCanvas } from "@/features/canvas";

export const CanvasPage = () => {
  return (
    <div className="size-full bg-neutral-950">
      <ReactFlowProvider>
        <MemoCanvas />
      </ReactFlowProvider>
    </div>
  );
};
