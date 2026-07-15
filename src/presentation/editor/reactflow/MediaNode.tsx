import { Handle, type Node, type NodeProps, Position } from '@xyflow/react';
import { Film, ImageIcon, MessageSquareText, MoreHorizontal, Settings2, Video, Zap } from 'lucide-react';
import { memo } from 'react';
import type React from 'react';
import { nodeCatalog } from '@/domain/workflow/nodeCatalog';
import type { FlowNodeData } from '@/domain/workflow/model';
import { rectFromElement } from '@/infrastructure/browser/domGeometry';

function MediaNodeComponent({ id, data, selected }: NodeProps<Node<FlowNodeData>>) {
  const isGroup = data.kind === 'group';
  const config = data.nodeType ? nodeCatalog[data.nodeType] : undefined;
  const emitSelection = (event: React.MouseEvent<HTMLElement>) => {
    window.dispatchEvent(
      new CustomEvent('prototype-node-select', {
        detail: {
          id,
          kind: data.kind,
          anchor: rectFromElement(event.currentTarget),
        },
      }),
    );
  };

  if (isGroup) {
    return (
      <div
        className="group-node"
        role="button"
        tabIndex={0}
        onClick={emitSelection}
        style={{
          '--group-accent': data.accent ?? '#334155',
        } as React.CSSProperties}
      >
        <div className="group-node-title">
          <span>{data.title}</span>
          <small>{data.count} 个节点</small>
        </div>
      </div>
    );
  }

  return (
    <div className={`flow-node ${selected ? 'is-selected' : ''}`} role="button" tabIndex={0} onClick={emitSelection}>
      <Handle className="node-handle node-handle-target" type="target" position={Position.Left} />
      <div className="node-head">
        <span className={`node-kind ${data.kind}`}>
          {data.kind === 'video' && <Video size={13} />}
          {data.kind === 'image' && <ImageIcon size={13} />}
          {data.kind === 'text' && <MessageSquareText size={13} />}
          {data.kind === 'audio' && <Zap size={13} />}
          {data.kind === 'tool' && <Settings2 size={13} />}
        </span>
        <span className="node-title">{data.title}</span>
        <button className="node-more" aria-label="more">
          <MoreHorizontal size={14} />
        </button>
      </div>
      {data.kind === 'text' ? (
        <div className="text-preview">
          <strong>{data.size}</strong>
          <p>{data.body}</p>
        </div>
      ) : (
        <div className="media-preview" style={{ background: data.preview }}>
          {data.kind === 'video' && <Film size={26} />}
          {data.kind === 'audio' && <Zap size={26} />}
          {data.kind === 'image' && <ImageIcon size={26} />}
          {data.kind === 'tool' && <Settings2 size={26} />}
          <span className="node-category-badge">{config?.category}</span>
        </div>
      )}
      <div className="node-foot">
        <span>{data.size}</span>
        {data.status === 'working' && <span className="pill busy">生成中</span>}
        {data.status === 'ready' && <span className="pill ok">完成</span>}
        {data.status === 'muted' && <span className="pill muted">静音</span>}
      </div>
      <Handle className="node-handle node-handle-source" type="source" position={Position.Right} />
    </div>
  );
}

export const MediaNode = memo(MediaNodeComponent);
