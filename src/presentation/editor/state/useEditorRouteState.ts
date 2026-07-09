import type { Node } from '@xyflow/react';
import type { Dispatch, SetStateAction } from 'react';
import { useEffect, useRef } from 'react';
import type { EditorRouteState } from '@/application/canvas/editorRouteState';
import type { FlowNodeData } from '@/domain/workflow/model';
import { getNodeDomRectById } from '@/infrastructure/browser/domGeometry';
import type { AnchorRect } from '@/shared/geometry/overlayPosition';
import type { NodePopover, Panel } from '@/presentation/editor/editorTypes';

type UseEditorRouteStateInput = {
  nodes: Node<FlowNodeData>[];
  onRouteStateChange?: (state: EditorRouteState) => void;
  panel: Panel;
  restoreRouteZoom: (zoom: number) => void;
  routeState?: EditorRouteState;
  selectedNodeId: string | null;
  setNodePopover: (popover: NodePopover) => void;
  setPanelState: Dispatch<SetStateAction<Panel>>;
  setSelectedAnchor: (anchor: AnchorRect | null) => void;
  setSelectedNodeId: (id: string | null) => void;
  setSelectedVideoId: (id: string | null) => void;
  zoomPercent: number;
};

export function useEditorRouteState({
  nodes,
  onRouteStateChange,
  panel,
  restoreRouteZoom,
  routeState,
  selectedNodeId,
  setNodePopover,
  setPanelState,
  setSelectedAnchor,
  setSelectedNodeId,
  setSelectedVideoId,
  zoomPercent,
}: UseEditorRouteStateInput) {
  const selectedNodeIdRef = useRef(selectedNodeId);
  const zoomPercentRef = useRef(zoomPercent);

  useEffect(() => {
    selectedNodeIdRef.current = selectedNodeId;
  }, [selectedNodeId]);

  useEffect(() => {
    zoomPercentRef.current = zoomPercent;
  }, [zoomPercent]);

  useEffect(() => {
    if (!onRouteStateChange) return;
    onRouteStateChange({
      nodeId: selectedNodeId,
      panel,
      zoom: zoomPercent / 100,
    });
  }, [onRouteStateChange, panel, selectedNodeId, zoomPercent]);

  useEffect(() => {
    const nextNodeId = routeState?.nodeId ?? null;
    if (nextNodeId === selectedNodeIdRef.current) return;

    const nextNode = nextNodeId ? nodes.find((node) => node.id === nextNodeId) : undefined;
    setSelectedNodeId(nextNode?.id ?? null);
    setSelectedVideoId(nextNode?.data.kind === 'video' ? nextNode.id : null);
    setSelectedAnchor(null);
    setNodePopover(null);
  }, [
    nodes,
    routeState?.nodeId,
    setNodePopover,
    setSelectedAnchor,
    setSelectedNodeId,
    setSelectedVideoId,
  ]);

  useEffect(() => {
    const nextPanel = routeState?.panel ?? null;
    setPanelState((currentPanel) => (currentPanel === nextPanel ? currentPanel : nextPanel));
  }, [routeState?.panel, setPanelState]);

  useEffect(() => {
    if (!routeState?.zoom) return;
    const nextZoomPercent = Math.round(routeState.zoom * 100);
    if (nextZoomPercent === zoomPercentRef.current) return;
    restoreRouteZoom(routeState.zoom);
  }, [restoreRouteZoom, routeState?.zoom]);

  useEffect(() => {
    if (!selectedNodeId) return;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const rect = getNodeDomRectById(selectedNodeId);
        if (rect) setSelectedAnchor(rect);
      });
    });
  }, [selectedNodeId, setSelectedAnchor]);
}
