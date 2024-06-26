import React from 'react';
import { MutableSnapshot, RecoilRoot } from 'recoil';
import { ApolloClient, ApolloProvider } from '@apollo/client';
import { NormalizedCacheObject } from '@apollo/client/cache/inmemory/types';

import { InteractionProvider, IntlProvider, NotifyProvider } from '../provider';
import {
    applicationContextState,
    constraintsState,
    featureFlagsState,
    searchTermState,
    selectedAssetIdState,
    selectedAssetTypeState,
    selectedInspectorViewState,
    selectedMediaTypeState,
} from '@media-ui/core/src/state';
import { SearchTerm } from '../domain/SearchTerm';

interface InitialStateProps {
    applicationContext: ApplicationContext;
    featureFlags: FeatureFlags;
    selectedAsset?: AssetIdentity;
    selectedInspectorView?: InspectorViewMode;
    constraints?: SelectionConstraints;
}

interface MediaApplicationWrapperProps {
    children: React.ReactNode;
    client: ApolloClient<NormalizedCacheObject>;
    translate: TranslateFunction;
    notificationApi: NeosNotification;
    initialState: InitialStateProps;
}

/**
 * This component adds the necessary providers and state initialization for the Media UI.
 */
const MediaApplicationWrapper: React.FC<MediaApplicationWrapperProps> = ({
    children,
    client,
    translate,
    notificationApi,
    initialState,
}) => {
    const initializeState = ({ set }: MutableSnapshot) => {
        const { applicationContext, featureFlags, constraints, selectedInspectorView, selectedAsset } = initialState;

        set(applicationContextState, applicationContext);
        set(featureFlagsState, featureFlags);

        if (selectedAsset) {
            set(selectedAssetIdState, selectedAsset);
        }

        if (selectedInspectorView) {
            set(selectedInspectorViewState, selectedInspectorView);
        }

        set(constraintsState, constraints);
        if (constraints.mediaTypes?.length > 0) {
            // Reset mediatype selection to prevent an empty screen with no matching assets or an invalid state
            // FIXME: The previous state could be valid, but this would require a more complex check with the given constraints
            set(selectedMediaTypeState, null);
        }
        if (constraints.assetType) {
            set(selectedAssetTypeState, constraints.assetType);
        }

        const searchTermFromUrl = SearchTerm.fromUrl(new URL(window.location.href));
        if (!searchTermFromUrl.empty()) {
            set(searchTermState, searchTermFromUrl);
        }
    };

    return (
        <IntlProvider translate={translate}>
            <NotifyProvider notificationApi={notificationApi}>
                <InteractionProvider>
                    <ApolloProvider client={client}>
                        <RecoilRoot initializeState={initializeState}>{children}</RecoilRoot>
                    </ApolloProvider>
                </InteractionProvider>
            </NotifyProvider>
        </IntlProvider>
    );
};

export default MediaApplicationWrapper;
