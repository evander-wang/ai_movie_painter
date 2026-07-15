import { renderActionIcon } from './attributePanelIcons';
import type {
  AttributeAction,
  AttributeChip,
  AttributeSlider as AttributeSliderModel,
} from './attributePanelPresenter';

export function AttributeTabs({ tabs = [] }: { tabs?: string[] }) {
  return (
    <div className="attribute-tabs">
      {tabs.map((tab, index) => (
        <button key={tab} className={index === 0 ? 'active' : ''}>
          {tab}
        </button>
      ))}
    </div>
  );
}

export function AttributeMetrics({ metrics = [] }: { metrics?: Array<[string, string]> }) {
  return (
    <div className="attribute-metrics">
      {metrics.map(([label, value]) => (
        <div key={label}>
          <strong>{value}</strong>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}

export function ChipSection({ chips = [], title }: { chips?: AttributeChip[]; title?: string }) {
  return (
    <div className="attribute-section">
      <div className="attribute-section-title">{title}</div>
      <div className="chip-grid">
        {chips.map((item) => (
          <button key={item.label} className={item.active ? 'active' : ''}>
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function StructuredList({
  dense = false,
  items = [],
}: {
  dense?: boolean;
  items?: Array<[string, string]>;
}) {
  return (
    <div className={`structured-list${dense ? ' dense' : ''}`}>
      {items.map(([label, value]) => (
        <div key={label}>
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
      ))}
    </div>
  );
}

export function AttributeSliders({ sliders = [] }: { sliders?: AttributeSliderModel[] }) {
  return sliders.map((slider) => <AttributeSlider key={slider.label} {...slider} />);
}

export function AttributeActions({ actions }: { actions: AttributeAction[] }) {
  return (
    <div className="attribute-actions">
      {actions.map((action) => (
        <button key={action.label}>
          {renderActionIcon(action.icon)}
          {action.label}
        </button>
      ))}
    </div>
  );
}

function AttributeSlider({ label, value }: AttributeSliderModel) {
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
