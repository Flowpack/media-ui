import * as React from 'react';
import { createContext, useCallback, useContext, useEffect } from 'react';
import { useRecoilValue } from 'recoil';

import { Asset } from '../interfaces';
import { useDeleteAsset, useImportAsset } from '../hooks';
import { useIntl, useNotify } from './index';
import { selectedAssetState } from '../state';

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
    selectionMode: boolean;
}

export const MediaUiContext = createContext({} as MediaUiProviderValues);
export const useMediaUi = (): MediaUiProviderValues => useContext(MediaUiContext);

// TODO: Make configurable via Settings
export const ASSETS_PER_PAGE = 20;
export const PAGINATION_MAXIMUM_LINKS = 5;

export function MediaUiProvider({
    children,
    dummyImage,
    selectionMode = false,
    onAssetSelection = null,
    containerRef
}: MediaUiProviderProps) {
    const { translate } = useIntl();
    const Notify = useNotify();
    const selectedAsset = useRecoilValue(selectedAssetState);
    const { deleteAsset } = useDeleteAsset();
    const { importAsset } = useImportAsset();

    const handleDeleteAsset = useCallback(
        (asset: Asset) => {
            const confirm = window.confirm(
                translate('action.deleteAsset.confirm', 'Do you really want to delete the asset ' + asset.label, [
                    asset.label
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
    useEffect(() => {
        if (!onAssetSelection || !selectedAsset) {
            return;
        }
        if (selectedAsset.localId) {
            onAssetSelection(selectedAsset.localId);
        } else {
            importAsset(selectedAsset, false).then(({ data }) => {
                onAssetSelection(data.importAsset.localId);
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedAsset]);

    return (
        <MediaUiContext.Provider
            value={{
                containerRef,
                dummyImage,
                handleDeleteAsset,
                selectionMode
            }}
        >
            {children}
        </MediaUiContext.Provider>
    );
}
