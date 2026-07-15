import {
  createWorkflowEdge,
  decorateWorkflowConnection,
  evaluateWorkflowConnection,
  type WorkflowConnection,
} from '@/domain/workflow/connectionRules';
import type { AiNodeType, WorkflowEdge } from '@/domain/workflow/model';

type CreateEdgeForAddedWorkflowNodeInput = {
  existingEdges: WorkflowConnection[];
  sourceNodeId: string | null;
  sourceNodeType?: AiNodeType;
  targetNodeId: string;
  targetNodeType?: AiNodeType;
};

type WorkflowNodeReference = {
  data: {
    nodeType?: AiNodeType;
  };
  id: string;
};

type CreateInteractiveWorkflowEdgeOptions = {
  existingEdges: WorkflowConnection[];
  nodes: WorkflowNodeReference[];
};

type AddedWorkflowNodeEdgeResult = {
  edge: WorkflowEdge | null;
  rejectionReason: string | null;
};

type InteractiveWorkflowConnectionResult<T extends WorkflowConnection> = {
  edge: (T & Pick<WorkflowEdge, 'animated' | 'type'>) | null;
  rejectionReason: string | null;
};

export function createEdgeForAddedWorkflowNode({
  existingEdges,
  sourceNodeId,
  sourceNodeType,
  targetNodeId,
  targetNodeType,
}: CreateEdgeForAddedWorkflowNodeInput): WorkflowEdge | null {
  return resolveEdgeForAddedWorkflowNode({
    existingEdges,
    sourceNodeId,
    sourceNodeType,
    targetNodeId,
    targetNodeType,
  }).edge;
}

export function resolveEdgeForAddedWorkflowNode({
  existingEdges,
  sourceNodeId,
  sourceNodeType,
  targetNodeId,
  targetNodeType,
}: CreateEdgeForAddedWorkflowNodeInput): AddedWorkflowNodeEdgeResult {
  if (!sourceNodeId) return { edge: null, rejectionReason: null };

  const edge = createWorkflowEdge({
    existingEdges,
    source: sourceNodeId,
    sourceNodeType,
    target: targetNodeId,
    targetNodeType,
  });
  if (edge) return { edge, rejectionReason: null };

  const decision = evaluateWorkflowConnection({
    existingEdges,
    source: sourceNodeId,
    sourceNodeType,
    target: targetNodeId,
    targetNodeType,
  });

  return {
    edge: null,
    rejectionReason: decision.allowed ? null : decision.reason,
  };
}

export function createInteractiveWorkflowEdge<T extends WorkflowConnection>(
  connection: T,
  options?: CreateInteractiveWorkflowEdgeOptions,
): (T & Pick<WorkflowEdge, 'animated' | 'type'>) | null {
  return resolveInteractiveWorkflowConnection(connection, options).edge;
}

export function resolveInteractiveWorkflowConnection<T extends WorkflowConnection>(
  connection: T,
  options?: CreateInteractiveWorkflowEdgeOptions,
): InteractiveWorkflowConnectionResult<T> {
  if (options) {
    const sourceNodeType = options.nodes.find((node) => node.id === connection.source)?.data.nodeType;
    const targetNodeType = options.nodes.find((node) => node.id === connection.target)?.data.nodeType;
    const decision = evaluateWorkflowConnection({
      existingEdges: options.existingEdges,
      source: connection.source,
      sourceNodeType,
      target: connection.target,
      targetNodeType,
    });

    if (!decision.allowed) {
      return {
        edge: null,
        rejectionReason: decision.reason,
      };
    }
  }

  return {
    edge: decorateWorkflowConnection(connection),
    rejectionReason: null,
  };
}
