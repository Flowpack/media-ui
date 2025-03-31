import React, { createRef } from 'react';
import { render } from 'react-dom';
import Modal from 'react-modal';
import { ApolloClient, ApolloLink } from '@apollo/client';
import { createUploadLink } from 'apollo-upload-client';

// GraphQL type definitions
import { MediaUiProvider, typeDefs as TYPE_DEFS_CORE } from '@media-ui/core';
import MediaApplicationWrapper from '@media-ui/core/src/components/MediaApplicationWrapper';
import { typeDefs as TYPE_DEFS_ASSET_USAGE } from '@media-ui/feature-asset-usage';
import { AssetCollectionTreeDndProvider } from '@media-ui/feature-asset-collections/src/provider/AssetCollectionTreeDndProvider';

// Internal dependencies
import { CacheFactory, createErrorHandler, createRetryHandler } from './core';
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
    const endpoints = JSON.parse(root.dataset.endpoints) as Endpoints;
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
            createRetryHandler(),
            createUploadLink({
                uri: endpoints.graphql,
                credentials: 'same-origin',
            }),
        ]),
        typeDefs: [TYPE_DEFS_CORE, TYPE_DEFS_ASSET_USAGE],
    });

    const initialState = {
        applicationContext: 'browser' as ApplicationContext,
        featureFlags,
        constraints: {},
        assetType: 'all' as AssetType,
    };

    render(
        <MediaApplicationWrapper
            client={client}
            translate={translate}
            notificationApi={Notification}
            initialState={initialState}
        >
            <ErrorBoundary>
                <MediaUiProvider dummyImage={dummyImage} containerRef={containerRef}>
                    <AssetCollectionTreeDndProvider>
                        <App />
                    </AssetCollectionTreeDndProvider>
                </MediaUiProvider>
            </ErrorBoundary>
        </MediaApplicationWrapper>,
        root
    );
};
