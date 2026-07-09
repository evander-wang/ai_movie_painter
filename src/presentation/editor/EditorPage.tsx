import {
  addEdge,
  Background,
  BackgroundVariant,
  Connection,
  Controls,
  Edge,
  MiniMap,
  Node,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from '@xyflow/react';
import { projectConfig } from '@/config/projectConfig';
import { arrangeCanvasNodes } from '@/application/canvas/arrangeCanvas';
import { markActivePathEdges } from '@/application/canvas/activePath';
import { buildCanvasExportPayload, parseImportedCanvas } from '@/application/canvas/importExportCanvas';
import { getNextZoomIn, getNextZoomOut } from '@/application/canvas/viewportCommands';
import { createWorkflowNode } from '@/application/workflow/createWorkflowNode';
import { createDefaultCanvasNodes, initialEdges } from '@/domain/workflow/defaultCanvas';
import { nodeCatalog } from '@/domain/workflow/nodeCatalog';
import type { AiNodeType, FlowNodeData } from '@/domain/workflow/model';
import { downloadJson } from '@/infrastructure/browser/downloadJson';
import { getNodeDomRectById, readCurrentViewport, rectFromElement } from '@/infrastructure/browser/domGeometry';
import { edgeTypes } from '@/presentation/editor/reactflow/edgeTypes';
import { NodeAttributePopover } from '@/presentation/editor/overlays/NodeAttributePopover';
import { SelectedVideoOverlay } from '@/presentation/editor/overlays/SelectedVideoOverlay';
import { PanelLayer } from '@/presentation/editor/panels/PanelLayer';
import { CenterToolbar, LeftStatus, TopNav, WorkflowRail } from '@/presentation/editor/toolbars/EditorToolbars';
import { useMagneticHandles } from '@/presentation/editor/state/useMagneticHandles';
import { nodeTypes } from '@/presentation/editor/reactflow/nodeTypes';
import { chooseOverlayPosition } from '@/shared/geometry/overlayPosition';
import type { AnchorRect } from '@/shared/geometry/overlayPosition';
import type { NodePopover, Panel } from '@/presentation/editor/editorTypes';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const initialNodes: Node<FlowNodeData>[] = createDefaultCanvasNodes() as Node<FlowNodeData>[];
const initialFlowEdges: Edge[] = initialEdges as Edge[];

export function EditorPage() {
  return (
    <ReactFlowProvider>
      <CanvasPrototype />
    </ReactFlowProvider>
  );
}

function CanvasPrototype() {
  const reactFlow = useReactFlow<Node<FlowNodeData>, Edge>();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialFlowEdges);
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const [panel, setPanel] = useState<Panel>(null);
  const [nodePopover, setNodePopover] = useState<NodePopover>(null);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedAnchor, setSelectedAnchor] = useState<AnchorRect | null>(null);
  const [showMiniMap, setShowMiniMap] = useState(false);
  const [snap, setSnap] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [zoomPercent, setZoomPercent] = useState(58);
  const readEditorViewport = useCallback(
    () => readCurrentViewport(projectConfig.canvas.defaultViewport.zoom),
    [],
  );

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, type: 'pulse', animated: true }, eds)),
    [setEdges],
  );
  const displayEdges = useMemo(
    () => markActivePathEdges(edges, selectedNodeId),
    [edges, selectedNodeId],
  );

  useMagneticHandles(isConnecting);

  const selectNodeById = useCallback((id: string, kind: FlowNodeData['kind']) => {
    setSelectedNodeId(id);
    setSelectedVideoId(kind === 'video' ? id : null);
    setNodePopover(null);
    setPanel(null);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const rect = getNodeDomRectById(id);
        if (rect) setSelectedAnchor(rect);
      });
    });
  }, []);

  const addWorkflowNode = useCallback((nodeType: AiNodeType) => {
    const config = nodeCatalog[nodeType];
    const id = `${nodeType}-${Date.now().toString(36)}`;
    const nextNode = createWorkflowNode({
      id,
      nodeType,
      viewport: readEditorViewport(),
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
  }, [readEditorViewport, selectNodeById, setNodes]);

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
      setSelectedNodeId(null);
      setSelectedVideoId(null);
      setSelectedAnchor(null);
      setNodePopover(null);
      setPanel(null);
      if (payload.viewport) {
        requestAnimationFrame(() => {
          reactFlow.setViewport(payload.viewport!, { duration: 180 });
        });
      }
    } catch (error) {
      window.alert(error instanceof Error ? error.message : '导入失败');
    }
  }, [reactFlow, setEdges, setNodes]);

  const openImportDialog = useCallback(() => {
    importInputRef.current?.click();
  }, []);

  const fitCanvasView = useCallback(() => {
    reactFlow.fitView({ padding: 0.18, duration: 320, includeHiddenNodes: false });
  }, [reactFlow]);

  const resetCanvasView = useCallback(() => {
    reactFlow.setViewport(projectConfig.canvas.defaultViewport, { duration: 260 });
  }, [reactFlow]);

  const zoomCanvasTo = useCallback((zoom: number) => {
    const viewport = readEditorViewport();
    reactFlow.setViewport({ ...viewport, zoom }, { duration: 180 });
  }, [reactFlow, readEditorViewport]);

  const zoomCanvasIn = useCallback(() => {
    const viewport = readEditorViewport();
    zoomCanvasTo(getNextZoomIn(viewport, projectConfig.canvas.maxZoom));
  }, [readEditorViewport, zoomCanvasTo]);

  const zoomCanvasOut = useCallback(() => {
    const viewport = readEditorViewport();
    zoomCanvasTo(getNextZoomOut(viewport, projectConfig.canvas.minZoom));
  }, [readEditorViewport, zoomCanvasTo]);

  const arrangeCanvas = useCallback(() => {
    setNodes((currentNodes) => arrangeCanvasNodes(currentNodes));
    requestAnimationFrame(() => {
      requestAnimationFrame(fitCanvasView);
    });
  }, [fitCanvasView, setNodes]);

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

  useEffect(() => {
    const handleNodeSelect = (event: Event) => {
      const detail = (event as CustomEvent<{ id: string; kind: FlowNodeData['kind']; anchor?: AnchorRect }>).detail;
      setNodePopover(null);
      setPanel(null);
      setSelectedNodeId(detail.id);
      if (detail.anchor) setSelectedAnchor(detail.anchor);
      setSelectedVideoId(detail.kind === 'video' ? detail.id : null);
    };

    window.addEventListener('prototype-node-select', handleNodeSelect);
    return () => window.removeEventListener('prototype-node-select', handleNodeSelect);
  }, []);

  return (
    <div className="app-shell">
      <input
        ref={importInputRef}
        className="hidden-file-input"
        type="file"
        accept="application/json,.json"
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          event.currentTarget.value = '';
          if (file) void importCanvasFile(file);
        }}
      />
      <TopNav />
      <div className={`canvas-wrap ${isConnecting ? 'is-connecting' : ''}`}>
        <ReactFlow
          nodes={nodes}
          edges={displayEdges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onConnectStart={() => setIsConnecting(true)}
          onConnectEnd={() => setIsConnecting(false)}
          onMove={(_, viewport) => setZoomPercent(Math.round(viewport.zoom * 100))}
          onNodeClick={(_, node) => {
            setNodePopover(null);
            setPanel(null);
            setSelectedNodeId(node.id);
            const nodeElement = document.querySelector(`[data-id="${node.id}"]`);
            if (nodeElement) setSelectedAnchor(rectFromElement(nodeElement));
            setSelectedVideoId(node.data.kind === 'video' ? node.id : null);
          }}
          onPaneClick={() => {
            setSelectedVideoId(null);
            setSelectedNodeId(null);
            setSelectedAnchor(null);
            setNodePopover(null);
          }}
          defaultViewport={projectConfig.canvas.defaultViewport}
          minZoom={projectConfig.canvas.minZoom}
          maxZoom={projectConfig.canvas.maxZoom}
          snapToGrid={snap}
          snapGrid={[projectConfig.canvas.snapGrid, projectConfig.canvas.snapGrid]}
          fitView={false}
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} gap={projectConfig.canvas.snapGrid} size={1.15} />
          <Controls showInteractive={false} position="bottom-right" />
          {showMiniMap && (
            <MiniMap
              pannable
              zoomable
              position="bottom-left"
              nodeColor={(node) => (node.data.kind === 'group' ? '#27313e' : '#49b6d6')}
            />
          )}
        </ReactFlow>
      </div>

      <LeftStatus
        snap={snap}
        setSnap={setSnap}
        setShowMiniMap={setShowMiniMap}
        setPanel={setPanel}
        onExportCanvas={exportCanvas}
        onImportCanvas={openImportDialog}
        onArrangeCanvas={arrangeCanvas}
        onZoomIn={zoomCanvasIn}
        onZoomOut={zoomCanvasOut}
        zoomPercent={zoomPercent}
      />
      <CenterToolbar setPanel={setPanel} activePanel={panel} />
      <WorkflowRail activePanel={panel} setPanel={setPanel} />
      {selectedVideoId && activeSelectedNode?.kind === 'video' && (
        <SelectedVideoOverlay
          node={activeSelectedNode}
          position={overlayPosition}
          activePopover={nodePopover}
          setActivePopover={setNodePopover}
          openExpand={() => setPanel('selectedExpand')}
        />
      )}
      {activeSelectedNode && activeSelectedNode.kind !== 'video' && !panel && (
        <NodeAttributePopover
          node={activeSelectedNode}
          position={overlayPosition}
          onClose={() => {
            setSelectedNodeId(null);
            setSelectedAnchor(null);
          }}
        />
      )}
      <PanelLayer
        panel={panel}
        setPanel={setPanel}
        selectedNode={selectedNode}
        onAddNode={addWorkflowNode}
        onFitView={fitCanvasView}
        onZoom100={() => zoomCanvasTo(1)}
        onZoomOut={zoomCanvasOut}
        onResetView={resetCanvasView}
      />
    </div>
  );
}
