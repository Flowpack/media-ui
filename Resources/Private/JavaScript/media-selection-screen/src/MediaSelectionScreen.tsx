import * as React from 'react';
import { createRef } from 'react';
import { connect } from 'react-redux';
import { RecoilRoot } from 'recoil';
import { ApolloClient, ApolloLink, ApolloProvider } from '@apollo/client';
import { createUploadLink } from 'apollo-upload-client';
import { $get, $transform } from 'plow-js';

// Neos dependencies are provided by the UI
// @ts-ignore
import { neos } from '@neos-project/neos-ui-decorators';
// @ts-ignore
import { actions } from '@neos-project/neos-ui-redux-store';

// Media UI dependencies
import {
    I18nRegistry,
    IntlProvider,
    MediaUiProvider,
    MediaUiThemeProvider,
    Notify,
    NotifyProvider,
} from '@media-ui/core/src';
import { ApolloErrorHandler, CacheFactory, PersistentStateManager } from 'backend-module/src/core';
import App from 'backend-module/src/components/App';

// GraphQL type definitions
import TYPE_DEFS_CORE from '@media-ui/core/schema.graphql';
import TYPE_DEFS_CLIPBOARD from '@media-ui/feature-clipboard/schema.graphql';
import TYPE_DEFS_ASSET_USAGE from '@media-ui/feature-asset-usage/schema.graphql';

// GraphQL local resolvers
import buildClipboardResolver from '@media-ui/feature-clipboard/src/resolvers/mutation';
import buildModuleResolver from 'backend-module/src/resolvers/mutation';
import { FeatureFlags } from '@media-ui/core/src/interfaces';

let apolloClient = null;

interface MediaSelectionScreenProps {
    i18nRegistry: I18nRegistry;
    frontendConfiguration: {
        queryAssetUsage: boolean;
    };
    neos: Record<string, unknown>;
    // TODO: Forward and use prop in selection screen
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
        isLeftSideBarHidden: $get('ui.leftSideBar.isHidden'),
    }),
    {
        addFlashMessage: actions.UI.FlashMessages.add,
        toggleSidebar: actions.UI.LeftSideBar.toggle,
    }
)
@neos((globalRegistry) => ({
    i18nRegistry: globalRegistry.get('i18n'),
    frontendConfiguration: globalRegistry.get('frontendConfiguration').get('Flowpack.Media.Ui'),
}))
// eslint-disable-next-line prettier/prettier
export default class MediaSelectionScreen extends React.PureComponent<
    MediaSelectionScreenProps,
    MediaSelectionScreenState
> {
    constructor(props: MediaSelectionScreenProps) {
        super(props);
        this.state = {
            initialLeftSideBarHiddenState: false,
        };
    }

    componentDidMount() {
        const { isLeftSideBarHidden, toggleSidebar } = this.props;
        this.setState({
            initialLeftSideBarHiddenState: isLeftSideBarHidden,
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
                upload: '/neos/media-ui/upload',
            },
            // TODO: Generate image uri from Neos
            dummyImage: '/_Resources/Static/Packages/Neos.Neos/Images/dummy-image.svg',
        };
    }

    getApolloClient() {
        if (!apolloClient) {
            const { endpoints } = this.getConfig();
            const cache = CacheFactory.createCache({
                queryAssetUsage: this.props.frontendConfiguration.queryAssetUsage,
            });
            PersistentStateManager.restoreLocalState(cache);

            apolloClient = new ApolloClient({
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
        }
        return apolloClient;
    }

    translate = (
        id?: string,
        fallback?: string,
        params?: Record<string, unknown> | string[],
        packageKey = 'Flowpack.Media.Ui',
        sourceName = 'Main'
    ) => {
        return this.props.i18nRegistry.translate(id, fallback, params, packageKey, sourceName);
    };

    render() {
        const { addFlashMessage, onComplete } = this.props;
        const client = this.getApolloClient();
        const { dummyImage } = this.getConfig();
        const containerRef = createRef<HTMLDivElement>();

        const featureFlags: FeatureFlags = {
            queryAssetUsage: this.props.frontendConfiguration.queryAssetUsage,
        };

        const Notification: Notify = {
            info: (message) => addFlashMessage(message, message, 'error'),
            ok: (message) => addFlashMessage(message, message, 'error'),
            notice: (message) => addFlashMessage(message, message, 'error'),
            warning: (title, message = '') => addFlashMessage(title, message, 'error'),
            error: (title, message = '') => addFlashMessage(title, message, 'error'),
        };

        return (
            <div style={{ transform: 'translateZ(0)', height: '100%', padding: '1rem' }}>
                <IntlProvider translate={this.translate}>
                    <NotifyProvider notificationApi={Notification}>
                        <ApolloProvider client={client}>
                            <RecoilRoot>
                                <MediaUiProvider
                                    dummyImage={dummyImage}
                                    onAssetSelection={(localAssetIdentifier) => onComplete(localAssetIdentifier)}
                                    selectionMode={true}
                                    containerRef={containerRef}
                                    featureFlags={featureFlags}
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
