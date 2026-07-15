import { editorRoutePanels, type EditorRoutePanel } from '@/application/canvas/editorRouteState';
import {
  panelMetadataById,
  type DrawerPanelId,
  type PanelLauncher,
  type PanelMeta,
  type PanelSurface,
} from './panelMetadata';

export type {
  DrawerPanelId,
  PanelIconKey,
  PanelLauncher,
  PanelMeta,
  PanelSurface,
} from './panelMetadata';

export const routeablePanelIds = editorRoutePanels.filter((panel) => panelMetadataById[panel].routeable);
export const centerToolbarPanels = getPanelsByLauncher('center-toolbar');
export const workflowRailPanels = getPanelsByLauncher('workflow-rail');
export const drawerPanels = getPanelsBySurface('side-drawer');
export const popoverPanels = getPanelsBySurface('popover');
export const modalPanels = getPanelsBySurface('modal');
export const inlinePanels = getPanelsBySurface('panel');

export function getPanelMeta(panel: EditorRoutePanel): PanelMeta {
  return panelMetadataById[panel];
}

export function getDrawerPanelMeta(panel: DrawerPanelId) {
  const meta = getPanelMeta(panel);
  return {
    drawerSubtitle: meta.drawerSubtitle,
    drawerTitle: meta.drawerTitle,
  };
}

export function isDrawerPanel(panel: EditorRoutePanel | null): panel is DrawerPanelId {
  return Boolean(panel && panelMetadataById[panel].surface === 'side-drawer');
}

function getPanelsByLauncher(launcher: PanelLauncher): PanelMeta[] {
  return editorRoutePanels
    .map((panel) => panelMetadataById[panel])
    .filter((panel) => panel.launcher === launcher)
    .sort(comparePanelLauncherOrder);
}

function getPanelsBySurface(surface: PanelSurface): PanelMeta[] {
  return editorRoutePanels
    .map((panel) => panelMetadataById[panel])
    .filter((panel) => panel.surface === surface);
}

function comparePanelLauncherOrder(left: PanelMeta, right: PanelMeta) {
  return (left.launcherOrder ?? 0) - (right.launcherOrder ?? 0);
}
