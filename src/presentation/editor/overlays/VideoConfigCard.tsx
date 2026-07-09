import { ChevronDown, Clapperboard, Expand, GitBranch, ImageIcon, ListPlus, Play, Plus, Search, Share2, ShieldCheck, SlidersHorizontal, Sparkles, Square, Upload, Volume2 } from 'lucide-react';
import type { FlowNodeData, NodeAttributeConfig } from '@/domain/workflow/model';

export function VideoConfigCard({
  node,
  config,
  openExpand,
}: {
  node: FlowNodeData;
  config: NodeAttributeConfig;
  openExpand: () => void;
}) {
  const references = [
    'linear-gradient(135deg,#f8f8f4,#bfc4c5 50%,#f8f8f4)',
    'linear-gradient(135deg,#e9d8bd,#4b7a9a 48%,#f0d295)',
    'radial-gradient(circle at 42% 36%,#b77957,#321915 48%,#c1a67b)',
    'linear-gradient(135deg,#d8c6a5,#8b4b32 45%,#222)',
    'linear-gradient(135deg,#a66538,#f0b36a 52%,#221b17)',
    'linear-gradient(135deg,#8d5d3c,#d7b373 48%,#2d241e)',
  ];

  return (
    <section className="video-config-card">
      <button className="card-expand" onClick={openExpand} aria-label="展开参数卡">
        <Expand size={15} />
      </button>
      <div className="mode-tabs">
        {config.tabs.slice(0, 5).map((tab, index) => (
          <button key={tab} className={index === 1 ? 'active' : ''}>
            {tab}
          </button>
        ))}
      </div>
      <div className="quick-actions">
        {[
          ['标记', Search],
          ['特效', ImageIcon],
          ['角色库', ShieldCheck],
          ['参考', Plus],
        ].map(([label, Icon]) => (
          <button key={label as string}>
            <Icon size={15} />
            <span>{label as string}</span>
          </button>
        ))}
        <div className="reference-strip">
          {references.map((bg, index) => (
            <button key={index} style={{ background: bg }}>
              <span>{index + 1}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="prompt-scroll">
        <p>## {node.title} · {config.category}</p>
        <p>{config.summary}</p>
        <p>{config.fields.map(([label, value]) => `${label}：${value}`).join('；')}</p>
      </div>
      <div className="video-attribute-compact">
        <div className="video-metrics-row">
          {config.metrics.map(([label, value]) => (
            <span key={label}>
              <strong>{value}</strong>
              <small>{label}</small>
            </span>
          ))}
        </div>
        <div className="video-chip-row">
          {config.chips.slice(0, 4).map((chip, index) => (
            <button key={chip} className={config.activeChips.includes(index) ? 'active' : ''}>{chip}</button>
          ))}
        </div>
        <div className="video-action-row">
          {config.actions.map((action, index) => (
            <button key={action}>
              {index === 0 ? <Play size={14} /> : index === 1 ? <Sparkles size={14} /> : <GitBranch size={14} />}
              {action}
            </button>
          ))}
        </div>
      </div>
      <div className="config-footer">
        <button><SlidersHorizontal size={15} />{config.metrics[0]?.[1]} <span className="tiny-gold">◆</span></button>
        <button><Square size={15} />{config.fields[1]?.[1] ?? '16:9 · 720P · 4s'}</button>
        <button><Volume2 size={15} /></button>
        <button><Clapperboard size={15} />运镜</button>
        <button><ListPlus size={15} /></button>
        <button><Share2 size={15} /></button>
        <button>1个<ChevronDown size={13} /></button>
        <button className="cost">✦ {config.metrics.find(([label]) => label === '消耗')?.[1] ?? '108'}</button>
        <button className="submit-arrow"><Upload size={18} /></button>
      </div>
    </section>
  );
}


