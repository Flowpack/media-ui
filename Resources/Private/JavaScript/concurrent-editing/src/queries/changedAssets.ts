import { gql } from '@apollo/client';

const CHANGED_ASSETS = gql`
    query CHANGED_ASSETS($since: DateTime = null) {
        changedAssets(since: $since) {
            lastModified
            changes {
                assetId
                lastModified
                type
            }
        }
    }
`;

export default CHANGED_ASSETS;
