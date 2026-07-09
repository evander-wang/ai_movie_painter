import { FolderOpen, ImageIcon, MessageSquareText, Settings2, Video, Volume2, X } from 'lucide-react';
import { nodeCatalog } from '@/domain/workflow/nodeCatalog';
import type { FlowNodeData, NodeKind } from '@/domain/workflow/model';
import { AudioAttributePanel, ConfigAttributePanel, getNodeSubtitle, GroupAttributePanel, ImageAttributePanel, TextAttributePanel } from './AttributePanels';
import { useDraggableOverlay } from '@/presentation/editor/state/useDraggableOverlay';
import type { OverlayPosition } from '@/shared/geometry/overlayPosition';

export function NodeAttributePopover({
  node,
  position,
  onClose,
}: {
  node: FlowNodeData;
  position?: OverlayPosition;
  onClose: () => void;
}) {
  const { dragStyle, dragHandleProps } = useDraggableOverlay(position);
  const config = node.nodeType ? nodeCatalog[node.nodeType] : undefined;
  const iconMap: Record<NodeKind, React.ReactNode> = {
    image: <ImageIcon size={17} />,
    text: <MessageSquareText size={17} />,
    audio: <Volume2 size={17} />,
    group: <FolderOpen size={17} />,
    video: <Video size={17} />,
    tool: <Settings2 size={17} />,
  };

  return (
    <aside className={`node-attribute-popover ${node.kind}`} style={dragStyle}>
      <div className="attribute-head draggable-handle" {...dragHandleProps}>
        <div className="attribute-title">
          <span className={`attribute-icon ${node.kind}`}>{iconMap[node.kind]}</span>
          <div>
            <strong>{node.title}</strong>
            <small>{getNodeSubtitle(node)}</small>
          </div>
        </div>
        <button
          onClick={(event) => {
            event.stopPropagation();
            onClose();
          }}
        >
          <X size={17} />
        </button>
      </div>
      {config && <ConfigAttributePanel node={node} config={config} />}
      {!config && node.kind === 'image' && <ImageAttributePanel node={node} />}
      {!config && node.kind === 'text' && <TextAttributePanel node={node} />}
      {!config && node.kind === 'audio' && <AudioAttributePanel />}
      {!config && node.kind === 'group' && <GroupAttributePanel node={node} />}
    </aside>
  );
}
