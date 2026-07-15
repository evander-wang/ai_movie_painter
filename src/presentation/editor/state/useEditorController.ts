import {
  type NodeChange,
  type Edge,
  type Node,
  useEdgesState,
  useNodesState,
} from '@xyflow/react';
import { useCallback, useMemo, useState } from 'react';
import { isDefaultCanvasState } from '@/application/canvas/canvasDraftState';
import { parseCanvasDraftPayload } from '@/application/canvas/importExportCanvas';
import type { EditorRouteState } from '@/application/canvas/editorRouteState';
import { projectConfig } from '@/config/projectConfig';
import { createDefaultCanvasNodes, initialEdges } from '@/domain/workflow/defaultCanvas';
import type { FlowNodeData } from '@/domain/workflow/model';
import { getCanvasDraftStorage, readCanvasDraftPayload } from '@/infrastructure/storage/canvasDraftStorage';
import type { Panel } from '@/presentation/editor/editorTypes';
import { useCanvasCommands } from '@/presentation/editor/state/useCanvasCommands';
import { useCanvasConnections } from '@/presentation/editor/state/useCanvasConnections';
import { useCanvasDraftPersistence } from '@/presentation/editor/state/useCanvasDraftPersistence';
import { useCanvasImportExport } from '@/presentation/editor/state/useCanvasImportExport';
import { useCanvasViewport } from '@/presentation/editor/state/useCanvasViewport';
import { createInitialCanvasNodes } from '@/presentation/editor/state/editorSelection';
import { useEditorSelection } from '@/presentation/editor/state/useEditorSelection';
import { useEditorRouteState } from '@/presentation/editor/state/useEditorRouteState';
import { useMagneticHandles } from '@/presentation/editor/state/useMagneticHandles';
import { useWorkflowNodeActions } from '@/presentation/editor/state/useWorkflowNodeActions';

const initialNodes: Node<FlowNodeData>[] = createDefaultCanvasNodes() as Node<FlowNodeData>[];
const initialFlowEdges: Edge[] = initialEdges as Edge[];

type UseEditorControllerInput = {
  onRouteStateChange?: (state: EditorRouteState) => void;
  routeState?: EditorRouteState;
};

