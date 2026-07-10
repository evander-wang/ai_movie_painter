import { join } from 'node:path';
import { describe, it } from 'vitest';
import { buildCanvasExportPayload } from '../../src/application/canvas/importExportCanvas';
import { projectConfig } from '../../src/config/projectConfig';
import { createDefaultCanvasNodes, initialEdges } from '../../src/domain/workflow/defaultCanvas';
import { expectGolden } from './goldenHelper';

describe('canvas schema golden', () => {
  it('matches the reviewed default canvas export schema', () => {
    const payload = buildCanvasExportPayload({
      appName: projectConfig.app.name,
      edges: initialEdges,
      nodes: createDefaultCanvasNodes(),
      updatedAt: '2026-07-09T00:00:00.000Z',
      viewport: projectConfig.canvas.defaultViewport,
    });

    expectGolden(
      {
        version: payload.version,
        schemaVersion: payload.schemaVersion,
        updatedAt: payload.updatedAt,
        app: payload.app,
        viewport: payload.viewport,
        nodeCount: payload.nodes.length,
        edgeCount: payload.edges.length,
        firstNode: payload.nodes[0],
        firstEdge: payload.edges[0],
      },
      join(__dirname, 'baselines/canvas-schema.golden.json'),
    );
  });
});
