import React from 'react';

import { NotifyContext } from '@media-ui/core/src/provider/Notify';

class ErrorBoundary extends React.Component<
    { children: React.ReactElement | React.ReactElement[] },
    { hasError: boolean; error: Error | null }
> {
    static contextType = NotifyContext;

    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error) {
        this.setState({ error });
        this.context.error(error.name, error.message);
    }

    reload() {
        window.location.reload();
    }

    clearConfigAndReload = () => {
        // TODO: Only clear media ui specific entries from localstorage
        localStorage.clear();
        this.reload();
    };

    render() {
        const { hasError, error } = this.state;
        if (hasError) {
            return (
                <div>
                    <p style={{ color: 'red' }}>The media application encountered an unexpected error:</p>
                    <br />
                    {error && <pre>{error.message}</pre>}
                    <br />
                    <button className="neos-button" onClick={this.reload}>
                        Reload
                    </button>
                    {' or '}
                    <button className="neos-button" onClick={this.clearConfigAndReload}>
                        Clear configuration &amp; reload
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
