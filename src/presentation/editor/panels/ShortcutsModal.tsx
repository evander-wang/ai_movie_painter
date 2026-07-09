import { X } from 'lucide-react';

export function ShortcutsModal({ onClose }: { onClose: () => void }) {
  const rows = [
    ['空格 + 拖拽', '平移画布'],
    ['⌘ / Ctrl + 滚轮', '缩放画布'],
    ['Option + Shift + F', '整理画布'],
    ['⌘ / Ctrl + C', '复制节点'],
    ['⌘ / Ctrl + V', '粘贴节点'],
    ['Delete', '删除选中节点'],
  ];

  return (
    <div className="modal-backdrop">
      <section className="shortcut-modal">
        <div className="modal-head">
          <div>
            <span>快捷键</span>
            <p>高频操作会保持在画布底部工具条附近。</p>
          </div>
          <button onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="shortcut-list">
          {rows.map(([key, action]) => (
            <div key={key}>
              <kbd>{key}</kbd>
              <span>{action}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}


