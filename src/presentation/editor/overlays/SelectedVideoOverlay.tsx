import { BookOpen, Captions, ChevronDown, Download, Expand, Scissors, Square, Volume2 } from 'lucide-react';
import { nodeCatalog } from '@/domain/workflow/nodeCatalog';
import { makeNodePreview } from '@/domain/workflow/nodeFactory';
import type { FlowNodeData } from '@/domain/workflow/model';
import type { NodePopover } from '@/presentation/editor/editorTypes';
import { useDraggableOverlay } from '@/presentation/editor/state/useDraggableOverlay';
import { ToolbarPopover } from './ToolbarPopover';
import { VideoConfigCard } from './VideoConfigCard';
import type { OverlayPosition } from '@/shared/geometry/overlayPosition';

export function SelectedVideoOverlay({
  node,
  position,
  activePopover,
  setActivePopover,
  openExpand,
}: {
  node: FlowNodeData;
  position?: OverlayPosition;
  activePopover: NodePopover;
  setActivePopover: (popover: NodePopover) => void;
  openExpand: () => void;
}) {
  const { dragStyle, dragHandleProps } = useDraggableOverlay(position);
  const config = node.nodeType ? nodeCatalog[node.nodeType] : nodeCatalog.textToVideo;
  const toolButtons: Array<[NodePopover, React.ReactNode, string]> = [
    ['edit', <Scissors size={15} />, '剪辑'],
    ['crop', <Square size={15} />, '裁剪'],
    ['hd', <span className="hd-badge">HD</span>, '高清'],
    ['parse', <BookOpen size={15} />, '解析'],
    ['subtitle', <Captions size={15} />, '智能去字幕'],
    ['audio', <Volume2 size={15} />, '音频分离'],
  ];

  return (
    <div className="selected-video-overlay" style={dragStyle}>
      <div className="selected-media-node draggable-handle" {...dragHandleProps}>
        <div className="node-caption">{node.title} · {config.category}</div>
        <div className="selected-media-preview" style={{ background: node.preview ?? makeNodePreview(config) }}>
          <div className="play-chip">00:00</div>
          <div className="duration-chip">00:06</div>
        </div>
      </div>

      <div className="floating-video-toolbar">
        {toolButtons.map(([key, icon, label]) => (
          <button
            key={key}
            className={activePopover === key ? 'active' : ''}
            onClick={() => setActivePopover(activePopover === key ? null : key)}
          >
            {icon}
            <span>{label}</span>
            {(key === 'subtitle' || key === 'audio') && <ChevronDown size={13} />}
          </button>
        ))}
        <span className="toolbar-separator" />
        <button onClick={() => setActivePopover(activePopover === 'download' ? null : 'download')}>
          <Download size={16} />
        </button>
        <button onClick={openExpand}>
          <Expand size={16} />
        </button>
      </div>

      {activePopover && <ToolbarPopover type={activePopover} />}
      <VideoConfigCard node={node} config={config} openExpand={openExpand} />
    </div>
  );
}

