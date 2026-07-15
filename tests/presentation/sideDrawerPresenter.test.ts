import { describe, expect, it } from 'vitest';
import {
  createAssetsView,
  createCharactersView,
  createHistoryView,
  createToolboxView,
} from '../../src/presentation/editor/panels/sideDrawerPresenter';

describe('sideDrawerPresenter', () => {
  it('builds a stable asset drawer grid', () => {
    const assets = createAssetsView();

    expect(assets).toHaveLength(10);
    expect(assets.slice(0, 4).map((asset) => asset.label)).toEqual(['钟馗', '黎侯虎', '战鼓', '纸鸢']);
    expect(assets[0].background).toContain('linear-gradient');
  });

  it('builds character drawer rows with reference counts', () => {
    expect(createCharactersView()).toEqual([
      { color: '#F05B5B', imageCount: 3, name: '钟馗', videoNodeCount: 2 },
      { color: '#F59E0B', imageCount: 4, name: '寅虎', videoNodeCount: 3 },
      { color: '#10B981', imageCount: 5, name: '赤发青面', videoNodeCount: 4 },
      { color: '#23A6F2', imageCount: 6, name: '燕儿', videoNodeCount: 5 },
    ]);
  });

  it('builds chronological drawer events', () => {
    expect(createHistoryView()).toEqual([
      { label: '整理画布', minutesAgo: 3 },
      { label: '新增视频节点', minutesAgo: 10 },
      { label: '替换参考图', minutesAgo: 17 },
      { label: '复制分组', minutesAgo: 24 },
      { label: '保存项目', minutesAgo: 31 },
    ]);
  });

  it('uses selected node data in the toolbox drawer', () => {
    expect(createToolboxView({ title: '图片参考 9', kind: 'image', size: '2048 × 1536' })).toEqual(
      expect.objectContaining({
        selectedNodeSize: '2048 × 1536',
        selectedNodeTitle: '图片参考 9',
        tools: [
          { icon: 'scissors', label: '裁剪' },
          { icon: 'sparkles', label: '高清' },
          { icon: 'book', label: '解析' },
          { icon: 'copy', label: '复制' },
        ],
      }),
    );
  });
});
