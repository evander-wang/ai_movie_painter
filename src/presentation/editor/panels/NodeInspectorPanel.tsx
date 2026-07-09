import { Cpu, Gauge, MessageSquareText, ShieldCheck, X } from 'lucide-react';

export function NodeInspectorPanel({ onClose }: { onClose: () => void }) {
  const sliders = [
    ['运动强度', 68, '更明显的推拉摇移'],
    ['风格强度', 42, '保留写实质感'],
    ['角色一致性', 86, '锁定服装与体态'],
    ['镜头稳定', 73, '减少主体漂移'],
  ] as const;

  return (
    <aside className="workflow-panel inspector-panel">
      <div className="drawer-head">
        <div>
          <span>节点详情参数</span>
          <small>视频节点 5 - 副本 · 全能参考</small>
        </div>
        <button onClick={onClose}>
          <X size={18} />
        </button>
      </div>
      <div className="workflow-body">
        <section className="parameter-section">
          <div className="section-title">
            <Cpu size={16} />
            <span>生成模型</span>
          </div>
          <div className="segmented-grid">
            {['Seedance 2.0', 'Kling 3.0', 'Runway Gen-4', 'Veo 3'].map((item, index) => (
              <button key={item} className={index === 0 ? 'active' : ''}>{item}</button>
            ))}
          </div>
        </section>

        <section className="parameter-section compact-parameter-grid">
          <label>
            <span>画幅</span>
            <div className="mini-segment">
              {['16:9', '9:16', '1:1'].map((item, index) => (
                <button key={item} className={index === 0 ? 'active' : ''}>{item}</button>
              ))}
            </div>
          </label>
          <label>
            <span>清晰度</span>
            <div className="mini-segment">
              {['720P', '1080P', '2K'].map((item, index) => (
                <button key={item} className={index === 1 ? 'active' : ''}>{item}</button>
              ))}
            </div>
          </label>
          <label>
            <span>时长</span>
            <div className="mini-segment">
              {['4s', '8s', '12s'].map((item, index) => (
                <button key={item} className={index === 0 ? 'active' : ''}>{item}</button>
              ))}
            </div>
          </label>
          <label>
            <span>采样</span>
            <div className="mini-segment">
              {['标准', '精细'].map((item, index) => (
                <button key={item} className={index === 1 ? 'active' : ''}>{item}</button>
              ))}
            </div>
          </label>
        </section>

        <section className="parameter-section">
          <div className="section-title">
            <Gauge size={16} />
            <span>控制强度</span>
          </div>
          <div className="slider-stack">
            {sliders.map(([label, value, hint]) => (
              <div className="slider-row" key={label}>
                <div>
                  <strong>{label}</strong>
                  <small>{hint}</small>
                </div>
                <span>{value}</span>
                <div className="fake-slider">
                  <i style={{ width: `${value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="parameter-section">
          <div className="section-title">
            <ShieldCheck size={16} />
            <span>一致性锁定</span>
          </div>
          <div className="lock-list">
            {['角色锁定', '场景锁定', '服装道具锁定'].map((item, index) => (
              <button key={item} className={index !== 1 ? 'active' : ''}>
                <span>{item}</span>
                <i />
              </button>
            ))}
          </div>
        </section>

        <section className="parameter-section">
          <div className="section-title">
            <MessageSquareText size={16} />
            <span>负向约束</span>
          </div>
          <div className="negative-prompt">
            正脸、五官特写、字幕、水印、手指畸形、背景穿帮、角色服装漂移、过度锐化
          </div>
        </section>
      </div>
    </aside>
  );
}

