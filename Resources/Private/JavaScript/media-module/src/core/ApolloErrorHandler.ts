import { onError } from '@apollo/client/link/error';

// TODO: Use NotificationHandler to show simplified error message to user
const ApolloErrorHandler = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
        graphQLErrors.map((data) =>
            console.error(
                data.extensions.category === 'internal' ? '[Internal server error]' : '[GraphQL error]',
                data.path,
                data
            )
        );
    }

    if (networkError) console.error(`[Network error]: ${networkError}`);
});

export default ApolloErrorHandler;
