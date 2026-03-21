import { ReactFlow, useNodesState, useReactFlow } from "@xyflow/react";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from "react";

import type { MemoNode } from "../model/memo-node";
import { NODE_TYPES } from "../model/node-types";
import { loadMemos, saveMemos } from "../model/storage";

const CARD_HALF_WIDTH = 96; // w-48（192px）の半分
const CARD_HALF_HEIGHT = 20; // カード初期高さの近似半分
const OVERLAP_THRESHOLD = 20; // 同一位置判定の距離（px）
const OVERLAP_OFFSET = 20; // 重複時のオフセット（px）

export type MemoCanvasHandle = { reset: () => void };

export const MemoCanvas = forwardRef<MemoCanvasHandle, Record<string, never>>((_props, ref) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<MemoNode>(loadMemos());
  const { screenToFlowPosition, updateNodeData } = useReactFlow<MemoNode>();

  // D-03: ノード変更時に保存 — D-02: ドラッグ中はスキップ
  useEffect(() => {
    const isDragging = nodes.some((n) => n.dragging === true);
    if (!isDragging) {
      saveMemos(nodes);
    }
  }, [nodes]);

  // D-02: ドラッグ完了時に最終位置を保存
  const handleNodeDragStop = useCallback(
    (_event: React.MouseEvent, _node: MemoNode, allNodes: MemoNode[]) => {
      saveMemos(allNodes);
    },
    [],
  );

  // D-11: 同一位置への連続作成でズレを付ける
  const lastCreatedPosition = useRef<{ x: number; y: number } | null>(null);

  const handlePaneDoubleClick = useCallback(
    (event: React.MouseEvent) => {
      // ペイン（背景）以外のダブルクリックは無視
      const target = event.target as HTMLElement;
      if (!target.classList.contains("react-flow__pane")) return;

      const flowPosition = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // D-09: クリック位置にカードを中央揃えで配置
      let position = {
        x: flowPosition.x - CARD_HALF_WIDTH,
        y: flowPosition.y - CARD_HALF_HEIGHT,
      };

      // D-11: 同一位置への重複を防ぐオフセット
      if (
        lastCreatedPosition.current !== null &&
        Math.abs(position.x - lastCreatedPosition.current.x) < OVERLAP_THRESHOLD &&
        Math.abs(position.y - lastCreatedPosition.current.y) < OVERLAP_THRESHOLD
      ) {
        position = {
          x: position.x + OVERLAP_OFFSET,
          y: position.y + OVERLAP_OFFSET,
        };
      }

      lastCreatedPosition.current = position;

      const newNode: MemoNode = {
        id: crypto.randomUUID(),
        type: "memo",
        position,
        data: { content: "", isEditing: true },
      };

      setNodes((prev) => [...prev, newNode]);
    },
    [screenToFlowPosition, setNodes],
  );

  const handleNodeDoubleClick = useCallback(
    (_event: React.MouseEvent, node: MemoNode) => {
      updateNodeData(node.id, { isEditing: true });
    },
    [updateNodeData],
  );

  const handleReset = useCallback(() => {
    setNodes([]);
    saveMemos([]);
  }, [setNodes]);

  useImperativeHandle(ref, () => ({ reset: handleReset }), [handleReset]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={[]}
      nodeTypes={NODE_TYPES}
      onNodesChange={onNodesChange}
      deleteKeyCode={null}
      zoomOnDoubleClick={false}
      onDoubleClick={handlePaneDoubleClick}
      onNodeDoubleClick={handleNodeDoubleClick}
      onNodeDragStop={handleNodeDragStop}
      // panOnDrag はデフォルト true — CANVAS-02 を満たす
      // zoomOnScroll はデフォルト true — CANVAS-03 を満たす
    />
  );
});
