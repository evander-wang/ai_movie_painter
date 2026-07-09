import type { AiNodeType, FlowNodeData } from '@/domain/workflow/model';
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

export function PanelLayer({
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


