import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#050507] text-white p-6">
          <div className="max-w-md w-full border border-[#333] rounded-none p-8 bg-[#0c0c0e]">
            <h1 className="text-2xl font-black uppercase tracking-tighter text-emerald-500 mb-3">
              Something went wrong
            </h1>
            <p className="text-sm font-mono text-[#888] mb-6">
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <button
              onClick={this.handleReload}
              className="w-full py-3 bg-emerald-500 text-black rounded-none font-bold uppercase tracking-widest text-xs hover:bg-emerald-400 transition-all"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
