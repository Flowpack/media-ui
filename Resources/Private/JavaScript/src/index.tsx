import * as React from 'react';
import { render } from 'react-dom';
import Modal from 'react-modal';
import { ApolloProvider } from '@apollo/react-hooks';
import ApolloClient from 'apollo-boost';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { MediaUiProvider } from './core/MediaUi';
import { IntlProvider } from './core/Intl';
import App from './components/App';
import { resolvers, typeDefs } from './core/Resolvers';
import { restoreLocalState } from './core/PersistentStateManager';
import loadIconLibrary from './lib/FontAwesome';

loadIconLibrary();

window.onload = async (): Promise<void> => {
    while (!window.NeosCMS || !window.NeosCMS.I18n.initialized) {
        await new Promise(resolve => setTimeout(resolve, 50));
    }

    const root = document.getElementById('media-ui-app');
    Modal.setAppElement(root);

    const cache = new InMemoryCache();
    restoreLocalState(cache);

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
                <MediaUiProvider
                    csrf={root.dataset.csrfToken}
                    endpoints={JSON.parse(root.dataset.endpoints)}
                    notify={notify}
                    dummyImage={root.dataset.dummyImage}
                >
                    <App />
                </MediaUiProvider>
            </ApolloProvider>
        </IntlProvider>,
        root
    );
};
