import { onError } from '@apollo/client/link/error';

const createErrorHandler = (notify: NeosNotification) => {
    const translate = (id, value = null, args = {}, packageKey = 'Flowpack.Media.Ui', source = 'Main') => {
        return window.NeosCMS.I18n.translate(id, value, packageKey, source, args);
    };

    return onError(({ graphQLErrors, networkError, operation }) => {
        const context = operation.getContext();
        const isRetrying = context.isRetrying;

        // Don't show notifications while retrying - only after max retries exhausted
        if (isRetrying) {
            console.warn('[ErrorHandler] Suppressing error notifications during retry attempts');
            return;
        }

        if (graphQLErrors) {
            graphQLErrors.map((data) => {
                const isInternalError = data.extensions?.category === 'internal';
                const defaultErrorTitle = isInternalError
                    ? translate('errors.internal.title', 'Internal server error')
                    : translate('errors.graphql.title', 'Communication error');
                let errorMessageLabel = '';
                let errorTitleLabel = '';
                if (data.extensions?.errorCode) {
                    errorTitleLabel = `errors.${data.extensions.errorCode}.title`;
                    errorMessageLabel = `errors.${data.extensions.errorCode}.message`;
                } else if (data.extensions?.debugMessage) {
                    errorMessageLabel = data.extensions.debugMessage;
                }

                console.error('[GraphQL error]:', data);

                notify.error(
                    translate(errorTitleLabel, defaultErrorTitle),
                    errorMessageLabel.length ? translate(errorMessageLabel) : data.message
                );
            });
        }

        if (networkError) {
            console.error('[Network error]:', networkError);
            notify.warning('Network error', 'Please check your connection.');
        }

        // TODO: Show error overlay and ask the user on how to continue (retry, reload, re-login)
    });
};

export default createErrorHandler;
