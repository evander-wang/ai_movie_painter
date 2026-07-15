import { describe, expect, it } from 'vitest';
import { isDefaultCanvasState } from '../../src/application/canvas/canvasDraftState';
import {
  createCanvasDraftPayload,
  parseCanvasDraftPayload,
  parseImportedCanvas,
} from '../../src/application/canvas/importExportCanvas';
import { createDefaultCanvasNodes, initialEdges } from '../../src/domain/workflow/defaultCanvas';
import {
  CANVAS_DRAFT_STORAGE_KEY,
  readCanvasDraftPayload,
  saveCanvasDraft,
} from '../../src/infrastructure/storage/canvasDraftStorage';
import { createMemoryStorage, workflowNode } from './testWorkflowFixtures';

describe('canvas draft state use cases', () => {
  it('saves and loads a canvas draft payload from storage', () => {
    const storage = createMemoryStorage();
    const payload = createCanvasDraftPayload({
      appName: 'AI Movie Painter',
      nodes: [workflowNode('text-1', 'text')],
      edges: [],
      viewport: { x: 12, y: 24, zoom: 0.75 },
      updatedAt: '2026-07-09T01:00:00.000Z',
    });

    saveCanvasDraft(storage, payload);

    expect(storage.getItem(CANVAS_DRAFT_STORAGE_KEY)).toContain('"version":"short-flow-canvas/v1"');
    expect(parseImportedCanvas(readCanvasDraftPayload(storage), 0.58)).toEqual({
      nodes: [{ ...payload.nodes[0], selected: false }],
      edges: [],
      viewport: { x: 12, y: 24, zoom: 0.75 },
    });
  });

  it('ignores draft payloads with unsupported schema versions', () => {
    const storage = createMemoryStorage();
    storage.setItem(CANVAS_DRAFT_STORAGE_KEY, JSON.stringify({ version: 'short-flow-canvas/v0', nodes: [], edges: [] }));

    expect(parseCanvasDraftPayload(readCanvasDraftPayload(storage), 0.58)).toBeNull();
  });

  it('ignores invalid draft JSON without removing the current canvas state', () => {
    const storage = createMemoryStorage();
    storage.setItem(CANVAS_DRAFT_STORAGE_KEY, '{not valid json');

    expect(readCanvasDraftPayload(storage)).toBeNull();
    expect(parseCanvasDraftPayload(readCanvasDraftPayload(storage), 0.58)).toBeNull();
  });

  it('detects the unchanged default canvas state so it does not need a draft', () => {
    expect(
      isDefaultCanvasState({
        edges: initialEdges,
        nodes: createDefaultCanvasNodes(),
        viewport: { x: 0, y: 0, zoom: 0.58 },
        defaultViewport: { x: 0, y: 0, zoom: 0.58 },
      }),
    ).toBe(true);

    expect(
      isDefaultCanvasState({
        edges: initialEdges,
        nodes: [...createDefaultCanvasNodes(), workflowNode('new-node', 'image')],
        viewport: { x: 0, y: 0, zoom: 0.58 },
        defaultViewport: { x: 0, y: 0, zoom: 0.58 },
      }),
    ).toBe(false);

    expect(
      isDefaultCanvasState({
        edges: initialEdges,
        nodes: createDefaultCanvasNodes().map((node) =>
          node.id === 'default-text' ? { ...node, position: { x: node.position.x + 10, y: node.position.y } } : node,
        ),
        viewport: { x: 0, y: 0, zoom: 0.58 },
        defaultViewport: { x: 0, y: 0, zoom: 0.58 },
      }),
    ).toBe(false);
  });
});
