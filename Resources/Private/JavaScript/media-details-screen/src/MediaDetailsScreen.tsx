import React, { createRef } from 'react';
import { connect } from 'react-redux';
import { RecoilRoot } from 'recoil';
import { ApolloClient, ApolloLink, ApolloProvider } from '@apollo/client';
import { createUploadLink } from 'apollo-upload-client';

// Neos dependencies are provided by the UI
// @ts-ignore
import { neos } from '@neos-project/neos-ui-decorators';
// @ts-ignore
import { actions } from '@neos-project/neos-ui-redux-store';

// Media UI dependencies
import { InteractionProvider, IntlProvider, MediaUiProvider, NotifyProvider } from '@media-ui/core';
import { createErrorHandler, CacheFactory } from '@media-ui/media-module/src/core';
import { Details } from './components';

// GraphQL type definitions
import { typeDefs as TYPE_DEFS_CORE } from '@media-ui/core';
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

    render() {
        const { addFlashMessage, onComplete, constraints, type, imageIdentity, frontendConfiguration } = this.props;
        const client = this.getApolloClient();
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
                <IntlProvider translate={this.translate}>
                    <NotifyProvider notificationApi={Notification}>
                        <InteractionProvider>
                            <ApolloProvider client={client}>
                                <RecoilRoot>
                                    <MediaUiProvider
                                        dummyImage={dummyImage}
                                        onAssetSelection={onComplete}
                                        selectionMode
                                        containerRef={containerRef}
                                        featureFlags={frontendConfiguration}
                                        constraints={constraints || {}}
                                        assetType={type === 'images' ? 'image' : type}
                                        approvalAttainmentStrategyFactory={
                                            MediaDetailsScreenApprovalAttainmentStrategyFactory
                                        }
                                        isInMediaDetailsScreen
                                    >
                                        <Details
                                            buildLinkToMediaUi={buildLinkToMediaUi}
                                            assetIdentity={{
                                                assetId: imageIdentity,
                                                assetSourceId: 'neos',
                                            }}
                                        />
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

const mapGlobalRegistryToProps = neos((globalRegistry: any) => ({
    i18nRegistry: globalRegistry.get('i18n'),
    frontendConfiguration: globalRegistry.get('frontendConfiguration').get('Flowpack.Media.Ui'),
}));

export default connect(() => ({}), {
    addFlashMessage: actions.UI.FlashMessages.add,
})(mapGlobalRegistryToProps(MediaDetailsScreen));
