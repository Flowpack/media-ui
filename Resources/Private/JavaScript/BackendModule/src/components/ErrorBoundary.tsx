import React from 'react';

import { NotifyContext } from '@media-ui/core/src/provider/Notify';

class ErrorBoundary extends React.Component<
    { children: React.ReactElement | React.ReactElement[] },
    { hasError: boolean }
> {
    static contextType = NotifyContext;

    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error) {
        this.context.error(error.name, error.message);
    }

    render() {
        if (this.state.hasError) {
            return (
                <>
                    <p style={{ color: 'red' }}>Something went wrong.</p>
                    <br />
                    <button className="neos-button" onClick={() => window.location.reload()}>
                        Reload
                    </button>
                </>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
