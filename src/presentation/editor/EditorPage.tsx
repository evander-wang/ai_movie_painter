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
import {
  Archive,
  AlertTriangle,
  BadgeHelp,
  BookOpen,
  Box,
  ChevronsUpDown,
  CheckCircle2,
  Clock3,
  Captions,
  ChevronDown,
  Clapperboard,
  Copy,
  Cpu,
  Download,
  Expand,
  Film,
  FolderOpen,
  Gauge,
  GitBranch,
  Grid3X3,
  ImageIcon,
  Keyboard,
  Layers3,
  Library,
  ListPlus,
  Maximize2,
  MessageSquareText,
  Minus,
  Minimize2,
  MousePointer2,
  Plus,
  Scissors,
  Search,
  Settings2,
  Share2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Split,
  Square,
  Upload,
  UserRound,
  Video,
  Volume2,
  WandSparkles,
  X,
  Zap,
  Pause,
  Play,
  RefreshCcw,
  Rows3,
  Timer,
} from 'lucide-react';
import { projectConfig } from '@/config/projectConfig';
import { arrangeCanvasNodes } from '@/application/canvas/arrangeCanvas';
import { markActivePathEdges } from '@/application/canvas/activePath';
import { buildCanvasExportPayload, parseImportedCanvas } from '@/application/canvas/importExportCanvas';
import { getNextZoomIn, getNextZoomOut } from '@/application/canvas/viewportCommands';
import { createWorkflowNode } from '@/application/workflow/createWorkflowNode';
import { createDefaultCanvasNodes, initialEdges } from '@/domain/workflow/defaultCanvas';
import { nodeCatalog } from '@/domain/workflow/nodeCatalog';
import { workflowGroups } from '@/domain/workflow/workflowGroups';
import { makeNodePreview } from '@/domain/workflow/nodeFactory';
import type { AiNodeType, FlowNodeData, NodeAttributeConfig, NodeKind } from '@/domain/workflow/model';
import { downloadJson } from '@/infrastructure/browser/downloadJson';
import { getNodeDomRectById, readCurrentViewport, rectFromElement } from '@/infrastructure/browser/domGeometry';
import { edgeTypes } from '@/presentation/editor/reactflow/edgeTypes';
import { useDraggableOverlay } from '@/presentation/editor/state/useDraggableOverlay';
import { useMagneticHandles } from '@/presentation/editor/state/useMagneticHandles';
import { nodeTypes } from '@/presentation/editor/reactflow/nodeTypes';
import { chooseOverlayPosition } from '@/shared/geometry/overlayPosition';
import type { AnchorRect, OverlayPosition } from '@/shared/geometry/overlayPosition';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type Panel =
  | 'toolbox'
  | 'assets'
  | 'characters'
  | 'history'
  | 'shortcuts'
  | 'zoom'
  | 'nodeMenu'
  | 'selectedExpand'
  | 'nodeInspector'
  | 'storyboard'
  | 'timeline'
  | 'queue'
  | null;

type NodePopover = 'edit' | 'crop' | 'hd' | 'parse' | 'subtitle' | 'audio' | 'download' | null;

const swatches = [
  '#F05B5B',
  '#F59E0B',
  '#10B981',
  '#23A6F2',
  '#8B5CF6',
  '#F472B6',
];

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

function TopNav() {
  return (
    <header className="top-nav">
      <div className="brand-block">
        <div className="brand-mark">
          <Split size={20} />
        </div>
        <button className="project-name">{projectConfig.app.displayName}</button>
      </div>
      <div className="top-actions">
        <button className="promo-button">
          <Sparkles size={15} />
          <span>会员特惠</span>
          <strong>37折</strong>
        </button>
        <button className="credit-button">
          <Zap size={15} />
          68
        </button>
        <button className="avatar-button">
          <UserRound size={18} />
        </button>
      </div>
    </header>
  );
}

function CenterToolbar({ setPanel, activePanel }: { setPanel: (panel: Panel) => void; activePanel: Panel }) {
  const tools: Array<[Panel, React.ReactNode, string]> = [
    ['nodeMenu', <Plus size={20} />, '添加节点'],
    ['toolbox', <Box size={18} />, '打开工具箱'],
    ['assets', <Library size={18} />, '素材库'],
    ['characters', <UserRound size={18} />, '角色库'],
    ['history', <Clock3 size={18} />, '历史记录'],
    ['shortcuts', <Keyboard size={18} />, '快捷键'],
  ];

  return (
    <div className="center-toolbar" role="toolbar">
      {tools.map(([key, icon, label]) => (
        <button
          key={key}
          className={activePanel === key ? 'active' : ''}
          title={label}
          onClick={() => setPanel(activePanel === key ? null : key)}
        >
          {icon}
        </button>
      ))}
      <span className="tool-divider" />
      <button title="教程">
        <BadgeHelp size={18} />
      </button>
    </div>
  );
}

