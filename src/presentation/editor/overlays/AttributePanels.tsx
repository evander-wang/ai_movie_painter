import { Archive, Captions, Download, Film, GitBranch, Grid3X3, ImageIcon, Layers3, MessageSquareText, Play, Scissors, Settings2, ShieldCheck, Sparkles, Video, Volume2 } from 'lucide-react';
import { nodeCatalog } from '@/domain/workflow/nodeCatalog';
import { makeNodePreview } from '@/domain/workflow/nodeFactory';
import type { FlowNodeData, NodeAttributeConfig } from '@/domain/workflow/model';

export function getNodeSubtitle(node: FlowNodeData) {
  if (node.nodeType) return `${nodeCatalog[node.nodeType].category} · ${nodeCatalog[node.nodeType].summary}`;
  if (node.kind === 'image') return `${node.size ?? '参考图'} · 可作为角色/场景/风格约束`;
  if (node.kind === 'text') return `${node.size ?? 'Prompt'} · 可连接到多个生成节点`;
  if (node.kind === 'audio') return `${node.size ?? '音频'} · 人声/音乐/环境声处理`;
  if (node.kind === 'group') return `${node.count ?? 0} 个节点 · 批量管理与一致性约束`;
  if (node.kind === 'tool') return `${node.size ?? '工具'} · 工作流处理节点`;
  return `${node.size ?? '视频'} · 生成结果`;
}

