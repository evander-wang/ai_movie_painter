import type { EditorRoutePanel } from '@/application/canvas/editorRouteState';

export type PanelLauncher = 'center-toolbar' | 'workflow-rail';
export type PanelSurface = 'side-drawer' | 'modal' | 'panel' | 'popover';
export type PanelIconKey =
  | 'box'
  | 'characters'
  | 'clock'
  | 'keyboard'
  | 'layers'
  | 'library'
  | 'node-menu'
  | 'queue'
  | 'settings'
  | 'timeline'
  | 'zoom';

export type DrawerPanelId = Extract<EditorRoutePanel, 'assets' | 'characters' | 'history' | 'toolbox'>;

export type PanelMeta = {
  drawerSubtitle?: string;
  drawerTitle?: string;
  icon: PanelIconKey;
  id: EditorRoutePanel;
  label: string;
  launcher?: PanelLauncher;
  launcherOrder?: number;
  routeable: boolean;
  surface: PanelSurface;
  title: string;
};

export const panelMetadataById: Record<EditorRoutePanel, PanelMeta> = {
  toolbox: sideDrawerPanel('toolbox', '工具箱', '节点和项目工具', 'box'),
  assets: sideDrawerPanel('assets', '素材库', '全局参考、图片、视频、音频', 'library'),
  characters: sideDrawerPanel('characters', '角色库', '节点和项目工具', 'characters'),
  history: sideDrawerPanel('history', '历史记录', '节点和项目工具', 'clock'),
  shortcuts: {
    icon: 'keyboard',
    id: 'shortcuts',
    label: '快捷键',
    launcher: 'center-toolbar',
    launcherOrder: 60,
    routeable: true,
    surface: 'modal',
    title: '快捷键',
  },
  zoom: {
    icon: 'zoom',
    id: 'zoom',
    label: '缩放选项',
    routeable: true,
    surface: 'popover',
    title: '缩放选项',
  },
  nodeMenu: {
    icon: 'node-menu',
    id: 'nodeMenu',
    label: '添加节点',
    launcher: 'center-toolbar',
    launcherOrder: 10,
    routeable: true,
    surface: 'popover',
    title: '添加节点',
  },
  selectedExpand: {
    icon: 'zoom',
    id: 'selectedExpand',
    label: '展开参数',
    routeable: true,
    surface: 'modal',
    title: '展开参数',
  },
  nodeInspector: workflowRailPanel('nodeInspector', '参数', '节点详情参数面板', 'settings'),
  storyboard: workflowRailPanel('storyboard', '分镜', 'Storyboard 分镜面板', 'layers'),
  timeline: workflowRailPanel('timeline', '时间线', '拼接与轨道预览', 'timeline'),
  queue: workflowRailPanel('queue', '任务', '生成任务队列', 'queue'),
};

function sideDrawerPanel(
  id: DrawerPanelId,
  drawerTitle: string,
  drawerSubtitle: string,
  icon: PanelIconKey,
): PanelMeta {
  return {
    drawerSubtitle,
    drawerTitle,
    icon,
    id,
    label: drawerTitle,
    launcher: 'center-toolbar',
    launcherOrder: getCenterToolbarOrder(id),
    routeable: true,
    surface: 'side-drawer',
    title: drawerTitle,
  };
}

function workflowRailPanel(id: EditorRoutePanel, label: string, title: string, icon: PanelIconKey): PanelMeta {
  return {
    icon,
    id,
    label,
    launcher: 'workflow-rail',
    launcherOrder: getWorkflowRailOrder(id),
    routeable: true,
    surface: 'panel',
    title,
  };
}

function getCenterToolbarOrder(id: DrawerPanelId): number {
  const order: Record<DrawerPanelId, number> = {
    toolbox: 20,
    assets: 30,
    characters: 40,
    history: 50,
  };
  return order[id];
}

function getWorkflowRailOrder(id: EditorRoutePanel): number {
  const order: Partial<Record<EditorRoutePanel, number>> = {
    nodeInspector: 10,
    storyboard: 20,
    timeline: 30,
    queue: 40,
  };
  return order[id] ?? 100;
}
