import type { AiNodeType, FlowNodeData } from '@/domain/workflow/model';
import type { EditorRoutePanel } from '@/application/canvas/editorRouteState';
import type { Panel } from '@/presentation/editor/editorTypes';
import { NodeMenu } from './NodeMenu';
import { ZoomPopover } from './ZoomPopover';
import { ShortcutsModal } from './ShortcutsModal';
import { SelectedExpandModal } from './SelectedExpandModal';
import { NodeInspectorPanel } from './NodeInspectorPanel';
import { StoryboardPanel } from './StoryboardPanel';
import { TimelinePanel } from './TimelinePanel';
import { QueuePanel } from './QueuePanel';
import { SideDrawer } from './SideDrawer';
import { isDrawerPanel } from './panelRegistry';

type PanelLayerProps = {
  panel: Panel;
  setPanel: (panel: Panel) => void;
  selectedNode?: FlowNodeData;
  onAddNode: (nodeType: AiNodeType) => void;
  onFitView: () => void;
  onZoom100: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
};

type PanelRenderer = (props: PanelLayerProps & { closePanel: () => void }) => React.ReactNode;

const panelRenderers: Partial<Record<EditorRoutePanel, PanelRenderer>> = {
  nodeMenu: ({ closePanel, onAddNode }) => <NodeMenu onAddNode={onAddNode} onClose={closePanel} />,
  zoom: ({ closePanel, onFitView, onResetView, onZoom100, onZoomOut }) => (
    <ZoomPopover
      onClose={closePanel}
      onFitView={onFitView}
      onZoom100={onZoom100}
      onZoomOut={onZoomOut}
      onResetView={onResetView}
    />
  ),
  shortcuts: ({ closePanel }) => <ShortcutsModal onClose={closePanel} />,
  selectedExpand: ({ closePanel }) => <SelectedExpandModal onClose={closePanel} />,
  nodeInspector: ({ closePanel }) => <NodeInspectorPanel onClose={closePanel} />,
  storyboard: ({ closePanel }) => <StoryboardPanel onClose={closePanel} />,
  timeline: ({ closePanel }) => <TimelinePanel onClose={closePanel} />,
  queue: ({ closePanel }) => <QueuePanel onClose={closePanel} />,
};

export function PanelLayer({
  panel,
  setPanel,
  selectedNode,
  onAddNode,
  onFitView,
  onZoom100,
  onZoomOut,
  onResetView,
}: PanelLayerProps) {
  const closePanel = () => setPanel(null);
  const renderer = panel ? panelRenderers[panel] : undefined;
  const props = {
    panel,
    setPanel,
    selectedNode,
    onAddNode,
    onFitView,
    onZoom100,
    onZoomOut,
    onResetView,
    closePanel,
  };

  return (
    <>
      {renderer?.(props)}
      {isDrawerPanel(panel) && (
        <SideDrawer panel={panel} onClose={closePanel} selectedNode={selectedNode} />
      )}
    </>
  );
}
