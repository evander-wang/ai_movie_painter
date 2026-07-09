import { join } from 'node:path';
import { describe, it } from 'vitest';
import { createDefaultCanvasNodes, initialEdges } from '../../src/App';
import { expectGolden } from './goldenHelper';

describe('default canvas golden', () => {
  it('matches the reviewed default AI video workflow graph', () => {
    const nodes = createDefaultCanvasNodes();
    const edges = initialEdges;
    const nodesByKind = countBy(nodes.map((node) => node.data.kind));
    const nodesByType = countBy(nodes.map((node) => node.data.nodeType ?? 'none'));

    expectGolden(
      {
        schemaVersion: 'golden/default-canvas/v1',
        nodeCount: nodes.length,
        edgeCount: edges.length,
        nodesByKind,
        nodesByType,
        nodes: nodes.map((node) => ({
          id: node.id,
          kind: node.data.kind,
          nodeType: node.data.nodeType ?? null,
          position: node.position,
          status: node.data.status ?? null,
          title: node.data.title,
        })),
        edges: edges
          .map((edge) => ({
            id: edge.id,
            source: edge.source,
            target: edge.target,
            type: edge.type ?? null,
            animated: Boolean(edge.animated),
          }))
          .sort((left, right) => left.id.localeCompare(right.id)),
      },
      join(__dirname, 'baselines/default-canvas.golden.json'),
    );
  });
});

function countBy(values: string[]): Record<string, number> {
  return values.reduce<Record<string, number>>((counts, value) => {
    counts[value] = (counts[value] ?? 0) + 1;
    return counts;
  }, {});
}
