import React, { useCallback, useState, createContext, useContext } from 'react';

import { useIntl, useNotify } from '@media-ui/core';

import { useSetAssetCollectionParent } from '../hooks/useSetAssetCollectionParent';
import useAssetCollectionsQuery from '../hooks/useAssetCollectionsQuery';
import { UNASSIGNED_COLLECTION_ID } from '../hooks/useAssetCollectionQuery';
import { isChildOfCollection } from '../helpers/collectionPath';

interface AssetCollectionTreeDndProviderProps {
    children: React.ReactElement;
}

interface AssetCollectionTreeDndProviderValues {
    currentlyDraggedNodes: string[];
    handleDrag: (assetCollectionId: string) => void;
    handeEndDrag: () => void;
    handleDrop: (targetAssetCollectionId: string, position: number) => void;
    acceptsDraggedNode: (assetCollectionId: AssetCollectionId, mode: 'into' | 'after') => boolean;
}

export const AssetCollectionDndContext = createContext(null);
export const useAssetCollectionDnd = (): AssetCollectionTreeDndProviderValues => useContext(AssetCollectionDndContext);

export function AssetCollectionTreeDndProvider({ children }: AssetCollectionTreeDndProviderProps) {
    const { translate } = useIntl();
    const Notify = useNotify();
    const { assetCollections } = useAssetCollectionsQuery();
    const [currentlyDraggedNodes, setCurrentlyDraggedNodes] = useState<string[]>([]);
    const { setAssetCollectionParent } = useSetAssetCollectionParent();

    const handleDrag = useCallback(
        (assetCollectionId: string) => {
            setCurrentlyDraggedNodes([assetCollectionId]);
        },
        [setCurrentlyDraggedNodes]
    );

    const handeEndDrag = useCallback(() => {
        setCurrentlyDraggedNodes([]);
    }, [setCurrentlyDraggedNodes]);

    const handleDrop = useCallback(
        (targetAssetCollectionId: string, position: 'before' | 'into') => {
            const targetAssetCollection = assetCollections.find(({ id }) => id === targetAssetCollectionId);
            const draggedAssetCollections = currentlyDraggedNodes.map((draggedId) =>
                assetCollections.find(({ id }) => id === draggedId)
            );

            const targetAssetCollectionParent = targetAssetCollection.parent?.id
                ? assetCollections.find(({ id }) => id === targetAssetCollection.parent?.id)
                : null;
            const targetParentCollection = position === 'into' ? targetAssetCollection : targetAssetCollectionParent;

            draggedAssetCollections.forEach((draggedAssetCollection: AssetCollection) => {
                if (targetParentCollection?.id !== draggedAssetCollection.parent?.id) {
                    setAssetCollectionParent({
                        assetCollection: draggedAssetCollection,
                        parent: targetParentCollection,
                    })
                        .then(() => {
                            Notify.ok(
                                translate(
                                    'ParentCollectionSelectBox.setParent.success',
                                    'The parent collection has been set'
                                )
                            );
                        })
                        .catch(({ message }) => {
                            Notify.error(
                                translate(
                                    'ParentCollectionSelectBox.setParent.error',
                                    'Error while setting the parent collection'
                                ),
                                message
                            );
                        });
                }
            });

            setCurrentlyDraggedNodes([]);
        },
        [Notify, assetCollections, currentlyDraggedNodes, setAssetCollectionParent, setCurrentlyDraggedNodes, translate]
    );

    const acceptsDraggedNode = useCallback(
        (assetCollectionId: AssetCollectionId, mode: 'into' | 'after') => {
            if (currentlyDraggedNodes.length === 0 || currentlyDraggedNodes.includes(assetCollectionId)) return false;

            // TODO: Also check current assetSource.readonly property
            const canBeInsertedInto = assetCollectionId && assetCollectionId !== UNASSIGNED_COLLECTION_ID;
            const canBeInsertedAlongside = assetCollectionId && assetCollectionId !== UNASSIGNED_COLLECTION_ID;
            const canBeInserted = mode === 'into' ? canBeInsertedInto : canBeInsertedAlongside;
            if (!canBeInserted) return false;

            const assetCollection = assetCollections.find(({ id }) => id === assetCollectionId);
            const createsRecursion = currentlyDraggedNodes.some((draggedAssetCollectionId) => {
                return isChildOfCollection(assetCollection, draggedAssetCollectionId, assetCollections);
            });
            return !createsRecursion;
        },
        [assetCollections, currentlyDraggedNodes]
    );

    return (
        <AssetCollectionDndContext.Provider
            value={{
                currentlyDraggedNodes,
                handleDrag,
                handeEndDrag,
                handleDrop,
                acceptsDraggedNode,
            }}
        >
            {children}
        </AssetCollectionDndContext.Provider>
    );
}
