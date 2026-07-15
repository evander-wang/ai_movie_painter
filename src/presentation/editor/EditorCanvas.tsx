import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
} from '@xyflow/react';
import { useCallback } from 'react';
import { projectConfig } from '@/config/projectConfig';
import { EditorErrorBoundary } from '@/presentation/editor/EditorErrorBoundary';
import { edgeTypes } from '@/presentation/editor/reactflow/edgeTypes';
import { nodeTypes } from '@/presentation/editor/reactflow/nodeTypes';
import type { EditorController } from '@/presentation/editor/state/useEditorController';

const canvasSnapGrid: [number, number] = [projectConfig.canvas.snapGrid, projectConfig.canvas.snapGrid];
const reactFlowProOptions = { hideAttribution: true };

export function EditorCanvas({ editor }: { editor: EditorController }) {
  const handleConnectStart = useCallback(() => editor.setIsConnecting(true), [editor.setIsConnecting]);
  const handleConnectEnd = useCallback(() => editor.setIsConnecting(false), [editor.setIsConnecting]);

  return (
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
          onConnectStart={handleConnectStart}
          onConnectEnd={handleConnectEnd}
          onMove={editor.handleMove}
          onNodeClick={(_, node) => editor.handleNodeClick(node)}
          onPaneClick={editor.handlePaneClick}
          defaultViewport={editor.defaultViewport}
          minZoom={projectConfig.canvas.minZoom}
          maxZoom={projectConfig.canvas.maxZoom}
          snapToGrid={editor.snap}
          snapGrid={canvasSnapGrid}
          fitView={false}
          proOptions={reactFlowProOptions}
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
  );
}
