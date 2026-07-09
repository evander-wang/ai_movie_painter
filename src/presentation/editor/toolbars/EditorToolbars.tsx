import { Archive, BadgeHelp, Box, Clock3, Download, Grid3X3, Keyboard, Layers3, Library, Minus, MousePointer2, Plus, Rows3, Settings2, Sparkles, Split, Timer, Upload, UserRound, Zap } from 'lucide-react';
import { projectConfig } from '@/config/projectConfig';
import type { Panel } from '@/presentation/editor/editorTypes';

export function TopNav() {
  return (
    <header className="top-nav">
      <div className="brand-block">
        <div className="brand-mark">
          <Split size={20} />
        </div>
        <button className="project-name">{projectConfig.app.displayName}</button>
      </div>
      <div className="top-actions">
        <button className="promo-button">
          <Sparkles size={15} />
          <span>会员特惠</span>
          <strong>37折</strong>
        </button>
        <button className="credit-button">
          <Zap size={15} />
          68
        </button>
        <button className="avatar-button">
          <UserRound size={18} />
        </button>
      </div>
    </header>
  );
}

export function CenterToolbar({ setPanel, activePanel }: { setPanel: (panel: Panel) => void; activePanel: Panel }) {
  const tools: Array<[Panel, React.ReactNode, string]> = [
    ['nodeMenu', <Plus size={20} />, '添加节点'],
    ['toolbox', <Box size={18} />, '打开工具箱'],
    ['assets', <Library size={18} />, '素材库'],
    ['characters', <UserRound size={18} />, '角色库'],
    ['history', <Clock3 size={18} />, '历史记录'],
    ['shortcuts', <Keyboard size={18} />, '快捷键'],
  ];

  return (
    <div className="center-toolbar" role="toolbar">
      {tools.map(([key, icon, label]) => (
        <button
          key={key}
          className={activePanel === key ? 'active' : ''}
          title={label}
          onClick={() => setPanel(activePanel === key ? null : key)}
        >
          {icon}
        </button>
      ))}
      <span className="tool-divider" />
      <button title="教程">
        <BadgeHelp size={18} />
      </button>
    </div>
  );
}

export function WorkflowRail({ activePanel, setPanel }: { activePanel: Panel; setPanel: (panel: Panel) => void }) {
  const tools: Array<[Panel, React.ReactNode, string, string]> = [
    ['nodeInspector', <Settings2 size={17} />, '参数', '节点详情参数面板'],
    ['storyboard', <Layers3 size={17} />, '分镜', 'Storyboard 分镜面板'],
    ['timeline', <Rows3 size={17} />, '时间线', '拼接与轨道预览'],
    ['queue', <Timer size={17} />, '任务', '生成任务队列'],
  ];

  return (
    <div className="workflow-rail" role="toolbar" aria-label="AI 视频工作流工具">
      {tools.map(([key, icon, label, title]) => (
        <button
          key={key}
          className={activePanel === key ? 'active' : ''}
          title={title}
          onClick={() => setPanel(activePanel === key ? null : key)}
        >
          {icon}
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}

export function LeftStatus({
  snap,
  setSnap,
  setShowMiniMap,
  setPanel,
  onExportCanvas,
  onImportCanvas,
  onArrangeCanvas,
  onZoomIn,
  onZoomOut,
  zoomPercent,
}: {
  snap: boolean;
  setSnap: (snap: boolean) => void;
  setShowMiniMap: (value: (prev: boolean) => boolean) => void;
  setPanel: (panel: Panel) => void;
  onExportCanvas: () => void;
  onImportCanvas: () => void;
  onArrangeCanvas: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  zoomPercent: number;
}) {
  return (
    <div className="left-status">
      <button title="资产管理">
        <Archive size={16} />
        <span>资产管理</span>
      </button>
      <button title="整理画布" onClick={onArrangeCanvas}>
        <Grid3X3 size={16} />
      </button>
      <button title="切换小地图" onClick={() => setShowMiniMap((prev) => !prev)}>
        <MousePointer2 size={16} />
      </button>
      <button className={snap ? 'active' : ''} title="网格吸附" onClick={() => setSnap(!snap)}>
        <Grid3X3 size={16} />
      </button>
      <button title="导出画布 JSON" onClick={onExportCanvas}>
        <Download size={16} />
        <span>导出</span>
      </button>
      <button title="导入画布 JSON" onClick={onImportCanvas}>
        <Upload size={16} />
        <span>导入</span>
      </button>
      <button title="缩小画布" onClick={onZoomOut}>
        <Minus size={16} />
      </button>
      <button className="zoom-chip" title="缩放选项" onClick={() => setPanel('zoom')}>
        {zoomPercent}%
      </button>
      <button title="放大画布" onClick={onZoomIn}>
        <Plus size={16} />
      </button>
    </div>
  );
}


