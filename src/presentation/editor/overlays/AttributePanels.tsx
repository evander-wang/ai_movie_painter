import type { FlowNodeData, NodeAttributeConfig } from '@/domain/workflow/model';
import {
  AttributeActions,
  AttributeMetrics,
  AttributeSliders,
  AttributeTabs,
  ChipSection,
  StructuredList,
} from './AttributePanelPrimitives';
import { renderPreviewIcon } from './attributePanelIcons';
import {
  createAudioAttributeView,
  createConfigAttributeView,
  createGroupAttributeView,
  createImageAttributeView,
  createTextAttributeView,
  getNodeSubtitle,
} from './attributePanelPresenter';

export { getNodeSubtitle };

export function ConfigAttributePanel({ node, config }: { node: FlowNodeData; config: NodeAttributeConfig }) {
  const view = createConfigAttributeView(node, config);

  return (
    <div className="attribute-body config-attribute-body">
      <div className="config-hero">
        <div className={`config-preview ${config.kind}`} style={{ background: view.preview?.background }}>
          {renderPreviewIcon(config.kind)}
        </div>
        <div className="config-summary">
          <span>{view.category}</span>
          <p>{view.summary}</p>
        </div>
      </div>
      <AttributeTabs tabs={view.tabs} />
      <AttributeMetrics metrics={view.metrics} />
      <StructuredList dense items={view.fields} />
      <ChipSection chips={view.chips} title={view.chipsTitle} />
      <AttributeSliders sliders={view.sliders} />
      <AttributeActions actions={view.actions} />
    </div>
  );
}

export function ImageAttributePanel({ node }: { node: FlowNodeData }) {
  const view = createImageAttributeView(node);

  return (
    <div className="attribute-body">
      <div className="attribute-preview" style={{ background: view.preview?.background }}>
        <span>{view.preview?.label}</span>
      </div>
      <AttributeTabs tabs={view.tabs} />
      <AttributeMetrics metrics={view.metrics} />
      <ChipSection chips={view.chips} title={view.chipsTitle} />
      <AttributeSliders sliders={view.sliders} />
      <AttributeActions actions={view.actions} />
    </div>
  );
}

export function TextAttributePanel({ node }: { node: FlowNodeData }) {
  const view = createTextAttributeView(node);

  return (
    <div className="attribute-body">
      <AttributeTabs tabs={view.tabs} />
      <div className="prompt-editor">
        <small>{view.prompt?.label}</small>
        <p>{view.prompt?.body}</p>
      </div>
      <ChipSection chips={view.chips} title={view.chipsTitle} />
      <StructuredList items={view.fields} />
      <AttributeActions actions={view.actions} />
    </div>
  );
}

export function AudioAttributePanel() {
  const view = createAudioAttributeView();

  return (
    <div className="attribute-body">
      <div className="waveform">
        {view.waveformBars.map((height, index) => (
          <i key={index} style={{ height: `${height}px` }} />
        ))}
      </div>
      <AttributeTabs tabs={view.tabs} />
      <div className="audio-channel-list">
        {view.audioChannels?.map((channel) => (
          <div key={channel.label}>
            <span>{channel.label}</span>
            <small>{channel.state}</small>
            <b>{channel.value}%</b>
          </div>
        ))}
      </div>
      <AttributeSliders sliders={view.sliders} />
      <AttributeActions actions={view.actions} />
    </div>
  );
}

export function GroupAttributePanel({ node }: { node: FlowNodeData }) {
  const view = createGroupAttributeView(node);

  return (
    <div className="attribute-body">
      <div className="group-overview">
        {view.metrics?.map(([label, value]) => (
          <div key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
      <ChipSection chips={view.chips} title={view.chipsTitle} />
      <StructuredList items={view.fields} />
      <AttributeActions actions={view.actions} />
    </div>
  );
}
