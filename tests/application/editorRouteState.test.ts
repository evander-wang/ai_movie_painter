import { describe, expect, it } from 'vitest';
import {
  buildEditorRouteSearch,
  editorRoutePanels,
  parseEditorRouteState,
} from '../../src/application/canvas/editorRouteState';

describe('editor route state', () => {
  it('parses selected node, active panel, and zoom from the URL query', () => {
    const state = parseEditorRouteState(new URLSearchParams('node=default-image-3&panel=timeline&zoom=102'));

    expect(state).toEqual({
      nodeId: 'default-image-3',
      panel: 'timeline',
      zoom: 1.02,
    });
  });

  it('drops unknown panels, blank node ids, and zoom values outside the editor range', () => {
    const state = parseEditorRouteState(new URLSearchParams('node=+&panel=settings&zoom=900'));

    expect(state).toEqual({
      nodeId: null,
      panel: null,
      zoom: null,
    });
  });

  it('builds compact query strings without default or empty route state', () => {
    expect(
      buildEditorRouteSearch({
        nodeId: 'default-video',
        panel: 'nodeInspector',
        zoom: 0.72,
      }),
    ).toBe('?node=default-video&panel=nodeInspector&zoom=72');

    expect(buildEditorRouteSearch({ nodeId: null, panel: null, zoom: 0.58 })).toBe('');
  });

  it('keeps the route panel whitelist explicit', () => {
    expect(editorRoutePanels).toContain('timeline');
    expect(editorRoutePanels).toContain('selectedExpand');
  });
});
