import React, { useCallback, useMemo } from 'react';

import { Headline, SelectBox } from '@neos-project/react-ui-components';

import { useIntl, useNotify } from '@media-ui/core';
import { IconLabel } from '@media-ui/core/src/components';
import {
    useAssetCollectionsQuery,
    useSelectedAssetCollection,
    useUpdateAssetCollection,
} from '@media-ui/feature-asset-collections';

const ParentCollectionSelectBox = () => {
    const Notify = useNotify();
    const { translate } = useIntl();
    const { assetCollections } = useAssetCollectionsQuery();
    const selectedAssetCollection = useSelectedAssetCollection();
    const { updateAssetCollection, loading } = useUpdateAssetCollection();

    const assetCollectionsWithLabel = useMemo(
        () => assetCollections.map(({ title, ...rest }) => ({ label: title, ...rest })),
        [assetCollections]
    );

    const handleChange = useCallback(
        async (parentCollectionId: string) => {
            if (parentCollectionId !== selectedAssetCollection.parent?.id) {
                updateAssetCollection({
                    assetCollection: selectedAssetCollection,
                    parent: assetCollections.find((c) => c.id === parentCollectionId),
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
        [selectedAssetCollection, updateAssetCollection, assetCollections, Notify, translate]
    );

    return (
        <div>
            <Headline type="h2">
                <IconLabel icon="folder" label={translate('inspector.assetCollections', 'Parent collection')} />
            </Headline>
            <SelectBox
                disabled={loading}
                placeholder={translate('inspector.collections.placeholder', 'Select a collection')}
                value={selectedAssetCollection.parent?.id}
                optionValueField="id"
                options={assetCollectionsWithLabel}
                searchOptions={assetCollectionsWithLabel}
                noMatchesFoundLabel={translate('general.noMatchesFound', 'No matches found')}
                onValueChange={handleChange}
            />
        </div>
    );
};

export default React.memo(ParentCollectionSelectBox);
