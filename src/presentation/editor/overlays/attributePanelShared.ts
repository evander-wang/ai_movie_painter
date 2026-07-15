import { nodeCatalog } from '@/domain/workflow/nodeCatalog';
import type { FlowNodeData } from '@/domain/workflow/model';
import type { AttributeActionIcon } from './attributePanelTypes';

export const configActionIcons: AttributeActionIcon[] = ['play', 'sparkles', 'gitBranch'];

export function getNodeSubtitle(node: FlowNodeData) {
  if (node.nodeType) return `${nodeCatalog[node.nodeType].category} · ${nodeCatalog[node.nodeType].summary}`;
  if (node.kind === 'image') return `${node.size ?? '参考图'} · 可作为角色/场景/风格约束`;
  if (node.kind === 'text') return `${node.size ?? 'Prompt'} · 可连接到多个生成节点`;
  if (node.kind === 'audio') return `${node.size ?? '音频'} · 人声/音乐/环境声处理`;
  if (node.kind === 'group') return `${node.count ?? 0} 个节点 · 批量管理与一致性约束`;
  if (node.kind === 'tool') return `${node.size ?? '工具'} · 工作流处理节点`;
  return `${node.size ?? '视频'} · 生成结果`;
}

export function createChips(labels: string[], activeIndexes: number[]) {
  const activeSet = new Set(activeIndexes);
  return labels.map((label, index) => ({
    label,
    active: activeSet.has(index),
  }));
}

export function createSliders(sliders: Array<[string, number]>) {
  return sliders.map(([label, value]) => ({ label, value }));
}
