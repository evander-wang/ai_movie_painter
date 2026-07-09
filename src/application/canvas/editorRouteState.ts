export const editorRoutePanels = [
  'toolbox',
  'assets',
  'characters',
  'history',
  'shortcuts',
  'zoom',
  'nodeMenu',
  'selectedExpand',
  'nodeInspector',
  'storyboard',
  'timeline',
  'queue',
] as const;

export type EditorRoutePanel = (typeof editorRoutePanels)[number];

export type EditorRouteState = {
  nodeId: string | null;
  panel: EditorRoutePanel | null;
  zoom: number | null;
};

const defaultZoom = 0.58;
const minZoom = 0.18;
const maxZoom = 1.4;
const panelSet = new Set<string>(editorRoutePanels);

export function parseEditorRouteState(searchParams: URLSearchParams): EditorRouteState {
  return {
    nodeId: parseNodeId(searchParams.get('node')),
    panel: parsePanel(searchParams.get('panel')),
    zoom: parseZoom(searchParams.get('zoom')),
  };
}

export function buildEditorRouteSearch(state: EditorRouteState): string {
  const searchParams = new URLSearchParams();

  if (state.nodeId) searchParams.set('node', state.nodeId);
  if (state.panel) searchParams.set('panel', state.panel);
  if (state.zoom && !isDefaultZoom(state.zoom)) {
    searchParams.set('zoom', String(Math.round(state.zoom * 100)));
  }

  const search = searchParams.toString();
  return search ? `?${search}` : '';
}

function parseNodeId(value: string | null): string | null {
  const nodeId = value?.trim();
  return nodeId ? nodeId : null;
}

function parsePanel(value: string | null): EditorRoutePanel | null {
  if (!value || !panelSet.has(value)) return null;
  return value as EditorRoutePanel;
}

function parseZoom(value: string | null): number | null {
  if (!value) return null;
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return null;

  const zoom = numericValue > 3 ? numericValue / 100 : numericValue;
  if (zoom < minZoom || zoom > maxZoom) return null;

  return Number(zoom.toFixed(3));
}

function isDefaultZoom(zoom: number): boolean {
  return Math.abs(zoom - defaultZoom) < 0.001;
}
