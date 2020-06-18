import * as React from 'react';
import { createRef } from 'react';
import { connect } from 'react-redux';
import { RecoilRoot } from 'recoil';
import { ApolloProvider } from '@apollo/react-hooks';
import { InMemoryCache } from 'apollo-cache-inmemory';
import ApolloClient from 'apollo-boost';
import { $get, $transform } from 'plow-js';

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
    isLeftSideBarHidden: boolean;
    toggleSidebar: () => void;
    addFlashMessage: (title: string, message: string, severity?: string, timeout?: number) => void;
}

interface MediaSelectionScreenState {
    initialLeftSideBarHiddenState: boolean;
}

@connect(
    $transform({
        isLeftSideBarHidden: $get('ui.leftSideBar.isHidden')
    }),
    {
        addFlashMessage: actions.UI.FlashMessages.add,
        toggleSidebar: actions.UI.LeftSideBar.toggle
    }
)
@neos(globalRegistry => ({
    i18nRegistry: globalRegistry.get('i18n')
}))
// eslint-disable-next-line prettier/prettier
export default class MediaSelectionScreen extends React.PureComponent<MediaSelectionScreenProps, MediaSelectionScreenState> {
    constructor(props: MediaSelectionScreenProps) {
        super(props);
        this.state = {
            initialLeftSideBarHiddenState: false
        };
    }

    componentDidMount() {
        const { isLeftSideBarHidden, toggleSidebar } = this.props;
        this.setState({
            initialLeftSideBarHiddenState: isLeftSideBarHidden
        });
        if (!isLeftSideBarHidden) {
            toggleSidebar();
        }
    }

    componentWillUnmount() {
        const { isLeftSideBarHidden, toggleSidebar } = this.props;
        const { initialLeftSideBarHiddenState } = this.state;
        if (initialLeftSideBarHiddenState !== isLeftSideBarHidden) {
            toggleSidebar();
        }
    }

    getConfig() {
        return {
            endpoints: {
                // TODO: Generate uri from Neos maybe like $get('routes.core.modules.mediaBrowser', neos);
                graphql: '/neos/graphql/media-assets',
                upload: '/neos/media-ui/upload'
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
        const { addFlashMessage, onComplete } = this.props;
        const client = this.getApolloClient();
        const { dummyImage, endpoints } = this.getConfig();
        const containerRef = createRef<HTMLDivElement>();

        const Notification: Notify = {
            info: message => addFlashMessage(message, message, 'error'),
            ok: message => addFlashMessage(message, message, 'error'),
            notice: message => addFlashMessage(message, message, 'error'),
            warning: (title, message = '') => addFlashMessage(title, message, 'error'),
            error: (title, message = '') => addFlashMessage(title, message, 'error')
        };

        return (
            <div style={{ transform: 'translateZ(0)', height: '100%', padding: '1rem' }}>
                <IntlProvider translate={this.translate}>
                    <NotifyProvider notificationApi={Notification}>
                        <ApolloProvider client={client}>
                            <RecoilRoot>
                                <MediaUiProvider
                                    endpoints={endpoints}
                                    dummyImage={dummyImage}
                                    onAssetSelection={localAssetIdentifier => onComplete(localAssetIdentifier)}
                                    selectionMode={true}
                                    containerRef={containerRef}
                                >
                                    <MediaUiThemeProvider>
                                        <App />
                                    </MediaUiThemeProvider>
                                </MediaUiProvider>
                            </RecoilRoot>
                        </ApolloProvider>
                    </NotifyProvider>
                </IntlProvider>
            </div>
        );
    }
}
