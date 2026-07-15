import { describe, expect, test } from 'vitest';
import type { FlowNodeData, NodeAttributeConfig } from '@/domain/workflow/model';
import {
  createConfigAttributeView,
  createGroupAttributeView,
  createImageAttributeView,
  createTextAttributeView,
  getNodeSubtitle,
} from '@/presentation/editor/overlays/attributePanelPresenter';

describe('attributePanelPresenter', () => {
  test('builds catalog-backed subtitles for configured workflow nodes', () => {
    const node: FlowNodeData = {
      title: '图生视频',
      kind: 'video',
      nodeType: 'imageToVideo',
    };

    expect(getNodeSubtitle(node)).toBe('核心生成 · 以参考图作为首帧或主体约束，生成带运动的视频片段。');
  });

  test('keeps image attribute controls as structured presentation data', () => {
    const view = createImageAttributeView({
      title: '图片参考 10',
      kind: 'image',
      preview: 'linear-gradient(red, blue)',
    });

    expect(view.tabs).toEqual(['参考设置', '裁剪', '用途', '版本']);
    expect(view.metrics).toContainEqual(['权重', '78']);
    expect(view.chips?.filter((chip) => chip.active).map((chip) => chip.label)).toEqual([
      '角色外观',
      '服装道具',
    ]);
    expect(view.actions.map((action) => action.icon)).toEqual(['shield', 'video', 'scissors']);
  });

  test('builds prompt and structured rows for text nodes', () => {
    const view = createTextAttributeView({
      title: '全局分镜 Prompt',
      kind: 'text',
      body: '非遗主题短片',
    });

    expect(view.prompt).toEqual({ label: '镜头描述', body: '非遗主题短片' });
    expect(view.fields).toContainEqual(['禁用', '正脸、五官特写、背景音乐']);
    expect(view.actions.map((action) => action.label)).toEqual(['拆成分镜', '应用到下游', '优化提示词']);
  });

  test('derives group metrics from node count', () => {
    const view = createGroupAttributeView({
      title: '参考组',
      kind: 'group',
      count: 7,
    });

    expect(view.metrics?.[0]).toEqual(['节点', '7']);
    expect(view.chips?.filter((chip) => chip.active).map((chip) => chip.label)).toEqual([
      '锁定角色',
      '继承负向词',
      '自动排版',
    ]);
  });

  test('uses node preview override for configurable catalog attributes', () => {
    const config: NodeAttributeConfig = {
      label: 'Prompt 节点',
      category: '文本与脚本',
      kind: 'text',
      accent: '#7c3aed',
      summary: '存放可复用提示词',
      tabs: ['Prompt'],
      metrics: [['字数', '186']],
      fields: [['变量', '{角色}']],
      chips: ['全局提示词', '分镜提示词'],
      activeChips: [0],
      sliders: [['提示词权重', 82]],
      actions: ['运行', '优化', '应用'],
    };

    const view = createConfigAttributeView(
      {
        title: 'Prompt',
        kind: 'text',
        preview: 'custom-preview',
      },
      config,
    );

    expect(view.preview?.background).toBe('custom-preview');
    expect(view.actions.map((action) => action.icon)).toEqual(['play', 'sparkles', 'gitBranch']);
  });
});
