import { ReactFlowProvider } from '@xyflow/react';
import type { EditorRouteState } from '@/application/canvas/editorRouteState';
import { EditorCanvas } from '@/presentation/editor/EditorCanvas';
import { EditorOverlayLayer } from '@/presentation/editor/EditorOverlayLayer';
import { LeftStatus } from '@/presentation/editor/toolbars/LeftStatus';
import { CenterToolbar, TopNav, WorkflowRail } from '@/presentation/editor/toolbars/EditorToolbars';
import { useEditorController, type EditorController } from '@/presentation/editor/state/useEditorController';

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
      <CanvasImportInput editor={editor} />
      <TopNav />
      <EditorCanvas editor={editor} />
      <EditorStatusBar editor={editor} />
      <CenterToolbar setPanel={editor.setPanel} activePanel={editor.panel} />
      <WorkflowRail activePanel={editor.panel} setPanel={editor.setPanel} />
      <EditorOverlayLayer editor={editor} />
    </div>
  );
}

function CanvasImportInput({ editor }: { editor: EditorController }) {
  return (
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
  );
}

function EditorStatusBar({ editor }: { editor: EditorController }) {
  return (
    <LeftStatus
      snap={editor.snap}
      setSnap={editor.setSnap}
      setShowMiniMap={editor.setShowMiniMap}
      setPanel={editor.setPanel}
      onExportCanvas={editor.exportCanvas}
      onImportCanvas={editor.openImportDialog}
      onArrangeCanvas={editor.arrangeCanvas}
      onRestoreDefaultCanvas={editor.restoreDefaultCanvas}
      onZoomIn={editor.zoomCanvasIn}
      onZoomOut={editor.zoomCanvasOut}
      zoomPercent={editor.zoomPercent}
    />
  );
}