export function ConfigAttributePanel({ node, config }: { node: FlowNodeData; config: NodeAttributeConfig }) {
  return (
    <div className="attribute-body config-attribute-body">
      <div className="config-hero">
        <div className={`config-preview ${config.kind}`} style={{ background: node.preview ?? makeNodePreview(config) }}>
          {config.kind === 'video' && <Film size={28} />}
          {config.kind === 'image' && <ImageIcon size={28} />}
          {config.kind === 'text' && <MessageSquareText size={28} />}
          {config.kind === 'audio' && <Volume2 size={28} />}
          {config.kind === 'tool' && <Settings2 size={28} />}
        </div>
        <div className="config-summary">
          <span>{config.category}</span>
          <p>{config.summary}</p>
        </div>
      </div>
      <div className="attribute-tabs">
        {config.tabs.map((tab, index) => (
          <button key={tab} className={index === 0 ? 'active' : ''}>{tab}</button>
        ))}
      </div>
      <div className="attribute-metrics">
        {config.metrics.map(([label, value]) => (
          <div key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
      <div className="structured-list dense">
        {config.fields.map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <div className="attribute-section">
        <div className="attribute-section-title">能力开关</div>
        <div className="chip-grid">
          {config.chips.map((item, index) => (
            <button key={item} className={config.activeChips.includes(index) ? 'active' : ''}>{item}</button>
          ))}
        </div>
      </div>
      {config.sliders.map(([label, value]) => (
        <AttributeSlider key={label} label={label} value={value} />
      ))}
      <div className="attribute-actions">
        {config.actions.map((action, index) => (
          <button key={action}>
            {index === 0 ? <Play size={15} /> : index === 1 ? <Sparkles size={15} /> : <GitBranch size={15} />}
            {action}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ImageAttributePanel({ node }: { node: FlowNodeData }) {
  return (
    <div className="attribute-body">
      <div className="attribute-preview" style={{ background: node.preview }}>
        <span>参考图</span>
      </div>
      <div className="attribute-tabs">
        {['参考设置', '裁剪', '用途', '版本'].map((tab, index) => (
          <button key={tab} className={index === 0 ? 'active' : ''}>{tab}</button>
        ))}
      </div>
      <div className="attribute-metrics">
        {[
          ['权重', '78'],
          ['绑定节点', '3'],
          ['相似度', '高'],
          ['版本', 'v4'],
        ].map(([label, value]) => (
          <div key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
      <div className="attribute-section">
        <div className="attribute-section-title">参考用途</div>
        <div className="chip-grid">
          {['角色外观', '服装道具', '场景光线', '构图比例'].map((item, index) => (
            <button key={item} className={index < 2 ? 'active' : ''}>{item}</button>
          ))}
        </div>
      </div>
      <AttributeSlider label="角色一致性" value={86} />
      <AttributeSlider label="风格迁移强度" value={52} />
      <div className="attribute-actions">
        <button><ShieldCheck size={15} />设为角色参考</button>
        <button><Video size={15} />生成视频</button>
        <button><Scissors size={15} />抠像裁剪</button>
      </div>
    </div>
  );
}

export function TextAttributePanel({ node }: { node: FlowNodeData }) {
  return (
    <div className="attribute-body">
      <div className="attribute-tabs">
        {['Prompt', '结构化', '负向词', '下游'].map((tab, index) => (
          <button key={tab} className={index === 0 ? 'active' : ''}>{tab}</button>
        ))}
      </div>
      <div className="prompt-editor">
        <small>镜头描述</small>
        <p>{node.body}</p>
      </div>
      <div className="attribute-section">
        <div className="attribute-section-title">Prompt 类型</div>
        <div className="chip-grid">
          {['全局约束', '分镜描述', '镜头语言', '负向约束'].map((item, index) => (
            <button key={item} className={index === 1 ? 'active' : ''}>{item}</button>
          ))}
        </div>
      </div>
      <div className="structured-list">
        {[
          ['景别', '中近景 / 局部特写'],
          ['运镜', '极缓推进，轻微右移'],
          ['主体', '爷爷与孙子肩以下、手部、背影'],
          ['禁用', '正脸、五官特写、背景音乐'],
        ].map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <div className="attribute-actions">
        <button><Layers3 size={15} />拆成分镜</button>
        <button><GitBranch size={15} />应用到下游</button>
        <button><Sparkles size={15} />优化提示词</button>
      </div>
    </div>
  );
}

export function AudioAttributePanel() {
  return (
    <div className="attribute-body">
      <div className="waveform">
        {Array.from({ length: 34 }).map((_, index) => (
          <i key={index} style={{ height: `${18 + ((index * 17) % 34)}px` }} />
        ))}
      </div>
      <div className="attribute-tabs">
        {['分离', '音量', '降噪', '导出'].map((tab, index) => (
          <button key={tab} className={index === 0 ? 'active' : ''}>{tab}</button>
        ))}
      </div>
      <div className="audio-channel-list">
        {[
          ['人声', '已分离', 82],
          ['环境声', '可增强', 48],
          ['背景音乐', '静音约束', 0],
        ].map(([label, state, value]) => (
          <div key={label as string}>
            <span>{label as string}</span>
            <small>{state as string}</small>
            <b>{value}%</b>
          </div>
        ))}
      </div>
      <AttributeSlider label="降噪强度" value={64} />
      <AttributeSlider label="环境声保留" value={35} />
      <div className="attribute-actions">
        <button><Volume2 size={15} />重新分离</button>
        <button><Download size={15} />导出 WAV</button>
        <button><Captions size={15} />生成字幕</button>
      </div>
    </div>
  );
}

export function GroupAttributePanel({ node }: { node: FlowNodeData }) {
  return (
    <div className="attribute-body">
      <div className="group-overview">
        <div>
          <strong>{node.count ?? 0}</strong>
          <span>节点</span>
        </div>
        <div>
          <strong>5</strong>
          <span>视频</span>
        </div>
        <div>
          <strong>2</strong>
          <span>参考</span>
        </div>
        <div>
          <strong>1</strong>
          <span>约束</span>
        </div>
      </div>
      <div className="attribute-section">
        <div className="attribute-section-title">批量策略</div>
        <div className="chip-grid">
          {['统一模型', '锁定角色', '继承负向词', '自动排版'].map((item, index) => (
            <button key={item} className={index !== 0 ? 'active' : ''}>{item}</button>
          ))}
        </div>
      </div>
      <div className="structured-list">
        {[
          ['默认模型', 'Seedance 2.0'],
          ['输出比例', '16:9 · 720P'],
          ['命名规则', '分组名 + 镜头序号'],
          ['失败策略', '自动重试 1 次'],
        ].map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <div className="attribute-actions">
        <button><Grid3X3 size={15} />整理分组</button>
        <button><Play size={15} />批量生成</button>
        <button><Archive size={15} />加入资产</button>
      </div>
    </div>
  );
}

function AttributeSlider({ label, value }: { label: string; value: number }) {
  return (
    <div className="attribute-slider">
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <i>
        <b style={{ width: `${value}%` }} />
      </i>
    </div>
  );
}


