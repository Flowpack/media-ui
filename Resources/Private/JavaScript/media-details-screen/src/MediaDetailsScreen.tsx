import React, { createRef } from 'react';
import { connect } from 'react-redux';
import { ApolloClient, ApolloLink } from '@apollo/client';
import { createUploadLink } from 'apollo-upload-client';

// Neos dependencies are provided by the UI
// @ts-ignore
import { neos } from '@neos-project/neos-ui-decorators';
// @ts-ignore
import { actions } from '@neos-project/neos-ui-redux-store';

// Media UI dependencies
// GraphQL type definitions
import { MediaUiProvider, typeDefs as TYPE_DEFS_CORE } from '@media-ui/core';
import MediaApplicationWrapper from '@media-ui/core/src/components/MediaApplicationWrapper';
import { CacheFactory, createErrorHandler } from '@media-ui/media-module/src/core';
import { Details } from './components';
import { typeDefs as TYPE_DEFS_ASSET_USAGE } from '@media-ui/feature-asset-usage';

// GraphQL local resolvers
import { MediaDetailsScreenApprovalAttainmentStrategyFactory } from './strategy';

import classes from './MediaDetailsScreen.module.css';

let apolloClient = null;

interface MediaDetailsScreenProps {
    i18nRegistry: I18nRegistry;
    frontendConfiguration: FeatureFlags;
    neos: Record<string, unknown>;
    type: AssetType | 'images'; // The image editor sets the type to 'images'
    onComplete: (localAssetIdentifier: string) => void;
    addFlashMessage: (title: string, message: string, severity?: string, timeout?: number) => void;
    constraints?: SelectionConstraints;
    imageIdentity: string;
}

interface MediaDetailsScreenState {
    initialLeftSideBarHiddenState: boolean;
    initialNodeCreationDialogOpenState: boolean;
}

export class MediaDetailsScreen extends React.PureComponent<MediaDetailsScreenProps, MediaDetailsScreenState> {
    notificationHandler: NeosNotification;

    constructor(props: MediaDetailsScreenProps) {
        super(props);

        // The Neos.UI FlashMessages only support the levels 'success', 'error' and 'info'
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
            buildLinkToMediaUi: (asset: Asset) => `/neos/management/mediaui?searchTerm=id:${asset.id}`,
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
        const { frontendConfiguration, imageIdentity, type, constraints } = this.props;

        return {
            applicationContext: 'details' as ApplicationContext,
            featureFlags: frontendConfiguration,
            selectedAsset: {
                assetId: imageIdentity,
                // FIXME: Set the correct asset source id (do we even have it at this point?)
                assetSourceId: 'neos',
            },
            selectedInspectorView: 'asset' as InspectorViewMode,
            constraints: {
                ...(constraints || {}),
                assetType: type === 'images' ? 'image' : type,
            },
        };
    };

    render() {
        const { addFlashMessage, onComplete } = this.props;
        const { dummyImage, buildLinkToMediaUi } = this.getConfig();
        const containerRef = createRef<HTMLDivElement>();

        // The Neos.UI FlashMessages only support the levels 'success', 'error' and 'info'
        const Notification: NeosNotification = {
            info: (message) => addFlashMessage(message, message, 'info'),
            ok: (message) => addFlashMessage(message, message, 'success'),
            notice: (message) => addFlashMessage(message, message, 'info'),
            warning: (title, message = '') => addFlashMessage(title, message, 'error'),
            error: (title, message = '') => addFlashMessage(title, message, 'error'),
        };

        return (
            <div className={classes.mediaDetailsScreen}>
                <MediaApplicationWrapper
                    client={this.getApolloClient()}
                    translate={this.translate}
                    notificationApi={Notification}
                    initialState={this.getInitialState()}
                >
                    <MediaUiProvider
                        dummyImage={dummyImage}
                        onAssetSelection={onComplete}
                        selectionMode
                        containerRef={containerRef}
                        approvalAttainmentStrategyFactory={MediaDetailsScreenApprovalAttainmentStrategyFactory}
                    >
                        <Details buildLinkToMediaUi={buildLinkToMediaUi} />
                    </MediaUiProvider>
                </MediaApplicationWrapper>
            </div>
        );
    }
}

const mapGlobalRegistryToProps = neos((globalRegistry: any) => ({
    i18nRegistry: globalRegistry.get('i18n'),
    frontendConfiguration: globalRegistry.get('frontendConfiguration').get('Flowpack.Media.Ui'),
}));

export default connect(() => ({}), {
    addFlashMessage: actions.UI.FlashMessages.add,
})(mapGlobalRegistryToProps(MediaDetailsScreen));
