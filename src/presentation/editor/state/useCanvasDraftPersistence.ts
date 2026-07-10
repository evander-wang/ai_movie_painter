import type { Edge, Node } from '@xyflow/react';
import { useEffect } from 'react';
import { createCanvasDraftPayload } from '@/application/canvas/importExportCanvas';
import { projectConfig } from '@/config/projectConfig';
import type { CanvasViewport, FlowNodeData } from '@/domain/workflow/model';
import { clearCanvasDraft, getCanvasDraftStorage, saveCanvasDraft } from '@/infrastructure/storage/canvasDraftStorage';

const saveDelayMs = 450;

type UseCanvasDraftPersistenceInput = {
  edges: Edge[];
  enabled: boolean;
  isDefaultCanvas: boolean;
  nodes: Node<FlowNodeData>[];
  viewport: CanvasViewport;
};

export function useCanvasDraftPersistence({
  edges,
  enabled,
  isDefaultCanvas,
  nodes,
  viewport,
}: UseCanvasDraftPersistenceInput) {
  useEffect(() => {
    if (!enabled) return;
    const storage = getCanvasDraftStorage();
    if (!storage) return;

    if (isDefaultCanvas) {
      clearCanvasDraft(storage);
      return;
    }

    const timer = window.setTimeout(() => {
      saveCanvasDraft(
        storage,
        createCanvasDraftPayload({
          appName: projectConfig.app.name,
          edges,
          nodes,
          viewport,
        }),
      );
    }, saveDelayMs);

    return () => window.clearTimeout(timer);
  }, [edges, enabled, isDefaultCanvas, nodes, viewport]);
}
