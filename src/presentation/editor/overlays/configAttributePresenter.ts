import { makeNodePreview } from '@/domain/workflow/nodeFactory';
import type { FlowNodeData, NodeAttributeConfig } from '@/domain/workflow/model';
import { configActionIcons, createChips, createSliders } from './attributePanelShared';
import type { AttributePanelView } from './attributePanelTypes';

export function createConfigAttributeView(
  node: FlowNodeData,
  config: NodeAttributeConfig,
): AttributePanelView & { category: string; summary: string } {
  return {
    category: config.category,
    summary: config.summary,
    preview: {
      background: node.preview ?? makeNodePreview(config),
      kind: config.kind,
    },
    tabs: config.tabs,
    metrics: config.metrics,
    fields: config.fields,
    chipsTitle: '能力开关',
    chips: createChips(config.chips, config.activeChips),
    sliders: createSliders(config.sliders),
    actions: config.actions.map((label, index) => ({
      label,
      icon: configActionIcons[index] ?? 'gitBranch',
    })),
  };
}
