import React, { createRef } from 'react';
import { render } from 'react-dom';
import Modal from 'react-modal';
import { RecoilRoot } from 'recoil';
import { DndProvider } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { ApolloClient, ApolloLink, ApolloProvider } from '@apollo/client';
import { createUploadLink } from 'apollo-upload-client';

import { InteractionProvider, IntlProvider, MediaUiProvider, NotifyProvider } from '@media-ui/core';

// GraphQL type definitions
import { typeDefs as TYPE_DEFS_CORE } from '@media-ui/core';
import { typeDefs as TYPE_DEFS_ASSET_USAGE } from '@media-ui/feature-asset-usage';

// Internal dependencies
import { createErrorHandler, CacheFactory } from './core';
import App from './components/App';
import ErrorBoundary from './components/ErrorBoundary';
import loadIconLibrary from './lib/FontAwesome';

loadIconLibrary();

window.onload = async (): Promise<void> => {
    while (!window.NeosCMS?.I18n?.initialized) {
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

    const containerRef = createRef<HTMLDivElement>();

    const { Notification } = window.NeosCMS;

    const translate = (id, value = null, args = {}, packageKey = 'Flowpack.Media.Ui', source = 'Main') => {
        return window.NeosCMS.I18n.translate(id, value, packageKey, source, args);
    };

    const client = new ApolloClient({
        connectToDevTools: true,
        cache,
        link: ApolloLink.from([
            createErrorHandler(Notification),
            createUploadLink({
                uri: endpoints.graphql,
                credentials: 'same-origin',
            }),
        ]),
        typeDefs: [TYPE_DEFS_CORE, TYPE_DEFS_ASSET_USAGE],
    });

    render(
        <IntlProvider translate={translate}>
            <NotifyProvider notificationApi={Notification}>
                <InteractionProvider>
                    <ApolloProvider client={client}>
                        <RecoilRoot>
                            <ErrorBoundary>
                                <MediaUiProvider
                                    dummyImage={dummyImage}
                                    containerRef={containerRef}
                                    featureFlags={featureFlags}
                                >
                                    <DndProvider backend={HTML5Backend}>
                                        <App />
                                    </DndProvider>
                                </MediaUiProvider>
                            </ErrorBoundary>
                        </RecoilRoot>
                    </ApolloProvider>
                </InteractionProvider>
            </NotifyProvider>
        </IntlProvider>,
        root
    );
};
