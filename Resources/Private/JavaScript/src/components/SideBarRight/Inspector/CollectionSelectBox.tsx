import * as React from 'react';
import { useCallback, useMemo } from 'react';

import { Headline, MultiSelectBox } from '@neos-project/react-ui-components';

import { createUseMediaUiStyles, useIntl, useNotify } from '../../../core';
import { useAssetCollectionsQuery, useSelectedAsset } from '../../../hooks';
import { Asset } from '../../../interfaces';
import useSetAssetCollections from '../../../hooks/useSetAssetCollections';
import { IconLabel } from '../../Presentation';

const useStyles = createUseMediaUiStyles({
    collectionSelectBox: {},
    collectionSelection: {}
});

const collectionsMatchAsset = (collections: string[], asset: Asset) => {
    return (
        collections.join(',') ===
        asset.collections
            .map(collection => collection.title)
            .sort()
            .join(',')
    );
};

const CollectionSelectBox: React.FC = () => {
    const classes = useStyles();
    const Notify = useNotify();
    const { translate } = useIntl();
    const { assetCollections } = useAssetCollectionsQuery();
    const { setAssetCollections, loading } = useSetAssetCollections();
    const selectedAsset = useSelectedAsset();

    const allCollections = useMemo(() => assetCollections.map(({ title }) => ({ label: title })), [assetCollections]);

    const collections = useMemo(() => selectedAsset?.collections.map(({ title }) => title).sort(), [
        selectedAsset?.collections
    ]);

    const handleChange = useCallback(
        newCollections => {
            if (!collectionsMatchAsset(newCollections, selectedAsset)) {
                setAssetCollections({
                    asset: selectedAsset,
                    collectionNames: newCollections
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
        [Notify, selectedAsset, setAssetCollections, translate]
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
                values={collections}
                optionValueField="label"
                options={allCollections}
                searchOptions={allCollections}
                onValuesChange={handleChange}
            />
        </div>
    );
};

export default React.memo(CollectionSelectBox);
