import { ApolloLink, FetchResult, Observable, Operation } from '@apollo/client';
import { ServerError } from '@apollo/client/link/utils';

const maxRetries = 2;
const initialDelay = 300;

const isRetryableError = (statusCode: number | undefined): boolean => {
    if (!statusCode) return false;
    // Retry on 401 (auth errors) or 5xx (server errors)
    return statusCode === 401 || (statusCode >= 500 && statusCode < 600);
};

/**
 * Custom retry link that handles GraphQL errors with statusCode in extensions.
 * Unlike the standard RetryLink, this can retry based on GraphQL error status codes,
 * not just HTTP status codes (which are always 200 for GraphQL).
 *
 * Retries on:
 * - 401 (Authentication errors - might be temporary token refresh issues)
 * - 5xx (Server errors)
 */
const createRetryHandler = () => {
    return new ApolloLink((operation: Operation, forward) => {
        return new Observable((observer) => {
            let retryCount = 0;

            // Set retry flag from the start to suppress error notifications until we're done retrying
            operation.setContext({
                isRetrying: true,
            });

            const attemptRequest = () => {
                // Clear retry flag if this is the last attempt
                if (retryCount >= maxRetries) {
                    operation.setContext({
                        isRetrying: false,
                    });
                }

                const subscription = forward(operation).subscribe({
                    next: (result: FetchResult) => {
                        // Check if there are GraphQL errors with retryable status codes
                        const retryableError = result.errors?.find((error) =>
                            isRetryableError(error.extensions?.statusCode as number)
                        );

                        if (retryableError && retryCount < maxRetries) {
                            retryCount++;

                            // Will retry - set context flag to suppress error notifications
                            operation.setContext({
                                isRetrying: true,
                                retryAttempt: retryCount,
                            });

                            const delay = initialDelay * Math.pow(2, retryCount - 1);
                            const jitter = Math.random() * 100;

                            // Retry after delay - DON'T pass result to observer yet
                            setTimeout(() => {
                                subscription.unsubscribe();
                                attemptRequest();
                            }, delay + jitter);
                        } else {
                            // Max retries reached or no retryable error - pass result through
                            observer.next(result);
                            observer.complete();
                        }
                    },
                    error: (error: ServerError) => {
                        // Handle network errors
                        if (isRetryableError(error.statusCode) && retryCount < maxRetries) {
                            retryCount++;
                            const delay = initialDelay * Math.pow(2, retryCount - 1);
                            const jitter = Math.random() * 100;

                            setTimeout(attemptRequest, delay + jitter);
                        } else {
                            // Max retries reached or non-retryable error
                            observer.error(error);
                        }
                    },
                    complete: () => {
                        // This shouldn't happen with next() being called, but handle it
                        observer.complete();
                    },
                });
            };

            attemptRequest();
        });
    });
};

export default createRetryHandler;
