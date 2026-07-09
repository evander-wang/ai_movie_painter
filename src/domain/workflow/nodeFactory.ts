import { nodeCatalog } from './nodeCatalog';
import type { AiNodeType, CanvasPosition, NodeAttributeConfig, WorkflowNode } from './model';

export function makeNodePreview(config: NodeAttributeConfig) {
  return `linear-gradient(135deg, ${config.accent}44, rgba(255,255,255,0.06) 42%, rgba(9,11,14,0.92)), radial-gradient(circle at 72% 32%, ${config.accent}88, transparent 20%)`;
}



export function createNodeFromCatalog(nodeType: AiNodeType, id: string, position: CanvasPosition): WorkflowNode {
  const config = nodeCatalog[nodeType];
  return {
    id,
    type: 'mediaNode',
    position,
    selected: true,
    data: {
      title: config.label,
      kind: config.kind,
      nodeType,
      size: config.category,
      status: nodeType === 'taskQueue' ? 'working' : nodeType === 'music' ? 'muted' : 'ready',
      accent: config.accent,
      preview: makeNodePreview(config),
      body: config.summary,
    },
  };
}


