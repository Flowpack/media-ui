import * as React from 'react';
import { render } from 'react-dom';
import Modal from 'react-modal';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { ApolloProvider } from '@apollo/react-hooks';
import ApolloClient from 'apollo-boost';
import { InMemoryCache } from 'apollo-cache-inmemory';

import { IntlProvider, MediaUiProvider, PersistentStateManager } from './core';
import App from './components/App';
import loadIconLibrary from './lib/FontAwesome';
import { resolvers, typeDefs } from './core/Resolvers';

loadIconLibrary();

const withDragDropContext = DragDropContext(HTML5Backend);
const AppWithDnd = withDragDropContext(App);

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

    const notify = (type, message) => {
        window.NeosCMS.Notification[type](message);
    };

    const translate = (id, value = null, args = [], packageKey = 'Flowpack.Media.Ui', source = 'Main') => {
        return window.NeosCMS.I18n.translate(id, value, packageKey, source, args);
    };

    render(
        <IntlProvider translate={translate}>
            <ApolloProvider client={client}>
                <MediaUiProvider notify={notify} dummyImage={root.dataset.dummyImage}>
                    <AppWithDnd />
                </MediaUiProvider>
            </ApolloProvider>
        </IntlProvider>,
        root
    );
};
