import { onError } from 'apollo-link-error';

// TODO: Use NotificationHandler to show simplified error message to user
const ApolloErrorHandler = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
        graphQLErrors.map(({ message, locations, path }) =>
            console.error(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`)
        );
    }

    if (networkError) console.error(`[Network error]: ${networkError}`);
});

export default ApolloErrorHandler;
