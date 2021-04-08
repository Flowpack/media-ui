import React from 'react';

class ErrorBoundary extends React.Component<
    { children: React.ReactElement | React.ReactElement[] },
    { hasError: boolean }
> {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error(error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return <p style={{ color: 'red' }}>Something went wrong.</p>;
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
