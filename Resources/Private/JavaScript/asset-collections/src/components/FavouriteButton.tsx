import React, { useCallback } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import { IconButton } from '@neos-project/react-ui-components';

import { useIntl } from '@media-ui/core';

import selectedAssetCollectionIdState from '../state/selectedAssetCollectionIdState';
import { assetCollectionFavouriteState } from '../state/assetCollectionFavouritesState';

const FavouriteButton: React.FC = () => {
    const { translate } = useIntl();
    const selectedAssetCollectionId = useRecoilValue(selectedAssetCollectionIdState);
    const [isFavourite, setIsFavourite] = useRecoilState(assetCollectionFavouriteState(selectedAssetCollectionId));

    const toggleFavourite = useCallback(() => {
        setIsFavourite((prev) => !prev);
    }, [setIsFavourite]);

    return (
        <IconButton
            icon="star"
            size="regular"
            style={isFavourite ? 'warn' : 'transparent'}
            hoverStyle="warn"
            disabled={!selectedAssetCollectionId}
            title={translate('assetCollectionTree.toolbar.favourite', 'Toggle favourite')}
            onClick={toggleFavourite}
        />
    );
};

export default React.memo(FavouriteButton);
