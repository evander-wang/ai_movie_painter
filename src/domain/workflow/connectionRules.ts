import type { AiNodeType, WorkflowEdge } from './model';
import { isIncompleteConnection } from './connectionRulePredicates';
import { workflowConnectionRules } from './connectionRuleSet';

export type WorkflowConnection = {
  source?: string | null;
  sourceHandle?: string | null;
  target?: string | null;
  targetHandle?: string | null;
};

type CreateWorkflowEdgeInput = {
  existingEdges?: WorkflowConnection[];
  source: string;
  sourceHandle?: string | null;
  sourceNodeType?: AiNodeType;
  target: string;
  targetHandle?: string | null;
  targetNodeType?: AiNodeType;
};

export type EvaluateWorkflowConnectionInput = {
  existingEdges?: WorkflowConnection[];
  source?: string | null;
  sourceNodeType?: AiNodeType;
  target?: string | null;
  targetNodeType?: AiNodeType;
};

export type WorkflowConnectionDecision =
  | { allowed: true }
  | { allowed: false; reason: string };

export function createWorkflowEdge(input: CreateWorkflowEdgeInput): WorkflowEdge | null {
  const decision = evaluateWorkflowConnection(input);
  if (!decision.allowed || !canConnectWorkflowNodes(input)) return null;

  return {
    animated: true,
    id: buildWorkflowEdgeId(input),
    source: input.source,
    sourceHandle: input.sourceHandle,
    target: input.target,
    targetHandle: input.targetHandle,
    type: 'pulse',
  };
}

export function evaluateWorkflowConnection(input: EvaluateWorkflowConnectionInput): WorkflowConnectionDecision {
  if (isIncompleteConnection(input)) return { allowed: true };

  const rejection = workflowConnectionRules.find((rule) => rule.rejects(input));
  return rejection ? { allowed: false, reason: rejection.reason } : { allowed: true };
}

export function decorateWorkflowConnection<T extends WorkflowConnection>(connection: T): T & Pick<WorkflowEdge, 'animated' | 'type'> {
  return {
    ...connection,
    animated: true,
    type: 'pulse',
  };
}

function canConnectWorkflowNodes(input: CreateWorkflowEdgeInput): boolean {
  return !(input.existingEdges ?? []).some(
    (edge) =>
      edge.source === input.source &&
      edge.target === input.target &&
      (edge.sourceHandle ?? null) === (input.sourceHandle ?? null) &&
      (edge.targetHandle ?? null) === (input.targetHandle ?? null),
  );
}

function buildWorkflowEdgeId(input: CreateWorkflowEdgeInput): string {
  const handles = [input.sourceHandle, input.targetHandle].filter(Boolean).join('-');
  return handles ? `e-${input.source}-${input.target}-${handles}` : `e-${input.source}-${input.target}`;
}
