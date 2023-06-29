import { onError } from '@apollo/client/link/error';

const createErrorHandler = (notify: NeosNotification) => {
    return onError(({ graphQLErrors, networkError }) => {
        if (graphQLErrors) {
            graphQLErrors.map((data) => {
                const isInternalError = data.extensions.code === 'INTERNAL_SERVER_ERROR';

                console.error(
                    data.extensions.code === isInternalError ? '[Internal server error]' : '[GraphQL error]',
                    data.path,
                    data
                );

                notify.error(
                    data.extensions.code === isInternalError ? 'Internal server error' : 'Communication error',
                    data.message
                );
            });
        }

        if (networkError) {
            console.error(`[Network error]: ${networkError}`);
            notify.warning('Network error', 'Please check your connection.');
        }
    });
};

export default createErrorHandler;
