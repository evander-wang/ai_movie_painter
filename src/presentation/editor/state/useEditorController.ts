import {
  addEdge,
  type NodeChange,
  type Connection,
  type Edge,
  type Node,
  useEdgesState,
  useNodesState,
} from '@xyflow/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { arrangeCanvasNodes } from '@/application/canvas/arrangeCanvas';
import { isDefaultCanvasState } from '@/application/canvas/canvasDraftState';
import { parseCanvasDraftPayload } from '@/application/canvas/importExportCanvas';
import { markActivePathEdges } from '@/application/canvas/activePath';
import type { EditorRouteState } from '@/application/canvas/editorRouteState';
import { createWorkflowNode } from '@/application/workflow/createWorkflowNode';
import { projectConfig } from '@/config/projectConfig';
import { createDefaultCanvasNodes, initialEdges } from '@/domain/workflow/defaultCanvas';
import { nodeCatalog } from '@/domain/workflow/nodeCatalog';
import type { AiNodeType, FlowNodeData } from '@/domain/workflow/model';
import { getNodeDomRectById, rectFromElement } from '@/infrastructure/browser/domGeometry';
import { clearCanvasDraft, getCanvasDraftStorage, readCanvasDraftPayload } from '@/infrastructure/storage/canvasDraftStorage';
import { chooseOverlayPosition } from '@/shared/geometry/overlayPosition';
import type { AnchorRect } from '@/shared/geometry/overlayPosition';
import type { NodePopover, Panel } from '@/presentation/editor/editorTypes';
import { useCanvasDraftPersistence } from '@/presentation/editor/state/useCanvasDraftPersistence';
import { useCanvasImportExport } from '@/presentation/editor/state/useCanvasImportExport';
import { useCanvasViewport } from '@/presentation/editor/state/useCanvasViewport';
import { createInitialCanvasNodes, getVideoNodeId, markSelectedCanvasNode } from '@/presentation/editor/state/editorSelection';
import { useEditorRouteState } from '@/presentation/editor/state/useEditorRouteState';
import { useMagneticHandles } from '@/presentation/editor/state/useMagneticHandles';

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
  const [nodePopover, setNodePopover] = useState<NodePopover>(null);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(() =>
    getVideoNodeId(initialNodes, routeNodeId),
  );
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(routeNodeId);
  const [selectedAnchor, setSelectedAnchor] = useState<AnchorRect | null>(null);
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

  const setSelectedFlowNodeId = useCallback((id: string | null) => {
    setSelectedNodeId((currentId) => (currentId === id ? currentId : id));
    setNodes((currentNodes) => markSelectedCanvasNode(currentNodes, id));
  }, [setNodes]);

  const handleNodesChange = useCallback((changes: NodeChange<Node<FlowNodeData>>[]) => {
    const nonSelectionChanges = changes.filter((change) => change.type !== 'select');
    if (nonSelectionChanges.length === 0) return;

    onNodesChange(nonSelectionChanges);
  }, [onNodesChange]);

  const resetEditorState = useCallback(() => {
    setSelectedFlowNodeId(null);
    setSelectedVideoId(null);
    setSelectedAnchor(null);
    setNodePopover(null);
    setPanel(null);
  }, [setPanel, setSelectedFlowNodeId]);

  const clearSelection = useCallback(() => {
    setSelectedVideoId(null);
    setSelectedFlowNodeId(null);
    setSelectedAnchor(null);
    setNodePopover(null);
  }, [setSelectedFlowNodeId]);

  const selectNodeById = useCallback((id: string, kind: FlowNodeData['kind']) => {
    setSelectedFlowNodeId(id);
    setSelectedVideoId(kind === 'video' ? id : null);
    setNodePopover(null);
    setPanel(null);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const rect = getNodeDomRectById(id);
        if (rect) setSelectedAnchor(rect);
      });
    });
  }, [setPanel, setSelectedFlowNodeId]);

  const handleNodeClick = useCallback((node: Node<FlowNodeData>) => {
    setNodePopover(null);
    setPanel(null);
    setSelectedFlowNodeId(node.id);
    const nodeElement = document.querySelector(`[data-id="${node.id}"]`);
    if (nodeElement) setSelectedAnchor(rectFromElement(nodeElement));
    setSelectedVideoId(node.data.kind === 'video' ? node.id : null);
  }, [setPanel, setSelectedFlowNodeId]);

  const handlePaneClick = useCallback(() => {
    clearSelection();
  }, [clearSelection]);

  useEffect(() => {
    const handleNodeSelect = (event: Event) => {
      const detail = (event as CustomEvent<{ id: string; kind: FlowNodeData['kind']; anchor?: AnchorRect }>).detail;
      setNodePopover(null);
      setPanel(null);
      setSelectedFlowNodeId(detail.id);
      if (detail.anchor) setSelectedAnchor(detail.anchor);
      setSelectedVideoId(detail.kind === 'video' ? detail.id : null);
    };

    window.addEventListener('prototype-node-select', handleNodeSelect);
    return () => window.removeEventListener('prototype-node-select', handleNodeSelect);
  }, [setPanel, setSelectedFlowNodeId]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((currentEdges) => addEdge({ ...params, type: 'pulse', animated: true }, currentEdges)),
    [setEdges],
  );

  const displayEdges = useMemo(
    () => markActivePathEdges(edges, selectedNodeId),
    [edges, selectedNodeId],
  );

  const addWorkflowNode = useCallback((nodeType: AiNodeType) => {
    const config = nodeCatalog[nodeType];
    const id = `${nodeType}-${Date.now().toString(36)}`;
    const sourceNodeId = selectedNodeId;
    const nextNode = createWorkflowNode({
      id,
      nodeType,
      viewport: viewport.readEditorViewport(),
      viewportSize: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    }) as Node<FlowNodeData>;

    setNodes((currentNodes): Node<FlowNodeData>[] => [...currentNodes, { ...nextNode, selected: false }]);
    if (sourceNodeId) {
      setEdges((currentEdges) =>
        addEdge(
          {
            animated: true,
            id: `e-${sourceNodeId}-${id}`,
            source: sourceNodeId,
            target: id,
            type: 'pulse',
          },
          currentEdges,
        ),
      );
    }
    selectNodeById(id, config.kind);
  }, [selectNodeById, selectedNodeId, setEdges, setNodes, viewport]);

  const arrangeCanvas = useCallback(() => {
    setNodes((currentNodes) => arrangeCanvasNodes(currentNodes));
    requestAnimationFrame(() => {
      requestAnimationFrame(viewport.fitCanvasView);
    });
  }, [setNodes, viewport.fitCanvasView]);

  const restoreDefaultCanvas = useCallback(() => {
    const storage = getCanvasDraftStorage();
    if (storage) clearCanvasDraft(storage);

    setNodes(createInitialCanvasNodes(initialNodes, null));
    setEdges(initialFlowEdges);
    resetEditorState();
    viewport.setCanvasViewport(projectConfig.canvas.defaultViewport, 260);
  }, [resetEditorState, setEdges, setNodes, viewport]);

  const selectedNode = useMemo(
    () =>
      nodes.find((node) => node.id === selectedNodeId)?.data ??
      nodes.find((node) => node.selected)?.data ??
      nodes.find((node) => node.id === 'default-text')?.data,
    [nodes, selectedNodeId],
  );

  const activeSelectedNode = useMemo(
    () => (selectedNodeId ? nodes.find((node) => node.id === selectedNodeId)?.data : undefined),
    [nodes, selectedNodeId],
  );

  const overlayPosition = useMemo(() => {
    if (!selectedAnchor || !activeSelectedNode) return undefined;
    return chooseOverlayPosition(
      selectedAnchor,
      activeSelectedNode.kind === 'video' ? { width: 650, height: 548 } : { width: 520, height: 620 },
      { width: window.innerWidth, height: window.innerHeight },
    );
  }, [activeSelectedNode, selectedAnchor]);

  const importExport = useCanvasImportExport({
    edges,
    nodes,
    readEditorViewport: viewport.readEditorViewport,
    resetEditorState,
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
    selectedNodeId,
    setNodePopover,
    setPanelState,
    setSelectedAnchor,
    setSelectedNodeId: setSelectedFlowNodeId,
    setSelectedVideoId,
    zoomPercent: viewport.zoomPercent,
  });

  return {
    activeSelectedNode,
    addWorkflowNode,
    arrangeCanvas,
    clearSelection,
    defaultViewport: viewport.defaultViewport,
    displayEdges,
    exportCanvas: importExport.exportCanvas,
    fitCanvasView: viewport.fitCanvasView,
    handleMove: viewport.handleMove,
    handleNodeClick,
    handlePaneClick,
    importCanvasFile: importExport.importCanvasFile,
    importInputRef: importExport.importInputRef,
    isConnecting,
    nodePopover,
    nodes,
    edges: displayEdges,
    onConnect,
    onEdgesChange,
    onNodesChange: handleNodesChange,
    openImportDialog: importExport.openImportDialog,
    overlayPosition,
    panel,
    resetCanvasView: viewport.resetCanvasView,
    restoreDefaultCanvas,
    selectedNode,
    selectedNodeId,
    selectedVideoId,
    setIsConnecting,
    setNodePopover,
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
