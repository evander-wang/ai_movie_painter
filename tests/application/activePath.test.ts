import { describe, expect, it } from 'vitest';
import { markActivePathEdges } from '../../src/application/canvas/activePath';

describe('active path use case', () => {
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
});
