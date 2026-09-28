import { useCallback } from 'react';
import { gql, useApolloClient } from '@apollo/client';

const ASSET_LABEL_FRAGMENT = gql`
    fragment AssetLabel on Asset {
        label
    }
`;

export default function useFailedAssetLabels() {
    const client = useApolloClient();

    const getAssetLabel = useCallback(
        (assetId: string): string => {
            const data = client.readFragment({
                fragment: ASSET_LABEL_FRAGMENT,
                id: client.cache.identify({ __typename: 'Asset', id: assetId }),
            });
            return data?.label || assetId;
        },
        [client]
    );

    const getFailedAssetLabels = useCallback(
        (results: PromiseSettledResult<unknown>[], identities: AssetIdentity[]): string[] =>
            results
                .map((result, index) =>
                    result.status === 'rejected' ? getAssetLabel(identities[index].assetId) : null
                )
                .filter(Boolean),
        [getAssetLabel]
    );

    return { getAssetLabel, getFailedAssetLabels };
}
