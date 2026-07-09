import type { Node } from '@xyflow/react';
import type { FlowNodeData } from '@/domain/workflow/model';

export function createInitialCanvasNodes(
  nodes: Node<FlowNodeData>[],
  selectedNodeId: string | null,
): Node<FlowNodeData>[] {
  return nodes.map((node) => ({
    ...node,
    selected: selectedNodeId ? node.id === selectedNodeId : node.selected,
  }));
}

export function getVideoNodeId(nodes: Node<FlowNodeData>[], selectedNodeId: string | null): string | null {
  if (!selectedNodeId) return null;
  const selectedNode = nodes.find((node) => node.id === selectedNodeId);
  return selectedNode?.data.kind === 'video' ? selectedNode.id : null;
}
