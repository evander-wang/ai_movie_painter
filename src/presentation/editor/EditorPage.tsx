import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import { projectConfig } from '@/config/projectConfig';
import type { EditorRouteState } from '@/application/canvas/editorRouteState';
import { edgeTypes } from '@/presentation/editor/reactflow/edgeTypes';
import { EditorErrorBoundary } from '@/presentation/editor/EditorErrorBoundary';
import { NodeAttributePopover } from '@/presentation/editor/overlays/NodeAttributePopover';
import { SelectedVideoOverlay } from '@/presentation/editor/overlays/SelectedVideoOverlay';
import { PanelLayer } from '@/presentation/editor/panels/PanelLayer';
import { CenterToolbar, LeftStatus, TopNav, WorkflowRail } from '@/presentation/editor/toolbars/EditorToolbars';
import { nodeTypes } from '@/presentation/editor/reactflow/nodeTypes';
import { useEditorController } from '@/presentation/editor/state/useEditorController';

type EditorPageProps = {
  routeState?: EditorRouteState;
  onRouteStateChange?: (state: EditorRouteState) => void;
};

export function EditorPage(props: EditorPageProps) {
  return (
    <ReactFlowProvider>
      <CanvasPrototype {...props} />
    </ReactFlowProvider>
  );
}

function CanvasPrototype({ routeState, onRouteStateChange }: EditorPageProps) {
  const editor = useEditorController({ routeState, onRouteStateChange });

  return (
    <div className="app-shell">
      <input
        ref={editor.importInputRef}
        className="hidden-file-input"
        type="file"
        accept="application/json,.json"
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          event.currentTarget.value = '';
          if (file) void editor.importCanvasFile(file);
        }}
      />
      <TopNav />
      <div className={`canvas-wrap ${editor.isConnecting ? 'is-connecting' : ''}`}>
        <EditorErrorBoundary
          title="画布渲染异常"
          description="画布运行时出现异常，当前页面不会再直接黑屏。"
          recoverLabel="重新加载编辑器"
          onRecover={() => window.location.reload()}
          resetKey={`${editor.nodes.length}:${editor.edges.length}`}
          variant="canvas"
        >
          <ReactFlow
            nodes={editor.nodes}
            edges={editor.edges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodesChange={editor.onNodesChange}
            onEdgesChange={editor.onEdgesChange}
            onConnect={editor.onConnect}
            onConnectStart={() => editor.setIsConnecting(true)}
            onConnectEnd={() => editor.setIsConnecting(false)}
            onSelectionChange={editor.handleFlowSelectionChange}
            onMove={editor.handleMove}
            onNodeClick={(_, node) => editor.handleNodeClick(node)}
            onPaneClick={editor.handlePaneClick}
            defaultViewport={editor.defaultViewport}
            minZoom={projectConfig.canvas.minZoom}
            maxZoom={projectConfig.canvas.maxZoom}
            snapToGrid={editor.snap}
            snapGrid={[projectConfig.canvas.snapGrid, projectConfig.canvas.snapGrid]}
            fitView={false}
            proOptions={{ hideAttribution: true }}
          >
            <Background variant={BackgroundVariant.Dots} gap={projectConfig.canvas.snapGrid} size={1.15} />
            <Controls showInteractive={false} position="bottom-right" />
            {editor.showMiniMap && (
              <MiniMap
                pannable
                zoomable
                position="bottom-left"
                nodeColor={(node) => (node.data.kind === 'group' ? '#27313e' : '#49b6d6')}
              />
            )}
          </ReactFlow>
        </EditorErrorBoundary>
      </div>

      <LeftStatus
        snap={editor.snap}
        setSnap={editor.setSnap}
        setShowMiniMap={editor.setShowMiniMap}
        setPanel={editor.setPanel}
        onExportCanvas={editor.exportCanvas}
        onImportCanvas={editor.openImportDialog}
        onArrangeCanvas={editor.arrangeCanvas}
        onZoomIn={editor.zoomCanvasIn}
        onZoomOut={editor.zoomCanvasOut}
        zoomPercent={editor.zoomPercent}
      />
      <CenterToolbar setPanel={editor.setPanel} activePanel={editor.panel} />
      <WorkflowRail activePanel={editor.panel} setPanel={editor.setPanel} />
      <EditorErrorBoundary
        title="属性面板异常"
        description="当前节点的属性面板出错了，可以先清空选择继续编辑画布。"
        recoverLabel="清空当前选择"
        onRecover={editor.clearSelection}
        resetKey={`${editor.selectedNodeId ?? 'none'}:${editor.panel ?? 'none'}`}
      >
        {editor.selectedVideoId && editor.activeSelectedNode?.kind === 'video' && (
          <SelectedVideoOverlay
            node={editor.activeSelectedNode}
            position={editor.overlayPosition}
            activePopover={editor.nodePopover}
            setActivePopover={editor.setNodePopover}
            openExpand={() => editor.setPanel('selectedExpand')}
          />
        )}
        {editor.activeSelectedNode && editor.activeSelectedNode.kind !== 'video' && !editor.panel && (
          <NodeAttributePopover
            node={editor.activeSelectedNode}
            position={editor.overlayPosition}
            onClose={editor.clearSelection}
          />
        )}
        <PanelLayer
          panel={editor.panel}
          setPanel={editor.setPanel}
          selectedNode={editor.selectedNode}
          onAddNode={editor.addWorkflowNode}
          onFitView={editor.fitCanvasView}
          onZoom100={() => editor.zoomCanvasTo(1)}
          onZoomOut={editor.zoomCanvasOut}
          onResetView={editor.resetCanvasView}
        />
      </EditorErrorBoundary>
    </div>
  );
}
