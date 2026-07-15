import { nodeCatalog } from './nodeCatalog';
import type { AiNodeType } from './model';
import type { EvaluateWorkflowConnectionInput, WorkflowConnection } from './connectionRules';

export function isIncompleteConnection(input: EvaluateWorkflowConnectionInput): boolean {
  return (!input.source && !input.sourceNodeType) || (!input.target && !input.targetNodeType);
}

export function isSelfConnection(input: EvaluateWorkflowConnectionInput): boolean {
  return Boolean(input.source && input.target && input.source === input.target);
}

export function createsCycle(edges: WorkflowConnection[], source: string, target: string): boolean {
  const visited = new Set<string>();
  const stack = [target];

  while (stack.length) {
    const current = stack.pop();
    if (!current || visited.has(current)) continue;
    if (current === source) return true;

    visited.add(current);
    for (const edge of edges) {
      if (edge.source === current && edge.target) stack.push(edge.target);
    }
  }

  return false;
}

export function isOutputNode(nodeType: AiNodeType): boolean {
  return nodeCatalog[nodeType].category === '任务输出';
}

export function isImageReferenceNode(nodeType: AiNodeType): boolean {
  return (
    nodeType === 'imageReference' ||
    nodeType === 'characterReference' ||
    nodeType === 'sceneReference' ||
    nodeType === 'propReference' ||
    nodeType === 'styleReference'
  );
}

export function isAudioNode(nodeType: AiNodeType): boolean {
  return nodeCatalog[nodeType].kind === 'audio';
}
