import React, { createContext, useCallback, useContext, useEffect, useMemo } from 'react';
import { useApolloClient, gql } from '@apollo/client';
import { useSetRecoilState } from 'recoil';
import { isMatch } from 'matcher';

import { useImportAsset } from '../hooks';
import { useNotify } from './Notify';
import { useIntl } from './Intl';
import { useInteraction } from './Interaction';
import { constraintsState, featureFlagsState, selectedAssetTypeState, selectedMediaTypeState } from '../state';
import { ASSET_FRAGMENT } from '../fragments/asset';
import {
    ApprovalAttainmentStrategy,
    ApprovalAttainmentStrategyFactory,
    DefaultApprovalAttainmentStrategyFactory,
} from '../strategy';

interface MediaUiProviderProps {
    children: React.ReactElement;
    dummyImage: string;
    selectionMode?: boolean;
    isInNodeCreationDialog?: boolean;
    isInMediaDetailsScreen?: boolean;
    containerRef: React.RefObject<HTMLDivElement>;
    onAssetSelection?: (localAssetIdentifier: string) => void;
    featureFlags: FeatureFlags;
    constraints?: SelectionConstraints;
    assetType?: AssetType;
    approvalAttainmentStrategyFactory?: ApprovalAttainmentStrategyFactory;
}

interface MediaUiProviderValues {
    containerRef: React.RefObject<HTMLDivElement>;
    dummyImage: string;
    handleSelectAsset: (assetIdentity: AssetIdentity) => void;
    // TODO: Turn view variants into a single view Enum
    selectionMode: boolean;
    isInNodeCreationDialog: boolean;
    isInMediaDetailsScreen: boolean;
    assetType: AssetType;
    isAssetSelectable: (asset: Asset) => boolean;
    approvalAttainmentStrategy: ApprovalAttainmentStrategy;
}

export const MediaUiContext = createContext({} as MediaUiProviderValues);
export const useMediaUi = (): MediaUiProviderValues => useContext(MediaUiContext);

export function MediaUiProvider({
    children,
    dummyImage,
    selectionMode = false,
    isInNodeCreationDialog = false,
    isInMediaDetailsScreen = false,
    onAssetSelection = null,
    containerRef,
    featureFlags,
    constraints = {},
    assetType = 'all',
    approvalAttainmentStrategyFactory = DefaultApprovalAttainmentStrategyFactory,
}: MediaUiProviderProps) {
    const { translate } = useIntl();
    const Notify = useNotify();
    const Interaction = useInteraction();
    const client = useApolloClient();
    const { importAsset } = useImportAsset();
    const setConstraints = useSetRecoilState(constraintsState);
    const setSelectedAssetType = useSetRecoilState(selectedAssetTypeState);
    const setSelectedMediaType = useSetRecoilState(selectedMediaTypeState);
    const setFeatureFlags = useSetRecoilState(featureFlagsState);
    const approvalAttainmentStrategy = useMemo(
        () =>
            approvalAttainmentStrategyFactory({
                interaction: Interaction,
                intl: { translate },
            }),
        [approvalAttainmentStrategyFactory, Interaction, translate]
    );

    // Update some state variables which can be influenced by the current context
    useEffect(() => {
        setFeatureFlags(featureFlags);

        if (assetType !== 'all') {
            setSelectedAssetType(assetType);
        }

        setConstraints(constraints);
        if (constraints.mediaTypes?.length > 0) {
            // Reset mediatype selection to prevent an empty screen with no matching assets or an invalid state
            // FIXME: The previous state could be valid, but this would require a more complex check with the given constraints
            setSelectedMediaType(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // TODO: This can properly be optimised by turning it into a recoil readonly selector family
    const isAssetSelectable = useCallback(
        (asset: Asset) => {
            if (constraints.mediaTypes?.length > 0) {
                if (!isMatch(asset.file.mediaType, constraints.mediaTypes)) {
                    return false;
                }
            }
            if (constraints.assetSources?.length > 0) {
                if (!isMatch(asset.assetSource.id, constraints.assetSources)) {
                    return false;
                }
            }
            return true;
        },
        [constraints]
    );

    // TODO: Move into select asset hook, as it's the only place using this method
    const handleSelectAsset = useCallback(
        (assetIdentity: AssetIdentity) => {
            if (!onAssetSelection || !assetIdentity) {
                return;
            }

            // Read local asset data from cache as the asset editor and the constraint check require it
            const asset = client.readFragment({
                fragment: gql`
                    fragment LocalAssetData on Asset {
                        ...AssetProps
                    }
                    ${ASSET_FRAGMENT}
                `,
                fragmentName: 'LocalAssetData',
                variables: {
                    includeUsage: false,
                },
                id: client.cache.identify({ __typename: 'Asset', id: assetIdentity.assetId }),
            });

            if (!isAssetSelectable(asset)) {
                Notify.notice(
                    translate(
                        'action.selectAsset.invalidType.message',
                        'You can only select any of the following types: {types}',
                        {
                            types: constraints.mediaTypes.join(', '),
                        }
                    )
                );
                return;
            }

            if (asset.localId) {
                onAssetSelection(asset.localId);
            } else {
                // If no local id is present, we first need to import the asset from its remote source
                importAsset(assetIdentity).then(({ data }) => {
                    onAssetSelection(data.importAsset.localId);
                });
            }
        },
        [client, importAsset, onAssetSelection, isAssetSelectable, translate, Notify, constraints.mediaTypes]
    );

    return (
        <MediaUiContext.Provider
            value={{
                containerRef,
                dummyImage,
                handleSelectAsset,
                selectionMode,
                isInNodeCreationDialog,
                isInMediaDetailsScreen,
                assetType,
                isAssetSelectable,
                approvalAttainmentStrategy,
            }}
        >
            {children}
        </MediaUiContext.Provider>
    );
}
