import { createNodeFromCatalog } from '../../domain/workflow/nodeFactory';
import type { AiNodeType, CanvasViewport, WorkflowNode } from '../../domain/workflow/model';

export type CreateWorkflowNodeInput = {
  nodeType: AiNodeType;
  id: string;
  viewport: CanvasViewport;
  viewportSize: {
    width: number;
    height: number;
  };
};

export function createWorkflowNode(input: CreateWorkflowNodeInput): WorkflowNode {
  const zoom = input.viewport.zoom || 0.48;
  const position = {
    x: (input.viewportSize.width / 2 - input.viewport.x) / zoom - 120,
    y: (input.viewportSize.height / 2 - input.viewport.y) / zoom - 90,
  };

  return createNodeFromCatalog(input.nodeType, input.id, position);
}
