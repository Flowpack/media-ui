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
import AssetType from '../interfaces/AssetType';

interface AssetProxiesQueryResult {
    assetProxies: AssetProxy[];
    assetCollections: AssetCollection[];
    assetSources: AssetSource[];
    assetTypes: AssetType[];
    assetCount: number;
    tags: Tag[];
}

interface AssetProxiesQueryVariables {
    assetSource: string;
    assetCollection: string;
    assetType: string;
    tag: string;
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
    query ASSET_PROXIES(
        $assetSource: String
        $assetCollection: String
        $assetType: String
        $tag: String
        $limit: Int
        $offset: Int
    ) {
        assetProxies(
            assetSource: $assetSource
            assetCollection: $assetCollection
            assetType: $assetType
            tag: $tag
            limit: $limit
            offset: $offset
        ) {
            identifier
            label
            mediaType
            filename
            fileTypeIcon {
                src
                alt
            }
            thumbnailUri
            previewUri
            localAssetIdentifier
            localAssetData {
                identifier
                label
                title
                caption
                copyrightNotice
                tags {
                    label
                }
                assetCollections {
                    title
                }
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
        assetCount(assetSource: $assetSource, assetCollection: $assetCollection, assetType: $assetType, tag: $tag)
        assetTypes {
            label
        }
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
    const [selectedAsset, setSelectedAsset] = useState<AssetProxy>();
    const [assetTypeFilter, setAssetTypeFilter] = useState<AssetType>();

    const { loading, error, data } = useQuery<AssetProxiesQueryResult, AssetProxiesQueryVariables>(ASSET_PROXIES, {
        variables: {
            assetSource: assetSourceFilter?.identifier,
            assetCollection: assetCollectionFilter?.title || '',
            assetType: assetTypeFilter?.label || '',
            tag: tagFilter?.label || '',
            limit: ASSETS_PER_PAGE,
            offset: (currentPage - 1) * ASSETS_PER_PAGE
        }
    });

    const assetProxies = data?.assetProxies || [];
    const assetCollections = data?.assetCollections || [];
    const assetSources = data?.assetSources || [];
    const assetCount = data?.assetCount || 0;
    const assetTypes = data?.assetTypes || [];
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
                    assetTypes,
                    assetTypeFilter,
                    setAssetTypeFilter,
                    currentPage,
                    setCurrentPage,
                    selectedAsset,
                    setSelectedAsset,
                    dummyImage
                }}
            >
                {error ? <p>{error.message}</p> : !assetProxies && loading ? <p>Loading...</p> : children}
            </MediaUiContext.Provider>
        </>
    );
}
