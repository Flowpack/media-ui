import * as React from 'react';
import { createContext, useCallback, useContext, useEffect } from 'react';
import { useApolloClient, gql } from '@apollo/client';
import { useRecoilState } from 'recoil';

import { useIntl } from '@media-ui/core/src';

import { Asset, AssetIdentity, FeatureFlags, SelectionConstraints } from '../interfaces';
import { useAssetsQuery, useDeleteAsset, useImportAsset } from '../hooks';
import { useNotify } from './Notify';
import { selectedMediaTypeState } from '../state';

interface MediaUiProviderProps {
    children: React.ReactElement;
    dummyImage: string;
    selectionMode?: boolean;
    isInNodeCreationDialog?: boolean;
    containerRef: React.RefObject<HTMLDivElement>;
    onAssetSelection?: (localAssetIdentifier: string) => void;
    featureFlags: FeatureFlags;
    constraints?: SelectionConstraints;
    assetType?: AssetType;
}

interface MediaUiProviderValues {
    containerRef: React.RefObject<HTMLDivElement>;
    dummyImage: string;
    handleDeleteAsset: (asset: Asset) => Promise<boolean>;
    handleSelectAsset: (assetIdentity: AssetIdentity) => void;
    selectionMode: boolean;
    isInNodeCreationDialog: boolean;
    assets: Asset[];
    refetchAssets: () => void;
    featureFlags: FeatureFlags;
    constraints: SelectionConstraints;
    assetType: AssetType;
}

export const MediaUiContext = createContext({} as MediaUiProviderValues);
export const useMediaUi = (): MediaUiProviderValues => useContext(MediaUiContext);

export function MediaUiProvider({
    children,
    dummyImage,
    selectionMode = false,
    isInNodeCreationDialog = false,
    onAssetSelection = null,
    containerRef,
    featureFlags,
    constraints = {},
    assetType = 'all',
}: MediaUiProviderProps) {
    const { translate } = useIntl();
    const Notify = useNotify();
    const client = useApolloClient();
    const { deleteAsset } = useDeleteAsset();
    const { importAsset } = useImportAsset();
    const { assets, refetch: refetchAssets } = useAssetsQuery();
    const [selectedMediaType, setSelectedMediaType] = useRecoilState(selectedMediaTypeState);

    // Set initial media type state
    useEffect(() => {
        if (assetType) {
            setSelectedMediaType(assetType);
        }
    }, [assetType, setSelectedMediaType]);

    const handleDeleteAsset = useCallback(
        (asset: Asset): Promise<boolean> => {
            // TODO: Use custom modal
            const confirm = window.confirm(
                translate('action.deleteAsset.confirm', 'Do you really want to delete the asset ' + asset.label, [
                    asset.label,
                ])
            );
            if (!confirm) return new Promise(() => false);

            return deleteAsset({ assetId: asset.id, assetSourceId: asset.assetSource.id })
                .then(() => {
                    Notify.ok(translate('action.deleteAsset.success', 'The asset has been deleted'));
                    return true;
                })
                .catch(({ message }) => {
                    // TODO: translate possible error message or generate one on server
                    Notify.error(
                        translate('action.deleteAsset.error', 'Error while trying to delete the asset'),
                        message
                    );
                    return false;
                });
        },
        [Notify, translate, deleteAsset]
    );

    // Handle selection mode for the secondary Neos UI inspector
    const handleSelectAsset = useCallback(
        (assetIdentity: AssetIdentity) => {
            if (!onAssetSelection || !assetIdentity) {
                return;
            }
            // Read local asset id from cache as the asset editor requires it
            const { localId } = client.readFragment({
                fragment: gql`
                    fragment LocalAssetId on Asset {
                        localId
                    }
                `,
                id: client.cache.identify({ __typename: 'Asset', id: assetIdentity.assetId }),
            });

            if (localId) {
                onAssetSelection(localId);
            } else {
                // If no local id is present, we first need to import the asset from its remote source
                importAsset(assetIdentity).then(({ data }) => {
                    onAssetSelection(data.importAsset.localId);
                });
            }
        },
        [client, importAsset, onAssetSelection]
    );

    return (
        <MediaUiContext.Provider
            value={{
                containerRef,
                dummyImage,
                handleDeleteAsset,
                handleSelectAsset,
                selectionMode,
                isInNodeCreationDialog,
                assets,
                refetchAssets,
                featureFlags,
                constraints,
                assetType,
            }}
        >
            {children}
        </MediaUiContext.Provider>
    );
}