function WorkflowRail({ activePanel, setPanel }: { activePanel: Panel; setPanel: (panel: Panel) => void }) {
  const tools: Array<[Panel, React.ReactNode, string, string]> = [
    ['nodeInspector', <Settings2 size={17} />, '参数', '节点详情参数面板'],
    ['storyboard', <Layers3 size={17} />, '分镜', 'Storyboard 分镜面板'],
    ['timeline', <Rows3 size={17} />, '时间线', '拼接与轨道预览'],
    ['queue', <Timer size={17} />, '任务', '生成任务队列'],
  ];

  return (
    <div className="workflow-rail" role="toolbar" aria-label="AI 视频工作流工具">
      {tools.map(([key, icon, label, title]) => (
        <button
          key={key}
          className={activePanel === key ? 'active' : ''}
          title={title}
          onClick={() => setPanel(activePanel === key ? null : key)}
        >
          {icon}
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}

function LeftStatus({
  snap,
  setSnap,
  setShowMiniMap,
  setPanel,
  onExportCanvas,
  onImportCanvas,
  onArrangeCanvas,
  onZoomIn,
  onZoomOut,
  zoomPercent,
}: {
  snap: boolean;
  setSnap: (snap: boolean) => void;
  setShowMiniMap: (value: (prev: boolean) => boolean) => void;
  setPanel: (panel: Panel) => void;
  onExportCanvas: () => void;
  onImportCanvas: () => void;
  onArrangeCanvas: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  zoomPercent: number;
}) {
  return (
    <div className="left-status">
      <button title="资产管理">
        <Archive size={16} />
        <span>资产管理</span>
      </button>
      <button title="整理画布" onClick={onArrangeCanvas}>
        <Grid3X3 size={16} />
      </button>
      <button title="切换小地图" onClick={() => setShowMiniMap((prev) => !prev)}>
        <MousePointer2 size={16} />
      </button>
      <button className={snap ? 'active' : ''} title="网格吸附" onClick={() => setSnap(!snap)}>
        <Grid3X3 size={16} />
      </button>
      <button title="导出画布 JSON" onClick={onExportCanvas}>
        <Download size={16} />
        <span>导出</span>
      </button>
      <button title="导入画布 JSON" onClick={onImportCanvas}>
        <Upload size={16} />
        <span>导入</span>
      </button>
      <button title="缩小画布" onClick={onZoomOut}>
        <Minus size={16} />
      </button>
      <button className="zoom-chip" title="缩放选项" onClick={() => setPanel('zoom')}>
        {zoomPercent}%
      </button>
      <button title="放大画布" onClick={onZoomIn}>
        <Plus size={16} />
      </button>
    </div>
  );
}

function PanelLayer({
  panel,
  setPanel,
  selectedNode,
  onAddNode,
  onFitView,
  onZoom100,
  onZoomOut,
  onResetView,
}: {
  panel: Panel;
  setPanel: (panel: Panel) => void;
  selectedNode?: FlowNodeData;
  onAddNode: (nodeType: AiNodeType) => void;
  onFitView: () => void;
  onZoom100: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
}) {
  return (
    <>
      {panel === 'nodeMenu' && <NodeMenu onAddNode={onAddNode} onClose={() => setPanel(null)} />}
      {panel === 'zoom' && (
        <ZoomPopover
          onClose={() => setPanel(null)}
          onFitView={onFitView}
          onZoom100={onZoom100}
          onZoomOut={onZoomOut}
          onResetView={onResetView}
        />
      )}
      {panel === 'shortcuts' && <ShortcutsModal onClose={() => setPanel(null)} />}
      {panel === 'selectedExpand' && <SelectedExpandModal onClose={() => setPanel(null)} />}
      {panel === 'nodeInspector' && <NodeInspectorPanel onClose={() => setPanel(null)} />}
      {panel === 'storyboard' && <StoryboardPanel onClose={() => setPanel(null)} />}
      {panel === 'timeline' && <TimelinePanel onClose={() => setPanel(null)} />}
      {panel === 'queue' && <QueuePanel onClose={() => setPanel(null)} />}
      {['toolbox', 'assets', 'characters', 'history'].includes(panel ?? '') && (
        <SideDrawer panel={panel} onClose={() => setPanel(null)} selectedNode={selectedNode} />
      )}
    </>
  );
}

function NodeAttributePopover({
  node,
  position,
  onClose,
}: {
  node: FlowNodeData;
  position?: OverlayPosition;
  onClose: () => void;
}) {
  const { dragStyle, dragHandleProps } = useDraggableOverlay(position);
  const config = node.nodeType ? nodeCatalog[node.nodeType] : undefined;
  const iconMap: Record<NodeKind, React.ReactNode> = {
    image: <ImageIcon size={17} />,
    text: <MessageSquareText size={17} />,
    audio: <Volume2 size={17} />,
    group: <FolderOpen size={17} />,
    video: <Video size={17} />,
    tool: <Settings2 size={17} />,
  };

  return (
    <aside className={`node-attribute-popover ${node.kind}`} style={dragStyle}>
      <div className="attribute-head draggable-handle" {...dragHandleProps}>
        <div className="attribute-title">
          <span className={`attribute-icon ${node.kind}`}>{iconMap[node.kind]}</span>
          <div>
            <strong>{node.title}</strong>
            <small>{getNodeSubtitle(node)}</small>
          </div>
        </div>
        <button onClick={onClose}>
          <X size={17} />
        </button>
      </div>
      {config && <ConfigAttributePanel node={node} config={config} />}
      {!config && node.kind === 'image' && <ImageAttributePanel node={node} />}
      {!config && node.kind === 'text' && <TextAttributePanel node={node} />}
      {!config && node.kind === 'audio' && <AudioAttributePanel />}
      {!config && node.kind === 'group' && <GroupAttributePanel node={node} />}
    </aside>
  );
}

function getNodeSubtitle(node: FlowNodeData) {
  if (node.nodeType) return `${nodeCatalog[node.nodeType].category} · ${nodeCatalog[node.nodeType].summary}`;
  if (node.kind === 'image') return `${node.size ?? '参考图'} · 可作为角色/场景/风格约束`;
  if (node.kind === 'text') return `${node.size ?? 'Prompt'} · 可连接到多个生成节点`;
  if (node.kind === 'audio') return `${node.size ?? '音频'} · 人声/音乐/环境声处理`;
  if (node.kind === 'group') return `${node.count ?? 0} 个节点 · 批量管理与一致性约束`;
  if (node.kind === 'tool') return `${node.size ?? '工具'} · 工作流处理节点`;
  return `${node.size ?? '视频'} · 生成结果`;
}

function ConfigAttributePanel({ node, config }: { node: FlowNodeData; config: NodeAttributeConfig }) {
  return (
    <div className="attribute-body config-attribute-body">
      <div className="config-hero">
        <div className={`config-preview ${config.kind}`} style={{ background: node.preview ?? makeNodePreview(config) }}>
          {config.kind === 'video' && <Film size={28} />}
          {config.kind === 'image' && <ImageIcon size={28} />}
          {config.kind === 'text' && <MessageSquareText size={28} />}
          {config.kind === 'audio' && <Volume2 size={28} />}
          {config.kind === 'tool' && <Settings2 size={28} />}
        </div>
        <div className="config-summary">
          <span>{config.category}</span>
          <p>{config.summary}</p>
        </div>
      </div>
      <div className="attribute-tabs">
        {config.tabs.map((tab, index) => (
          <button key={tab} className={index === 0 ? 'active' : ''}>{tab}</button>
        ))}
      </div>
      <div className="attribute-metrics">
        {config.metrics.map(([label, value]) => (
          <div key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
      <div className="structured-list dense">
        {config.fields.map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <div className="attribute-section">
        <div className="attribute-section-title">能力开关</div>
        <div className="chip-grid">
          {config.chips.map((item, index) => (
            <button key={item} className={config.activeChips.includes(index) ? 'active' : ''}>{item}</button>
          ))}
        </div>
      </div>
      {config.sliders.map(([label, value]) => (
        <AttributeSlider key={label} label={label} value={value} />
      ))}
      <div className="attribute-actions">
        {config.actions.map((action, index) => (
          <button key={action}>
            {index === 0 ? <Play size={15} /> : index === 1 ? <Sparkles size={15} /> : <GitBranch size={15} />}
            {action}
          </button>
        ))}
      </div>
    </div>
  );
}

function ImageAttributePanel({ node }: { node: FlowNodeData }) {
  return (
    <div className="attribute-body">
      <div className="attribute-preview" style={{ background: node.preview }}>
        <span>参考图</span>
      </div>
      <div className="attribute-tabs">
        {['参考设置', '裁剪', '用途', '版本'].map((tab, index) => (
          <button key={tab} className={index === 0 ? 'active' : ''}>{tab}</button>
        ))}
      </div>
      <div className="attribute-metrics">
        {[
          ['权重', '78'],
          ['绑定节点', '3'],
          ['相似度', '高'],
          ['版本', 'v4'],
        ].map(([label, value]) => (
          <div key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
      <div className="attribute-section">
        <div className="attribute-section-title">参考用途</div>
        <div className="chip-grid">
          {['角色外观', '服装道具', '场景光线', '构图比例'].map((item, index) => (
            <button key={item} className={index < 2 ? 'active' : ''}>{item}</button>
          ))}
        </div>
      </div>
      <AttributeSlider label="角色一致性" value={86} />
      <AttributeSlider label="风格迁移强度" value={52} />
      <div className="attribute-actions">
        <button><ShieldCheck size={15} />设为角色参考</button>
        <button><Video size={15} />生成视频</button>
        <button><Scissors size={15} />抠像裁剪</button>
      </div>
    </div>
  );
}

function TextAttributePanel({ node }: { node: FlowNodeData }) {
  return (
    <div className="attribute-body">
      <div className="attribute-tabs">
        {['Prompt', '结构化', '负向词', '下游'].map((tab, index) => (
          <button key={tab} className={index === 0 ? 'active' : ''}>{tab}</button>
        ))}
      </div>
      <div className="prompt-editor">
        <small>镜头描述</small>
        <p>{node.body}</p>
      </div>
      <div className="attribute-section">
        <div className="attribute-section-title">Prompt 类型</div>
        <div className="chip-grid">
          {['全局约束', '分镜描述', '镜头语言', '负向约束'].map((item, index) => (
            <button key={item} className={index === 1 ? 'active' : ''}>{item}</button>
          ))}
        </div>
      </div>
      <div className="structured-list">
        {[
          ['景别', '中近景 / 局部特写'],
          ['运镜', '极缓推进，轻微右移'],
          ['主体', '爷爷与孙子肩以下、手部、背影'],
          ['禁用', '正脸、五官特写、背景音乐'],
        ].map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <div className="attribute-actions">
        <button><Layers3 size={15} />拆成分镜</button>
        <button><GitBranch size={15} />应用到下游</button>
        <button><Sparkles size={15} />优化提示词</button>
      </div>
    </div>
  );
}

function AudioAttributePanel() {
  return (
    <div className="attribute-body">
      <div className="waveform">
        {Array.from({ length: 34 }).map((_, index) => (
          <i key={index} style={{ height: `${18 + ((index * 17) % 34)}px` }} />
        ))}
      </div>
      <div className="attribute-tabs">
        {['分离', '音量', '降噪', '导出'].map((tab, index) => (
          <button key={tab} className={index === 0 ? 'active' : ''}>{tab}</button>
        ))}
      </div>
      <div className="audio-channel-list">
        {[
          ['人声', '已分离', 82],
          ['环境声', '可增强', 48],
          ['背景音乐', '静音约束', 0],
        ].map(([label, state, value]) => (
          <div key={label as string}>
            <span>{label as string}</span>
            <small>{state as string}</small>
            <b>{value}%</b>
          </div>
        ))}
      </div>
      <AttributeSlider label="降噪强度" value={64} />
      <AttributeSlider label="环境声保留" value={35} />
      <div className="attribute-actions">
        <button><Volume2 size={15} />重新分离</button>
        <button><Download size={15} />导出 WAV</button>
        <button><Captions size={15} />生成字幕</button>
      </div>
    </div>
  );
}

function GroupAttributePanel({ node }: { node: FlowNodeData }) {
  return (
    <div className="attribute-body">
      <div className="group-overview">
        <div>
          <strong>{node.count ?? 0}</strong>
          <span>节点</span>
        </div>
        <div>
          <strong>5</strong>
          <span>视频</span>
        </div>
        <div>
          <strong>2</strong>
          <span>参考</span>
        </div>
        <div>
          <strong>1</strong>
          <span>约束</span>
        </div>
      </div>
      <div className="attribute-section">
        <div className="attribute-section-title">批量策略</div>
        <div className="chip-grid">
          {['统一模型', '锁定角色', '继承负向词', '自动排版'].map((item, index) => (
            <button key={item} className={index !== 0 ? 'active' : ''}>{item}</button>
          ))}
        </div>
      </div>
      <div className="structured-list">
        {[
          ['默认模型', 'Seedance 2.0'],
          ['输出比例', '16:9 · 720P'],
          ['命名规则', '分组名 + 镜头序号'],
          ['失败策略', '自动重试 1 次'],
        ].map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <div className="attribute-actions">
        <button><Grid3X3 size={15} />整理分组</button>
        <button><Play size={15} />批量生成</button>
        <button><Archive size={15} />加入资产</button>
      </div>
    </div>
  );
}

function AttributeSlider({ label, value }: { label: string; value: number }) {
  return (
    <div className="attribute-slider">
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <i>
        <b style={{ width: `${value}%` }} />
      </i>
    </div>
  );
}

function SelectedVideoOverlay({
  node,
  position,
  activePopover,
  setActivePopover,
  openExpand,
}: {
  node: FlowNodeData;
  position?: OverlayPosition;
  activePopover: NodePopover;
  setActivePopover: (popover: NodePopover) => void;
  openExpand: () => void;
}) {
  const { dragStyle, dragHandleProps } = useDraggableOverlay(position);
  const config = node.nodeType ? nodeCatalog[node.nodeType] : nodeCatalog.textToVideo;
  const toolButtons: Array<[NodePopover, React.ReactNode, string]> = [
    ['edit', <Scissors size={15} />, '剪辑'],
    ['crop', <Square size={15} />, '裁剪'],
    ['hd', <span className="hd-badge">HD</span>, '高清'],
    ['parse', <BookOpen size={15} />, '解析'],
    ['subtitle', <Captions size={15} />, '智能去字幕'],
    ['audio', <Volume2 size={15} />, '音频分离'],
  ];

  return (
    <div className="selected-video-overlay" style={dragStyle}>
      <div className="selected-media-node draggable-handle" {...dragHandleProps}>
        <div className="node-caption">{node.title} · {config.category}</div>
        <div className="selected-media-preview" style={{ background: node.preview ?? makeNodePreview(config) }}>
          <div className="play-chip">00:00</div>
          <div className="duration-chip">00:06</div>
        </div>
      </div>

      <div className="floating-video-toolbar">
        {toolButtons.map(([key, icon, label]) => (
          <button
            key={key}
            className={activePopover === key ? 'active' : ''}
            onClick={() => setActivePopover(activePopover === key ? null : key)}
          >
            {icon}
            <span>{label}</span>
            {(key === 'subtitle' || key === 'audio') && <ChevronDown size={13} />}
          </button>
        ))}
        <span className="toolbar-separator" />
        <button onClick={() => setActivePopover(activePopover === 'download' ? null : 'download')}>
          <Download size={16} />
        </button>
        <button onClick={openExpand}>
          <Expand size={16} />
        </button>
      </div>

      {activePopover && <ToolbarPopover type={activePopover} />}
      <VideoConfigCard node={node} config={config} openExpand={openExpand} />
    </div>
  );
}

function ToolbarPopover({ type }: { type: NodePopover }) {
  const content: Record<Exclude<NodePopover, null>, Array<[React.ReactNode, string, string]>> = {
    edit: [
      [<Scissors size={15} />, '分割片段', '按当前时间点切成两个节点'],
      [<Clapperboard size={15} />, '替换镜头', '保留参数并重新生成画面'],
      [<Copy size={15} />, '复制为副本', '复制视频和生成参数'],
    ],
    crop: [
      [<Square size={15} />, '16:9 · 720P', '当前节点输出比例'],
      [<Square size={15} />, '9:16 · 720P', '竖屏短视频构图'],
      [<Maximize2 size={15} />, '自由裁剪', '拖动裁剪框重新取景'],
    ],
    hd: [
      [<span className="hd-badge">HD</span>, '高清增强', '提升清晰度和细节质感'],
      [<WandSparkles size={15} />, '电影级质感', '增强自然光、景深和胶片感'],
      [<ShieldCheck size={15} />, '保持主体一致', '避免角色脸部和服饰漂移'],
    ],
    parse: [
      [<BookOpen size={15} />, '解析镜头语言', '读取运镜、景别和主体动作'],
      [<ListPlus size={15} />, '生成分镜描述', '输出可复制的文字节点'],
      [<Sparkles size={15} />, '提取参考风格', '保存为全能参考'],
    ],
    subtitle: [
      [<Captions size={15} />, '智能去字幕', '去除底部字幕和水印区域'],
      [<ShieldCheck size={15} />, '保护人物边缘', '减少背景修补痕迹'],
      [<ChevronDown size={15} />, '强度：标准', '适合干净室内镜头'],
    ],
    audio: [
      [<Volume2 size={15} />, '音频分离', '拆分人声、环境声和音乐'],
      [<Zap size={15} />, '静音输出', '保留视频画面，移除声音'],
      [<Download size={15} />, '导出音频', '生成独立音频素材节点'],
    ],
    download: [
      [<Download size={15} />, '下载 720P MP4', '导出当前节点结果'],
      [<ImageIcon size={15} />, '导出首帧', '保存为图片参考'],
      [<Copy size={15} />, '复制资源链接', '复制当前视频地址'],
    ],
  };

  return (
    <div className="toolbar-popover">
      {content[type as Exclude<NodePopover, null>].map(([icon, title, desc]) => (
        <button key={title}>
          {icon}
          <span>
            <strong>{title}</strong>
            <small>{desc}</small>
          </span>
        </button>
      ))}
    </div>
  );
}

function VideoConfigCard({
  node,
  config,
  openExpand,
}: {
  node: FlowNodeData;
  config: NodeAttributeConfig;
  openExpand: () => void;
}) {
  const references = [
    'linear-gradient(135deg,#f8f8f4,#bfc4c5 50%,#f8f8f4)',
    'linear-gradient(135deg,#e9d8bd,#4b7a9a 48%,#f0d295)',
    'radial-gradient(circle at 42% 36%,#b77957,#321915 48%,#c1a67b)',
    'linear-gradient(135deg,#d8c6a5,#8b4b32 45%,#222)',
    'linear-gradient(135deg,#a66538,#f0b36a 52%,#221b17)',
    'linear-gradient(135deg,#8d5d3c,#d7b373 48%,#2d241e)',
  ];

  return (
    <section className="video-config-card">
      <button className="card-expand" onClick={openExpand} aria-label="展开参数卡">
        <Expand size={15} />
      </button>
      <div className="mode-tabs">
        {config.tabs.slice(0, 5).map((tab, index) => (
          <button key={tab} className={index === 1 ? 'active' : ''}>
            {tab}
          </button>
        ))}
      </div>
      <div className="quick-actions">
        {[
          ['标记', Search],
          ['特效', ImageIcon],
          ['角色库', ShieldCheck],
          ['参考', Plus],
        ].map(([label, Icon]) => (
          <button key={label as string}>
            <Icon size={15} />
            <span>{label as string}</span>
          </button>
        ))}
        <div className="reference-strip">
          {references.map((bg, index) => (
            <button key={index} style={{ background: bg }}>
              <span>{index + 1}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="prompt-scroll">
        <p>## {node.title} · {config.category}</p>
        <p>{config.summary}</p>
        <p>{config.fields.map(([label, value]) => `${label}：${value}`).join('；')}</p>
      </div>
      <div className="video-attribute-compact">
        <div className="video-metrics-row">
          {config.metrics.map(([label, value]) => (
            <span key={label}>
              <strong>{value}</strong>
              <small>{label}</small>
            </span>
          ))}
        </div>
        <div className="video-chip-row">
          {config.chips.slice(0, 4).map((chip, index) => (
            <button key={chip} className={config.activeChips.includes(index) ? 'active' : ''}>{chip}</button>
          ))}
        </div>
        <div className="video-action-row">
          {config.actions.map((action, index) => (
            <button key={action}>
              {index === 0 ? <Play size={14} /> : index === 1 ? <Sparkles size={14} /> : <GitBranch size={14} />}
              {action}
            </button>
          ))}
        </div>
      </div>
      <div className="config-footer">
        <button><SlidersHorizontal size={15} />{config.metrics[0]?.[1]} <span className="tiny-gold">◆</span></button>
        <button><Square size={15} />{config.fields[1]?.[1] ?? '16:9 · 720P · 4s'}</button>
        <button><Volume2 size={15} /></button>
        <button><Clapperboard size={15} />运镜</button>
        <button><ListPlus size={15} /></button>
        <button><Share2 size={15} /></button>
        <button>1个<ChevronDown size={13} /></button>
        <button className="cost">✦ {config.metrics.find(([label]) => label === '消耗')?.[1] ?? '108'}</button>
        <button className="submit-arrow"><Upload size={18} /></button>
      </div>
    </section>
  );
}

function SelectedExpandModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="modal-backdrop">
      <section className="selected-expand-modal">
        <div className="modal-head">
          <div>
            <span>视频节点 5 - 副本</span>
            <p>全能参考 · 16:9 · 720P · 4s</p>
          </div>
          <button onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="expand-layout">
          <div className="expand-video">
            <div className="play-chip">00:00</div>
            <div className="duration-chip">00:06</div>
          </div>
          <div className="expand-data">
            <h3>节点参数</h3>
            <dl>
              <dt>模型</dt>
              <dd>Seedance 2.0</dd>
              <dt>比例</dt>
              <dd>16:9</dd>
              <dt>清晰度</dt>
              <dd>720P</dd>
              <dt>时长</dt>
              <dd>4s</dd>
              <dt>参考数量</dt>
              <dd>6 张图片参考</dd>
              <dt>消耗</dt>
              <dd>108 积分</dd>
            </dl>
          </div>
        </div>
      </section>
    </div>
  );
}

function NodeMenu({ onAddNode, onClose }: { onAddNode: (nodeType: AiNodeType) => void; onClose: () => void }) {
  return (
    <div className="popover node-menu">
      <div className="popover-head">
        <div>
          <strong>添加节点</strong>
          <small>选择一种 AI 视频工作流节点，添加到当前视口中心</small>
        </div>
        <button onClick={onClose}>
          <X size={15} />
        </button>
      </div>
      <div className="node-menu-library">
        {workflowGroups.map((group) => (
          <section key={group.id} className="node-menu-section">
            <div className="node-menu-section-head">
              <span style={{ background: group.accent }} />
              <strong>{group.title}</strong>
              <small>{group.count}</small>
            </div>
            <div className="node-menu-grid">
              {group.nodeTypes.map((nodeType) => {
                const config = nodeCatalog[nodeType];
                return (
                  <button
                    key={nodeType}
                    onClick={() => {
                      onAddNode(nodeType);
                      onClose();
                    }}
                  >
                    <span className={`node-kind ${config.kind}`}>
                      {config.kind === 'video' && <Video size={13} />}
                      {config.kind === 'image' && <ImageIcon size={13} />}
                      {config.kind === 'text' && <MessageSquareText size={13} />}
                      {config.kind === 'audio' && <Zap size={13} />}
                      {config.kind === 'tool' && <Settings2 size={13} />}
                    </span>
                    <span>{config.label}</span>
                    <small>{config.summary}</small>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function ZoomPopover({
  onClose,
  onFitView,
  onZoom100,
  onZoomOut,
  onResetView,
}: {
  onClose: () => void;
  onFitView: () => void;
  onZoom100: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
}) {
  const options = [
    { label: '适应屏幕', shortcut: 'F', icon: <Maximize2 size={16} />, action: onFitView },
    { label: '缩放到 100%', shortcut: '100%', icon: <Maximize2 size={16} />, action: onZoom100 },
    { label: '缩小一级', shortcut: '-18%', icon: <Minimize2 size={16} />, action: onZoomOut },
    { label: '重置视图', shortcut: '58%', icon: <Minimize2 size={16} />, action: onResetView },
  ];

  return (
    <div className="popover zoom-popover">
      <div className="popover-head">
        <strong>缩放选项</strong>
        <button onClick={onClose}>
          <X size={15} />
        </button>
      </div>
      {options.map((item) => (
        <button
          key={item.label}
          className="menu-row"
          onClick={() => {
            item.action();
            onClose();
          }}
        >
          {item.icon}
          <span>{item.label}</span>
          <kbd>{item.shortcut}</kbd>
        </button>
      ))}
    </div>
  );
}

function ShortcutsModal({ onClose }: { onClose: () => void }) {
  const rows = [
    ['空格 + 拖拽', '平移画布'],
    ['⌘ / Ctrl + 滚轮', '缩放画布'],
    ['Option + Shift + F', '整理画布'],
    ['⌘ / Ctrl + C', '复制节点'],
    ['⌘ / Ctrl + V', '粘贴节点'],
    ['Delete', '删除选中节点'],
  ];

  return (
    <div className="modal-backdrop">
      <section className="shortcut-modal">
        <div className="modal-head">
          <div>
            <span>快捷键</span>
            <p>高频操作会保持在画布底部工具条附近。</p>
          </div>
          <button onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="shortcut-list">
          {rows.map(([key, action]) => (
            <div key={key}>
              <kbd>{key}</kbd>
              <span>{action}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function NodeInspectorPanel({ onClose }: { onClose: () => void }) {
  const sliders = [
    ['运动强度', 68, '更明显的推拉摇移'],
    ['风格强度', 42, '保留写实质感'],
    ['角色一致性', 86, '锁定服装与体态'],
    ['镜头稳定', 73, '减少主体漂移'],
  ] as const;

  return (
    <aside className="workflow-panel inspector-panel">
      <div className="drawer-head">
        <div>
          <span>节点详情参数</span>
          <small>视频节点 5 - 副本 · 全能参考</small>
        </div>
        <button onClick={onClose}>
          <X size={18} />
        </button>
      </div>
      <div className="workflow-body">
        <section className="parameter-section">
          <div className="section-title">
            <Cpu size={16} />
            <span>生成模型</span>
          </div>
          <div className="segmented-grid">
            {['Seedance 2.0', 'Kling 3.0', 'Runway Gen-4', 'Veo 3'].map((item, index) => (
              <button key={item} className={index === 0 ? 'active' : ''}>{item}</button>
            ))}
          </div>
        </section>

        <section className="parameter-section compact-parameter-grid">
          <label>
            <span>画幅</span>
            <div className="mini-segment">
              {['16:9', '9:16', '1:1'].map((item, index) => (
                <button key={item} className={index === 0 ? 'active' : ''}>{item}</button>
              ))}
            </div>
          </label>
          <label>
            <span>清晰度</span>
            <div className="mini-segment">
              {['720P', '1080P', '2K'].map((item, index) => (
                <button key={item} className={index === 1 ? 'active' : ''}>{item}</button>
              ))}
            </div>
          </label>
          <label>
            <span>时长</span>
            <div className="mini-segment">
              {['4s', '8s', '12s'].map((item, index) => (
                <button key={item} className={index === 0 ? 'active' : ''}>{item}</button>
              ))}
            </div>
          </label>
          <label>
            <span>采样</span>
            <div className="mini-segment">
              {['标准', '精细'].map((item, index) => (
                <button key={item} className={index === 1 ? 'active' : ''}>{item}</button>
              ))}
            </div>
          </label>
        </section>

        <section className="parameter-section">
          <div className="section-title">
            <Gauge size={16} />
            <span>控制强度</span>
          </div>
          <div className="slider-stack">
            {sliders.map(([label, value, hint]) => (
              <div className="slider-row" key={label}>
                <div>
                  <strong>{label}</strong>
                  <small>{hint}</small>
                </div>
                <span>{value}</span>
                <div className="fake-slider">
                  <i style={{ width: `${value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="parameter-section">
          <div className="section-title">
            <ShieldCheck size={16} />
            <span>一致性锁定</span>
          </div>
          <div className="lock-list">
            {['角色锁定', '场景锁定', '服装道具锁定'].map((item, index) => (
              <button key={item} className={index !== 1 ? 'active' : ''}>
                <span>{item}</span>
                <i />
              </button>
            ))}
          </div>
        </section>

        <section className="parameter-section">
          <div className="section-title">
            <MessageSquareText size={16} />
            <span>负向约束</span>
          </div>
          <div className="negative-prompt">
            正脸、五官特写、字幕、水印、手指畸形、背景穿帮、角色服装漂移、过度锐化
          </div>
        </section>
      </div>
    </aside>
  );
}

function StoryboardPanel({ onClose }: { onClose: () => void }) {
  const shots = [
    ['01', '老屋晨光', '远景', '缓慢推进', '爷爷与孙子背影进入书房，桌面民俗道具被自然光扫过', 'ready'],
    ['02', '布老虎特写', '近景', '右移跟拍', '只拍手部整理布老虎与泥塑钟馗，避免人物露脸', 'working'],
    ['03', '泥塑钟馗', '中近景', '轻微环绕', '镜头围绕道具，强调金色光线和木质纹理', 'ready'],
    ['04', '纸鸢展开', '中景', '俯拍转平视', '孩子肩以下打开纸鸢，布面纹样清晰可见', 'queue'],
    ['05', '合成结尾', '大全景', '缓慢拉远', '道具在桌面形成非遗主题陈列，画面安静收束', 'ready'],
  ] as const;

  return (
    <section className="bottom-workflow-sheet storyboard-sheet">
      <div className="sheet-head">
        <div>
          <span>Storyboard 分镜面板</span>
          <small>从提示词拆镜、批量生成并同步回画布节点</small>
        </div>
        <div className="sheet-actions">
          <button><Sparkles size={15} />一键拆镜</button>
          <button><Play size={15} />批量生成</button>
          <button><GitBranch size={15} />同步到画布</button>
          <button className="icon-only" onClick={onClose}><X size={17} /></button>
        </div>
      </div>
      <div className="shot-strip">
        {shots.map(([num, scene, shot, motion, prompt, status]) => (
          <article key={num} className={`shot-card ${status}`}>
            <div className="shot-thumb">
              <span>镜头 {num}</span>
            </div>
            <div className="shot-meta">
              <strong>{scene}</strong>
              <div>
                <span>{shot}</span>
                <span>{motion}</span>
              </div>
              <p>{prompt}</p>
            </div>
            <button>{status === 'working' ? '生成中' : status === 'queue' ? '排队' : '可生成'}</button>
          </article>
        ))}
      </div>
    </section>
  );
}

function TimelinePanel({ onClose }: { onClose: () => void }) {
  const ticks = ['00:00', '00:04', '00:08', '00:12', '00:16', '00:20'];

  return (
    <section className="bottom-workflow-sheet timeline-sheet">
      <div className="sheet-head">
        <div>
          <span>Timeline 拼接时间线</span>
          <small>把画布视频节点编排成可导出的短片轨道</small>
        </div>
        <div className="sheet-actions">
          <button><Pause size={15} />预览</button>
          <button><Split size={15} />添加转场</button>
          <button><Download size={15} />导出短片</button>
          <button className="icon-only" onClick={onClose}><X size={17} /></button>
        </div>
      </div>
      <div className="timeline-ruler">
        {ticks.map((tick) => <span key={tick}>{tick}</span>)}
      </div>
      <div className="timeline-tracks">
        <div className="track-row">
          <label><Film size={15} />视频轨</label>
          <div className="track-lane">
            <span className="clip clip-a">1-1 副本</span>
            <span className="clip clip-b">钟馗细节</span>
            <span className="clip clip-c">老屋结尾</span>
            <i className="playhead" />
          </div>
        </div>
        <div className="track-row">
          <label><Volume2 size={15} />音乐轨</label>
          <div className="track-lane audio-lane">
            <span className="clip audio">无背景音乐约束</span>
          </div>
        </div>
        <div className="track-row">
          <label><Captions size={15} />字幕轨</label>
          <div className="track-lane subtitle-lane">
            <span className="subtitle-block">非遗道具说明</span>
            <span className="subtitle-block second">结尾字幕</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function QueuePanel({ onClose }: { onClose: () => void }) {
  const tasks = [
    ['视频节点 5 - 副本', 'running', 72, 'Seedance 2.0 · 108'],
    ['纸鸢展开镜头', 'running', 38, 'Kling 3.0 · 142'],
    ['布老虎近景增强', 'queue', 0, '等待 2 个任务'],
    ['泥塑钟馗解析', 'done', 100, '已生成 4s'],
    ['首尾帧转场', 'failed', 64, '参考图缺失'],
  ] as const;

  return (
    <aside className="workflow-panel queue-panel">
      <div className="drawer-head">
        <div>
          <span>生成任务队列</span>
          <small>运行中 2 · 排队 4 · 失败 1 · 预计 03:18</small>
        </div>
        <button onClick={onClose}>
          <X size={18} />
        </button>
      </div>
      <div className="queue-summary">
        {[
          ['运行中', '2'],
          ['排队', '4'],
          ['失败', '1'],
          ['本轮消耗', '648'],
        ].map(([label, value]) => (
          <div key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
      <div className="queue-list">
        {tasks.map(([title, status, progress, meta]) => (
          <article key={title} className={`queue-row ${status}`}>
            <div className="queue-icon">
              {status === 'done' ? <CheckCircle2 size={17} /> : status === 'failed' ? <AlertTriangle size={17} /> : <Timer size={17} />}
            </div>
            <div className="queue-main">
              <div>
                <strong>{title}</strong>
                <small>{meta}</small>
              </div>
              <div className="queue-progress">
                <i style={{ width: `${progress}%` }} />
              </div>
            </div>
            <button title={status === 'failed' ? '重试' : '刷新'}>
              <RefreshCcw size={15} />
            </button>
          </article>
        ))}
      </div>
    </aside>
  );
}

function SideDrawer({
  panel,
  onClose,
  selectedNode,
}: {
  panel: Panel;
  onClose: () => void;
  selectedNode?: FlowNodeData;
}) {
  const title =
    panel === 'assets' ? '素材库' : panel === 'characters' ? '角色库' : panel === 'history' ? '历史记录' : '工具箱';

  return (
    <aside className="side-drawer">
      <div className="drawer-head">
        <div>
          <span>{title}</span>
          <small>{panel === 'assets' ? '全局参考、图片、视频、音频' : '节点和项目工具'}</small>
        </div>
        <button onClick={onClose}>
          <X size={18} />
        </button>
      </div>
      {panel === 'assets' && <AssetsPanel />}
      {panel === 'characters' && <CharactersPanel />}
      {panel === 'history' && <HistoryPanel />}
      {panel === 'toolbox' && <ToolboxPanel selectedNode={selectedNode} />}
    </aside>
  );
}

function AssetsPanel() {
  return (
    <div className="drawer-body">
      <label className="search-box">
        <Search size={16} />
        <input placeholder="搜索素材、节点或文件名" />
      </label>
      <div className="tabs">
        <button className="active">全部参考</button>
        <button>图片</button>
        <button>视频</button>
        <button>音频</button>
      </div>
      <div className="asset-grid">
        {Array.from({ length: 10 }).map((_, index) => (
          <button key={index} className="asset-card">
            <div
              style={{
                background:
                  index % 3 === 0
                    ? 'linear-gradient(135deg,#2b1b17,#f0b36a 52%,#111827)'
                    : index % 3 === 1
                      ? 'linear-gradient(135deg,#1e293b,#38bdf8 48%,#fde68a)'
                      : 'radial-gradient(circle at 45% 35%,#f8d7a3,#8f3430 42%,#141414)',
              }}
            />
            <span>{['钟馗', '黎侯虎', '战鼓', '纸鸢'][index % 4]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function CharactersPanel() {
  return (
    <div className="drawer-body">
      <div className="character-list">
        {['钟馗', '寅虎', '赤发青面', '燕儿'].map((name, index) => (
          <button key={name} className="character-card">
            <span style={{ background: swatches[index] }} />
            <div>
              <strong>{name}</strong>
              <small>{index + 3} 张参考图 · {index + 2} 个视频节点</small>
            </div>
            <ChevronsUpDown size={16} />
          </button>
        ))}
      </div>
    </div>
  );
}

function HistoryPanel() {
  return (
    <div className="drawer-body">
      <div className="timeline">
        {['整理画布', '新增视频节点', '替换参考图', '复制分组', '保存项目'].map((event, index) => (
          <div key={event} className="timeline-row">
            <span />
            <div>
              <strong>{event}</strong>
              <small>{index * 7 + 3} 分钟前</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ToolboxPanel({ selectedNode }: { selectedNode?: FlowNodeData }) {
  return (
    <div className="drawer-body">
      <div className="selected-node-card">
        <span>当前节点</span>
        <strong>{selectedNode?.title ?? '视频节点 2'}</strong>
        <small>{selectedNode?.size ?? '1280 × 720'}</small>
      </div>
      <div className="tool-list">
        {[
          ['裁剪', Scissors],
          ['高清', WandSparkles],
          ['解析', BookOpen],
          ['复制', Copy],
        ].map(([name, Icon]) => (
          <button key={name as string}>
            <Icon size={17} />
            <span>{name as string}</span>
          </button>
        ))}
      </div>
      <div className="prompt-box">
        <span>生成提示词</span>
        <p>
          全局执行限制，全程无背景音乐。人物不露脸，只拍手、脚、背影、肩以下、局部身体或影子。
        </p>
        <button>展开参数</button>
      </div>
    </div>
  );
}
