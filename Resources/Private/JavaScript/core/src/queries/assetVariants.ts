import { gql } from '@apollo/client';

import { CROP_INFORMATION_FRAGMENT } from '../fragments/cropinformation';

const ASSET_VARIANTS = gql`
    query ASSET_VARIANTS($id: AssetId!, $assetSourceId: AssetSourceId!) {
        assetVariants(id: $id, assetSourceId: $assetSourceId) {
            id
            width
            height
            presetIdentifier
            variantName
            hasCrop
            cropInformation {
                ...CropInformationProps
            }
        }
    }
    ${CROP_INFORMATION_FRAGMENT}
`;

export default ASSET_VARIANTS;
