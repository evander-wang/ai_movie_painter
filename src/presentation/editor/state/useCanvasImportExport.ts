import type { Edge, Node } from '@xyflow/react';
import type { Dispatch, SetStateAction } from 'react';
import { useCallback, useRef } from 'react';
import { buildCanvasExportPayload, parseImportedCanvas } from '@/application/canvas/importExportCanvas';
import { projectConfig } from '@/config/projectConfig';
import type { CanvasViewport, FlowNodeData } from '@/domain/workflow/model';
import { downloadJson } from '@/infrastructure/browser/downloadJson';

type UseCanvasImportExportInput = {
  edges: Edge[];
  nodes: Node<FlowNodeData>[];
  readEditorViewport: () => CanvasViewport;
  resetEditorState: () => void;
  setCanvasViewport: (viewport: CanvasViewport, duration?: number) => void;
  setEdges: Dispatch<SetStateAction<Edge[]>>;
  setNodes: Dispatch<SetStateAction<Node<FlowNodeData>[]>>;
};

export function useCanvasImportExport({
  edges,
  nodes,
  readEditorViewport,
  resetEditorState,
  setCanvasViewport,
  setEdges,
  setNodes,
}: UseCanvasImportExportInput) {
  const importInputRef = useRef<HTMLInputElement | null>(null);

  const exportCanvas = useCallback(() => {
    const payload = buildCanvasExportPayload({
      appName: projectConfig.app.name,
      viewport: readEditorViewport(),
      nodes,
      edges,
    });

    downloadJson(`short-flow-canvas-${Date.now()}.json`, payload);
  }, [edges, nodes, readEditorViewport]);

  const importCanvasFile = useCallback(async (file: File) => {
    try {
      const payload = parseImportedCanvas(JSON.parse(await file.text()), projectConfig.canvas.defaultViewport.zoom);
      setNodes(payload.nodes as Node<FlowNodeData>[]);
      setEdges(payload.edges as Edge[]);
      resetEditorState();
      if (payload.viewport) {
        requestAnimationFrame(() => setCanvasViewport(payload.viewport!));
      }
    } catch (error) {
      window.alert(error instanceof Error ? error.message : '导入失败');
    }
  }, [resetEditorState, setCanvasViewport, setEdges, setNodes]);

  const openImportDialog = useCallback(() => {
    importInputRef.current?.click();
  }, []);

  return {
    exportCanvas,
    importCanvasFile,
    importInputRef,
    openImportDialog,
  };
}
