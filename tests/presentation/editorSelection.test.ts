import { describe, expect, it } from 'vitest';
import { createInitialCanvasNodes, getVideoNodeId } from '../../src/presentation/editor/state/editorSelection';
import type { FlowNodeData } from '../../src/domain/workflow/model';

describe('editor selection state', () => {
  it('marks only the route-selected node as selected on initial load', () => {
    const nodes = [
      flowNode('default-text', 'text', true),
      flowNode('default-image-1', 'image'),
      flowNode('default-video', 'video'),
    ];

    expect(createInitialCanvasNodes(nodes, 'default-image-1')).toEqual([
      expect.objectContaining({ id: 'default-text', selected: false }),
      expect.objectContaining({ id: 'default-image-1', selected: true }),
      expect.objectContaining({ id: 'default-video', selected: false }),
    ]);
  });

  it('keeps existing selected state when no route-selected node exists', () => {
    const nodes = [
      flowNode('default-text', 'text', true),
      flowNode('default-image-1', 'image'),
    ];

    expect(createInitialCanvasNodes(nodes, null)).toEqual([
      expect.objectContaining({ id: 'default-text', selected: true }),
      expect.objectContaining({ id: 'default-image-1', selected: false }),
    ]);
  });

  it('returns the selected node id only when it points to a video node', () => {
    const nodes = [
      flowNode('default-image-1', 'image'),
      flowNode('default-video', 'video'),
    ];

    expect(getVideoNodeId(nodes, 'default-video')).toBe('default-video');
    expect(getVideoNodeId(nodes, 'default-image-1')).toBeNull();
    expect(getVideoNodeId(nodes, null)).toBeNull();
  });
});

function flowNode(id: string, kind: FlowNodeData['kind'], selected = false) {
  return {
    id,
    type: 'mediaNode',
    position: { x: 0, y: 0 },
    selected,
    data: {
      title: id,
      kind,
    },
  };
}
