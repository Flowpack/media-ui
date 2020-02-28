import * as React from 'react';
import { createContext, useContext, useState } from 'react';
import { useQuery } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';
import Tag from '../interfaces/Tag';
import AssetProxy from '../interfaces/AssetProxy';
import AssetCollection from '../interfaces/AssetCollection';
import AssetSource from '../interfaces/AssetSource';

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
    assetProxies: AssetProxy[];
    assetCollections: AssetCollection[];
    tags: Tag[];
    notify: Function;
    tagFilter: Tag;
    setTagFilter: Function;
    currentPage: number;
    setCurrentPage: Function;
    dummyImage: string;
}

interface AssetProxiesQueryResult {
    assetProxies: AssetProxy[];
    assetCollections: AssetCollection[];
    tags: Tag[];
}

interface AssetProxiesQueryVariables {
    assetSource: string;
    tag: string;
    limit: number;
    offset: number;
}

export const MediaUiContext = createContext({} as ProviderValues);
export const useMediaUi = (): ProviderValues => useContext(MediaUiContext);

export const ASSETS_PER_PAGE = 20;
export const NEOS_ASSET_SOURCE: AssetSource = {
    identifier: 'neos',
    label: 'Neos',
    readonly: false
};

const ASSET_PROXIES = gql`
    query ASSET_PROXIES($assetSource: String, $tag: String, $limit: Int, $offset: Int) {
        assetProxies(assetSource: $assetSource, tag: $tag, limit: $limit, offset: $offset) {
            identifier
            label
            mediaType
            thumbnailUri
            previewUri
        }
        assetCollections {
            title
            tags {
                label
            }
        }
        tags {
            label
        }
    }
`;

export function MediaUiProvider({ children, csrf, endpoints, notify, dummyImage }: ProviderProps) {
    const [tagFilter, setTagFilter] = useState<Tag>();
    const [assetCollectionFilter, setAssetCollectionFilter] = useState<AssetCollection>();
    const [assetSourceFilter, setAssetSourceFilter] = useState<AssetSource>(NEOS_ASSET_SOURCE);
    const [currentPage, setCurrentPage] = useState(0);

    const { loading, error, data } = useQuery<AssetProxiesQueryResult, AssetProxiesQueryVariables>(ASSET_PROXIES, {
        variables: {
            assetSource: assetSourceFilter.identifier,
            tag: tagFilter && tagFilter.label ? tagFilter.label : '',
            limit: ASSETS_PER_PAGE,
            offset: currentPage * ASSETS_PER_PAGE
        }
    });

    const assetProxies = data?.assetProxies || [];
    const assetCollections = data?.assetCollections || [];
    const tags = data?.tags || [];

    if (error) {
        console.error(error);
    }

    return (
        <>
            <MediaUiContext.Provider
                value={{
                    csrf,
                    endpoints,
                    assetProxies,
                    tags,
                    assetCollections,
                    notify,
                    tagFilter,
                    setTagFilter,
                    currentPage,
                    setCurrentPage,
                    dummyImage
                }}
            >
                {error ? <p>{error.message}</p> : !assetProxies && loading ? <p>Loading...</p> : children}
            </MediaUiContext.Provider>
        </>
    );
}
