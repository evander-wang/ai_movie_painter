import { describe, expect, it } from 'vitest';
import { editorRoutePanels } from '../../src/application/canvas/editorRouteState';
import {
  centerToolbarPanels,
  drawerPanels,
  getDrawerPanelMeta,
  getPanelMeta,
  inlinePanels,
  modalPanels,
  popoverPanels,
  routeablePanelIds,
  workflowRailPanels,
} from '../../src/presentation/editor/panels/panelRegistry';

describe('panel registry', () => {
  it('keeps every route panel represented in the presentation registry', () => {
    expect(routeablePanelIds).toEqual(editorRoutePanels);
    expect(editorRoutePanels.every((panel) => getPanelMeta(panel).routeable)).toBe(true);
  });

  it('derives center toolbar and workflow rail panel order from metadata', () => {
    expect(centerToolbarPanels.map((panel) => panel.id)).toEqual([
      'nodeMenu',
      'toolbox',
      'assets',
      'characters',
      'history',
      'shortcuts',
    ]);
    expect(workflowRailPanels.map((panel) => panel.id)).toEqual([
      'nodeInspector',
      'storyboard',
      'timeline',
      'queue',
    ]);
  });

  it('centralizes side drawer copy', () => {
    expect(drawerPanels.map((panel) => panel.id)).toEqual(['toolbox', 'assets', 'characters', 'history']);
    expect(getDrawerPanelMeta('assets')).toEqual({
      drawerSubtitle: '全局参考、图片、视频、音频',
      drawerTitle: '素材库',
    });
    expect(getDrawerPanelMeta('toolbox')).toEqual({
      drawerSubtitle: '节点和项目工具',
      drawerTitle: '工具箱',
    });
  });

  it('derives render surface groups from metadata', () => {
    expect(popoverPanels.map((panel) => panel.id)).toEqual(['zoom', 'nodeMenu']);
    expect(modalPanels.map((panel) => panel.id)).toEqual(['shortcuts', 'selectedExpand']);
    expect(inlinePanels.map((panel) => panel.id)).toEqual(['nodeInspector', 'storyboard', 'timeline', 'queue']);
  });
});
