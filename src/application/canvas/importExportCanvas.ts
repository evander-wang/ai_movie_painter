import { CANVAS_SCHEMA_VERSION } from '../../domain/workflow/canvasSchema';
import type { CanvasViewport, FlowNodeData, WorkflowEdge, WorkflowNode } from '../../domain/workflow/model';

export type CanvasExportInput = {
  appName: string;
  viewport: CanvasViewport;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  exportedAt?: string;
};

export type ImportedCanvas = {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  viewport?: CanvasViewport;
};

export function buildCanvasExportPayload(input: CanvasExportInput) {
  return {
    schemaVersion: CANVAS_SCHEMA_VERSION,
    exportedAt: input.exportedAt ?? new Date().toISOString(),
    app: input.appName,
    viewport: input.viewport,
    nodes: input.nodes.map((node) => ({
      id: node.id,
      type: node.type,
      position: node.position,
      width: node.width,
      height: node.height,
      selected: Boolean(node.selected),
      data: node.data,
    })),
    edges: input.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
      type: edge.type,
      animated: Boolean(edge.animated),
      label: edge.label,
    })),
  };
}

export function parseImportedCanvas(payload: unknown, fallbackZoom: number): ImportedCanvas {
  if (!isRecord(payload)) throw new Error('文件不是有效的画布 JSON');
  if (payload.schemaVersion !== CANVAS_SCHEMA_VERSION) throw new Error('不支持的画布版本');
  if (!Array.isArray(payload.nodes) || !Array.isArray(payload.edges)) throw new Error('缺少 nodes 或 edges');

  return {
    nodes: payload.nodes.map(parseWorkflowNode),
    edges: payload.edges.map(parseWorkflowEdge),
    viewport: parseViewport(payload.viewport, fallbackZoom),
  };
}

function parseWorkflowNode(rawNode: unknown, index: number): WorkflowNode {
  if (!isRecord(rawNode) || typeof rawNode.id !== 'string' || !isRecord(rawNode.position) || !isRecord(rawNode.data)) {
    throw new Error(`第 ${index + 1} 个节点结构无效`);
  }

  const data = rawNode.data as Partial<FlowNodeData>;
  if (typeof data.title !== 'string' || typeof data.kind !== 'string') {
    throw new Error(`第 ${index + 1} 个节点缺少 title 或 kind`);
  }

  return {
    id: rawNode.id,
    type: typeof rawNode.type === 'string' ? rawNode.type : 'mediaNode',
    position: {
      x: Number(rawNode.position.x) || 0,
      y: Number(rawNode.position.y) || 0,
    },
    selected: Boolean(rawNode.selected),
    data: data as FlowNodeData,
  };
}

function parseWorkflowEdge(rawEdge: unknown, index: number): WorkflowEdge {
  if (!isRecord(rawEdge) || typeof rawEdge.id !== 'string' || typeof rawEdge.source !== 'string' || typeof rawEdge.target !== 'string') {
    throw new Error(`第 ${index + 1} 条连线结构无效`);
  }

  return {
    id: rawEdge.id,
    source: rawEdge.source,
    target: rawEdge.target,
    type: typeof rawEdge.type === 'string' ? rawEdge.type : 'pulse',
    sourceHandle: typeof rawEdge.sourceHandle === 'string' ? rawEdge.sourceHandle : null,
    targetHandle: typeof rawEdge.targetHandle === 'string' ? rawEdge.targetHandle : null,
    animated: Boolean(rawEdge.animated),
    label: rawEdge.label,
  };
}

function parseViewport(rawViewport: unknown, fallbackZoom: number): CanvasViewport | undefined {
  if (!isRecord(rawViewport)) return undefined;
  return {
    x: Number(rawViewport.x) || 0,
    y: Number(rawViewport.y) || 0,
    zoom: Number(rawViewport.zoom) || fallbackZoom,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