export function useEditorController({ routeState, onRouteStateChange }: UseEditorControllerInput) {
  const [storedCanvas] = useState(() => {
    const storage = getCanvasDraftStorage();
    const payload = storage ? readCanvasDraftPayload(storage) : null;
    return parseCanvasDraftPayload(payload, projectConfig.canvas.defaultViewport.zoom);
  });
  const routeNodeId = routeState?.nodeId ?? null;
  const initialViewport = useMemo(
    () => ({
      ...(storedCanvas?.viewport ?? projectConfig.canvas.defaultViewport),
      zoom: routeState?.zoom ?? storedCanvas?.viewport?.zoom ?? projectConfig.canvas.defaultViewport.zoom,
    }),
    [routeState?.zoom, storedCanvas?.viewport],
  );
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<FlowNodeData>>(
    createInitialCanvasNodes((storedCanvas?.nodes as Node<FlowNodeData>[] | undefined) ?? initialNodes, routeNodeId),
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState((storedCanvas?.edges as Edge[] | undefined) ?? initialFlowEdges);
  const [panel, setPanelState] = useState<Panel>(routeState?.panel ?? null);
  const [showMiniMap, setShowMiniMap] = useState(false);
  const [snap, setSnap] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const viewport = useCanvasViewport(initialViewport);
  const isDefaultCanvas = useMemo(
    () =>
      isDefaultCanvasState({
        defaultViewport: projectConfig.canvas.defaultViewport,
        edges,
        nodes,
        viewport: viewport.currentViewport,
      }),
    [edges, nodes, viewport.currentViewport],
  );

  useMagneticHandles(isConnecting);
  useCanvasDraftPersistence({
    edges,
    enabled: true,
    isDefaultCanvas,
    nodes,
    viewport: viewport.currentViewport,
  });

  const setPanel = useCallback((nextPanel: Panel) => {
    setPanelState(nextPanel);
  }, []);

  const selection = useEditorSelection({
    initialSelectedNodeId: routeNodeId,
    nodes,
    setNodes,
    setPanel,
  });

  const handleNodesChange = useCallback((changes: NodeChange<Node<FlowNodeData>>[]) => {
    const nonSelectionChanges = changes.filter((change) => change.type !== 'select');
    if (nonSelectionChanges.length === 0) return;

    onNodesChange(nonSelectionChanges);
  }, [onNodesChange]);

  const canvasConnections = useCanvasConnections({
    edges,
    nodes,
    selectedNodeId: selection.selectedNodeId,
    setEdges,
  });

  const workflowNodeActions = useWorkflowNodeActions({
    addEdgeForAddedNode: canvasConnections.addEdgeForAddedNode,
    readEditorViewport: viewport.readEditorViewport,
    selectedNodeId: selection.selectedNodeId,
    selectNodeById: selection.selectNodeById,
    setNodes,
  });

  const canvasCommands = useCanvasCommands({
    defaultEdges: initialFlowEdges,
    defaultNodes: initialNodes,
    fitCanvasView: viewport.fitCanvasView,
    resetEditorState: selection.resetEditorState,
    setCanvasViewport: viewport.setCanvasViewport,
    setEdges,
    setNodes,
  });

  const importExport = useCanvasImportExport({
    edges,
    nodes,
    readEditorViewport: viewport.readEditorViewport,
    resetEditorState: selection.resetEditorState,
    setCanvasViewport: viewport.setCanvasViewport,
    setEdges,
    setNodes,
  });

  useEditorRouteState({
    nodes,
    onRouteStateChange,
    panel,
    restoreRouteZoom: viewport.restoreRouteZoom,
    routeState,
    selectedNodeId: selection.selectedNodeId,
    setNodePopover: selection.setNodePopover,
    setPanelState,
    setSelectedAnchor: selection.setSelectedAnchor,
    setSelectedNodeId: selection.setSelectedFlowNodeId,
    setSelectedVideoId: selection.setSelectedVideoId,
    zoomPercent: viewport.zoomPercent,
  });

  return {
    activeSelectedNode: selection.activeSelectedNode,
    addWorkflowNode: workflowNodeActions.addWorkflowNode,
    arrangeCanvas: canvasCommands.arrangeCanvas,
    clearSelection: selection.clearSelection,
    defaultViewport: viewport.defaultViewport,
    displayEdges: canvasConnections.displayEdges,
    exportCanvas: importExport.exportCanvas,
    fitCanvasView: viewport.fitCanvasView,
    handleMove: viewport.handleMove,
    handleNodeClick: selection.handleNodeClick,
    handlePaneClick: selection.handlePaneClick,
    importCanvasFile: importExport.importCanvasFile,
    importInputRef: importExport.importInputRef,
    isConnecting,
    connectionNotice: canvasConnections.connectionNotice,
    nodePopover: selection.nodePopover,
    nodes,
    edges: canvasConnections.displayEdges,
    onConnect: canvasConnections.onConnect,
    onEdgesChange,
    onNodesChange: handleNodesChange,
    openImportDialog: importExport.openImportDialog,
    overlayPosition: selection.overlayPosition,
    panel,
    resetCanvasView: viewport.resetCanvasView,
    restoreDefaultCanvas: canvasCommands.restoreDefaultCanvas,
    selectedNode: selection.selectedNode,
    selectedNodeId: selection.selectedNodeId,
    selectedVideoId: selection.selectedVideoId,
    setIsConnecting,
    setNodePopover: selection.setNodePopover,
    setPanel,
    setShowMiniMap,
    setSnap,
    showMiniMap,
    snap,
    zoomCanvasIn: viewport.zoomCanvasIn,
    zoomCanvasOut: viewport.zoomCanvasOut,
    zoomCanvasTo: viewport.zoomCanvasTo,
    zoomPercent: viewport.zoomPercent,
  };
}

export type EditorController = ReturnType<typeof useEditorController>;
