import type { Edge, Node, Viewport } from '@xyflow/react';
import { useReactFlow } from '@xyflow/react';
import { useCallback, useMemo, useState } from 'react';
import { getNextZoomIn, getNextZoomOut } from '@/application/canvas/viewportCommands';
import { projectConfig } from '@/config/projectConfig';
import type { CanvasViewport, FlowNodeData } from '@/domain/workflow/model';
import { readCurrentViewport } from '@/infrastructure/browser/domGeometry';

export function useCanvasViewport(initialZoom: number) {
  const reactFlow = useReactFlow<Node<FlowNodeData>, Edge>();
  const [zoomPercent, setZoomPercent] = useState(Math.round(initialZoom * 100));

  const defaultViewport = useMemo(
    () => ({ ...projectConfig.canvas.defaultViewport, zoom: initialZoom }),
    [initialZoom],
  );

  const readEditorViewport = useCallback(
    () => readCurrentViewport(projectConfig.canvas.defaultViewport.zoom),
    [],
  );

  const fitCanvasView = useCallback(() => {
    reactFlow.fitView({ padding: 0.18, duration: 320, includeHiddenNodes: false });
  }, [reactFlow]);

  const setCanvasViewport = useCallback((viewport: CanvasViewport, duration = 180) => {
    reactFlow.setViewport(viewport, { duration });
  }, [reactFlow]);

  const resetCanvasView = useCallback(() => {
    setCanvasViewport(projectConfig.canvas.defaultViewport, 260);
  }, [setCanvasViewport]);

  const zoomCanvasTo = useCallback((zoom: number) => {
    setCanvasViewport({ ...readEditorViewport(), zoom });
  }, [readEditorViewport, setCanvasViewport]);

  const zoomCanvasIn = useCallback(() => {
    zoomCanvasTo(getNextZoomIn(readEditorViewport(), projectConfig.canvas.maxZoom));
  }, [readEditorViewport, zoomCanvasTo]);

  const zoomCanvasOut = useCallback(() => {
    zoomCanvasTo(getNextZoomOut(readEditorViewport(), projectConfig.canvas.minZoom));
  }, [readEditorViewport, zoomCanvasTo]);

  const restoreRouteZoom = useCallback((zoom: number) => {
    setZoomPercent(Math.round(zoom * 100));
    requestAnimationFrame(() => {
      setCanvasViewport({ ...readEditorViewport(), zoom });
    });
  }, [readEditorViewport, setCanvasViewport]);

  const handleMove = useCallback((_event: MouseEvent | TouchEvent | null, viewport: Viewport) => {
    const nextZoomPercent = Math.round(viewport.zoom * 100);
    setZoomPercent((currentZoomPercent) =>
      currentZoomPercent === nextZoomPercent ? currentZoomPercent : nextZoomPercent,
    );
  }, []);

  return {
    defaultViewport,
    fitCanvasView,
    handleMove,
    readEditorViewport,
    resetCanvasView,
    restoreRouteZoom,
    setCanvasViewport,
    zoomCanvasIn,
    zoomCanvasOut,
    zoomCanvasTo,
    zoomPercent,
  };
}
