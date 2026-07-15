import { describe, expect, it } from 'vitest';
import { arrangeCanvasNodes } from '../../src/application/canvas/arrangeCanvas';
import { workflowNode } from './testWorkflowFixtures';

describe('arrange canvas use case', () => {
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
});
