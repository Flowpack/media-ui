import * as React from 'react';
import { createContext, useContext, useState } from 'react';
import { useQuery } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';
import MediaUiProviderValues from '../interfaces/MediaUiProviderValues';
import AssetSource from '../interfaces/AssetSource';
import Tag from '../interfaces/Tag';
import AssetCollection from '../interfaces/AssetCollection';
import MediaUiProviderProps from '../interfaces/MediaUiProviderProps';
import AssetProxy from '../interfaces/AssetProxy';

interface AssetProxiesQueryResult {
    assetProxies: AssetProxy[];
    assetCollections: AssetCollection[];
    assetSources: AssetSource[];
    assetCount: number;
    tags: Tag[];
}

interface AssetProxiesQueryVariables {
    assetSource: string;
    tag: string;
    assetCollection: string;
    limit: number;
    offset: number;
}

export const MediaUiContext = createContext({} as MediaUiProviderValues);
export const useMediaUi = (): MediaUiProviderValues => useContext(MediaUiContext);

export const ASSETS_PER_PAGE = 20;
export const NEOS_ASSET_SOURCE: AssetSource = {
    identifier: 'neos',
    label: 'Neos',
    readOnly: false,
    supportsCollections: true,
    supportsTagging: true
};

// TODO: Split this big query into individual reusable pieces including the matching interfaces
const ASSET_PROXIES = gql`
    query ASSET_PROXIES($assetSource: String, $tag: String, $assetCollection: String, $limit: Int, $offset: Int) {
        assetProxies(
            assetSource: $assetSource
            assetCollection: $assetCollection
            tag: $tag
            limit: $limit
            offset: $offset
        ) {
            identifier
            label
            mediaType
            thumbnailUri
            previewUri
            localAssetIdentifier
            localAssetData {
                label
                title
                caption
                copyrightNotice
            }
        }
        assetCollections {
            title
            tags {
                label
            }
        }
        assetSources {
            label
            identifier
            readOnly
            supportsTagging
            supportsCollections
        }
        assetCount(assetSource: $assetSource, assetCollection: $assetCollection, tag: $tag)
        tags {
            label
        }
    }
`;

export function MediaUiProvider({ children, csrf, endpoints, notify, dummyImage }: MediaUiProviderProps) {
    const [tagFilter, setTagFilter] = useState<Tag>();
    const [assetCollectionFilter, setAssetCollectionFilter] = useState<AssetCollection>();
    const [assetSourceFilter, setAssetSourceFilter] = useState<AssetSource>(NEOS_ASSET_SOURCE);
    const [currentPage, setCurrentPage] = useState(1);

    const { loading, error, data } = useQuery<AssetProxiesQueryResult, AssetProxiesQueryVariables>(ASSET_PROXIES, {
        variables: {
            assetSource: assetSourceFilter?.identifier,
            assetCollection: assetCollectionFilter?.title || '',
            tag: tagFilter?.label || '',
            limit: ASSETS_PER_PAGE,
            offset: (currentPage - 1) * ASSETS_PER_PAGE
        }
    });

    const assetProxies = data?.assetProxies || [];
    const assetCollections = data?.assetCollections || [];
    const assetSources = data?.assetSources || [];
    const assetCount = data?.assetCount || 0;
    const tags = data?.tags || [];
    const isLoading = loading;

    if ((currentPage - 1) * ASSETS_PER_PAGE > assetCount) {
        setCurrentPage(1);
    }

    if (error) {
        console.error(error);
    }

    return (
        <>
            <MediaUiContext.Provider
                value={{
                    csrf,
                    endpoints,
                    isLoading,
                    assetProxies,
                    tags,
                    assetCollections,
                    notify,
                    assetCount,
                    tagFilter,
                    setTagFilter,
                    assetCollectionFilter,
                    setAssetCollectionFilter,
                    assetSources,
                    assetSourceFilter,
                    setAssetSourceFilter,
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
