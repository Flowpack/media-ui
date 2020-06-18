import * as React from 'react';
import { render } from 'react-dom';
import Modal from 'react-modal';
import { DndProvider } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { ApolloProvider } from '@apollo/react-hooks';
import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { hot, setConfig } from 'react-hot-loader';
import { createUploadLink } from 'apollo-upload-client';

import { IntlProvider, MediaUiProvider, MediaUiThemeProvider, PersistentStateManager } from './core';
import App from './components/App';
import loadIconLibrary from './lib/FontAwesome';
import { resolvers, typeDefs } from './core/Resolvers';
import { createRef } from 'react';
import { NotifyProvider } from './core';
import { RecoilRoot } from 'recoil';

loadIconLibrary();

setConfig({
    showReactDomPatchNotification: false
});

window.onload = async (): Promise<void> => {
    while (!window.NeosCMS || !window.NeosCMS.I18n.initialized) {
        await new Promise(resolve => setTimeout(resolve, 50));
    }

    const root = document.getElementById('media-ui-app');
    const { dummyImage, csrfToken } = root.dataset;
    const endpoints = JSON.parse(root.dataset.endpoints);

    // Modal for the lightbox
    Modal.setAppElement(root);

    // Cache for ApolloClient
    const cache = new InMemoryCache();

    // Restore state from last visit
    PersistentStateManager.restoreLocalState(cache);

    const client = new ApolloClient({
        cache,
        link: createUploadLink({
            uri: endpoints.graphql,
            credentials: 'same-origin'
        }),
        typeDefs,
        resolvers
    });

    const containerRef = createRef<HTMLDivElement>();

    const { Notification } = window.NeosCMS;

    const translate = (id, value = null, args = [], packageKey = 'Flowpack.Media.Ui', source = 'Main') => {
        return window.NeosCMS.I18n.translate(id, value, packageKey, source, args);
    };

    // Lightweight port of the method with the same name from Neos UI
    // TODO: Remove when all queries are done via GraphQL
    const fetchWithErrorHandling = {
        withCsrfToken: makeFetchRequest => {
            const fetchOptions = makeFetchRequest(csrfToken);
            const { url } = fetchOptions;
            if (!url) {
                throw new Error('Url option not provided');
            }
            delete fetchOptions.url;
            return fetch(url, fetchOptions).then(response => response.json());
        }
    };

    const AppWithHmr = hot(module)(App);

    render(
        <IntlProvider translate={translate}>
            <NotifyProvider notificationApi={Notification}>
                <ApolloProvider client={client}>
                    <RecoilRoot>
                        <MediaUiProvider
                            fetchWithErrorHandling={fetchWithErrorHandling}
                            endpoints={endpoints}
                            dummyImage={dummyImage}
                            containerRef={containerRef}
                        >
                            <MediaUiThemeProvider>
                                <DndProvider backend={HTML5Backend}>
                                    <AppWithHmr />
                                </DndProvider>
                            </MediaUiThemeProvider>
                        </MediaUiProvider>
                    </RecoilRoot>
                </ApolloProvider>
            </NotifyProvider>
        </IntlProvider>,
        root
    );
};
