import { ReactFlowProvider } from "@xyflow/react";

import { MemoCanvas } from "@/features/canvas";

export const CanvasPage = () => {
  return (
    <div className="h-full w-full bg-neutral-950">
      <ReactFlowProvider>
        <MemoCanvas />
      </ReactFlowProvider>
    </div>
  );
};
