import { BookOpen, ChevronsUpDown, Copy, Scissors, Search, WandSparkles, X } from 'lucide-react';
import type { FlowNodeData } from '@/domain/workflow/model';
import type { Panel } from '@/presentation/editor/editorTypes';

const swatches = [
  '#F05B5B',
  '#F59E0B',
  '#10B981',
  '#23A6F2',
  '#8B5CF6',
  '#F472B6',
];

export function SideDrawer({
  panel,
  onClose,
  selectedNode,
}: {
  panel: Panel;
  onClose: () => void;
  selectedNode?: FlowNodeData;
}) {
  const title =
    panel === 'assets' ? '素材库' : panel === 'characters' ? '角色库' : panel === 'history' ? '历史记录' : '工具箱';

  return (
    <aside className="side-drawer">
      <div className="drawer-head">
        <div>
          <span>{title}</span>
          <small>{panel === 'assets' ? '全局参考、图片、视频、音频' : '节点和项目工具'}</small>
        </div>
        <button onClick={onClose}>
          <X size={18} />
        </button>
      </div>
      {panel === 'assets' && <AssetsPanel />}
      {panel === 'characters' && <CharactersPanel />}
      {panel === 'history' && <HistoryPanel />}
      {panel === 'toolbox' && <ToolboxPanel selectedNode={selectedNode} />}
    </aside>
  );
}

function AssetsPanel() {
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
        {Array.from({ length: 10 }).map((_, index) => (
          <button key={index} className="asset-card">
            <div
              style={{
                background:
                  index % 3 === 0
                    ? 'linear-gradient(135deg,#2b1b17,#f0b36a 52%,#111827)'
                    : index % 3 === 1
                      ? 'linear-gradient(135deg,#1e293b,#38bdf8 48%,#fde68a)'
                      : 'radial-gradient(circle at 45% 35%,#f8d7a3,#8f3430 42%,#141414)',
              }}
            />
            <span>{['钟馗', '黎侯虎', '战鼓', '纸鸢'][index % 4]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function CharactersPanel() {
  return (
    <div className="drawer-body">
      <div className="character-list">
        {['钟馗', '寅虎', '赤发青面', '燕儿'].map((name, index) => (
          <button key={name} className="character-card">
            <span style={{ background: swatches[index] }} />
            <div>
              <strong>{name}</strong>
              <small>{index + 3} 张参考图 · {index + 2} 个视频节点</small>
            </div>
            <ChevronsUpDown size={16} />
          </button>
        ))}
      </div>
    </div>
  );
}

function HistoryPanel() {
  return (
    <div className="drawer-body">
      <div className="timeline">
        {['整理画布', '新增视频节点', '替换参考图', '复制分组', '保存项目'].map((event, index) => (
          <div key={event} className="timeline-row">
            <span />
            <div>
              <strong>{event}</strong>
              <small>{index * 7 + 3} 分钟前</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ToolboxPanel({ selectedNode }: { selectedNode?: FlowNodeData }) {
  return (
    <div className="drawer-body">
      <div className="selected-node-card">
        <span>当前节点</span>
        <strong>{selectedNode?.title ?? '视频节点 2'}</strong>
        <small>{selectedNode?.size ?? '1280 × 720'}</small>
      </div>
      <div className="tool-list">
        {[
          ['裁剪', Scissors],
          ['高清', WandSparkles],
          ['解析', BookOpen],
          ['复制', Copy],
        ].map(([name, Icon]) => (
          <button key={name as string}>
            <Icon size={17} />
            <span>{name as string}</span>
          </button>
        ))}
      </div>
      <div className="prompt-box">
        <span>生成提示词</span>
        <p>
          全局执行限制，全程无背景音乐。人物不露脸，只拍手、脚、背影、肩以下、局部身体或影子。
        </p>
        <button>展开参数</button>
      </div>
    </div>
  );
}
