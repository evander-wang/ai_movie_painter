import { describe, expect, it } from 'vitest';
import { markActivePathEdges } from '../../src/application/canvas/activePath';
import { arrangeCanvasNodes } from '../../src/application/canvas/arrangeCanvas';
import { buildCanvasExportPayload, parseImportedCanvas } from '../../src/application/canvas/importExportCanvas';
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
      exportedAt: '2026-07-09T00:00:00.000Z',
      viewport: { x: 10, y: 20, zoom: 0.58 },
      nodes,
      edges,
    });

    expect(parseImportedCanvas(exported, 0.58)).toEqual({
      nodes: [{ ...nodes[0], selected: false }],
      edges: [{ ...edges[0], sourceHandle: null, targetHandle: null, label: undefined }],
      viewport: { x: 10, y: 20, zoom: 0.58 },
    });
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
