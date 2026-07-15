import type { FlowNodeData } from '@/domain/workflow/model';
import { createChips } from './attributePanelShared';
import type { AttributePanelView } from './attributePanelTypes';

export function createImageAttributeView(node: FlowNodeData): AttributePanelView {
  return {
    preview: {
      background: node.preview,
      label: '参考图',
    },
    tabs: ['参考设置', '裁剪', '用途', '版本'],
    metrics: [
      ['权重', '78'],
      ['绑定节点', '3'],
      ['相似度', '高'],
      ['版本', 'v4'],
    ],
    chipsTitle: '参考用途',
    chips: createChips(['角色外观', '服装道具', '场景光线', '构图比例'], [0, 1]),
    sliders: [
      { label: '角色一致性', value: 86 },
      { label: '风格迁移强度', value: 52 },
    ],
    actions: [
      { icon: 'shield', label: '设为角色参考' },
      { icon: 'video', label: '生成视频' },
      { icon: 'scissors', label: '抠像裁剪' },
    ],
  };
}

export function createTextAttributeView(node: FlowNodeData): AttributePanelView {
  return {
    tabs: ['Prompt', '结构化', '负向词', '下游'],
    prompt: {
      label: '镜头描述',
      body: node.body,
    },
    chipsTitle: 'Prompt 类型',
    chips: createChips(['全局约束', '分镜描述', '镜头语言', '负向约束'], [1]),
    fields: [
      ['景别', '中近景 / 局部特写'],
      ['运镜', '极缓推进，轻微右移'],
      ['主体', '爷爷与孙子肩以下、手部、背影'],
      ['禁用', '正脸、五官特写、背景音乐'],
    ],
    actions: [
      { icon: 'layers', label: '拆成分镜' },
      { icon: 'gitBranch', label: '应用到下游' },
      { icon: 'sparkles', label: '优化提示词' },
    ],
  };
}

export function createAudioAttributeView(): AttributePanelView & { waveformBars: number[] } {
  return {
    waveformBars: Array.from({ length: 34 }, (_, index) => 18 + ((index * 17) % 34)),
    tabs: ['分离', '音量', '降噪', '导出'],
    audioChannels: [
      { label: '人声', state: '已分离', value: 82 },
      { label: '环境声', state: '可增强', value: 48 },
      { label: '背景音乐', state: '静音约束', value: 0 },
    ],
    sliders: [
      { label: '降噪强度', value: 64 },
      { label: '环境声保留', value: 35 },
    ],
    actions: [
      { icon: 'volume', label: '重新分离' },
      { icon: 'download', label: '导出 WAV' },
      { icon: 'captions', label: '生成字幕' },
    ],
  };
}

export function createGroupAttributeView(node: FlowNodeData): AttributePanelView {
  return {
    metrics: [
      ['节点', String(node.count ?? 0)],
      ['视频', '5'],
      ['参考', '2'],
      ['约束', '1'],
    ],
    chipsTitle: '批量策略',
    chips: createChips(['统一模型', '锁定角色', '继承负向词', '自动排版'], [1, 2, 3]),
    fields: [
      ['默认模型', 'Seedance 2.0'],
      ['输出比例', '16:9 · 720P'],
      ['命名规则', '分组名 + 镜头序号'],
      ['失败策略', '自动重试 1 次'],
    ],
    actions: [
      { icon: 'grid', label: '整理分组' },
      { icon: 'play', label: '批量生成' },
      { icon: 'archive', label: '加入资产' },
    ],
  };
}
