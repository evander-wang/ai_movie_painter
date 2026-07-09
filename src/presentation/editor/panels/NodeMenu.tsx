import { ImageIcon, MessageSquareText, Settings2, Video, X, Zap } from 'lucide-react';
import { nodeCatalog } from '@/domain/workflow/nodeCatalog';
import { workflowGroups } from '@/domain/workflow/workflowGroups';
import type { AiNodeType } from '@/domain/workflow/model';

export function NodeMenu({ onAddNode, onClose }: { onAddNode: (nodeType: AiNodeType) => void; onClose: () => void }) {
  return (
    <div className="popover node-menu">
      <div className="popover-head">
        <div>
          <strong>添加节点</strong>
          <small>选择一种 AI 视频工作流节点，添加到当前视口中心</small>
        </div>
        <button onClick={onClose}>
          <X size={15} />
        </button>
      </div>
      <div className="node-menu-library">
        {workflowGroups.map((group) => (
          <section key={group.id} className="node-menu-section">
            <div className="node-menu-section-head">
              <span style={{ background: group.accent }} />
              <strong>{group.title}</strong>
              <small>{group.count}</small>
            </div>
            <div className="node-menu-grid">
              {group.nodeTypes.map((nodeType) => {
                const config = nodeCatalog[nodeType];
                return (
                  <button
                    key={nodeType}
                    onClick={() => {
                      onAddNode(nodeType);
                      onClose();
                    }}
                  >
                    <span className={`node-kind ${config.kind}`}>
                      {config.kind === 'video' && <Video size={13} />}
                      {config.kind === 'image' && <ImageIcon size={13} />}
                      {config.kind === 'text' && <MessageSquareText size={13} />}
                      {config.kind === 'audio' && <Zap size={13} />}
                      {config.kind === 'tool' && <Settings2 size={13} />}
                    </span>
                    <span>{config.label}</span>
                    <small>{config.summary}</small>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}


