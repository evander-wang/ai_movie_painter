import { describe, expect, it } from 'vitest';
import {
  buildCanvasExportPayload,
  parseImportedCanvas,
} from '../../src/application/canvas/importExportCanvas';
import type { WorkflowEdge } from '../../src/domain/workflow/model';
import { workflowNode } from './testWorkflowFixtures';

describe('canvas import/export use cases', () => {
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
});
