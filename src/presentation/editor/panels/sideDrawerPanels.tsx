import { BookOpen, ChevronsUpDown, Copy, Scissors, Search, WandSparkles } from 'lucide-react';
import type { FlowNodeData } from '@/domain/workflow/model';
import {
  createAssetsView,
  createCharactersView,
  createHistoryView,
  createToolboxView,
  type DrawerTool,
} from './sideDrawerPresenter';

export function AssetsPanel() {
  const assets = createAssetsView();

  return (
    <div className="drawer-body">
      <label className="search-box">
        <Search size={16} />
        <input placeholder="搜索素材、节点或文件名" />
      </label>
      <div className="tabs">
        <button className="active">全部参考</button>
        <button>图片</button>
        <button>视频</button>
        <button>音频</button>
      </div>
      <div className="asset-grid">
        {assets.map((asset, index) => (
          <button key={`${asset.label}-${index}`} className="asset-card">
            <div style={{ background: asset.background }} />
            <span>{asset.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function CharactersPanel() {
  const characters = createCharactersView();

  return (
    <div className="drawer-body">
      <div className="character-list">
        {characters.map((character) => (
          <button key={character.name} className="character-card">
            <span style={{ background: character.color }} />
            <div>
              <strong>{character.name}</strong>
              <small>{character.imageCount} 张参考图 · {character.videoNodeCount} 个视频节点</small>
            </div>
            <ChevronsUpDown size={16} />
          </button>
        ))}
      </div>
    </div>
  );
}

export function HistoryPanel() {
  const historyEvents = createHistoryView();

  return (
    <div className="drawer-body">
      <div className="timeline">
        {historyEvents.map((event) => (
          <div key={event.label} className="timeline-row">
            <span />
            <div>
              <strong>{event.label}</strong>
              <small>{event.minutesAgo} 分钟前</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ToolboxPanel({ selectedNode }: { selectedNode?: FlowNodeData }) {
  const toolbox = createToolboxView(selectedNode);

  return (
    <div className="drawer-body">
      <div className="selected-node-card">
        <span>当前节点</span>
        <strong>{toolbox.selectedNodeTitle}</strong>
        <small>{toolbox.selectedNodeSize}</small>
      </div>
      <div className="tool-list">
        {toolbox.tools.map((tool) => (
          <button key={tool.label}>
            {renderToolIcon(tool)}
            <span>{tool.label}</span>
          </button>
        ))}
      </div>
      <div className="prompt-box">
        <span>生成提示词</span>
        <p>{toolbox.prompt}</p>
        <button>展开参数</button>
      </div>
    </div>
  );
}

function renderToolIcon(tool: DrawerTool) {
  if (tool.icon === 'scissors') return <Scissors size={17} />;
  if (tool.icon === 'sparkles') return <WandSparkles size={17} />;
  if (tool.icon === 'book') return <BookOpen size={17} />;
  return <Copy size={17} />;
}
