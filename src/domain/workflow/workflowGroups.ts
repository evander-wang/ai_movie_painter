import type { AiNodeType } from './model';

export const workflowGroups = [
  {
    id: 'core-generation',
    title: '核心生成',
    count: 5,
    accent: '#15c8e8',
    position: { x: -1620, y: -620 },
    nodeTypes: ['textToVideo', 'imageToVideo', 'firstLastFrame', 'videoExtend', 'videoToVideo'] as AiNodeType[],
  },
  {
    id: 'reference-control',
    title: '参考控制',
    count: 5,
    accent: '#f6b84d',
    position: { x: -480, y: -620 },
    nodeTypes: ['imageReference', 'characterReference', 'sceneReference', 'propReference', 'styleReference'] as AiNodeType[],
  },
  {
    id: 'text-script',
    title: '文本与脚本',
    count: 5,
    accent: '#8b5cf6',
    position: { x: 660, y: -620 },
    nodeTypes: ['prompt', 'negativePrompt', 'script', 'storyboard', 'camera'] as AiNodeType[],
  },
  {
    id: 'audio',
    title: '音频',
    count: 5,
    accent: '#10b981',
    position: { x: -1620, y: 280 },
    nodeTypes: ['voiceover', 'music', 'soundEffect', 'audioSeparation', 'lipSync'] as AiNodeType[],
  },
  {
    id: 'video-processing',
    title: '视频处理',
    count: 7,
    accent: '#f59e0b',
    position: { x: -480, y: 280 },
    nodeTypes: ['trim', 'cropRatio', 'upscale', 'interpolate', 'removeText', 'matting', 'inpaint'] as AiNodeType[],
  },
  {
    id: 'orchestration-output',
    title: '编排与输出',
    count: 9,
    accent: '#06b6d4',
    position: { x: 660, y: 280 },
    nodeTypes: ['timeline', 'transition', 'subtitle', 'composite', 'versionCompare', 'batchGenerate', 'taskQueue', 'export', 'publish'] as AiNodeType[],
  },
];


