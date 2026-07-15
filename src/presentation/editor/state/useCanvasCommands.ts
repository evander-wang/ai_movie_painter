import type { Edge, Node } from '@xyflow/react';
import type { Dispatch, SetStateAction } from 'react';
import { useCallback } from 'react';
import { arrangeCanvasNodes } from '@/application/canvas/arrangeCanvas';
import { projectConfig } from '@/config/projectConfig';
import type { CanvasViewport, FlowNodeData } from '@/domain/workflow/model';
import { clearCanvasDraft, getCanvasDraftStorage } from '@/infrastructure/storage/canvasDraftStorage';
import { createInitialCanvasNodes } from '@/presentation/editor/state/editorSelection';

type UseCanvasCommandsInput = {
  defaultEdges: Edge[];
  defaultNodes: Node<FlowNodeData>[];
  fitCanvasView: () => void;
  resetEditorState: () => void;
  setCanvasViewport: (viewport: CanvasViewport, duration?: number) => void;
  setEdges: Dispatch<SetStateAction<Edge[]>>;
  setNodes: Dispatch<SetStateAction<Node<FlowNodeData>[]>>;
};

export function useCanvasCommands({
  defaultEdges,
  defaultNodes,
  fitCanvasView,
  resetEditorState,
  setCanvasViewport,
  setEdges,
  setNodes,
}: UseCanvasCommandsInput) {
  const arrangeCanvas = useCallback(() => {
    setNodes((currentNodes) => arrangeCanvasNodes(currentNodes));
    requestAnimationFrame(() => {
      requestAnimationFrame(fitCanvasView);
    });
  }, [fitCanvasView, setNodes]);

  const restoreDefaultCanvas = useCallback(() => {
    const storage = getCanvasDraftStorage();
    if (storage) clearCanvasDraft(storage);

    setNodes(createInitialCanvasNodes(defaultNodes, null));
    setEdges(defaultEdges);
    resetEditorState();
    setCanvasViewport(projectConfig.canvas.defaultViewport, 260);
  }, [defaultEdges, defaultNodes, resetEditorState, setCanvasViewport, setEdges, setNodes]);

  return {
    arrangeCanvas,
    restoreDefaultCanvas,
  };
}
