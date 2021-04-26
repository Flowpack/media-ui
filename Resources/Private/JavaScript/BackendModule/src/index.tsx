import * as React from 'react';
import { createRef } from 'react';
import { render } from 'react-dom';
import Modal from 'react-modal';
import { RecoilRoot } from 'recoil';
import { DndProvider } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { ApolloClient, ApolloProvider, ApolloLink } from '@apollo/client';
import { hot, setConfig } from 'react-hot-loader';
import { createUploadLink } from 'apollo-upload-client';

import { IntlProvider, MediaUiProvider, MediaUiThemeProvider, NotifyProvider } from '@media-ui/core/src';
import { FeatureFlags } from '@media-ui/core/src/interfaces';

// GraphQL type definitions
import TYPE_DEFS_CORE from '@media-ui/core/schema.graphql';
import TYPE_DEFS_CLIPBOARD from '@media-ui/feature-clipboard/schema.graphql';
import TYPE_DEFS_ASSET_USAGE from '@media-ui/feature-asset-usage/schema.graphql';

// GraphQL local resolvers
import buildClipboardResolver from '@media-ui/feature-clipboard/src/resolvers/mutation';
import buildModuleResolver from './resolvers/mutation';

// Internal dependencies
import { ApolloErrorHandler, PersistentStateManager, CacheFactory } from './core';
import App from './components/App';
import ErrorBoundary from './components/ErrorBoundary';
import loadIconLibrary from './lib/FontAwesome';

loadIconLibrary();

setConfig({
    showReactDomPatchNotification: false,
});

window.onload = async (): Promise<void> => {
    while (!window.NeosCMS || !window.NeosCMS.I18n.initialized) {
        await new Promise((resolve) => setTimeout(resolve, 50));
    }

    const root = document.getElementById('media-ui-app');
    const { dummyImage } = root.dataset;
    const endpoints = JSON.parse(root.dataset.endpoints);
    const featureFlags: FeatureFlags = JSON.parse(root.dataset.features);

    // Modal for the lightbox
    Modal.setAppElement(root);

    // Cache for ApolloClient
    const cache = CacheFactory.createCache(featureFlags);

    // Restore state from last visit
    PersistentStateManager.restoreLocalState(cache);

    const client = new ApolloClient({
        connectToDevTools: true,
        cache,
        link: ApolloLink.from([
            ApolloErrorHandler,
            createUploadLink({
                uri: endpoints.graphql,
                credentials: 'same-origin',
            }),
        ]),
        typeDefs: [TYPE_DEFS_CORE, TYPE_DEFS_CLIPBOARD, TYPE_DEFS_ASSET_USAGE],
        resolvers: [
            buildModuleResolver(PersistentStateManager.updateLocalState),
            buildClipboardResolver(PersistentStateManager.updateLocalState),
        ],
    });

    const containerRef = createRef<HTMLDivElement>();

    const { Notification } = window.NeosCMS;

    const translate = (id, value = null, args = {}, packageKey = 'Flowpack.Media.Ui', source = 'Main') => {
        return window.NeosCMS.I18n.translate(id, value, packageKey, source, args);
    };

    const AppWithHmr = hot(module)(App);

    render(
        <IntlProvider translate={translate}>
            <NotifyProvider notificationApi={Notification}>
                <ApolloProvider client={client}>
                    <RecoilRoot>
                        <ErrorBoundary>
                            <MediaUiProvider
                                dummyImage={dummyImage}
                                containerRef={containerRef}
                                featureFlags={featureFlags}
                            >
                                <MediaUiThemeProvider>
                                    <DndProvider backend={HTML5Backend}>
                                        <AppWithHmr />
                                    </DndProvider>
                                </MediaUiThemeProvider>
                            </MediaUiProvider>
                        </ErrorBoundary>
                    </RecoilRoot>
                </ApolloProvider>
            </NotifyProvider>
        </IntlProvider>,
        root
    );
};
