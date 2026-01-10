import React from "react";
import "../skeletons.css";

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in child component tree
 * Prevents FOUC by showing graceful error UI instead of blank screen
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Error caught by boundary:", error, errorInfo);

        this.setState({
            error,
            errorInfo
        });
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div
                    style={{
                        minHeight: "100vh",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "var(--bg-main)",
                        color: "var(--text-primary)",
                        padding: "2rem"
                    }}
                >
                    <div
                        style={{
                            maxWidth: "600px",
                            textAlign: "center",
                            backgroundColor: "var(--bg-card)",
                            padding: "3rem",
                            borderRadius: "16px",
                            border: "1px solid var(--border-color)"
                        }}
                    >
                        <h1
                            style={{
                                fontSize: "1.5rem",
                                marginBottom: "1rem",
                                color: "var(--text-primary)"
                            }}
                        >
                            Oops! Something went wrong
                        </h1>

                        <p
                            style={{
                                color: "var(--text-secondary)",
                                marginBottom: "2rem",
                                lineHeight: "1.6"
                            }}
                        >
                            We encountered an unexpected error. Don't worry, your data is safe. Try
                            refreshing the page or go back to continue.
                        </p>

                        <div
                            style={{
                                display: "flex",
                                gap: "1rem",
                                justifyContent: "center",
                                flexWrap: "wrap"
                            }}
                        >
                            <button
                                onClick={this.handleReset}
                                style={{
                                    padding: "0.75rem 1.5rem",
                                    backgroundColor: "var(--accent)",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    fontSize: "1rem",
                                    fontWeight: "600"
                                }}
                            >
                                Try Again
                            </button>

                            <button
                                onClick={() => (window.location.href = "/")}
                                style={{
                                    padding: "0.75rem 1.5rem",
                                    backgroundColor: "var(--bg-secondary)",
                                    color: "var(--text-primary)",
                                    border: "1px solid var(--border-color)",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    fontSize: "1rem",
                                    fontWeight: "600"
                                }}
                            >
                                Go Home
                            </button>
                        </div>

                        {process.env.NODE_ENV === "development" && this.state.error && (
                            <details
                                style={{
                                    marginTop: "2rem",
                                    textAlign: "left",
                                    backgroundColor: "var(--bg-main)",
                                    padding: "1rem",
                                    borderRadius: "8px",
                                    fontSize: "0.875rem",
                                    color: "var(--text-secondary)"
                                }}
                            >
                                <summary style={{ cursor: "pointer", fontWeight: "600" }}>
                                    Error Details (Development Only)
                                </summary>
                                <pre
                                    style={{
                                        marginTop: "1rem",
                                        overflow: "auto",
                                        whiteSpace: "pre-wrap"
                                    }}
                                >
                                    {this.state.error.toString()}
                                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
