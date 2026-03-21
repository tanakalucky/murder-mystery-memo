import { ReactFlowProvider } from "@xyflow/react";
import { useCallback, useRef } from "react";

import { MemoCanvas } from "@/features/canvas";
import type { MemoCanvasHandle } from "@/features/canvas";
import { ResetButton } from "@/features/reset";

export const CanvasPage = () => {
  const canvasRef = useRef<MemoCanvasHandle>(null);

  const handleReset = useCallback(() => {
    canvasRef.current?.reset();
  }, []);

  return (
    <div className="relative size-full bg-neutral-950">
      <ReactFlowProvider>
        <MemoCanvas ref={canvasRef} />
      </ReactFlowProvider>
      {/* ReactFlow の上に重ねる固定UIレイヤー (per VIS-03, D-02) */}
      <div className="pointer-events-none absolute inset-0 z-10">
        <div className="pointer-events-auto absolute top-4 right-4">
          <ResetButton onConfirm={handleReset} />
        </div>
      </div>
    </div>
  );
};
