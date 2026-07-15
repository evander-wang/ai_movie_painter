import type { CanvasExportInput } from '../../../src/application/canvas/importExportCanvas';

export const canvasSchemaFixture = {
  appName: 'Golden Canvas Fixture',
  updatedAt: '2026-07-09T00:00:00.000Z',
  viewport: { x: 120, y: -80, zoom: 0.75 },
  nodes: [
    {
      id: 'node-full',
      type: 'mediaNode',
      position: { x: 24, y: 48 },
      width: 320,
      height: 180,
      selected: true,
      data: {
        title: '完整节点',
        kind: 'video',
        nodeType: 'imageToVideo',
        size: '16:9 · 4s',
        status: 'working',
        accent: '#38bdf8',
        preview: 'fixture-preview',
        body: '用于锁定完整节点导出字段。',
        count: 3,
      },
    },
    {
      id: 'node-minimal',
      position: { x: 400, y: 48 },
      data: {
        title: '最小节点',
        kind: 'text',
      },
    },
  ],
  edges: [
    {
      id: 'edge-full',
      source: 'node-minimal',
      target: 'node-full',
      sourceHandle: 'source-right',
      targetHandle: 'target-left',
      type: 'pulse',
      animated: true,
      label: '完整连线',
    },
    {
      id: 'edge-minimal',
      source: 'node-full',
      target: 'node-minimal',
    },
  ],
} satisfies CanvasExportInput;
