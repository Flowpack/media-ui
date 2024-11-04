import { onError } from '@apollo/client/link/error';

const createErrorHandler = (notify: NeosNotification) => {
    const translate = (id, value = null, args = {}, packageKey = 'Flowpack.Media.Ui', source = 'Main') => {
        return window.NeosCMS.I18n.translate(id, value, packageKey, source, args);
    };

    return onError(({ graphQLErrors, networkError }) => {
        if (graphQLErrors) {
            graphQLErrors.map((data) => {
                const isInternalError = data.extensions.category === 'internal';
                let errorTitleLabel = isInternalError ? 'errors.internal.title' : 'errors.graphql.title';
                let errorMessageLabel = '';
                if (data.extensions.errorCode) {
                    errorTitleLabel = `errors.${data.extensions.errorCode}.title`;
                    errorMessageLabel = `errors.${data.extensions.errorCode}.message`;
                }

                notify.error(
                    translate(errorTitleLabel),
                    errorMessageLabel.length ? translate(errorMessageLabel) : data.message
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
