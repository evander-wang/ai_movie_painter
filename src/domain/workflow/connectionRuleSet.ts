import {
  createsCycle,
  isAudioNode,
  isImageReferenceNode,
  isOutputNode,
  isSelfConnection,
} from './connectionRulePredicates';
import type { EvaluateWorkflowConnectionInput } from './connectionRules';

export type WorkflowConnectionRule = {
  reason: string;
  rejects: (input: EvaluateWorkflowConnectionInput) => boolean;
};

export const workflowConnectionRules: WorkflowConnectionRule[] = [
  {
    reason: '不能连接节点自身',
    rejects: isSelfConnection,
  },
  {
    reason: '不能创建环路连接',
    rejects: (input) =>
      Boolean(
        input.source &&
        input.target &&
        createsCycle(input.existingEdges ?? [], input.source, input.target),
      ),
  },
  {
    reason: '输出节点只能作为终点',
    rejects: (input) => Boolean(input.sourceNodeType && isOutputNode(input.sourceNodeType)),
  },
  {
    reason: '图片参考不能直接连接音频节点',
    rejects: (input) =>
      Boolean(
        input.sourceNodeType &&
        input.targetNodeType &&
        isImageReferenceNode(input.sourceNodeType) &&
        isAudioNode(input.targetNodeType),
      ),
  },
];
