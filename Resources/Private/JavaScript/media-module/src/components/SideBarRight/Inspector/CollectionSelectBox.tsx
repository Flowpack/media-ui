import React, { useCallback, useMemo, useState, useEffect } from 'react';

import { Headline, MultiSelectBox } from '@neos-project/react-ui-components';

import { useIntl, createUseMediaUiStyles, useNotify, useMediaUi } from '@media-ui/core/src';
import { Asset } from '@media-ui/core/src/interfaces';
import { useSelectedAsset, useSetAssetCollections } from '@media-ui/core/src/hooks';
import { IconLabel } from '@media-ui/core/src/components';
import { useAssetCollectionsQuery } from '@media-ui/feature-asset-collections';

const useStyles = createUseMediaUiStyles({
    collectionSelectBox: {},
    collectionSelection: {},
});

const collectionsMatchAsset = (assetCollectionIds: string[], asset: Asset) => {
    return assetCollectionIds.join(',') === asset.collections.map((collection) => collection.id).join(',');
};

const CollectionSelectBox = () => {
    const classes = useStyles();
    const Notify = useNotify();
    const { translate } = useIntl();
    const {
        approvalAttainmentStrategy: { obtainApprovalToSetAssetCollections },
    } = useMediaUi();
    const { assetCollections } = useAssetCollectionsQuery();
    const { setAssetCollections, loading } = useSetAssetCollections();
    const selectedAsset = useSelectedAsset();

    const assetCollectionsWithLabel = useMemo(
        () => assetCollections.map(({ title, ...rest }) => ({ label: title, ...rest })),
        [assetCollections]
    );

    const [selectedAssetCollectionIds, setSelectedAssetCollectionIds] = useState<string[]>([]);
    const syncSelectedAssetCollectionIds = useCallback(
        () => setSelectedAssetCollectionIds(selectedAsset?.collections.map(({ id }) => id)),
        [selectedAsset?.collections]
    );

    const handleChange = useCallback(
        async (newAssetCollectionIds) => {
            if (!collectionsMatchAsset(newAssetCollectionIds, selectedAsset)) {
                const asset = selectedAsset;
                const newAssetCollections = assetCollections.filter((c) => newAssetCollectionIds.includes(c.id));
                const hasApprovalToSetAssetCollections = await obtainApprovalToSetAssetCollections({
                    asset,
                    newAssetCollections,
                });

                if (hasApprovalToSetAssetCollections) {
                    try {
                        await setAssetCollections({
                            asset,
                            assetCollections: newAssetCollections,
                        });

                        Notify.ok(
                            translate(
                                'actions.setAssetCollections.success',
                                'The collections for the asset have been set'
                            )
                        );
                    } catch ({ message }) {
                        Notify.error(
                            translate(
                                'actions.setAssetCollections.error',
                                'Error while setting the collections for the asset'
                            ),
                            message
                        );
                    }
                } else {
                    syncSelectedAssetCollectionIds();
                }
            }
        },
        [
            Notify,
            selectedAsset,
            setAssetCollections,
            assetCollections,
            translate,
            syncSelectedAssetCollectionIds,
            obtainApprovalToSetAssetCollections,
        ]
    );

    useEffect(() => syncSelectedAssetCollectionIds(), [syncSelectedAssetCollectionIds]);

    if (!selectedAsset) return null;

    return (
        <div className={classes.collectionSelectBox}>
            <Headline type="h2">
                <IconLabel icon="folder" label={translate('inspector.assetCollections', 'Collections')} />
            </Headline>
            <MultiSelectBox
                className={classes.collectionSelection}
                disabled={loading || selectedAsset.assetSource.readOnly}
                placeholder={translate('inspector.collections.placeholder', 'Select a collection')}
                values={selectedAssetCollectionIds}
                optionValueField="id"
                options={assetCollectionsWithLabel}
                searchOptions={assetCollectionsWithLabel}
                noMatchesFoundLabel={translate('general.noMatchesFound', 'No matches found')}
                onValuesChange={handleChange}
            />
        </div>
    );
};

export default React.memo(CollectionSelectBox);
