import * as React from 'react';
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
import { I18nRegistry } from '../../src/interfaces';
import { IntlProvider, MediaUiProvider } from '../../src/core';
import App from '../../src/components/App';
import { restoreLocalState } from '../../src/core/PersistentStateManager';
import { resolvers, typeDefs } from '../../src/core/Resolvers';

let apolloClient = null;

interface AssetSelectionScreenProps {
    i18nRegistry: I18nRegistry;
    handleAssetSelected: Function;
    neos: object;
    type: 'assets' | 'images';
    flashMessages: {
        add: (id: string, message: string, severity?: string, timeout?: number) => void;
    };
}

@connect(state => ({}), {
    flashMessages: actions.UI.FlashMessages
})
@neos(globalRegistry => ({
    i18nRegistry: globalRegistry.get('i18n')
}))
export default class AssetSelectionScreen extends React.PureComponent<AssetSelectionScreenProps> {
    constructor(props: AssetSelectionScreenProps) {
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
            restoreLocalState(cache);

            apolloClient = new ApolloClient({
                cache,
                uri: endpoints.graphql,
                credentials: 'same-origin',
                typeDefs,
                resolvers
            });
        }
        return apolloClient;
    }

    translate = (id?: string, fallback?: string, params?: {}, packageKey = 'Flowpack.Media.Ui', sourceName = 'Main') => {
        return this.props.i18nRegistry.translate(id, fallback, packageKey, sourceName);
    };

    render() {
        const { flashMessages } = this.props;
        const client = this.getApolloClient();
        const { dummyImage } = this.getConfig();

        const notify = (type: string, message: string) => {
            flashMessages.add('', message, type);
        };

        return (
            <div style={{ transform: 'translateZ(0)', height: '100%' }}>
                <IntlProvider translate={this.translate}>
                    <ApolloProvider client={client}>
                        <MediaUiProvider notify={notify} dummyImage={dummyImage}>
                            <App />
                        </MediaUiProvider>
                    </ApolloProvider>
                </IntlProvider>
            </div>
        );
    }
}
