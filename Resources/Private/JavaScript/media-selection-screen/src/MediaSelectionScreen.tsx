import React, { createRef } from 'react';
import { connect } from 'react-redux';
import { RecoilRoot } from 'recoil';
import { ApolloClient, ApolloLink, ApolloProvider } from '@apollo/client';
import { createUploadLink } from 'apollo-upload-client';
import cx from 'classnames';

// Neos dependencies are provided by the UI
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { neos } from '@neos-project/neos-ui-decorators';
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { actions } from '@neos-project/neos-ui-redux-store';

// Media UI dependencies
import { InteractionProvider, IntlProvider, MediaUiProvider, NotifyProvider } from '@media-ui/core';
import { ApolloErrorHandler, CacheFactory } from '@media-ui/media-module/src/core';
import App from '@media-ui/media-module/src/components/App';

// GraphQL type definitions
import { typeDefs as TYPE_DEFS_CORE } from '@media-ui/core';
import { typeDefs as TYPE_DEFS_ASSET_USAGE } from '@media-ui/feature-asset-usage';

import classes from './MediaSelectionScreen.module.css';

let apolloClient = null;

interface MediaSelectionScreenProps {
    i18nRegistry: I18nRegistry;
    frontendConfiguration: {
        queryAssetUsage: boolean;
    };
    neos: Record<string, unknown>;
    type: AssetType | 'images'; // The image editor sets the type to 'images'
    onComplete: (localAssetIdentifier: string) => void;
    isLeftSideBarHidden: boolean;
    isNodeCreationDialogOpen: boolean;
    toggleSidebar: () => void;
    addFlashMessage: (title: string, message: string, severity?: string, timeout?: number) => void;
    constraints?: SelectionConstraints;
}

interface MediaSelectionScreenState {
    initialLeftSideBarHiddenState: boolean;
    initialNodeCreationDialogOpenState: boolean;
}

class MediaSelectionScreen extends React.PureComponent<MediaSelectionScreenProps, MediaSelectionScreenState> {
    constructor(props: MediaSelectionScreenProps) {
        super(props);
        this.state = {
            initialLeftSideBarHiddenState: false,
            initialNodeCreationDialogOpenState: false,
        };
    }

    componentDidMount() {
        const { isLeftSideBarHidden, isNodeCreationDialogOpen, toggleSidebar } = this.props;
        this.setState({
            initialLeftSideBarHiddenState: isLeftSideBarHidden,
            initialNodeCreationDialogOpenState: isNodeCreationDialogOpen,
        });
        if (!isLeftSideBarHidden && !isNodeCreationDialogOpen) {
            toggleSidebar();
        }
    }

    componentWillUnmount() {
        const { isLeftSideBarHidden, toggleSidebar } = this.props;
        const { initialLeftSideBarHiddenState, initialNodeCreationDialogOpenState } = this.state;
        if (initialLeftSideBarHiddenState !== isLeftSideBarHidden && !initialNodeCreationDialogOpenState) {
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
            const cache = CacheFactory.createCache(this.props.frontendConfiguration as FeatureFlags);

            apolloClient = new ApolloClient({
                cache,
                link: ApolloLink.from([
                    ApolloErrorHandler,
                    createUploadLink({
                        uri: endpoints.graphql,
                        credentials: 'same-origin',
                    }),
                ]),
                typeDefs: [TYPE_DEFS_CORE, TYPE_DEFS_ASSET_USAGE],
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
        const { addFlashMessage, onComplete, constraints, type } = this.props;
        const client = this.getApolloClient();
        const { dummyImage } = this.getConfig();
        const containerRef = createRef<HTMLDivElement>();

        const featureFlags: FeatureFlags = this.props.frontendConfiguration as FeatureFlags;

        // The Neos.UI FlashMessages only support the levels 'success', 'error' and 'info'
        const Notification: NeosNotification = {
            info: (message) => addFlashMessage(message, message, 'info'),
            ok: (message) => addFlashMessage(message, message, 'success'),
            notice: (message) => addFlashMessage(message, message, 'info'),
            warning: (title, message = '') => addFlashMessage(title, message, 'error'),
            error: (title, message = '') => addFlashMessage(title, message, 'error'),
        };

        const isInNodeCreationDialog = this.state.initialNodeCreationDialogOpenState;

        return (
            <div
                className={cx(classes.mediaSelectionScreen, {
                    [classes.isInNodeCreationDialog]: isInNodeCreationDialog,
                })}
            >
                <IntlProvider translate={this.translate}>
                    <NotifyProvider notificationApi={Notification}>
                        <InteractionProvider>
                            <ApolloProvider client={client}>
                                <RecoilRoot>
                                    <MediaUiProvider
                                        dummyImage={dummyImage}
                                        onAssetSelection={onComplete}
                                        selectionMode
                                        isInNodeCreationDialog={isInNodeCreationDialog}
                                        containerRef={containerRef}
                                        featureFlags={featureFlags}
                                        constraints={constraints || {}}
                                        assetType={type === 'images' ? 'image' : type}
                                    >
                                        <App />
                                    </MediaUiProvider>
                                </RecoilRoot>
                            </ApolloProvider>
                        </InteractionProvider>
                    </NotifyProvider>
                </IntlProvider>
            </div>
        );
    }
}

const mapStateToProps = (state: any) => ({
    isLeftSideBarHidden: state.ui.leftSideBar.isHidden,
    isNodeCreationDialogOpen: state.ui.nodeCreationDialog.isOpen,
});

const mapGlobalRegistryToProps = neos((globalRegistry: any) => ({
    i18nRegistry: globalRegistry.get('i18n'),
    frontendConfiguration: globalRegistry.get('frontendConfiguration').get('Flowpack.Media.Ui'),
}));

export default connect(() => ({}), {
    addFlashMessage: actions.UI.FlashMessages.add,
    toggleSidebar: actions.UI.LeftSideBar.toggle,
})(connect(mapStateToProps)(mapGlobalRegistryToProps(MediaSelectionScreen)));
