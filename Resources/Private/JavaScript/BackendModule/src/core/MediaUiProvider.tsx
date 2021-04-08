import * as React from 'react';
import { createContext, useCallback, useContext } from 'react';

import { Asset } from '../interfaces';
import { useAssetsQuery, useDeleteAsset, useImportAsset } from '../hooks';
import { useIntl, useNotify } from './index';

interface MediaUiProviderProps {
    children: React.ReactElement;
    dummyImage: string;
    selectionMode?: boolean;
    containerRef: React.RefObject<HTMLDivElement>;
    onAssetSelection?: (localAssetIdentifier: string) => void;
}

interface MediaUiProviderValues {
    containerRef: React.RefObject<HTMLDivElement>;
    dummyImage: string;
    handleDeleteAsset: (asset: Asset) => void;
    handleSelectAsset: (asset: Asset) => void;
    selectionMode: boolean;
    assets: Asset[];
    refetchAssets: () => void;
}

export const MediaUiContext = createContext({} as MediaUiProviderValues);
export const useMediaUi = (): MediaUiProviderValues => useContext(MediaUiContext);

export function MediaUiProvider({
    children,
    dummyImage,
    selectionMode = false,
    onAssetSelection = null,
    containerRef,
}: MediaUiProviderProps) {
    const { translate } = useIntl();
    const Notify = useNotify();
    const { deleteAsset } = useDeleteAsset();
    const { importAsset } = useImportAsset();
    const { assets, refetchAssets } = useAssetsQuery();

    const handleDeleteAsset = useCallback(
        (asset: Asset) => {
            // TODO: Use custom modal
            const confirm = window.confirm(
                translate('action.deleteAsset.confirm', 'Do you really want to delete the asset ' + asset.label, [
                    asset.label,
                ])
            );
            if (!confirm) return;

            deleteAsset(asset)
                .then(() => {
                    Notify.ok(translate('action.deleteAsset.success', 'The asset has been deleted'));
                })
                .catch(({ message }) => {
                    Notify.error(
                        translate('action.deleteAsset.error', 'Error while trying to delete the asset'),
                        message
                    );
                });
        },
        [Notify, translate, deleteAsset]
    );

    // Handle selection mode for the secondary Neos UI inspector
    const handleSelectAsset = useCallback(
        (asset: Asset) => {
            if (!onAssetSelection || !asset) {
                return;
            }
            if (asset.localId) {
                onAssetSelection(asset.localId);
            } else {
                importAsset(asset, false).then(({ data }) => {
                    onAssetSelection(data.importAsset.localId);
                });
            }
        },
        [importAsset, onAssetSelection]
    );

    return (
        <MediaUiContext.Provider
            value={{
                containerRef,
                dummyImage,
                handleDeleteAsset,
                handleSelectAsset,
                selectionMode,
                assets,
                refetchAssets,
            }}
        >
            {children}
        </MediaUiContext.Provider>
    );
}
