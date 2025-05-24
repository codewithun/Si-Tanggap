import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    render(): ReactNode {
        if (this.state.hasError) {
            // You can customize this fallback UI
            return (
                this.props.fallback || (
                    <div className="rounded-md border border-red-300 bg-red-50 p-4">
                        <h3 className="text-lg font-semibold text-red-800">Terjadi kesalahan</h3>
                        <p className="text-sm text-red-600">Komponen tidak dapat ditampilkan. Silakan coba muat ulang halaman.</p>
                        <button
                            onClick={() => this.setState({ hasError: false })}
                            className="mt-2 rounded-md bg-red-100 px-3 py-1 text-sm text-red-800 hover:bg-red-200"
                        >
                            Coba Lagi
                        </button>
                    </div>
                )
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
