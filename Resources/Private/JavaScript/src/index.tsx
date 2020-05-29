import * as React from 'react';
import { render } from 'react-dom';
import Modal from 'react-modal';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { ApolloProvider } from '@apollo/react-hooks';
import ApolloClient from 'apollo-boost';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { hot, setConfig } from 'react-hot-loader';

import { IntlProvider, MediaUiProvider, PersistentStateManager } from './core';
import App from './components/App';
import loadIconLibrary from './lib/FontAwesome';
import { resolvers, typeDefs } from './core/Resolvers';
import { createRef } from 'react';
import { NotifyProvider } from './core';

loadIconLibrary();

setConfig({
    showReactDomPatchNotification: false
});

const withDragDropContext = DragDropContext(HTML5Backend);
const AppWithDnd = withDragDropContext(hot(module)(App));

window.onload = async (): Promise<void> => {
    while (!window.NeosCMS || !window.NeosCMS.I18n.initialized) {
        await new Promise(resolve => setTimeout(resolve, 50));
    }

    const root = document.getElementById('media-ui-app');
    Modal.setAppElement(root);

    const cache = new InMemoryCache();
    PersistentStateManager.restoreLocalState(cache);

    const client = new ApolloClient({
        cache,
        uri: JSON.parse(root.dataset.endpoints).graphql,
        credentials: 'same-origin',
        typeDefs,
        resolvers
    });

    const containerRef = createRef();

    const { Notification } = window.NeosCMS;

    const translate = (id, value = null, args = [], packageKey = 'Flowpack.Media.Ui', source = 'Main') => {
        return window.NeosCMS.I18n.translate(id, value, packageKey, source, args);
    };

    render(
        <IntlProvider translate={translate}>
            <NotifyProvider notificationApi={Notification}>
                <ApolloProvider client={client}>
                    <MediaUiProvider dummyImage={root.dataset.dummyImage} containerRef={containerRef}>
                        <AppWithDnd />
                    </MediaUiProvider>
                </ApolloProvider>
            </NotifyProvider>
        </IntlProvider>,
        root
    );
};
