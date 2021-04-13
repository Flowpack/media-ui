import * as React from 'react';
import { useCallback, useMemo } from 'react';

import { Headline, MultiSelectBox } from '@neos-project/react-ui-components';

import { useIntl, createUseMediaUiStyles, useNotify } from '@media-ui/core/src';
import { Asset } from '@media-ui/core/src/interfaces';
import { useAssetCollectionsQuery, useSelectedAsset, useSetAssetCollections } from '@media-ui/core/src/hooks';

import { IconLabel } from '../../Presentation';

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
    const { assetCollections } = useAssetCollectionsQuery();
    const { setAssetCollections, loading } = useSetAssetCollections();
    const selectedAsset = useSelectedAsset();

    const assetCollectionsWithLabel = useMemo(
        () => assetCollections.map(({ title, ...rest }) => ({ label: title, ...rest })),
        [assetCollections]
    );

    const assetCollectionIds = useMemo(() => selectedAsset?.collections.map(({ id }) => id), [selectedAsset]);

    const handleChange = useCallback(
        (newAssetCollectionIds) => {
            if (!collectionsMatchAsset(newAssetCollectionIds, selectedAsset)) {
                setAssetCollections({
                    asset: selectedAsset,
                    assetCollections: assetCollections.filter((c) => newAssetCollectionIds.includes(c.id)),
                })
                    .then(() => {
                        Notify.ok(
                            translate(
                                'actions.setAssetCollections.success',
                                'The collections for the asset have been set'
                            )
                        );
                    })
                    .catch(({ message }) => {
                        Notify.error(
                            translate(
                                'actions.setAssetCollections.error',
                                'Error while setting the collections for the asset'
                            ),
                            message
                        );
                    });
            }
        },
        [Notify, selectedAsset, setAssetCollections, assetCollections, translate]
    );

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
                values={assetCollectionIds}
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
