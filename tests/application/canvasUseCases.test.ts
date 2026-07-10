import { describe, expect, it } from 'vitest';
import { markActivePathEdges } from '../../src/application/canvas/activePath';
import { arrangeCanvasNodes } from '../../src/application/canvas/arrangeCanvas';
import { isDefaultCanvasState } from '../../src/application/canvas/canvasDraftState';
import { buildCanvasExportPayload, createCanvasDraftPayload, parseCanvasDraftPayload, parseImportedCanvas } from '../../src/application/canvas/importExportCanvas';
import { createDefaultCanvasNodes, initialEdges } from '../../src/domain/workflow/defaultCanvas';
import {
  CANVAS_DRAFT_STORAGE_KEY,
  readCanvasDraftPayload,
  saveCanvasDraft,
} from '../../src/infrastructure/storage/canvasDraftStorage';
import type { WorkflowEdge, WorkflowNode } from '../../src/domain/workflow/model';

describe('canvas application use cases', () => {
  it('marks only edges connected to the selected node as active path edges', () => {
    const edges = [
      { id: 'a', source: 'prompt', target: 'image-1' },
      { id: 'b', source: 'image-2', target: 'video' },
      { id: 'c', source: 'image-1', target: 'video' },
    ];

    expect(markActivePathEdges(edges, 'image-1')).toEqual([
      { id: 'a', source: 'prompt', target: 'image-1', data: { pulseActive: true } },
      { id: 'b', source: 'image-2', target: 'video', data: { pulseActive: false } },
      { id: 'c', source: 'image-1', target: 'video', data: { pulseActive: true } },
    ]);
  });

  it('keeps active path edge references stable when pulse state does not change', () => {
    const activeEdges = markActivePathEdges(
      [
        { id: 'a', source: 'prompt', target: 'image-1' },
        { id: 'b', source: 'image-2', target: 'video' },
      ],
      'image-1',
    );

    expect(markActivePathEdges(activeEdges, 'image-1')).toBe(activeEdges);
  });

  it('arranges nodes by workflow kind without changing node identity', () => {
    const nodes = [
      workflowNode('video-1', 'video'),
      workflowNode('image-1', 'image'),
      workflowNode('text-1', 'text'),
      workflowNode('tool-1', 'tool'),
      workflowNode('group-1', 'group'),
    ];

    expect(arrangeCanvasNodes(nodes)).toEqual([
      expect.objectContaining({ id: 'group-1' }),
      expect.objectContaining({ id: 'text-1', position: { x: -860, y: 170 } }),
      expect.objectContaining({ id: 'image-1', position: { x: -380, y: -250 } }),
      expect.objectContaining({ id: 'video-1', position: { x: 450, y: 170 } }),
      expect.objectContaining({ id: 'tool-1', position: { x: 820, y: -190 } }),
    ]);
  });

  it('round-trips the canvas import/export schema', () => {
    const nodes = [workflowNode('text-1', 'text')];
    const edges: WorkflowEdge[] = [{ id: 'edge-1', source: 'text-1', target: 'video-1', type: 'pulse', animated: true }];

    const exported = buildCanvasExportPayload({
      appName: 'AI Movie Painter',
      updatedAt: '2026-07-09T00:00:00.000Z',
      viewport: { x: 10, y: 20, zoom: 0.58 },
      nodes,
      edges,
    });

    expect(exported).toMatchObject({
      version: 'short-flow-canvas/v1',
      schemaVersion: 'short-flow-canvas/v1',
      updatedAt: '2026-07-09T00:00:00.000Z',
    });

    expect(parseImportedCanvas(exported, 0.58)).toEqual({
      nodes: [{ ...nodes[0], selected: false }],
      edges: [{ ...edges[0], sourceHandle: null, targetHandle: null, label: undefined }],
      viewport: { x: 10, y: 20, zoom: 0.58 },
    });
  });

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

function workflowNode(id: string, kind: WorkflowNode['data']['kind']): WorkflowNode {
  return {
    id,
    type: 'mediaNode',
    position: { x: 0, y: 0 },
    data: {
      title: id,
      kind,
    },
  };
}

function createMemoryStorage(): Storage {
  const values = new Map<string, string>();

  return {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key: string) => values.get(key) ?? null,
    key: (index: number) => Array.from(values.keys())[index] ?? null,
    removeItem: (key: string) => values.delete(key),
    setItem: (key: string, value: string) => values.set(key, value),
  };
}
