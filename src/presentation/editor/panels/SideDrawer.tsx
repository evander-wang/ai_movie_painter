import { X } from 'lucide-react';
import type { EditorRoutePanel } from '@/application/canvas/editorRouteState';
import type { FlowNodeData } from '@/domain/workflow/model';
import { getDrawerPanelMeta, type DrawerPanelId } from './panelRegistry';
import { AssetsPanel, CharactersPanel, HistoryPanel, ToolboxPanel } from './sideDrawerPanels';

type SideDrawerProps = {
  panel: DrawerPanelId;
  onClose: () => void;
  selectedNode?: FlowNodeData;
};

type DrawerPanelRenderer = (props: Pick<SideDrawerProps, 'selectedNode'>) => React.ReactNode;

const drawerPanelRenderers: Record<DrawerPanelId, DrawerPanelRenderer> = {
  assets: () => <AssetsPanel />,
  characters: () => <CharactersPanel />,
  history: () => <HistoryPanel />,
  toolbox: ({ selectedNode }) => <ToolboxPanel selectedNode={selectedNode} />,
};

export function SideDrawer({ panel, onClose, selectedNode }: SideDrawerProps) {
  const { drawerSubtitle, drawerTitle } = getDrawerPanelMeta(panel);
  const renderPanel = drawerPanelRenderers[panel];

  return (
    <aside className="side-drawer">
      <div className="drawer-head">
        <div>
          <span>{drawerTitle}</span>
          <small>{drawerSubtitle}</small>
        </div>
        <button onClick={onClose}>
          <X size={18} />
        </button>
      </div>
      {renderPanel({ selectedNode })}
    </aside>
  );
}

export function assertDrawerPanel(panel: EditorRoutePanel): asserts panel is DrawerPanelId {
  if (!(panel in drawerPanelRenderers)) {
    throw new Error(`Unsupported side drawer panel: ${panel}`);
  }
}
