import { join } from 'node:path';
import { describe, it } from 'vitest';
import { createDefaultCanvasNodes, initialEdges } from '../../src/domain/workflow/defaultCanvas';
import { expectGolden } from './goldenHelper';

describe('default canvas golden', () => {
  it('matches the reviewed default AI video workflow topology', () => {
    const nodes = createDefaultCanvasNodes();
    const edges = initialEdges;
    const nodesByKind = countBy(nodes.map((node) => node.data.kind));
    const nodesByType = countBy(nodes.map((node) => node.data.nodeType ?? 'none'));

    expectGolden(
      {
        schemaVersion: 'golden/default-canvas-topology/v1',
        nodeCount: nodes.length,
        edgeCount: edges.length,
        nodesByKind,
        nodesByType,
        nodes: nodes
          .map((node) => ({
            id: node.id,
            kind: node.data.kind,
            nodeType: node.data.nodeType ?? null,
          }))
          .sort((left, right) => left.id.localeCompare(right.id)),
        edges: edges
          .map((edge) => ({
            id: edge.id,
            source: edge.source,
            target: edge.target,
          }))
          .sort((left, right) => left.id.localeCompare(right.id)),
      },
      join(__dirname, 'baselines/default-canvas-topology.golden.json'),
    );
  });
});

function countBy(values: string[]): Record<string, number> {
  return values.reduce<Record<string, number>>((counts, value) => {
    counts[value] = (counts[value] ?? 0) + 1;
    return counts;
  }, {});
}
