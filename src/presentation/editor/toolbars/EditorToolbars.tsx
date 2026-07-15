import { BadgeHelp, Sparkles, Split, UserRound, Zap } from 'lucide-react';
import { projectConfig } from '@/config/projectConfig';
import type { Panel } from '@/presentation/editor/editorTypes';
import { centerToolbarPanels, workflowRailPanels } from '@/presentation/editor/panels/panelRegistry';
import { renderPanelIcon } from '@/presentation/editor/toolbars/toolbarIcons';

export function TopNav() {
  return (
    <header className="top-nav">
      <div className="brand-block">
        <div className="brand-mark">
          <Split size={20} />
        </div>
        <button className="project-name">{projectConfig.app.displayName}</button>
      </div>
      <div className="top-actions">
        <button className="promo-button">
          <Sparkles size={15} />
          <span>会员特惠</span>
          <strong>37折</strong>
        </button>
        <button className="credit-button">
          <Zap size={15} />
          68
        </button>
        <button className="avatar-button">
          <UserRound size={18} />
        </button>
      </div>
    </header>
  );
}

export function CenterToolbar({ setPanel, activePanel }: { setPanel: (panel: Panel) => void; activePanel: Panel }) {
  return (
    <div className="center-toolbar" role="toolbar">
      {centerToolbarPanels.map((panel) => (
        <button
          key={panel.id}
          className={activePanel === panel.id ? 'active' : ''}
          title={panel.title}
          onClick={() => setPanel(activePanel === panel.id ? null : panel.id)}
        >
          {renderPanelIcon(panel.icon, panel.id === 'nodeMenu' ? 20 : 18)}
        </button>
      ))}
      <span className="tool-divider" />
      <button title="教程">
        <BadgeHelp size={18} />
      </button>
    </div>
  );
}

export function WorkflowRail({ activePanel, setPanel }: { activePanel: Panel; setPanel: (panel: Panel) => void }) {
  return (
    <div className="workflow-rail" role="toolbar" aria-label="AI 视频工作流工具">
      {workflowRailPanels.map((panel) => (
        <button
          key={panel.id}
          className={activePanel === panel.id ? 'active' : ''}
          title={panel.title}
          onClick={() => setPanel(activePanel === panel.id ? null : panel.id)}
        >
          {renderPanelIcon(panel.icon, 17)}
          <span>{panel.label}</span>
        </button>
      ))}
    </div>
  );
}
