import {
  Archive,
  Download,
  Grid3X3,
  Minus,
  MousePointer2,
  Plus,
  RotateCcw,
  Upload,
} from 'lucide-react';
import type { Panel } from '@/presentation/editor/editorTypes';

type LeftStatusProps = {
  snap: boolean;
  setSnap: (snap: boolean) => void;
  setShowMiniMap: (value: (prev: boolean) => boolean) => void;
  setPanel: (panel: Panel) => void;
  onExportCanvas: () => void;
  onImportCanvas: () => void;
  onArrangeCanvas: () => void;
  onRestoreDefaultCanvas: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  zoomPercent: number;
};

export function LeftStatus({
  snap,
  setSnap,
  setShowMiniMap,
  setPanel,
  onExportCanvas,
  onImportCanvas,
  onArrangeCanvas,
  onRestoreDefaultCanvas,
  onZoomIn,
  onZoomOut,
  zoomPercent,
}: LeftStatusProps) {
  return (
    <div className="left-status">
      <button title="资产管理">
        <Archive size={16} />
        <span>资产管理</span>
      </button>
      <button title="整理画布" onClick={onArrangeCanvas}>
        <Grid3X3 size={16} />
      </button>
      <button title="恢复默认画布" onClick={onRestoreDefaultCanvas}>
        <RotateCcw size={16} />
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
