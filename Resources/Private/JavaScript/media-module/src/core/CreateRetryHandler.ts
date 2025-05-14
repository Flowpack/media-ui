import { RetryLink } from '@apollo/client/link/retry';

const createRetryHandler = () => {
    return new RetryLink({
        delay: {
            initial: 300,
            max: Infinity,
            jitter: true
        },
        attempts: {
            max: 2,
            retryIf: (error, _operation) => {
                if (error && error.statusCode < 500 || error.statusCode >= 600) {
                    console.warn('Retrying request due to error:', [
                        error.name,
                        error.statusCode,
                    ]);
                }
                return false;
            }
        }
    });
};

export default createRetryHandler;
