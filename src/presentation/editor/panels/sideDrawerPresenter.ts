import type { FlowNodeData } from '@/domain/workflow/model';

export type DrawerAsset = {
  background: string;
  label: string;
};

export type DrawerCharacter = {
  color: string;
  imageCount: number;
  name: string;
  videoNodeCount: number;
};

export type DrawerHistoryEvent = {
  label: string;
  minutesAgo: number;
};

export type DrawerTool = {
  icon: 'book' | 'copy' | 'scissors' | 'sparkles';
  label: string;
};

export type ToolboxView = {
  prompt: string;
  selectedNodeSize: string;
  selectedNodeTitle: string;
  tools: DrawerTool[];
};

const assetLabels = ['钟馗', '黎侯虎', '战鼓', '纸鸢'];
const swatches = ['#F05B5B', '#F59E0B', '#10B981', '#23A6F2', '#8B5CF6', '#F472B6'];

export function createAssetsView(): DrawerAsset[] {
  return Array.from({ length: 10 }, (_, index) => ({
    background: getAssetBackground(index),
    label: assetLabels[index % assetLabels.length],
  }));
}

export function createCharactersView(): DrawerCharacter[] {
  return ['钟馗', '寅虎', '赤发青面', '燕儿'].map((name, index) => ({
    color: swatches[index],
    imageCount: index + 3,
    name,
    videoNodeCount: index + 2,
  }));
}

export function createHistoryView(): DrawerHistoryEvent[] {
  return ['整理画布', '新增视频节点', '替换参考图', '复制分组', '保存项目'].map((label, index) => ({
    label,
    minutesAgo: index * 7 + 3,
  }));
}

export function createToolboxView(selectedNode?: FlowNodeData): ToolboxView {
  return {
    prompt: '全局执行限制，全程无背景音乐。人物不露脸，只拍手、脚、背影、肩以下、局部身体或影子。',
    selectedNodeSize: selectedNode?.size ?? '1280 × 720',
    selectedNodeTitle: selectedNode?.title ?? '视频节点 2',
    tools: [
      { icon: 'scissors', label: '裁剪' },
      { icon: 'sparkles', label: '高清' },
      { icon: 'book', label: '解析' },
      { icon: 'copy', label: '复制' },
    ],
  };
}

function getAssetBackground(index: number) {
  if (index % 3 === 0) return 'linear-gradient(135deg,#2b1b17,#f0b36a 52%,#111827)';
  if (index % 3 === 1) return 'linear-gradient(135deg,#1e293b,#38bdf8 48%,#fde68a)';
  return 'radial-gradient(circle at 45% 35%,#f8d7a3,#8f3430 42%,#141414)';
}
