import type { CanvasViewport, WorkflowEdge, WorkflowNode } from '@/domain/workflow/model';
import { createDefaultCanvasNodes, initialEdges } from '@/domain/workflow/defaultCanvas';

type DefaultCanvasStateInput = {
  defaultViewport: CanvasViewport;
  edges: WorkflowEdge[];
  nodes: WorkflowNode[];
  viewport: CanvasViewport;
};

export function isDefaultCanvasState({
  defaultViewport,
  edges,
  nodes,
  viewport,
}: DefaultCanvasStateInput): boolean {
  return (
    isDefaultViewport(viewport, defaultViewport) &&
    JSON.stringify(nodes.map(getNodeSignature).sort(compareById)) ===
      JSON.stringify(createDefaultCanvasNodes().map(getNodeSignature).sort(compareById)) &&
    JSON.stringify(edges.map(getEdgeSignature).sort(compareById)) ===
      JSON.stringify(initialEdges.map(getEdgeSignature).sort(compareById))
  );
}

function isDefaultViewport(viewport: CanvasViewport, defaultViewport: CanvasViewport): boolean {
  return (
    Math.abs(viewport.x - defaultViewport.x) < 0.001 &&
    Math.abs(viewport.y - defaultViewport.y) < 0.001 &&
    Math.abs(viewport.zoom - defaultViewport.zoom) < 0.001
  );
}

function getNodeSignature(node: WorkflowNode) {
  return {
    data: node.data,
    id: node.id,
    position: node.position,
    type: node.type ?? null,
  };
}

function getEdgeSignature(edge: WorkflowEdge) {
  return {
    animated: Boolean(edge.animated),
    id: edge.id,
    source: edge.source,
    sourceHandle: edge.sourceHandle ?? null,
    target: edge.target,
    targetHandle: edge.targetHandle ?? null,
    type: edge.type ?? null,
  };
}

function compareById(left: { id: string }, right: { id: string }) {
  return left.id.localeCompare(right.id);
}
