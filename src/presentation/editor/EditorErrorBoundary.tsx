import { AlertTriangle, RotateCcw, X } from 'lucide-react';
import { Component, type ErrorInfo, type ReactNode } from 'react';

type EditorErrorBoundaryProps = {
  children: ReactNode;
  description: string;
  onRecover: () => void;
  recoverLabel: string;
  resetKey?: string | null;
  title: string;
  variant?: 'canvas' | 'overlay';
};

type EditorErrorBoundaryState = {
  error: Error | null;
};

export class EditorErrorBoundary extends Component<EditorErrorBoundaryProps, EditorErrorBoundaryState> {
  state: EditorErrorBoundaryState = {
    error: null,
  };

  static getDerivedStateFromError(error: Error): EditorErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[editor-error-boundary]', error, errorInfo);
  }

  componentDidUpdate(previousProps: EditorErrorBoundaryProps) {
    if (this.state.error && previousProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  private recover = () => {
    this.setState({ error: null });
    this.props.onRecover();
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className={`editor-error-panel ${this.props.variant ?? 'overlay'}`}>
        <div className="editor-error-icon">
          <AlertTriangle size={18} />
        </div>
        <div className="editor-error-copy">
          <strong>{this.props.title}</strong>
          <span>{this.props.description}</span>
          <small>{this.state.error.message}</small>
        </div>
        <div className="editor-error-actions">
          <button onClick={this.recover}>
            <RotateCcw size={15} />
            {this.props.recoverLabel}
          </button>
          <button aria-label="关闭错误提示" onClick={() => this.setState({ error: null })}>
            <X size={15} />
          </button>
        </div>
      </div>
    );
  }
}
