import * as React from 'react';
import { createContext, useContext, useState } from 'react';
import { useQuery } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';
import Asset from '../interfaces/Asset';
import Tag from '../interfaces/Tag';
import AssetProxy from '../interfaces/AssetProxy';

interface ProviderProps {
    children: React.ReactElement;
    csrf: string;
    endpoints: {
        graphql: string;
    };
    notify: Function;
    dummyImage: string;
}

interface ProviderValues {
    csrf: string;
    endpoints: any;
    assetProxies: Array<AssetProxy>;
    tags: Array<Tag>;
    notify: Function;
    tagFilter: Tag;
    setTagFilter: Function;
    dummyImage: string;
}

interface AssetProxiesQueryResult {
    assetProxies: [AssetProxy];
    tags: [Tag];
}

interface AssetProxiesQueryVariables {
    assetSource: string;
    tag: string;
    limit: number;
    offset: number;
}

export const MediaUiContext = createContext(undefined);
export const useMediaUi = (): ProviderValues => useContext(MediaUiContext);

const ASSET_PROXIES = gql`
    query ASSET_PROXIES($assetSource: String, $tag: String, $limit: Int, $offset: Int) {
        assetProxies(assetSource: $assetSource, tag: $tag, limit: $limit, offset: $offset) {
            identifier
            label
            mediaType
            thumbnailUri
            previewUri
        }
        tags {
            label
        }
    }
`;

export function MediaUiProvider({ children, csrf, endpoints, notify, dummyImage }: ProviderProps) {
    const [tagFilter, setTagFilter] = useState<Tag>();
    const { loading, error, data } = useQuery<AssetProxiesQueryResult, AssetProxiesQueryVariables>(ASSET_PROXIES, {
        variables: {
            assetSource: 'Neos',
            tag: tagFilter && tagFilter.label ? tagFilter.label : '',
            limit: 20,
            offset: 0
        }
    });

    const assetProxies = data?.assetProxies || [];
    const tags = data?.tags || [];

    if (error) {
        console.error(error);
    }

    return (
        <>
            <MediaUiContext.Provider
                value={{ csrf, endpoints, assetProxies, tags, notify, tagFilter, setTagFilter, dummyImage }}
            >
                {error ? <p>{error.message}</p> : loading ? <p>Loading...</p> : children}
            </MediaUiContext.Provider>
        </>
    );
}
