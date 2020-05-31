import * as React from 'react';
import { createRef } from 'react';
import { connect } from 'react-redux';
import { ApolloProvider } from '@apollo/react-hooks';
import { InMemoryCache } from 'apollo-cache-inmemory';
import ApolloClient from 'apollo-boost';

// Neos dependencies are provided by the UI
// @ts-ignore
import { neos } from '@neos-project/neos-ui-decorators';
// @ts-ignore
import { actions } from '@neos-project/neos-ui-redux-store';

// Media UI dependencies
import { I18nRegistry, Notify } from '../../src/interfaces';
import {
    IntlProvider,
    MediaUiProvider,
    MediaUiThemeProvider,
    NotifyProvider,
    Resolvers,
    PersistentStateManager
} from '../../src/core';
import App from '../../src/components/App';

let apolloClient = null;

interface MediaSelectionScreenProps {
    i18nRegistry: I18nRegistry;
    handleAssetSelected: Function;
    neos: object;
    type: 'assets' | 'images';
    onComplete: (localAssetIdentifier: string) => void;
    flashMessages: {
        add: (title: string, message: string, severity?: string, timeout?: number) => void;
    };
}

@connect(() => ({}), {
    flashMessages: actions.UI.FlashMessages
})
@neos(globalRegistry => ({
    i18nRegistry: globalRegistry.get('i18n')
}))
export default class MediaSelectionScreen extends React.PureComponent<MediaSelectionScreenProps> {
    constructor(props: MediaSelectionScreenProps) {
        super(props);
        this.state = {};
    }

    getConfig() {
        return {
            endpoints: {
                // TODO: Generate uri from Neos maybe like $get('routes.core.modules.mediaBrowser', neos);
                graphql: '/neos/graphql/media-assets'
            },
            // TODO: Generate image uri from Neos
            dummyImage: '/_Resources/Static/Packages/Neos.Neos/Images/dummy-image.svg'
        };
    }

    getApolloClient() {
        if (!apolloClient) {
            const { endpoints } = this.getConfig();
            const cache = new InMemoryCache();
            PersistentStateManager.restoreLocalState(cache);

            apolloClient = new ApolloClient({
                cache,
                uri: endpoints.graphql,
                credentials: 'same-origin',
                typeDefs: Resolvers.typeDefs,
                resolvers: Resolvers.resolvers
            });
        }
        return apolloClient;
    }

    translate = (
        id?: string,
        fallback?: string,
        params?: {},
        packageKey = 'Flowpack.Media.Ui',
        sourceName = 'Main'
    ) => {
        return this.props.i18nRegistry.translate(id, fallback, packageKey, sourceName);
    };

    render() {
        const { flashMessages, onComplete } = this.props;
        const client = this.getApolloClient();
        const { dummyImage } = this.getConfig();
        const containerRef = createRef();

        const Notification: Notify = {
            info: title => flashMessages.add(title, '', 'error'),
            ok: title => flashMessages.add(title, '', 'error'),
            notice: title => flashMessages.add(title, '', 'error'),
            warning: (title, message = '') => flashMessages.add(title, message, 'error'),
            error: (title, message = '') => flashMessages.add(title, message, 'error')
        };

        return (
            <div style={{ transform: 'translateZ(0)', height: '100%', padding: '1rem' }}>
                <IntlProvider translate={this.translate}>
                    <NotifyProvider notificationApi={Notification}>
                        <ApolloProvider client={client}>
                            <MediaUiProvider
                                dummyImage={dummyImage}
                                onAssetSelection={localAssetIdentifier => onComplete(localAssetIdentifier)}
                                selectionMode={true}
                                containerRef={containerRef}
                            >
                                <MediaUiThemeProvider>
                                    <App />
                                </MediaUiThemeProvider>
                            </MediaUiProvider>
                        </ApolloProvider>
                    </NotifyProvider>
                </IntlProvider>
            </div>
        );
    }
}
