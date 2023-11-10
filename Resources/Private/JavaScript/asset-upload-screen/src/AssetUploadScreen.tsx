import React, { createRef } from 'react';
import { connect } from 'react-redux';
import { ApolloClient, ApolloLink } from '@apollo/client';
import { createUploadLink } from 'apollo-upload-client';

// Neos dependencies are provided by the UI
// @ts-ignore
import { neos } from '@neos-project/neos-ui-decorators';
// @ts-ignore
import { actions } from '@neos-project/neos-ui-redux-store';

import NewAssetUpload from './NewAssetUpload';

import { MediaUiProvider, typeDefs as TYPE_DEFS_CORE } from '@media-ui/core';
import MediaApplicationWrapper from '@media-ui/core/src/components/MediaApplicationWrapper';
import { CacheFactory, createErrorHandler } from '@media-ui/media-module/src/core';
import { typeDefs as TYPE_DEFS_ASSET_USAGE } from '@media-ui/feature-asset-usage';

let apolloClient = null;

interface AssetUploadScreenProps {
    i18nRegistry: I18nRegistry;
    frontendConfiguration: FeatureFlags;
    neos: Record<string, unknown>;
    type: AssetType | 'images'; // The image editor sets the type to 'images'
    onComplete: (result: { object: { __identity: string } }) => void;
    isLeftSideBarHidden: boolean;
    isNodeCreationDialogOpen: boolean;
    toggleSidebar: () => void;
    addFlashMessage: (title: string, message: string, severity?: string, timeout?: number) => void;
    constraints?: SelectionConstraints;
}

interface AssetUploadScreenState {
    initialLeftSideBarHiddenState: boolean;
    initialNodeCreationDialogOpenState: boolean;
}

export class AssetUploadScreen extends React.PureComponent<AssetUploadScreenProps, AssetUploadScreenState> {
    notificationHandler: NeosNotification;

    constructor(props) {
        super(props);
        this.state = {
            initialLeftSideBarHiddenState: false,
            initialNodeCreationDialogOpenState: false,
        };
        this.notificationHandler = {
            info: (message) => props.addFlashMessage(message, message, 'info'),
            ok: (message) => props.addFlashMessage(message, message, 'success'),
            notice: (message) => props.addFlashMessage(message, message, 'info'),
            warning: (title, message = '') => props.addFlashMessage(title, message, 'error'),
            error: (title, message = '') => props.addFlashMessage(title, message, 'error'),
        };
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
                    createErrorHandler(this.notificationHandler),
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

    getInitialState = () => {
        const { frontendConfiguration, constraints, type } = this.props;

        return {
            applicationContext: 'selection' as ApplicationContext,
            featureFlags: frontendConfiguration,
            constraints: {
                ...(constraints || {}),
                assetType: type === 'images' ? 'image' : type,
            },
        };
    };

    render() {
        const { onComplete } = this.props;
        const { dummyImage } = this.getConfig();
        const containerRef = createRef<HTMLDivElement>();
        const isInNodeCreationDialog = this.state.initialNodeCreationDialogOpenState;

        return (
            <div style={{ width: '100%', height: '100%', padding: '2rem' }}>
                <MediaApplicationWrapper
                    client={this.getApolloClient()}
                    translate={this.translate}
                    notificationApi={this.notificationHandler}
                    initialState={this.getInitialState()}
                >
                    <MediaUiProvider
                        dummyImage={dummyImage}
                        selectionMode
                        isInNodeCreationDialog={isInNodeCreationDialog}
                        containerRef={containerRef}
                    >
                        <NewAssetUpload onComplete={onComplete} />
                    </MediaUiProvider>
                </MediaApplicationWrapper>
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
})(connect(mapStateToProps)(mapGlobalRegistryToProps(AssetUploadScreen)));
