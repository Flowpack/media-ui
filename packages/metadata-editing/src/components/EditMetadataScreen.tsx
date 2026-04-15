import React from 'react';
import { useRecoilValue } from 'recoil';

import { endpointsState, selectedAssetIdState } from '@media-ui/core/src/state';

import classes from './EditMetadataScreen.module.css';

type EditMetadataScreenProps = {
    assetIdentities?: AssetIdentity[];
};

const EditMetadataScreen: React.FC<EditMetadataScreenProps> = ({ assetIdentities }) => {
    const endpoints = useRecoilValue(endpointsState);
    const selectedAssetId = useRecoilValue(selectedAssetIdState);

    // TODO: Support multiple editing metadata of multiple assets
    const firstAssetIdentity = assetIdentities?.length > 0 ? assetIdentities[0] : selectedAssetId;

    const endpointUriWithParameters = new URL(endpoints.editMetadata);
    endpointUriWithParameters.searchParams.set('assetId', firstAssetIdentity.assetId);
    endpointUriWithParameters.searchParams.set('assetSourceId', firstAssetIdentity.assetSourceId);

    return firstAssetIdentity ? (
        <div className={classes.editMetadataScreen}>
            <p>Edit Metadata for asset with id {firstAssetIdentity.assetId}</p>
            <iframe src={endpointUriWithParameters.toString()}></iframe>
        </div>
    ) : null;
};

export default React.memo(EditMetadataScreen);
