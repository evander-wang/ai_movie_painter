import { EditorErrorBoundary } from '@/presentation/editor/EditorErrorBoundary';
import { NodeAttributePopover } from '@/presentation/editor/overlays/NodeAttributePopover';
import { SelectedVideoOverlay } from '@/presentation/editor/overlays/SelectedVideoOverlay';
import { PanelLayer } from '@/presentation/editor/panels/PanelLayer';
import type { EditorController } from '@/presentation/editor/state/useEditorController';

export function EditorOverlayLayer({ editor }: { editor: EditorController }) {
  return (
    <>
      {editor.connectionNotice && (
        <div className="canvas-notice" role="status">
          {editor.connectionNotice}
        </div>
      )}
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
    </>
  );
}
