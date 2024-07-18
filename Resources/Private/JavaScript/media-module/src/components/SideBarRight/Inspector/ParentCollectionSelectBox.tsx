import React, { useCallback, useMemo, useState } from 'react';

import { Headline, SelectBox } from '@neos-project/react-ui-components';

import { useIntl, useMediaUi, useNotify } from '@media-ui/core';
import { IconLabel } from '@media-ui/core/src/components';
import {
    collectionPath,
    useAssetCollectionsQuery,
    useSelectedAssetCollection,
    useSetAssetCollectionParent,
} from '@media-ui/feature-asset-collections';

import { AssetCollectionOptionPreviewElement, CollectionOption } from './AssetCollectionOptionPreviewElement';

import * as classes from './ParentCollectionSelectBox.module.css';

const ParentCollectionSelectBox = () => {
    const Notify = useNotify();
    const { translate } = useIntl();
    const { approvalAttainmentStrategy } = useMediaUi();
    const { assetCollections } = useAssetCollectionsQuery();
    const selectedAssetCollection = useSelectedAssetCollection();
    const { setAssetCollectionParent, loading } = useSetAssetCollectionParent();
    const [searchTerm, setSearchTerm] = useState('');

    const selectBoxOptions: CollectionOption[] = useMemo(
        () =>
            assetCollections
                .filter(({ id }) => id !== selectedAssetCollection.id)
                .map((collection) => ({
                    label: collection.title,
                    id: collection.id,
                    secondaryLabel: collection.parent
                        ? '/' +
                          collectionPath(collection, assetCollections)
                              .map(({ title }) => title)
                              .join('/')
                        : '',
                })),
        [assetCollections, selectedAssetCollection?.id]
    );

    const filteredSelectBoxOptions: CollectionOption[] = useMemo(
        () => selectBoxOptions.filter(({ label }) => label.toLowerCase().includes(searchTerm)),
        [selectBoxOptions, searchTerm]
    );

    const handleChange = useCallback(
        async (parentCollectionId: string) => {
            const canMoveCollection = await approvalAttainmentStrategy.obtainApprovalToMoveAssetCollection({
                assetCollection: selectedAssetCollection,
            });
            if (canMoveCollection && parentCollectionId !== selectedAssetCollection.parent?.id) {
                setAssetCollectionParent({
                    assetCollection: selectedAssetCollection,
                    parent: parentCollectionId ? assetCollections.find((c) => c.id === parentCollectionId) : null,
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
        },
        [
            approvalAttainmentStrategy,
            selectedAssetCollection,
            setAssetCollectionParent,
            assetCollections,
            Notify,
            translate,
        ]
    );

    const handleSearchTermChange = useCallback((searchTerm) => {
        setSearchTerm(searchTerm.toLowerCase());
    }, []);

    return (
        <div>
            <Headline type="h2">
                <IconLabel icon="folder" label={translate('inspector.parentCollection', 'Parent collection')} />
            </Headline>
            <SelectBox
                className={classes.collectionSelectBox}
                disabled={loading}
                placeholder={translate('inspector.collections.placeholder', 'Select a collection')}
                value={selectedAssetCollection.parent?.id}
                optionValueField="id"
                options={filteredSelectBoxOptions}
                noMatchesFoundLabel={translate('general.noMatchesFound', 'No matches found')}
                onValueChange={handleChange}
                onSearchTermChange={handleSearchTermChange}
                ListPreviewElement={AssetCollectionOptionPreviewElement}
                displaySearchBox
                allowEmpty
                threshold={0}
            />
        </div>
    );
};

export default React.memo(ParentCollectionSelectBox);
