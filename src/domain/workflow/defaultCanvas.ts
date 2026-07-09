import { nodeCatalog } from './nodeCatalog';
import { makeNodePreview } from './nodeFactory';
import type { WorkflowEdge, WorkflowNode } from './model';

export function createDefaultCanvasNodes(): WorkflowNode[] {
  const promptConfig = nodeCatalog.prompt;
  const videoConfig = nodeCatalog.imageToVideo;
  const imageConfig = nodeCatalog.imageReference;
  const nodes: WorkflowNode[] = [
    {
      id: 'default-text',
      type: 'mediaNode',
      position: { x: -860, y: 170 },
      data: {
        title: '全局分镜 Prompt',
        kind: 'text',
        nodeType: 'prompt',
        size: '文本节点',
        status: 'ready',
        accent: promptConfig.accent,
        body:
          '非遗主题短片：老屋书房，清晨暖金色自然光，爷爷与孙子只拍手、脚、背影、肩以下。桌面依次展示布老虎、泥塑钟馗、纸鸢等道具，全程无背景音乐。',
      },
    },
  ];

  Array.from({ length: 10 }).forEach((_, index) => {
    const col = index < 5 ? 0 : 1;
    const row = index % 5;
    nodes.push({
      id: `default-image-${index + 1}`,
      type: 'mediaNode',
      position: {
        x: -380 + col * 300,
        y: -250 + row * 165,
      },
      data: {
        title: `图片参考 ${index + 1}`,
        kind: 'image',
        nodeType: 'imageReference',
        size: index < 5 ? '参与视频生成' : '仅作为参考',
        status: 'ready',
        accent: imageConfig.accent,
        preview:
          index % 3 === 0
            ? 'linear-gradient(135deg, #69413a, #b89463 45%, #1f2937)'
            : index % 3 === 1
              ? 'radial-gradient(circle at 35% 35%, #f7d8a6, #a4423a 42%, #121416)'
              : 'linear-gradient(135deg, #e6e0c8, #648a6a 45%, #121212)',
        body: imageConfig.summary,
      },
    });
  });

  nodes.push({
    id: 'default-video',
    type: 'mediaNode',
    position: { x: 450, y: 170 },
    data: {
      title: '图生视频合成',
      kind: 'video',
      nodeType: 'imageToVideo',
      size: '5 张参考 · 16:9',
      status: 'working',
      accent: videoConfig.accent,
      preview: makeNodePreview(videoConfig),
      body: videoConfig.summary,
    },
  });

  return nodes;
}



export const initialEdges: WorkflowEdge[] = [
  ...Array.from({ length: 10 }, (_, index) => ({
    id: `e-text-image-${index + 1}`,
    source: 'default-text',
    target: `default-image-${index + 1}`,
    type: 'pulse',
    animated: true,
  })),
  ...Array.from({ length: 5 }, (_, index) => ({
    id: `e-image-video-${index + 1}`,
    source: `default-image-${index + 1}`,
    target: 'default-video',
    type: 'pulse',
    animated: true,
  })),
];

