import {
  addEdge,
  type Connection,
  type Edge,
  type Node,
  type OnSelectionChangeParams,
  useEdgesState,
  useNodesState,
} from '@xyflow/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { arrangeCanvasNodes } from '@/application/canvas/arrangeCanvas';
import { markActivePathEdges } from '@/application/canvas/activePath';
import type { EditorRouteState } from '@/application/canvas/editorRouteState';
import { createWorkflowNode } from '@/application/workflow/createWorkflowNode';
import { projectConfig } from '@/config/projectConfig';
import { createDefaultCanvasNodes, initialEdges } from '@/domain/workflow/defaultCanvas';
import { nodeCatalog } from '@/domain/workflow/nodeCatalog';
import type { AiNodeType, FlowNodeData } from '@/domain/workflow/model';
import { getNodeDomRectById, rectFromElement } from '@/infrastructure/browser/domGeometry';
import { chooseOverlayPosition } from '@/shared/geometry/overlayPosition';
import type { AnchorRect } from '@/shared/geometry/overlayPosition';
import type { NodePopover, Panel } from '@/presentation/editor/editorTypes';
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
  const routeNodeId = routeState?.nodeId ?? null;
  const initialZoom = routeState?.zoom ?? projectConfig.canvas.defaultViewport.zoom;
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<FlowNodeData>>(
    createInitialCanvasNodes(initialNodes, routeNodeId),
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialFlowEdges);
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
  const isClearingSelectionRef = useRef(false);
  const viewport = useCanvasViewport(initialZoom);

  useMagneticHandles(isConnecting);

  const setPanel = useCallback((nextPanel: Panel) => {
    setPanelState(nextPanel);
  }, []);

  const setSelectedFlowNodeId = useCallback((id: string | null) => {
    setSelectedNodeId((currentId) => (currentId === id ? currentId : id));
    setNodes((currentNodes) => markSelectedCanvasNode(currentNodes, id));
  }, [setNodes]);

  const resetEditorState = useCallback(() => {
    setSelectedFlowNodeId(null);
    setSelectedVideoId(null);
    setSelectedAnchor(null);
    setNodePopover(null);
    setPanel(null);
  }, [setPanel, setSelectedFlowNodeId]);

  const clearSelection = useCallback(() => {
    isClearingSelectionRef.current = true;
    setSelectedVideoId(null);
    setSelectedFlowNodeId(null);
    setSelectedAnchor(null);
    setNodePopover(null);

    requestAnimationFrame(() => {
      setSelectedFlowNodeId(null);
      requestAnimationFrame(() => {
        isClearingSelectionRef.current = false;
      });
    });
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

  const handleFlowSelectionChange = useCallback(({ nodes: selectedNodes }: OnSelectionChangeParams) => {
    if (isClearingSelectionRef.current) {
      if (selectedNodes.length > 0) setSelectedFlowNodeId(null);
      return;
    }

    const selectedFlowNode = selectedNodes[0] as Node<FlowNodeData> | undefined;
    if (!selectedFlowNode || selectedFlowNode.id === selectedNodeId) return;
    selectNodeById(selectedFlowNode.id, selectedFlowNode.data.kind);
  }, [selectNodeById, selectedNodeId, setSelectedFlowNodeId]);

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
    const nextNode = createWorkflowNode({
      id,
      nodeType,
      viewport: viewport.readEditorViewport(),
      viewportSize: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    }) as Node<FlowNodeData>;

    setNodes((currentNodes): Node<FlowNodeData>[] => [
      ...currentNodes.map((node) => ({ ...node, selected: false })),
      nextNode,
    ]);
    selectNodeById(id, config.kind);
  }, [selectNodeById, setNodes, viewport]);

  const arrangeCanvas = useCallback(() => {
    setNodes((currentNodes) => arrangeCanvasNodes(currentNodes));
    requestAnimationFrame(() => {
      requestAnimationFrame(viewport.fitCanvasView);
    });
  }, [setNodes, viewport.fitCanvasView]);

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
    handleFlowSelectionChange,
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
    onNodesChange,
    openImportDialog: importExport.openImportDialog,
    overlayPosition,
    panel,
    resetCanvasView: viewport.resetCanvasView,
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
