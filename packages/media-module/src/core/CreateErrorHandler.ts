import { onError } from '@apollo/client/link/error';
import { setErrorStateExternal } from '@media-ui/core/src/state/errorState';
import { setErrorRiderectUrlStateExternal } from '@media-ui/core/src/state/errorRedirectUrlState';
import { setErrorTitleStateExternal } from '@media-ui/core/src/state/errorTitleState';
import { setErrorMessageStateExternal } from '@media-ui/core/src/state/errorMessageState';

const createErrorHandler = (notify: NeosNotification) => {
    const translate = (id, value = null, args = {}, packageKey = 'Flowpack.Media.Ui', source = 'Main') => {
        return window.NeosCMS.I18n.translate(id, value, packageKey, source, args);
    };

    return onError(({ graphQLErrors, networkError, operation }) => {
        const context = operation.getContext();
        const isRetrying = context.isRetrying;
        let errorTitle = '';
        let errorMessage = '';

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

                errorTitle = translate(errorTitleLabel, defaultErrorTitle);
                errorMessage = errorMessageLabel.length ? translate(errorMessageLabel) : data.message;

                if (data.extensions?.statusCode === 401) {
                    if (data.extensions?.redirectUrl) {
                        setErrorRiderectUrlStateExternal(data.extensions.redirectUrl);
                    }
                    errorTitle = translate('errorOverlay.header', 'Login required');
                    errorMessage = translate('errorOverlay.text', 'This media source requires you to be logged in.');
                }
            });
        }

        if (networkError) {
            console.error('[Network error]:', networkError);
            errorTitle = translate('errors.network.title', 'Network error');
            errorMessage = translate('errors.network.message', 'Please check your connection.');
        }

        setErrorTitleStateExternal(errorTitle);
        setErrorMessageStateExternal(errorMessage);
        setErrorStateExternal(true);
    });
};

export default createErrorHandler;
