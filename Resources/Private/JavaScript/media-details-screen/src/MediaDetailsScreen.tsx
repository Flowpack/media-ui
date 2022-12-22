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
    InteractionProvider,
    IntlProvider,
    MediaUiProvider,
    MediaUiThemeProvider,
    Notify,
    NotifyProvider,
} from '@media-ui/core/src';
import { Asset, FeatureFlags, SelectionConstraints } from '@media-ui/core/src/interfaces';
import { AssetMediaType } from '@media-ui/core/src/state/selectedMediaTypeState';
import { ApolloErrorHandler, CacheFactory, PersistentStateManager } from '@media-ui/media-module/src/core';
import { Details } from './components';

// GraphQL type definitions
import TYPE_DEFS_CORE from '@media-ui/core/schema.graphql';
import TYPE_DEFS_CLIPBOARD from '@media-ui/feature-clipboard/schema.graphql';
import TYPE_DEFS_ASSET_USAGE from '@media-ui/feature-asset-usage/schema.graphql';

// GraphQL local resolvers
import buildClipboardResolver from '@media-ui/feature-clipboard/src/resolvers/mutation';
import buildModuleResolver from '@media-ui/media-module/src/resolvers/mutation';
import { MediaDetailsScreenApprovalAttainmentStrategyFactory } from './strategy';

let apolloClient = null;

interface MediaDetailsScreenProps {
    i18nRegistry: I18nRegistry;
    frontendConfiguration: {
        queryAssetUsage: boolean;
    };
    neos: Record<string, unknown>;
    type: AssetMediaType | 'images'; // The image editor sets the type to 'images'
    onComplete: (localAssetIdentifier: string) => void;
    isLeftSideBarHidden: boolean;
    isNodeCreationDialogOpen: boolean;
    toggleSidebar: () => void;
    addFlashMessage: (title: string, message: string, severity?: string, timeout?: number) => void;
    constraints?: SelectionConstraints;
    imageIdentity: string;
}

interface MediaDetailsScreenState {
    initialLeftSideBarHiddenState: boolean;
    initialNodeCreationDialogOpenState: boolean;
}

@connect(
    $transform({
        isLeftSideBarHidden: $get('ui.leftSideBar.isHidden'),
        isNodeCreationDialogOpen: $get('ui.nodeCreationDialog.isOpen'),
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
export class MediaDetailsScreen extends React.PureComponent<
    MediaDetailsScreenProps,
    MediaDetailsScreenState
> {
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
            PersistentStateManager.restoreLocalState(cache, this.props.constraints);

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
        const { addFlashMessage, onComplete, constraints, type } = this.props;
        const client = this.getApolloClient();
        const { dummyImage, buildLinkToMediaUi } = this.getConfig();
        const containerRef = createRef<HTMLDivElement>();

        const featureFlags: FeatureFlags = this.props.frontendConfiguration as FeatureFlags;

        // The Neos.UI Flashmessages only support the levels 'success', 'error' and 'info'
        const Notification: Notify = {
            info: (message) => addFlashMessage(message, message, 'info'),
            ok: (message) => addFlashMessage(message, message, 'success'),
            notice: (message) => addFlashMessage(message, message, 'info'),
            warning: (title, message = '') => addFlashMessage(title, message, 'error'),
            error: (title, message = '') => addFlashMessage(title, message, 'error'),
        };

        return (
            <div style={{ transform: 'translateZ(0)', height: '100%', padding: '1rem' }}>
                <IntlProvider translate={this.translate}>
                    <NotifyProvider notificationApi={Notification}>
                        <InteractionProvider>
                            <ApolloProvider client={client}>
                                <RecoilRoot>
                                    <MediaUiProvider
                                        dummyImage={dummyImage}
                                        onAssetSelection={onComplete}
                                        selectionMode={true}
                                        containerRef={containerRef}
                                        featureFlags={featureFlags}
                                        constraints={constraints || {}}
                                        assetType={type === 'images' ? 'image' : type}
                                        approvalAttainmentStrategyFactory={
                                            MediaDetailsScreenApprovalAttainmentStrategyFactory
                                        }
                                        isInMediaDetailsScreen={true}
                                    >
                                        <MediaUiThemeProvider>
                                            <Details
                                                buildLinkToMediaUi={buildLinkToMediaUi}
                                                assetIdentity={{
                                                    assetId: this.props.imageIdentity,
                                                    assetSourceId: 'neos',
                                                }}
                                            />
                                        </MediaUiThemeProvider>
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
