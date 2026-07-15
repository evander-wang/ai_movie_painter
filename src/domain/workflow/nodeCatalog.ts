import type { AiNodeType, NodeAttributeConfig } from './model';
import { audioNodes } from './catalog/audioNodes';
import { editingNodes } from './catalog/editingNodes';
import { outputNodes } from './catalog/outputNodes';
import { referenceNodes } from './catalog/referenceNodes';
import { textNodes } from './catalog/textNodes';
import { videoNodes } from './catalog/videoNodes';

export const nodeCatalog: Record<AiNodeType, NodeAttributeConfig> = {
  ...videoNodes,
  ...referenceNodes,
  ...textNodes,
  ...audioNodes,
  ...editingNodes,
  ...outputNodes,
};
