import { X } from 'lucide-react';

export function SelectedExpandModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="modal-backdrop">
      <section className="selected-expand-modal">
        <div className="modal-head">
          <div>
            <span>视频节点 5 - 副本</span>
            <p>全能参考 · 16:9 · 720P · 4s</p>
          </div>
          <button onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="expand-layout">
          <div className="expand-video">
            <div className="play-chip">00:00</div>
            <div className="duration-chip">00:06</div>
          </div>
          <div className="expand-data">
            <h3>节点参数</h3>
            <dl>
              <dt>模型</dt>
              <dd>Seedance 2.0</dd>
              <dt>比例</dt>
              <dd>16:9</dd>
              <dt>清晰度</dt>
              <dd>720P</dd>
              <dt>时长</dt>
              <dd>4s</dd>
              <dt>参考数量</dt>
              <dd>6 张图片参考</dd>
              <dt>消耗</dt>
              <dd>108 积分</dd>
            </dl>
          </div>
        </div>
      </section>
    </div>
  );
}


