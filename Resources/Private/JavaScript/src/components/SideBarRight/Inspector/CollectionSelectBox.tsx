import * as React from 'react';
import { useCallback, useMemo } from 'react';
import { useRecoilState } from 'recoil';

import { Label, MultiSelectBox } from '@neos-project/react-ui-components';

import { selectedAssetState } from '../../../state';
import { createUseMediaUiStyles, useIntl, useNotify } from '../../../core';
import { useAssetCollectionsQuery } from '../../../hooks';
import { Asset } from '../../../interfaces';
import useSetAssetCollections from '../../../hooks/useSetAssetCollections';

const useStyles = createUseMediaUiStyles({
    collectionSelectBox: {},
    collectionSelection: {}
});

const collectionsMatchAsset = (assetCollectionIds: string[], asset: Asset) => {
    return assetCollectionIds.join(',') === asset.collections.map(collection => collection.id).join(',');
};

const CollectionSelectBox: React.FC = () => {
    const classes = useStyles();
    const Notify = useNotify();
    const { translate } = useIntl();
    const { assetCollections } = useAssetCollectionsQuery();
    const { setAssetCollections, loading } = useSetAssetCollections();
    const [selectedAsset, setSelectedAsset] = useRecoilState(selectedAssetState);

    const assetCollectionsWithLabel = useMemo(
        () => assetCollections.map(({ title, ...rest }) => ({ label: title, ...rest })),
        [assetCollections]
    );

    const assetCollectionIds = useMemo(() => selectedAsset.collections.map(({ id }) => id), [
        selectedAsset.collections
    ]);

    const handleChange = useCallback(
        newAssetCollectionIds => {
            if (!collectionsMatchAsset(newAssetCollectionIds, selectedAsset)) {
                setAssetCollections({
                    asset: selectedAsset,
                    assetCollections: assetCollections.filter(c => newAssetCollectionIds.includes(c.id))
                })
                    .then(({ data }) => {
                        setSelectedAsset(data.setAssetCollections);
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
        [Notify, selectedAsset, setAssetCollections, setSelectedAsset, assetCollections, translate]
    );

    return (
        <div className={classes.collectionSelectBox}>
            <Label>{translate('inspector.assetCollections', 'Collections')}</Label>
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
