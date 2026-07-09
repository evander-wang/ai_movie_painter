import { Maximize2, Minimize2, X } from 'lucide-react';

export function ZoomPopover({
  onClose,
  onFitView,
  onZoom100,
  onZoomOut,
  onResetView,
}: {
  onClose: () => void;
  onFitView: () => void;
  onZoom100: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
}) {
  const options = [
    { label: '适应屏幕', shortcut: 'F', icon: <Maximize2 size={16} />, action: onFitView },
    { label: '缩放到 100%', shortcut: '100%', icon: <Maximize2 size={16} />, action: onZoom100 },
    { label: '缩小一级', shortcut: '-18%', icon: <Minimize2 size={16} />, action: onZoomOut },
    { label: '重置视图', shortcut: '58%', icon: <Minimize2 size={16} />, action: onResetView },
  ];

  return (
    <div className="popover zoom-popover">
      <div className="popover-head">
        <strong>缩放选项</strong>
        <button onClick={onClose}>
          <X size={15} />
        </button>
      </div>
      {options.map((item) => (
        <button
          key={item.label}
          className="menu-row"
          onClick={() => {
            item.action();
            onClose();
          }}
        >
          {item.icon}
          <span>{item.label}</span>
          <kbd>{item.shortcut}</kbd>
        </button>
      ))}
    </div>
  );
}


