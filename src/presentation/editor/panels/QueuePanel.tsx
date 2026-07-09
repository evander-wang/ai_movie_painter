import { AlertTriangle, CheckCircle2, RefreshCcw, Timer, X } from 'lucide-react';

export function QueuePanel({ onClose }: { onClose: () => void }) {
  const tasks = [
    ['视频节点 5 - 副本', 'running', 72, 'Seedance 2.0 · 108'],
    ['纸鸢展开镜头', 'running', 38, 'Kling 3.0 · 142'],
    ['布老虎近景增强', 'queue', 0, '等待 2 个任务'],
    ['泥塑钟馗解析', 'done', 100, '已生成 4s'],
    ['首尾帧转场', 'failed', 64, '参考图缺失'],
  ] as const;

  return (
    <aside className="workflow-panel queue-panel">
      <div className="drawer-head">
        <div>
          <span>生成任务队列</span>
          <small>运行中 2 · 排队 4 · 失败 1 · 预计 03:18</small>
        </div>
        <button onClick={onClose}>
          <X size={18} />
        </button>
      </div>
      <div className="queue-summary">
        {[
          ['运行中', '2'],
          ['排队', '4'],
          ['失败', '1'],
          ['本轮消耗', '648'],
        ].map(([label, value]) => (
          <div key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
      <div className="queue-list">
        {tasks.map(([title, status, progress, meta]) => (
          <article key={title} className={`queue-row ${status}`}>
            <div className="queue-icon">
              {status === 'done' ? <CheckCircle2 size={17} /> : status === 'failed' ? <AlertTriangle size={17} /> : <Timer size={17} />}
            </div>
            <div className="queue-main">
              <div>
                <strong>{title}</strong>
                <small>{meta}</small>
              </div>
              <div className="queue-progress">
                <i style={{ width: `${progress}%` }} />
              </div>
            </div>
            <button title={status === 'failed' ? '重试' : '刷新'}>
              <RefreshCcw size={15} />
            </button>
          </article>
        ))}
      </div>
    </aside>
  );
}


